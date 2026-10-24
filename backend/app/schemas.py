from enum import StrEnum
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


class ClassLabel(StrEnum):
    REAL = "realperson"
    PRINTED = "fake_printed"
    SCREEN = "fake_screen"
    MASK = "fake_mask"
    MANNEQUIN = "fake_mannequin"
    OTHER = "fake_unknown"


class AnalyzeRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    example_id: ClassLabel


class Example(BaseModel):
    id: ClassLabel
    title: str
    image_name: str
    width: int
    height: int
    summary: str
    observations: list[str]


class ExampleCatalog(BaseModel):
    examples: list[Example]


class ModelPrediction(BaseModel):
    """The single contract a future real predictor needs to return."""
    model_config = ConfigDict(extra="forbid")
    label: ClassLabel | None
    confidence: float | None = Field(default=None, ge=0, le=1)


class AnalysisImage(BaseModel):
    example_id: ClassLabel
    title: str
    image_name: str
    width: int
    height: int
    size_bytes: int


class AnalysisMetadata(BaseModel):
    provider: Literal["fallback", "model"]
    model_loaded: bool
    fallback_reason: Literal["model_disabled", "model_not_configured", "model_load_failed", "prediction_failed"] | None
    result_source: Literal["reference_example", "model_prediction"]


class AnalysisResult(BaseModel):
    request_id: str
    created_at: str
    status: Literal["completed"] = "completed"
    verdict: Literal["genuine", "spoof", "review"]
    label: ClassLabel | None
    class_name: str
    title: str
    summary: str
    observations: list[str]
    confidence: float | None
    image: AnalysisImage
    metadata: AnalysisMetadata
    elapsed_ms: float


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    service: str = "face-spoofing-api"
    provider: Literal["fallback", "model"]
    model_loaded: bool
    model_load_enabled: bool
    model_state: Literal["disabled", "not_configured", "load_failed", "ready"]
