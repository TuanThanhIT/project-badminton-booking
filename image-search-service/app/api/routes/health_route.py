from fastapi import APIRouter, Depends

from app.api.dependencies import get_search_service
from app.schemas.search_schema import HealthResponse
from app.services.search_service import SearchService

router = APIRouter(prefix="/health", tags=["health"])


@router.get("", response_model=HealthResponse)
def health(service: SearchService = Depends(get_search_service)):
    status = service.status()
    return {"status": "ok", **status}
