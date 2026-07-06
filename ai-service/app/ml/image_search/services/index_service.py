from __future__ import annotations

import re
from pathlib import Path

import pandas as pd

from app.ml.image_search.config.config import get_settings
from app.ml.image_search.config.logger import get_logger
from app.ml.image_search.embeddings.clip_encoder import ClipEncoder, get_clip_encoder
from app.ml.image_search.image_processing.image_loader import open_image_location
from app.ml.image_search.retrieval.faiss_store import FaissStore
from app.ml.image_search.retrieval.metadata_store import MetadataStore
from app.ml.image_search.text_processing.color_dictionary import normalize_color

logger = get_logger(__name__)


REQUIRED_COLUMNS = {"product_id", "name", "image_url"}
TAG_RE = re.compile(r"<[^>]+>")
SPACE_RE = re.compile(r"\s+")


class IndexService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self._encoder: ClipEncoder | None = None

    @property
    def encoder(self) -> ClipEncoder:
        if self._encoder is None:
            self._encoder = get_clip_encoder()
        return self._encoder

    def build_from_csv(self, csv_path: Path | None = None, include_images: bool = True) -> dict:
        source = csv_path or self.settings.products_csv_path
        if not source.exists():
            raise FileNotFoundError(f"Products CSV not found: {source}")

        rows = pd.read_csv(source).fillna("")
        missing = REQUIRED_COLUMNS - set(rows.columns)
        if missing:
            raise ValueError(f"Products CSV is missing columns: {', '.join(sorted(missing))}")

        records = rows.to_dict(orient="records")
        total = len(records)
        text_vectors = []
        image_vectors = []
        metadata = []
        skipped = 0
        for index, row in enumerate(records, start=1):
            try:
                text = self._metadata_text(row)
                text_vector = self.encoder.encode_text(text)[0]
                image_vector = None
                if include_images:
                    image = open_image_location(str(row["image_url"]), self.settings.image_timeout_seconds)
                    image_vector = self.encoder.encode_image(image)[0]

                text_vectors.append(text_vector)
                if image_vector is not None:
                    image_vectors.append(image_vector)
                metadata.append(self._clean_metadata(row))
            except Exception as exc:
                skipped += 1
                logger.warning(
                    "Skipped product %s while building image-search index: %s",
                    row.get("product_id", "unknown"),
                    exc,
                )

            if index == 1 or index % 10 == 0 or index == total:
                logger.info(
                    "Image-search index progress: %s/%s processed, %s text indexed, %s image indexed, %s skipped",
                    index,
                    total,
                    len(text_vectors),
                    len(image_vectors),
                    skipped,
                )

        if not text_vectors:
            raise RuntimeError("No products could be indexed. Check image URLs and network access.")

        text_store = FaissStore()
        text_store.build(text_vectors)
        text_store.save(self.settings.text_index_path)
        text_store.save(self.settings.index_path)

        if include_images and len(image_vectors) == len(metadata):
            image_store = FaissStore()
            image_store.build(image_vectors)
            image_store.save(self.settings.image_index_path)
        elif include_images:
            logger.warning(
                "Image index was not saved because only %s/%s image vectors were built. "
                "Fix failed image URLs, then rebuild with --include-images.",
                len(image_vectors),
                len(metadata),
            )

        MetadataStore(metadata).save(self.settings.metadata_path)

        logger.info(
            "Built image-search index with %s text vectors, %s image vectors, skipped %s",
            len(text_vectors),
            len(image_vectors),
            skipped,
        )
        return {
            "indexed_items": len(metadata),
            "text_indexed_items": len(text_vectors),
            "image_indexed_items": len(image_vectors),
            "skipped_items": skipped,
            "index_path": str(self.settings.index_path),
            "text_index_path": str(self.settings.text_index_path),
            "image_index_path": str(self.settings.image_index_path),
        }

    def _metadata_text(self, row: dict) -> str:
        parts = []
        for field in ["name", "brand", "category", "color", "price"]:
            value = row.get(field)
            if not value:
                continue
            text = self._plain_text(str(value))
            if text:
                parts.append(f"{field}: {text}")
        return " ".join(parts)

    def _plain_text(self, value: str) -> str:
        value = TAG_RE.sub(" ", value)
        return SPACE_RE.sub(" ", value).strip()

    def _clean_metadata(self, row: dict) -> dict:
        cleaned = {key: value for key, value in row.items() if value != ""}
        if cleaned.get("color"):
            cleaned["color"] = normalize_color(str(cleaned["color"])) or str(cleaned["color"])
        cleaned["product_id"] = str(cleaned["product_id"])
        cleaned["name"] = str(cleaned["name"])
        cleaned["image_url"] = str(cleaned["image_url"])
        return cleaned
