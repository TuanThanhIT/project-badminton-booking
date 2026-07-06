from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.ml.image_search.api.dependencies import get_search_service
from app.ml.image_search.image_processing.image_loader import open_upload_image
from app.ml.image_search.schemas.search_schema import SearchResponse
from app.ml.image_search.services.search_service import SearchService

router = APIRouter(prefix="/search", tags=["search"])


@router.post("", response_model=SearchResponse)
async def search_products(
    image: UploadFile | None = File(default=None),
    query: str | None = Form(default=None),
    limit: int | None = Form(default=None),
    service: SearchService = Depends(get_search_service),
):
    try:
        pil_image = await open_upload_image(image) if image else None
        return service.search(pil_image, query, limit)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
