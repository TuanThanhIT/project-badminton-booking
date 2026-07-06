from __future__ import annotations

from PIL import Image

from app.ml.image_search.config.config import get_settings
from app.ml.image_search.embeddings.clip_encoder import ClipEncoder, get_clip_encoder
from app.ml.image_search.image_processing.color_extractor import metadata_colors
from app.ml.image_search.retrieval.faiss_store import FaissStore
from app.ml.image_search.retrieval.metadata_store import MetadataStore
from app.ml.image_search.retrieval.reranker import rerank_results
from app.ml.image_search.text_processing.query_parser import ParsedQuery, normalize_text, parse_query


class SearchService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self._encoder: ClipEncoder | None = None
        self.faiss_store = FaissStore.load(self.settings.index_path)
        self.text_store = FaissStore.load(self.settings.text_index_path)
        self.image_store = FaissStore.load(self.settings.image_index_path)
        self.metadata_store = MetadataStore.load(self.settings.metadata_path)

    @property
    def encoder(self) -> ClipEncoder:
        if self._encoder is None:
            self._encoder = get_clip_encoder()
        return self._encoder

    def reload(self) -> None:
        self.faiss_store = FaissStore.load(self.settings.index_path)
        self.text_store = FaissStore.load(self.settings.text_index_path)
        self.image_store = FaissStore.load(self.settings.image_index_path)
        self.metadata_store = MetadataStore.load(self.settings.metadata_path)

    def status(self) -> dict:
        return {
            "index_loaded": self.faiss_store.is_loaded,
            "text_index_loaded": self.text_store.is_loaded,
            "image_index_loaded": self.image_store.is_loaded,
            "indexed_items": min(self.faiss_store.count, len(self.metadata_store)),
            "text_indexed_items": min(self.text_store.count, len(self.metadata_store)),
            "image_indexed_items": min(self.image_store.count, len(self.metadata_store)),
        }

    def search(
        self,
        image: Image.Image | None,
        query: str | None,
        limit: int | None = None,
    ) -> dict:
        if len(self.metadata_store) == 0:
            raise FileNotFoundError(
                "Image search metadata is not built. Run `python scripts/build_image_search_index.py` first."
            )

        parsed_query = parse_query(query)
        requested_limit = min(limit or self.settings.default_limit, self.settings.max_limit)
        multiplier = 10 if parsed_query.has_structured_filters else 4
        candidate_limit = min(
            max(requested_limit * multiplier, requested_limit),
            self.settings.max_limit * multiplier,
        )
        hits = self._collect_hits(image, parsed_query, candidate_limit)
        hydrated = [
            {**self.metadata_store.get(index), "score": score}
            for index, score in hits
        ]

        results = rerank_results(hydrated, parsed_query)
        if parsed_query.has_structured_filters:
            results = [
                item for item in results
                if self._matches_structured_filters(item, parsed_query)
            ]
            if len(results) < requested_limit:
                seen_ids = {str(item.get("product_id")) for item in results}
                results.extend(
                    self._metadata_fallback(parsed_query, requested_limit - len(results), seen_ids)
                )

        results = results[:requested_limit]
        return {
            "query": parsed_query.raw_query or None,
            "desired_color": parsed_query.desired_color,
            "search_mode": self._search_mode(image is not None, parsed_query),
            "applied_filters": {
                "category": parsed_query.category_key,
                "color": parsed_query.desired_color,
                "min_price": parsed_query.min_price,
                "max_price": parsed_query.max_price,
            },
            "total": len(results),
            "results": results,
        }

    def _collect_hits(
        self,
        image: Image.Image | None,
        parsed_query: ParsedQuery,
        candidate_limit: int,
    ) -> list[tuple[int, float]]:
        has_image = image is not None
        has_text = bool(parsed_query.semantic_query)
        if not has_image and not has_text:
            raise ValueError("Provide at least an image or a text query")

        merged: dict[int, float] = {}

        if has_text:
            text_store = self.text_store if self.text_store.is_loaded else self.faiss_store
            if not text_store.is_loaded:
                raise FileNotFoundError(
                    "Text search index is not built. Run `python scripts/build_image_search_index.py` first."
                )
            text_vector = self.encoder.encode_text(parsed_query.semantic_query)[0]
            for index, score in text_store.search(text_vector, candidate_limit):
                merged[index] = max(merged.get(index, float("-inf")), score)

        if has_image:
            if not self.image_store.is_loaded:
                if not has_text:
                    raise FileNotFoundError(
                        "Image index is not built. Run `python scripts/build_image_search_index.py --include-images` first."
                    )
            else:
                image_vector = self.encoder.encode_image(image)[0]
                for index, score in self.image_store.search(image_vector, candidate_limit):
                    boost = 0.05 if index in merged else 0.0
                    merged[index] = max(merged.get(index, float("-inf")), score + boost)

        return sorted(merged.items(), key=lambda item: item[1], reverse=True)[:candidate_limit]

    def _search_mode(self, has_image: bool, parsed_query: ParsedQuery) -> str:
        has_text = bool(parsed_query.semantic_query)
        if has_image and has_text:
            suffix = "structured" if parsed_query.has_structured_filters else "semantic"
            return f"ai_multimodal_{suffix}"
        if has_image:
            return "ai_image"
        return "ai_structured" if parsed_query.has_structured_filters else "ai_semantic"

    def _matches_structured_filters(self, item: dict, parsed_query: ParsedQuery) -> bool:
        searchable_text = normalize_text(
            " ".join(
                str(item.get(key) or "")
                for key in ["name", "brand", "category", "description", "image_url"]
            )
        )

        if parsed_query.category_terms:
            if not any(term in searchable_text for term in parsed_query.category_terms):
                return False
        if parsed_query.excluded_terms:
            if any(term in searchable_text for term in parsed_query.excluded_terms):
                return False

        price = self._item_price(item)
        if parsed_query.min_price is not None and (price is None or price < parsed_query.min_price):
            return False
        if parsed_query.max_price is not None and (price is None or price > parsed_query.max_price):
            return False

        if parsed_query.desired_color:
            colors = metadata_colors(item.get("color") or item.get("colors"))
            if colors and parsed_query.desired_color not in colors:
                return False

        return True

    def _metadata_fallback(
        self,
        parsed_query: ParsedQuery,
        limit: int,
        seen_ids: set[str],
    ) -> list[dict]:
        if limit <= 0:
            return []

        candidates = []
        for item in self.metadata_store.items:
            product_id = str(item.get("product_id"))
            if product_id in seen_ids:
                continue
            if not self._matches_structured_filters(item, parsed_query):
                continue
            score = self._structured_score(item, parsed_query)
            candidates.append({
                **item,
                "score": round(score, 6),
                "reasons": ["metadata_structured_fallback"],
            })

        candidates.sort(key=lambda item: item["score"], reverse=True)
        return candidates[:limit]

    def _structured_score(self, item: dict, parsed_query: ParsedQuery) -> float:
        score = 0.45
        searchable_text = normalize_text(
            " ".join(str(item.get(key) or "") for key in ["name", "brand", "category"])
        )
        if parsed_query.category_terms and any(term in searchable_text for term in parsed_query.category_terms):
            score += 0.25
        if parsed_query.desired_color:
            colors = metadata_colors(item.get("color") or item.get("colors"))
            if parsed_query.desired_color in colors:
                score += 0.12
        price = self._item_price(item)
        if price is not None:
            if parsed_query.max_price is not None:
                score += max(0.0, 0.12 - (price / max(parsed_query.max_price, 1)) * 0.08)
            if parsed_query.min_price is not None and price >= parsed_query.min_price:
                score += 0.05
        return score

    @staticmethod
    def _item_price(item: dict) -> float | None:
        try:
            price = float(item.get("price"))
            return price if price >= 0 else None
        except (TypeError, ValueError):
            return None
