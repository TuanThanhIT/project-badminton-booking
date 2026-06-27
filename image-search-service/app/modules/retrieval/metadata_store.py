from __future__ import annotations

import json
from pathlib import Path
from typing import Any


class MetadataStore:
    def __init__(self, items: list[dict[str, Any]] | None = None) -> None:
        self.items = items or []

    @classmethod
    def load(cls, path: Path) -> "MetadataStore":
        if not path.exists() or path.stat().st_size == 0:
            return cls()
        with path.open("r", encoding="utf-8") as file:
            return cls(json.load(file))

    def save(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", encoding="utf-8") as file:
            json.dump(self.items, file, ensure_ascii=False, indent=2)

    def get(self, index: int) -> dict[str, Any]:
        return self.items[index]

    def __len__(self) -> int:
        return len(self.items)
