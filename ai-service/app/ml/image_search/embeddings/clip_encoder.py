from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Iterable

import numpy as np
from PIL import Image

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
        from sentence_transformers import SentenceTransformer

        cache_path = Path(cache_folder) if cache_folder else None
        text_model_path = _local_snapshot(text_model_name, cache_path)
        image_model_path = _local_snapshot(image_model_name, cache_path)
        cache_folder_value = str(cache_path) if cache_path else None
        self.text_model = SentenceTransformer(
            text_model_path,
            cache_folder=cache_folder_value,
            device=device,
            local_files_only=text_model_path != text_model_name,
        )
        self.image_model = (
            self.text_model
            if image_model_name == text_model_name
            else SentenceTransformer(
                image_model_path,
                cache_folder=cache_folder_value,
                device=device,
                local_files_only=image_model_path != image_model_name,
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


def _local_snapshot(model_name: str, cache_folder: Path | None) -> str:
    if cache_folder is None:
        return model_name
    snapshot_root = cache_folder / f"models--{model_name.replace('/', '--')}" / "snapshots"
    if not snapshot_root.exists():
        return model_name
    snapshots = [path for path in snapshot_root.iterdir() if path.is_dir()]
    if not snapshots:
        return model_name
    return str(max(snapshots, key=lambda path: path.stat().st_mtime))
