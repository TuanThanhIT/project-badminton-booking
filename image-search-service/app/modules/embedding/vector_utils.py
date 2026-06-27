from __future__ import annotations

import numpy as np


def l2_normalize(vectors: np.ndarray) -> np.ndarray:
    values = np.asarray(vectors, dtype="float32")
    if values.ndim == 1:
        values = values.reshape(1, -1)
    norms = np.linalg.norm(values, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    return values / norms


def weighted_average(vectors: list[np.ndarray], weights: list[float]) -> np.ndarray:
    stacked = np.vstack([np.asarray(vector).reshape(1, -1) for vector in vectors])
    weighted = np.average(stacked, axis=0, weights=np.asarray(weights, dtype="float32"))
    return l2_normalize(weighted)[0]

