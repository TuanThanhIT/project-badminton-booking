from pydantic import BaseModel

from app.ml.image_search.schemas.product_schema import ProductMetadata


class SearchResult(ProductMetadata):
    score: float
    reasons: list[str] = []


class SearchResponse(BaseModel):
    query: str | None
    desired_color: str | None
    search_mode: str | None = None
    applied_filters: dict | None = None
    total: int
    results: list[SearchResult]


class HealthResponse(BaseModel):
    status: str
    index_loaded: bool
    indexed_items: int
