from __future__ import annotations

from PIL import Image

from app.core.config import get_settings
from app.modules.embedding.clip_encoder import ClipEncoder, get_clip_encoder
from app.modules.embedding.vector_utils import weighted_average
from app.modules.retrieval.faiss_store import FaissStore
from app.modules.retrieval.metadata_store import MetadataStore
from app.modules.retrieval.reranker import rerank_results
from app.modules.text.query_parser import ParsedQuery, parse_query


class SearchService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self._encoder: ClipEncoder | None = None
        self.faiss_store = FaissStore.load(self.settings.index_path)
        self.metadata_store = MetadataStore.load(self.settings.metadata_path)

    @property
    def encoder(self) -> ClipEncoder:
        if self._encoder is None:
            self._encoder = get_clip_encoder()
        return self._encoder

    def reload(self) -> None:
        self.faiss_store = FaissStore.load(self.settings.index_path)
        self.metadata_store = MetadataStore.load(self.settings.metadata_path)

    def status(self) -> dict:
        return {
            "index_loaded": self.faiss_store.is_loaded,
            "indexed_items": min(self.faiss_store.count, len(self.metadata_store)),
        }

    def search(
        self,
        image: Image.Image | None,
        query: str | None,
        limit: int | None = None,
    ) -> dict:
        if not self.faiss_store.is_loaded or len(self.metadata_store) == 0:
            raise FileNotFoundError(
                "Image search index is not built. Run `python scripts/build_index.py` first."
            )

        parsed_query = parse_query(query)
        query_vector = self._build_query_vector(image, parsed_query)
        requested_limit = min(limit or self.settings.default_limit, self.settings.max_limit)
        candidate_limit = min(max(requested_limit * 4, requested_limit), self.settings.max_limit * 4)
        hits = self.faiss_store.search(query_vector, candidate_limit)

        hydrated = []
        for index, score in hits:
            item = self.metadata_store.get(index)
            hydrated.append({**item, "score": score})

        results = rerank_results(hydrated, parsed_query)[:requested_limit]
        return {
            "query": parsed_query.raw_query or None,
            "desired_color": parsed_query.desired_color,
            "total": len(results),
            "results": results,
        }

    def _build_query_vector(self, image: Image.Image | None, parsed_query: ParsedQuery):
        vectors = []
        weights = []

        if image is not None:
            vectors.append(self.encoder.encode_image(image)[0])
            weights.append(self.settings.image_weight)

        if parsed_query.semantic_query:
            vectors.append(self.encoder.encode_text(parsed_query.semantic_query)[0])
            weights.append(self.settings.text_weight)

        if not vectors:
            raise ValueError("Provide at least an image or a text query")
        return weighted_average(vectors, weights)
