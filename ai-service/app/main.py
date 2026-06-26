from __future__ import annotations

from fastapi import FastAPI

from app.insights.admin_rules import build_admin_insights
from app.ml.product_trainer import (
    get_product_model_info,
    recommend_products,
    train_product_model,
)
from app.schemas import (
    AdminInsightsRequest,
    ApiResponse,
    ProductRecommendRequest,
    ProductTrainRequest,
)

app = FastAPI(
    title="B-Hub AI Recommendation Service",
    description="Product recommendations + rule-based admin insights",
    version="1.0.0",
)


@app.get("/health")
def health():
    product_info = get_product_model_info()
    return {"status": "ok", "productModel": product_info}


@app.post("/api/v1/recommend/admin", response_model=ApiResponse)
def recommend_admin(request: AdminInsightsRequest):
    payload = request.model_dump()
    data = build_admin_insights(payload)
    return ApiResponse(data=data)


@app.get("/api/v1/product/status")
def product_status():
    return ApiResponse(data=get_product_model_info())


@app.post("/api/v1/product/train", response_model=ApiResponse)
def product_train(request: ProductTrainRequest):
    result = train_product_model(request.model_dump())
    return ApiResponse(
        data=result,
        message="Training completed" if result.get("trained") else "Training skipped",
    )


@app.post("/api/v1/recommend/product", response_model=ApiResponse)
def recommend_product(request: ProductRecommendRequest):
    data = recommend_products(request.model_dump())
    data["productModelReady"] = get_product_model_info().get("ready", False)
    return ApiResponse(data=data)
