import json
from pathlib import Path
from .schemas import ClassLabel, Example


def load_catalog() -> dict[ClassLabel, Example]:
    path = Path(__file__).parent / "fixtures/examples.json"
    items = [Example.model_validate(item) for item in json.loads(path.read_text(encoding="utf-8"))]
    if len(items) != len(ClassLabel) or len({item.id for item in items}) != len(ClassLabel):
        raise RuntimeError("The internal catalog must contain each class exactly once.")
    return {item.id: item for item in items}
