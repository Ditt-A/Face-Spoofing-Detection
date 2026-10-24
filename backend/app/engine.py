import importlib
import logging
from typing import Protocol
from .config import Settings
from .schemas import Example, HealthResponse, ModelPrediction


logger = logging.getLogger(__name__)


class Predictor(Protocol):
    def predict(self, *, image_bytes: bytes) -> dict | ModelPrediction: ...


class InferenceEngine:
    """Explicitly gated model loading; internal references are the default fallback."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self.predictor: Predictor | None = None
        self.state = "disabled" if not settings.enable_model else "not_configured"

    def start(self) -> None:
        if not self.settings.enable_model:
            return
        if not self.settings.model_factory:
            return
        try:
            module_name, factory_name = self.settings.model_factory.rsplit(":", 1)
            factory = getattr(importlib.import_module(module_name), factory_name)
            predictor = factory()
            if not callable(getattr(predictor, "predict", None)):
                raise TypeError("The predictor must provide predict(image_bytes=...).")
            self.predictor = predictor
            self.state = "ready"
        except Exception:
            self.state = "load_failed"
            logger.warning("Model initialization failed; internal reference fallback remains available.")

    def health(self) -> HealthResponse:
        return HealthResponse(
            provider="model" if self.predictor is not None else "fallback",
            model_loaded=self.predictor is not None,
            model_load_enabled=self.settings.enable_model,
            model_state=self.state,
        )

    def analyze(self, example: Example, image_path):
        reason = {
            "disabled": "model_disabled",
            "not_configured": "model_not_configured",
            "load_failed": "model_load_failed",
        }.get(self.state)
        if self.predictor is not None:
            try:
                prediction = ModelPrediction.model_validate(
                    self.predictor.predict(image_bytes=image_path.read_bytes())
                )
                return prediction, "model", None
            except Exception:
                logger.warning("Model prediction failed; using the internal example reference.")
                reason = "prediction_failed"
        return ModelPrediction(label=example.id), "fallback", reason

    def close(self) -> None:
        predictor = self.predictor
        self.predictor = None
        if predictor is not None and callable(getattr(predictor, "close", None)):
            predictor.close()
