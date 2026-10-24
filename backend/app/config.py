from dataclasses import dataclass
import os
from pathlib import Path


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]


@dataclass(frozen=True)
class Settings:
    enable_model: bool = False
    model_factory: str = ""
    asset_dir: Path = REPOSITORY_ROOT / "frontend/public/assets/images"
    allowed_origins: tuple[str, ...] = ("http://localhost:3001", "http://127.0.0.1:3001")

    @classmethod
    def from_env(cls) -> "Settings":
        return cls(
            enable_model=os.getenv("FSD_ENABLE_MODEL", "0") == "1",
            model_factory=os.getenv("FSD_MODEL_FACTORY", "").strip(),
            asset_dir=Path(os.getenv("FSD_ASSET_DIR", str(cls.asset_dir))).resolve(),
            allowed_origins=tuple(
                item.strip() for item in os.getenv(
                    "FSD_ALLOWED_ORIGINS", "http://localhost:3001,http://127.0.0.1:3001"
                ).split(",") if item.strip()
            ),
        )
