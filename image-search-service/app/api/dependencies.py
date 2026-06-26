from functools import lru_cache

from app.services.index_service import IndexService
from app.services.search_service import SearchService


@lru_cache(maxsize=1)
def get_search_service() -> SearchService:
    return SearchService()


@lru_cache(maxsize=1)
def get_index_service() -> IndexService:
    return IndexService()
