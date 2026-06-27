from __future__ import annotations

from pathlib import Path

import faiss
import numpy as np

from app.modules.embedding.vector_utils import l2_normalize


class FaissStore:
    def __init__(self, index=None) -> None:
        self.index = index

    @property
    def is_loaded(self) -> bool:
        return self.index is not None and self.index.ntotal > 0

    @property
    def size(self) -> int:
        return int(self.index.ntotal) if self.index is not None else 0

    @classmethod
    def load(cls, path: Path) -> "FaissStore":
        if not path.exists() or path.stat().st_size == 0:
            return cls()
        return cls(faiss.read_index(str(path)))

    def build(self, vectors: list[np.ndarray]) -> None:
        matrix = l2_normalize(np.asarray(vectors, dtype="float32"))
        index = faiss.IndexFlatIP(matrix.shape[1])
        index.add(matrix)
        self.index = index

    def save(self, path: Path) -> None:
        if self.index is None:
            raise RuntimeError("FAISS index is empty")
        path.parent.mkdir(parents=True, exist_ok=True)
        faiss.write_index(self.index, str(path))

    def search(self, vector: np.ndarray, limit: int) -> list[tuple[int, float]]:
        if not self.is_loaded:
            raise RuntimeError("FAISS index is not loaded")
        query = l2_normalize(np.asarray(vector, dtype="float32"))
        scores, indices = self.index.search(query, limit)
        return [
            (int(index), float(score))
            for index, score in zip(indices[0], scores[0])
            if int(index) >= 0
        ]

