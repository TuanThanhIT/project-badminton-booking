from __future__ import annotations

import random
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from lightgbm import LGBMClassifier

MODEL_DIR = Path(__file__).resolve().parent.parent.parent / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH = MODEL_DIR / "booking_lgbm.joblib"
META_PATH = MODEL_DIR / "booking_meta.joblib"

FEATURES = ["userId", "branchId", "hour", "dayOfWeek"]
MIN_SAMPLES = 20


def _meta() -> dict:
    if META_PATH.exists():
        return joblib.load(META_PATH)
    return {}


def model_ready() -> bool:
    return MODEL_PATH.exists()


def train_booking_model(records: list[dict]) -> dict:
    if len(records) < MIN_SAMPLES:
        return {
            "trained": False,
            "reason": "insufficient_data",
            "sampleCount": len(records),
            "minRequired": MIN_SAMPLES,
        }

    df_pos = pd.DataFrame(records)
    df_pos["label"] = 1

    positive_keys = set(
        zip(df_pos["userId"], df_pos["branchId"], df_pos["hour"], df_pos["dayOfWeek"])
    )

    users = df_pos["userId"].unique()
    branches = df_pos["branchId"].unique()
    hours = list(range(6, 23))
    days = list(range(0, 7))

    neg_rows: list[dict] = []
    target_neg = min(len(df_pos) * 2, 8000)
    attempts = 0
    while len(neg_rows) < target_neg and attempts < target_neg * 5:
        attempts += 1
        key = (
            int(random.choice(users)),
            int(random.choice(branches)),
            int(random.choice(hours)),
            int(random.choice(days)),
        )
        if key in positive_keys:
            continue
        neg_rows.append(
            {
                "userId": key[0],
                "branchId": key[1],
                "hour": key[2],
                "dayOfWeek": key[3],
                "label": 0,
            }
        )

    df = pd.concat([df_pos, pd.DataFrame(neg_rows)], ignore_index=True)
    x = df[FEATURES]
    y = df["label"]

    from sklearn.metrics import accuracy_score, roc_auc_score
    from sklearn.model_selection import train_test_split

    model = LGBMClassifier(
        n_estimators=120,
        learning_rate=0.08,
        max_depth=6,
        num_leaves=31,
        random_state=42,
        verbose=-1,
    )

    metrics: dict[str, float | None] = {"accuracy": None, "rocAuc": None}
    if len(df) >= 40:
        x_train, x_test, y_train, y_test = train_test_split(
            x, y, test_size=0.2, random_state=42, stratify=y
        )
        model.fit(x_train, y_train)
        y_pred = model.predict(x_test)
        metrics["accuracy"] = round(float(accuracy_score(y_test, y_pred)), 4)
        if len(set(y_test)) > 1:
            try:
                y_prob = model.predict_proba(x_test)[:, 1]
                metrics["rocAuc"] = round(float(roc_auc_score(y_test, y_prob)), 4)
            except ValueError:
                metrics["rocAuc"] = None
    else:
        model.fit(x, y)

    trained_at = datetime.now(timezone.utc).isoformat()

    joblib.dump(model, MODEL_PATH)
    joblib.dump(
        {
            "features": FEATURES,
            "sampleCount": len(records),
            "modelType": "LightGBMClassifier",
            "trainedAt": trained_at,
            "metrics": metrics,
        },
        META_PATH,
    )

    return {
        "trained": True,
        "sampleCount": len(records),
        "modelType": "LightGBMClassifier",
        "negativeSamples": len(neg_rows),
        "trainedAt": trained_at,
        "metrics": metrics,
    }


def load_model() -> LGBMClassifier | None:
    if not MODEL_PATH.exists():
        return None
    return joblib.load(MODEL_PATH)


def get_model_info() -> dict:
    if not model_ready():
        return {"ready": False}
    meta = _meta()
    return {"ready": True, **meta}


def _history_profile(history: list[dict]) -> dict:
    if not history:
        return {}

    branch_counts: dict[int, int] = {}
    hour_counts: dict[int, int] = {}
    day_counts: dict[int, int] = {}

    for item in history:
        branch_counts[item["branchId"]] = branch_counts.get(item["branchId"], 0) + 1
        hour_counts[item["hour"]] = hour_counts.get(item["hour"], 0) + 1
        day_counts[item["dayOfWeek"]] = day_counts.get(item["dayOfWeek"], 0) + 1

    fav_branch = max(branch_counts, key=branch_counts.get)
    fav_hour = max(hour_counts, key=hour_counts.get)
    fav_day = max(day_counts, key=day_counts.get)

    return {
        "favoriteBranchId": fav_branch,
        "favoriteHour": fav_hour,
        "favoriteDayOfWeek": fav_day,
        "branchCounts": branch_counts,
        "hourCounts": hour_counts,
    }


def _cold_start(payload: dict) -> dict:
    branches = payload.get("branches") or []
    popular = payload.get("popularBranches") or []
    slots = payload.get("popularTimeSlots") or []
    discounts = payload.get("activeDiscounts") or []
    top_k = payload.get("topK", 5)

    branch_recs = popular[:top_k] or [
        {
            "branchId": b["id"],
            "branchName": b["name"],
            "score": 1.0,
            "reason": "popular",
        }
        for b in branches[:top_k]
    ]

    time_recs = slots[:top_k] or [
        {"hour": h, "label": f"{h:02d}:00", "score": 1.0, "reason": "popular"}
        for h in [18, 19, 20, 17, 21][:top_k]
    ]

    promo_branches = [
        {
            "branchId": b["id"],
            "branchName": b["name"],
            "discountCode": d["code"],
            "discountValue": d["value"],
        }
        for b in branches
        for d in discounts[:1]
    ][:top_k]

    return {
        "strategy": "cold_start",
        "isNewUser": True,
        "branchRecommendations": branch_recs,
        "timeSlotRecommendations": time_recs,
        "promotionSuggestions": promo_branches,
        "profile": None,
        "modelUsed": False,
    }


def predict_user_recommendations(payload: dict) -> dict:
    history = payload.get("history") or []
    user_id = payload.get("userId")
    top_k = payload.get("topK", 5)
    branches = payload.get("branches") or []

    if payload.get("isNewUser") or not history:
        result = _cold_start(payload)
        result["isNewUser"] = bool(payload.get("isNewUser") or not history)
        return result

    profile = _history_profile(history)
    model = load_model()

    branch_ids = [b["id"] for b in branches] or list(profile["branchCounts"].keys())
    hours = list(range(6, 23))
    days = list(range(0, 7))

    candidates = []
    for branch_id in branch_ids:
        for hour in hours:
            for day in days:
                candidates.append(
                    {
                        "userId": user_id,
                        "branchId": branch_id,
                        "hour": hour,
                        "dayOfWeek": day,
                    }
                )

    branch_name_map = {b["id"]: b["name"] for b in branches}

    if model is not None and user_id is not None:
        df = pd.DataFrame(candidates)
        probs = model.predict_proba(df[FEATURES])[:, 1]
        df["score"] = probs
        df = df.sort_values("score", ascending=False)

        branch_recs = []
        seen_branches: set[int] = set()
        for _, row in df.iterrows():
            bid = int(row["branchId"])
            if bid in seen_branches:
                continue
            seen_branches.add(bid)
            branch_recs.append(
                {
                    "branchId": bid,
                    "branchName": branch_name_map.get(bid),
                    "score": round(float(row["score"]), 4),
                    "reason": "ml_prediction",
                }
            )
            if len(branch_recs) >= top_k:
                break

        time_recs = []
        seen_hours: set[int] = set()
        for _, row in df.iterrows():
            hour = int(row["hour"])
            if hour in seen_hours:
                continue
            seen_hours.add(hour)
            time_recs.append(
                {
                    "hour": hour,
                    "label": f"{hour:02d}:00",
                    "dayOfWeek": int(row["dayOfWeek"]),
                    "score": round(float(row["score"]), 4),
                    "reason": "ml_prediction",
                }
            )
            if len(time_recs) >= top_k:
                break

        return {
            "strategy": "ml_personalized",
            "isNewUser": False,
            "branchRecommendations": branch_recs,
            "timeSlotRecommendations": time_recs,
            "promotionSuggestions": _promo_for_branches(
                branch_recs, payload.get("activeDiscounts") or []
            ),
            "profile": profile,
            "modelUsed": True,
            "modelType": _meta().get("modelType", "LightGBMClassifier"),
        }

    # Heuristic fallback when model not trained
    branch_recs = [
        {
            "branchId": bid,
            "branchName": branch_name_map.get(bid),
            "score": round(count / max(len(history), 1), 4),
            "reason": "history_frequency",
        }
        for bid, count in sorted(
            profile["branchCounts"].items(), key=lambda x: x[1], reverse=True
        )[:top_k]
    ]

    time_recs = [
        {
            "hour": hour,
            "label": f"{hour:02d}:00",
            "score": round(count / max(len(history), 1), 4),
            "reason": "history_frequency",
        }
        for hour, count in sorted(
            profile["hourCounts"].items(), key=lambda x: x[1], reverse=True
        )[:top_k]
    ]

    return {
        "strategy": "history_heuristic",
        "isNewUser": False,
        "branchRecommendations": branch_recs,
        "timeSlotRecommendations": time_recs,
        "promotionSuggestions": _promo_for_branches(
            branch_recs, payload.get("activeDiscounts") or []
        ),
        "profile": profile,
        "modelUsed": False,
    }


def _promo_for_branches(branch_recs: list[dict], discounts: list[dict]) -> list[dict]:
    if not discounts:
        return []
    promo = []
    code = discounts[0]
    for b in branch_recs[:3]:
        promo.append(
            {
                "branchId": b["branchId"],
                "branchName": b.get("branchName"),
                "discountCode": code.get("code"),
                "discountValue": code.get("value"),
                "reason": "active_promotion",
            }
        )
    return promo
