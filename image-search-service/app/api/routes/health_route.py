from fastapi import APIRouter

from app.services.search_service import get_search_service

router = APIRouter()


@router.get("/health")
def health() -> dict:
    return get_search_service().status()
