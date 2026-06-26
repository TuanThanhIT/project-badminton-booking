import os
from pathlib import Path
from typing import Dict

import torch
from fastapi import FastAPI
from pydantic import BaseModel, Field
from transformers import AutoModelForSequenceClassification, AutoTokenizer


BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_DIR = os.getenv(
    "MODEL_DIR",
    str(BASE_DIR / "models" / "bhub_phobert_moderation_model_v8")
)

MAX_LENGTH = int(os.getenv("MAX_LENGTH", "128"))

app = FastAPI(
    title="B-Hub AI Moderation Service",
    version="1.0.0"
)


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_DIR,
    local_files_only=True
)

model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_DIR,
    local_files_only=True
)

model.to(device)
model.eval()

id2label = model.config.id2label


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
        "message": "AI service is running",
        "model_loaded": True,
        "model_dir": MODEL_DIR,
        "device": str(device),
        "labels": id2label
    }


@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    inputs = tokenizer(
        payload.text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=MAX_LENGTH
    )

    inputs = {
        key: value.to(device)
        for key, value in inputs.items()
    }

    with torch.inference_mode():
        outputs = model(**inputs)

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
        "probabilities": probabilities
    }