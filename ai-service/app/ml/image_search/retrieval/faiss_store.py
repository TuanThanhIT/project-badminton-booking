from __future__ import annotations

from pathlib import Path

import faiss
import numpy as np

from app.ml.image_search.embeddings.vector_utils import as_float32_matrix, l2_normalize


class FaissStore:
    def __init__(self, index: faiss.Index | None = None) -> None:
        self.index = index

    @property
    def is_loaded(self) -> bool:
        return self.index is not None

    @property
    def count(self) -> int:
        return 0 if self.index is None else self.index.ntotal

    @classmethod
    def load(cls, path: Path) -> "FaissStore":
        if not path.exists() or path.stat().st_size == 0:
            return cls()
        return cls(faiss.read_index(str(path)))

    def save(self, path: Path) -> None:
        if self.index is None:
            raise ValueError("Cannot save an empty FAISS index")
        path.parent.mkdir(parents=True, exist_ok=True)
        faiss.write_index(self.index, str(path))

    def build(self, vectors: np.ndarray) -> None:
        matrix = l2_normalize(as_float32_matrix(vectors))
        index = faiss.IndexFlatIP(matrix.shape[1])
        index.add(matrix)
        self.index = index

    def search(self, query_vector: np.ndarray, limit: int) -> list[tuple[int, float]]:
        if self.index is None or self.index.ntotal == 0:
            return []
        query = l2_normalize(as_float32_matrix(query_vector))
        scores, indices = self.index.search(query, min(limit, self.index.ntotal))
        return [
            (int(index), float(score))
            for index, score in zip(indices[0], scores[0])
            if index >= 0
        ]
