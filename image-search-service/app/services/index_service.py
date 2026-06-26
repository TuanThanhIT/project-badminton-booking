from __future__ import annotations

import re
from pathlib import Path

import pandas as pd

from app.core.config import get_settings
from app.core.logger import get_logger
from app.modules.embedding.clip_encoder import ClipEncoder, get_clip_encoder
from app.modules.embedding.vector_utils import weighted_average
from app.modules.image.image_loader import open_image_location
from app.modules.retrieval.faiss_store import FaissStore
from app.modules.retrieval.metadata_store import MetadataStore
from app.modules.text.color_dictionary import normalize_color

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

    def build_from_csv(self, csv_path: Path | None = None) -> dict:
        source = csv_path or self.settings.products_csv_path
        if not source.exists():
            raise FileNotFoundError(f"Products CSV not found: {source}")

        rows = pd.read_csv(source).fillna("")
        missing = REQUIRED_COLUMNS - set(rows.columns)
        if missing:
            raise ValueError(f"Products CSV is missing columns: {', '.join(sorted(missing))}")

        records = rows.to_dict(orient="records")
        total = len(records)
        vectors = []
        metadata = []
        skipped = 0
        for index, row in enumerate(records, start=1):
            try:
                image = open_image_location(str(row["image_url"]), self.settings.image_timeout_seconds)
                image_vector = self.encoder.encode_image(image)[0]
                text = self._metadata_text(row)
                text_vector = self.encoder.encode_text(text)[0]
                vectors.append(weighted_average([image_vector, text_vector], [0.75, 0.25]))
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
                    "Image-search index progress: %s/%s processed, %s indexed, %s skipped",
                    index,
                    total,
                    len(metadata),
                    skipped,
                )

        if not vectors:
            raise RuntimeError("No products could be indexed. Check image URLs and network access.")

        store = FaissStore()
        store.build(vectors)
        store.save(self.settings.index_path)
        MetadataStore(metadata).save(self.settings.metadata_path)

        logger.info("Built image-search index with %s products, skipped %s", len(metadata), skipped)
        return {
            "indexed_items": len(metadata),
            "skipped_items": skipped,
            "index_path": str(self.settings.index_path),
        }

    def _metadata_text(self, row: dict) -> str:
        parts = []
        for field in ["name", "brand", "category", "color", "description"]:
            value = row.get(field)
            if not value:
                continue
            text = self._plain_text(str(value))
            if field == "description":
                text = text[:500]
            parts.append(text)
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
