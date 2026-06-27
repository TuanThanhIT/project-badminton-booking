from __future__ import annotations

from functools import lru_cache

from app.core.config import get_settings
from app.modules.embedding.clip_encoder import ClipEncoder, get_clip_encoder
from app.modules.embedding.vector_utils import weighted_average
from app.modules.image.image_loader import open_image_bytes
from app.modules.retrieval.faiss_store import FaissStore
from app.modules.retrieval.metadata_store import MetadataStore
from app.modules.text.color_dictionary import detect_color, normalize_color


class SearchService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.store = FaissStore.load(self.settings.index_path)
        self.metadata = MetadataStore.load(self.settings.metadata_path)
        self._encoder: ClipEncoder | None = None

    @property
    def encoder(self) -> ClipEncoder:
        if self._encoder is None:
            self._encoder = get_clip_encoder()
        return self._encoder

    def status(self) -> dict:
        loaded = self.store.is_loaded and len(self.metadata) > 0
        return {"status": "ok", "index_loaded": loaded, "indexed_items": len(self.metadata)}

    def search(self, image_bytes: bytes | None, query: str | None, limit: int | None) -> dict:
        if not self.store.is_loaded or len(self.metadata) == 0:
            raise FileNotFoundError("Image search index is not built. Run `python scripts/build_index.py` first.")

        safe_limit = min(max(int(limit or self.settings.default_limit), 1), self.settings.max_limit)
        vectors = []
        weights = []
        if image_bytes:
            vectors.append(self.encoder.encode_image(open_image_bytes(image_bytes))[0])
            weights.append(self.settings.image_weight)
        if query:
            vectors.append(self.encoder.encode_text(query)[0])
            weights.append(self.settings.text_weight)
        if not vectors:
            raise ValueError("Please provide an image or query.")

        query_vector = vectors[0] if len(vectors) == 1 else weighted_average(vectors, weights)
        desired_color = detect_color(query)
        raw_results = self.store.search(query_vector, safe_limit * 3)

        results = []
        for index, score in raw_results:
            item = dict(self.metadata.get(index))
            item_color = normalize_color(str(item.get("color", "")))
            adjusted_score = score
            reasons = []
            if desired_color:
                if item_color == desired_color:
                    adjusted_score += 0.08
                    reasons.append(f"color_match:{desired_color}")
                elif item_color:
                    adjusted_score -= 0.06
                    reasons.append(f"color_mismatch:{item_color}")
            results.append(
                {
                    "product_id": item.get("product_id"),
                    "productId": item.get("product_id"),
                    "score": round(float(adjusted_score), 6),
                    "raw_score": round(float(score), 6),
                    "name": item.get("name"),
                    "image_url": item.get("image_url"),
                    "color": item.get("color"),
                    "desired_color": desired_color,
                    "reasons": reasons,
                }
            )

        results.sort(key=lambda item: item["score"], reverse=True)
        return {"results": results[:safe_limit], "query": query, "desired_color": desired_color}


@lru_cache(maxsize=1)
def get_search_service() -> SearchService:
    return SearchService()
