import importlib
import sys
import types
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from app.config import Settings
from app.main import create_app
from app.schemas import ClassLabel


def test_default_service_never_imports_model_factory_or_reads_weights(monkeypatch):
    original_import = importlib.import_module
    attempted = []

    def guarded_import(name, *args, **kwargs):
        if name == "must_never_load":
            attempted.append(name)
            raise AssertionError("A disabled model factory was imported")
        return original_import(name, *args, **kwargs)

    monkeypatch.setattr(importlib, "import_module", guarded_import)
    with TestClient(create_app(Settings(model_factory="must_never_load:create"))) as client:
        health = client.get("/api/v1/health").json()
        assert health["provider"] == "fallback"
        assert health["model_loaded"] is False
        assert health["model_load_enabled"] is False
        assert health["model_state"] == "disabled"
        for label in ClassLabel:
            response = client.post("/api/v1/analyze", json={"example_id": label})
            assert response.status_code == 200
            assert response.json()["metadata"]["fallback_reason"] == "model_disabled"
    assert attempted == []
    assert not {"torch", "timm", "transformers"}.intersection(sys.modules)


@pytest.mark.parametrize("label", list(ClassLabel))
def test_each_internal_example_has_a_deterministic_reference_result(label):
    with TestClient(create_app(Settings())) as client:
        response = client.post("/api/v1/analyze", json={"example_id": label})
        assert response.status_code == 200
        data = response.json()
        assert data["label"] == label
        assert data["verdict"] == ("genuine" if label == ClassLabel.REAL else "spoof")
        assert data["confidence"] is None
        assert data["metadata"]["provider"] == "fallback"
        assert data["metadata"]["result_source"] == "reference_example"
        assert data["metadata"]["model_loaded"] is False
        assert data["image"]["width"] == 1254
        assert len(data["observations"]) == 3
        second = client.post("/api/v1/analyze", json={"example_id": label}).json()
        assert second["label"] == data["label"]
        assert second["request_id"] != data["request_id"]


def test_catalog_is_complete_and_openapi_documents_the_contract():
    with TestClient(create_app(Settings())) as client:
        examples = client.get("/api/v1/examples").json()["examples"]
        assert {item["id"] for item in examples} == set(ClassLabel)
        assert len(examples) == 6
        assert all("/" not in item["image_name"] for item in examples)
        schema = client.get("/openapi.json").json()
        assert "/api/v1/analyze" in schema["paths"]
        assert list(schema["paths"]["/api/v1/analyze"]["post"]["requestBody"]["content"]) == ["application/json"]


@pytest.mark.parametrize("payload", [
    {}, {"example_id": "../../model/fsfm.pt"}, {"example_id": "unknown"},
    {"example_id": "realperson", "image": "untrusted input"},
    {"example_id": "realperson", "url": "https://example.com/photo.jpg"},
])
def test_only_known_internal_examples_are_accepted(payload):
    with TestClient(create_app(Settings())) as client:
        assert client.post("/api/v1/analyze", json=payload).status_code == 422


def test_no_upload_endpoint_is_exposed():
    with TestClient(create_app(Settings())) as client:
        assert client.post("/api/v1/upload", content=b"image").status_code == 404
        assert client.post("/api/v1/analyze", files={"file": ("photo.png", b"image", "image/png")}).status_code == 422


def test_missing_asset_returns_readable_service_error(tmp_path):
    with TestClient(create_app(Settings(asset_dir=tmp_path))) as client:
        response = client.post("/api/v1/analyze", json={"example_id": "realperson"})
        assert response.status_code == 503
        assert "Gambar contoh" in response.json()["detail"]


def test_unconfigured_or_failed_model_uses_reference_fallback():
    for factory, state, reason in [("", "not_configured", "model_not_configured"), ("module_that_does_not_exist:create", "load_failed", "model_load_failed")]:
        with TestClient(create_app(Settings(enable_model=True, model_factory=factory))) as client:
            assert client.get("/api/v1/health").json()["model_state"] == state
            result = client.post("/api/v1/analyze", json={"example_id": "fake_mask"}).json()
            assert result["metadata"]["fallback_reason"] == reason
            assert result["metadata"]["model_loaded"] is False


def test_future_adapter_is_explicitly_gated_and_uses_the_same_response_contract(monkeypatch):
    module = types.ModuleType("_fsd_test_adapter")
    events = []

    class Predictor:
        def predict(self, *, image_bytes):
            assert isinstance(image_bytes, bytes) and len(image_bytes) > 0
            events.append("predict")
            return {"label": "fake_screen", "confidence": 0.88}

        def close(self):
            events.append("close")

    def factory():
        events.append("create")
        return Predictor()

    module.create = factory
    monkeypatch.setitem(sys.modules, module.__name__, module)
    with TestClient(create_app(Settings(enable_model=True, model_factory="_fsd_test_adapter:create"))) as client:
        assert client.get("/api/v1/health").json()["model_loaded"] is True
        result = client.post("/api/v1/analyze", json={"example_id": "realperson"}).json()
        assert result["label"] == "fake_screen"
        assert result["confidence"] == 0.88
        assert result["metadata"]["provider"] == "model"
        assert result["metadata"]["fallback_reason"] is None
        assert result["metadata"]["result_source"] == "model_prediction"
    assert events == ["create", "predict", "close"]


def test_failed_prediction_falls_back_without_fabricating_confidence(monkeypatch):
    module = types.ModuleType("_fsd_failing_adapter")

    class Predictor:
        def predict(self, **kwargs):
            raise RuntimeError("Inference not available")

    module.create = Predictor
    monkeypatch.setitem(sys.modules, module.__name__, module)
    with TestClient(create_app(Settings(enable_model=True, model_factory="_fsd_failing_adapter:create"))) as client:
        result = client.post("/api/v1/analyze", json={"example_id": "fake_printed"}).json()
        assert result["metadata"]["provider"] == "fallback"
        assert result["metadata"]["fallback_reason"] == "prediction_failed"
        assert result["confidence"] is None


def test_environment_defaults_do_not_enable_loading(monkeypatch):
    monkeypatch.delenv("FSD_ENABLE_MODEL", raising=False)
    monkeypatch.setenv("FSD_MODEL_FACTORY", "must_never_load:create")
    assert Settings.from_env().enable_model is False
