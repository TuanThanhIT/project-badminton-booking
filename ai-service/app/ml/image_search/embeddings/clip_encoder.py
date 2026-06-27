from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Iterable

import numpy as np
from PIL import Image
from sentence_transformers import SentenceTransformer

from app.ml.image_search.config.config import get_settings
from app.ml.image_search.embeddings.vector_utils import l2_normalize


class ClipEncoder:
    def __init__(
        self,
        text_model_name: str,
        image_model_name: str,
        cache_folder: str | Path | None = None,
        device: str = "cpu",
    ) -> None:
        cache_folder = str(cache_folder) if cache_folder else None
        self.text_model = SentenceTransformer(
            text_model_name,
            cache_folder=cache_folder,
            device=device,
        )
        self.image_model = (
            self.text_model
            if image_model_name == text_model_name
            else SentenceTransformer(
                image_model_name,
                cache_folder=cache_folder,
                device=device,
            )
        )

    def encode_text(self, text: str | Iterable[str]) -> np.ndarray:
        values = [text] if isinstance(text, str) else list(text)
        vectors = self.text_model.encode(
            values,
            convert_to_numpy=True,
            normalize_embeddings=False,
            show_progress_bar=False,
        )
        return l2_normalize(vectors)

    def encode_image(self, image: Image.Image | Iterable[Image.Image]) -> np.ndarray:
        images = [image] if isinstance(image, Image.Image) else list(image)
        rgb_images = [item.convert("RGB") for item in images]
        vectors = self.image_model.encode(
            rgb_images,
            convert_to_numpy=True,
            normalize_embeddings=False,
            show_progress_bar=False,
        )
        return l2_normalize(vectors)


@lru_cache(maxsize=1)
def get_clip_encoder() -> ClipEncoder:
    settings = get_settings()
    return ClipEncoder(
        text_model_name=settings.text_model_name,
        image_model_name=settings.image_model_name,
        cache_folder=settings.model_cache_dir,
        device=settings.device,
    )
