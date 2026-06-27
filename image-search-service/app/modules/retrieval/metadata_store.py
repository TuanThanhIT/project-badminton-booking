from __future__ import annotations

import json
from pathlib import Path


class MetadataStore:
    def __init__(self, items: list[dict] | None = None) -> None:
        self.items = items or []

    @classmethod
    def load(cls, path: Path) -> "MetadataStore":
        if not path.exists() or path.stat().st_size == 0:
            return cls()
        return cls(json.loads(path.read_text(encoding="utf-8")))

    def save(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(self.items, ensure_ascii=False, indent=2), encoding="utf-8")

    def get(self, index: int) -> dict:
        return self.items[index]

    def __len__(self) -> int:
        return len(self.items)

