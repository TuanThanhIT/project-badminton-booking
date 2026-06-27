from pathlib import Path

from fastapi import APIRouter, Depends

from app.ml.image_search.api.dependencies import get_index_service, get_search_service
from app.ml.image_search.services.index_service import IndexService
from app.ml.image_search.services.search_service import SearchService

router = APIRouter(prefix="/index", tags=["index"])


@router.post("/rebuild")
def rebuild_index(
    csv_path: str | None = None,
    index_service: IndexService = Depends(get_index_service),
    search_service: SearchService = Depends(get_search_service),
):
    result = index_service.build_from_csv(Path(csv_path) if csv_path else None)
    search_service.reload()
    return result
