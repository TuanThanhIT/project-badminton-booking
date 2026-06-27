from __future__ import annotations

import numpy as np


def as_float32_matrix(vector: np.ndarray) -> np.ndarray:
    array = np.asarray(vector, dtype="float32")
    if array.ndim == 1:
        array = array.reshape(1, -1)
    return array


def l2_normalize(vector: np.ndarray, eps: float = 1e-12) -> np.ndarray:
    array = as_float32_matrix(vector)
    norms = np.linalg.norm(array, axis=1, keepdims=True)
    return array / np.maximum(norms, eps)


def weighted_average(vectors: list[np.ndarray], weights: list[float]) -> np.ndarray:
    if not vectors:
        raise ValueError("At least one vector is required")
    matrix = np.vstack([as_float32_matrix(vector)[0] for vector in vectors])
    weight_array = np.asarray(weights, dtype="float32")
    weight_array = weight_array / np.maximum(weight_array.sum(), 1e-12)
    return l2_normalize((matrix * weight_array[:, None]).sum(axis=0))[0]
