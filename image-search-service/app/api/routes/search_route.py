from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.services.search_service import get_search_service

router = APIRouter()


@router.post("/search")
async def search(
    image: UploadFile | None = File(default=None),
    query: str | None = Form(default=None),
    limit: int | None = Form(default=None),
) -> dict:
    try:
        image_bytes = await image.read() if image else None
        return get_search_service().search(image_bytes=image_bytes, query=query, limit=limit)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
