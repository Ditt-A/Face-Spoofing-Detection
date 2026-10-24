from contextlib import asynccontextmanager
from datetime import datetime, timezone
from time import perf_counter
from uuid import uuid4
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool
from .catalog import load_catalog
from .config import Settings
from .engine import InferenceEngine
from .schemas import (
    AnalysisImage, AnalysisMetadata, AnalysisResult, AnalyzeRequest,
    ClassLabel, ExampleCatalog, HealthResponse,
)


def create_app(settings: Settings | None = None) -> FastAPI:
    config = settings or Settings.from_env()
    catalog = load_catalog()
    engine = InferenceEngine(config)

    @asynccontextmanager
    async def lifespan(application: FastAPI):
        await run_in_threadpool(engine.start)
        try:
            yield
        finally:
            await run_in_threadpool(engine.close)

    api = FastAPI(
        title="Face Spoofing Detection API", version="1.0.0", lifespan=lifespan,
        description="Internal-example analysis with an explicitly gated model provider and reference fallback. No upload endpoint is exposed.",
    )
    api.state.engine = engine
    api.add_middleware(
        CORSMiddleware, allow_origins=list(config.allowed_origins),
        allow_methods=["GET", "POST"], allow_headers=["Content-Type"],
    )

    @api.get("/api/v1/health", response_model=HealthResponse)
    def health():
        return engine.health()

    @api.get("/api/v1/examples", response_model=ExampleCatalog)
    def examples():
        return ExampleCatalog(examples=list(catalog.values()))

    @api.post("/api/v1/analyze", response_model=AnalysisResult)
    def analyze(payload: AnalyzeRequest):
        started = perf_counter()
        example = catalog[payload.example_id]
        image_path = config.asset_dir / f"{example.image_name}.webp"
        if not image_path.is_file():
            raise HTTPException(503, "Gambar contoh belum tersedia. Silakan coba kembali nanti.")
        prediction, provider, reason = engine.analyze(example, image_path)
        label = prediction.label
        known = catalog[label] if label is not None else None
        verdict = "review" if label is None else "genuine" if label == ClassLabel.REAL else "spoof"
        return AnalysisResult(
            request_id=str(uuid4()), created_at=datetime.now(timezone.utc).isoformat(),
            verdict=verdict, label=label, class_name=known.title if known else "Belum ditentukan",
            title={"review": "Perlu peninjauan", "genuine": "Wajah asli", "spoof": "Indikasi pemalsuan"}[verdict],
            summary=known.summary if known else "Tinjau kembali gambar sebelum menentukan keaslian wajah.",
            observations=known.observations if known else ["Pemeriksaan lanjutan diperlukan"],
            confidence=prediction.confidence,
            image=AnalysisImage(
                example_id=example.id, title=example.title, image_name=example.image_name,
                width=example.width, height=example.height, size_bytes=image_path.stat().st_size,
            ),
            metadata=AnalysisMetadata(
                provider=provider, model_loaded=engine.predictor is not None, fallback_reason=reason,
                result_source="reference_example" if provider == "fallback" else "model_prediction",
            ),
            elapsed_ms=round((perf_counter() - started) * 1000, 2),
        )

    return api


app = create_app()
