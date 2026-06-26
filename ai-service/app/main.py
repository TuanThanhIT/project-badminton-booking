from pathlib import Path
from typing import Dict
import os

import torch
from fastapi import FastAPI
from pydantic import BaseModel, Field
from transformers import AutoModelForSequenceClassification, AutoTokenizer

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


BASE_DIR = Path(__file__).resolve().parent.parent
MODERATION_MODEL_DIR = os.getenv(
    "MODEL_DIR",
    str(BASE_DIR / "models" / "bhub_phobert_moderation_model_v8"),
)
MAX_LENGTH = int(os.getenv("MAX_LENGTH", "128"))

app = FastAPI(
    title="B-Hub AI Service",
    description="PhoBERT moderation + LightGBM product recommendations",
    version="1.0.0",
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

moderation_tokenizer = AutoTokenizer.from_pretrained(
    MODERATION_MODEL_DIR,
    local_files_only=True,
)
moderation_model = AutoModelForSequenceClassification.from_pretrained(
    MODERATION_MODEL_DIR,
    local_files_only=True,
)
moderation_model.to(device)
moderation_model.eval()
id2label = moderation_model.config.id2label


class PredictRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)


class PredictResponse(BaseModel):
    label: str
    confidence: float
    probabilities: Dict[str, float]


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "moderationModel": {
            "ready": True,
            "modelDir": MODERATION_MODEL_DIR,
            "device": str(device),
            "labels": id2label,
        },
        "productModel": get_product_model_info(),
    }


@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    inputs = moderation_tokenizer(
        payload.text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=MAX_LENGTH,
    )

    inputs = {
        key: value.to(device)
        for key, value in inputs.items()
    }

    with torch.inference_mode():
        outputs = moderation_model(**inputs)

    probs = torch.softmax(outputs.logits, dim=-1)[0]
    pred_id = int(torch.argmax(probs).item())
    label = id2label[pred_id]
    confidence = float(probs[pred_id].item())
    probabilities = {
        id2label[i]: float(probs[i].item())
        for i in range(len(probs))
    }

    return {
        "label": label,
        "confidence": confidence,
        "probabilities": probabilities,
    }


@app.post("/api/v1/recommend/admin", response_model=ApiResponse)
def recommend_admin(request: AdminInsightsRequest):
    data = build_admin_insights(request.model_dump())
    return ApiResponse(data=data)


@app.get("/api/v1/product/status", response_model=ApiResponse)
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
