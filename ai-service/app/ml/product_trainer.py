from __future__ import annotations

import random
from datetime import datetime, timezone
import os
from pathlib import Path

import joblib
import pandas as pd
from lightgbm import LGBMClassifier

BASE_DIR = Path(__file__).resolve().parent.parent.parent


def _resolve_model_dir() -> Path:
    raw = os.getenv("RECOMMENDATION_MODEL_DIR")
    if not raw:
        return BASE_DIR / "models" / "recommendation"
    path = Path(raw)
    if path.is_absolute():
        return path
    return (BASE_DIR / path).resolve()


MODEL_DIR = _resolve_model_dir()
MODEL_DIR.mkdir(parents=True, exist_ok=True)

COOCCUR_PATH = MODEL_DIR / "product_cooccur.joblib"
PRODUCT_MODEL_PATH = MODEL_DIR / "product_lgbm.joblib"
PRODUCT_META_PATH = MODEL_DIR / "product_meta.joblib"

FEATURES_V2 = [
    "userId",
    "productId",
    "categoryId",
    "soldCount",
    "minPrice",
    "avgPriceUser",
]
FEATURES_V1 = ["userId", "productId", "categoryId"]
FEATURES = FEATURES_V2

MIN_RECORDS = 10
TOP_COOCCUR_PER_ITEM = 12
MAX_ITEMS_PER_CATEGORY = 3


def product_model_ready() -> bool:
    return COOCCUR_PATH.exists() or PRODUCT_MODEL_PATH.exists()


def _meta() -> dict:
    if PRODUCT_META_PATH.exists():
        return joblib.load(PRODUCT_META_PATH)
    return {}


def _active_features() -> list[str]:
    meta = _meta()
    return list(meta.get("features") or FEATURES)


def get_product_model_info() -> dict:
    if not product_model_ready():
        return {"ready": False}
    return {
        "ready": True,
        "modelDir": str(MODEL_DIR),
        "artifactPaths": {
            "cooccurJoblib": str(COOCCUR_PATH),
            "lgbmJoblib": str(PRODUCT_MODEL_PATH),
            "metaJoblib": str(PRODUCT_META_PATH),
        },
        **_meta(),
    }


def _build_product_maps(products: list) -> dict[int, dict]:
    return {
        int(p["id"]): {
            "categoryId": int(p.get("categoryId") or 0),
            "minPrice": float(p.get("minPrice") or 0),
            "soldCount": int(p.get("soldCount") or 0),
        }
        for p in products
    }


def _build_user_avg_map(payload: dict) -> dict[int, float]:
    profiles = payload.get("userProfiles") or []
    if profiles:
        return {
            int(row["userId"]): float(row.get("avgPriceUser") or 0) for row in profiles
        }

    result: dict[int, float] = {}
    for row in payload.get("records") or []:
        uid = int(row["userId"])
        if row.get("avgPriceUser") is not None:
            result[uid] = float(row.get("avgPriceUser") or 0)
    return result


def _feature_row(
    user_id: int,
    product_id: int,
    product_maps: dict[int, dict],
    user_avg_map: dict[int, float],
    *,
    record: dict | None = None,
) -> dict:
    info = product_maps.get(int(product_id), {})
    avg_price = user_avg_map.get(int(user_id))
    if avg_price is None and record is not None:
        avg_price = float(record.get("avgPriceUser") or 0)
    if avg_price is None:
        avg_price = 0.0

    if record is not None:
        return {
            "userId": int(user_id),
            "productId": int(product_id),
            "categoryId": int(record.get("categoryId") or info.get("categoryId", 0)),
            "soldCount": int(record.get("soldCount") or info.get("soldCount", 0)),
            "minPrice": float(record.get("minPrice") or info.get("minPrice", 0)),
            "avgPriceUser": float(record.get("avgPriceUser") or avg_price),
        }

    return {
        "userId": int(user_id),
        "productId": int(product_id),
        "categoryId": int(info.get("categoryId", 0)),
        "soldCount": int(info.get("soldCount", 0)),
        "minPrice": float(info.get("minPrice", 0)),
        "avgPriceUser": float(avg_price),
    }


def _build_cooccurrence(baskets: list[list[int]]) -> dict[int, list[dict]]:
    counts: dict[int, dict[int, int]] = {}

    for basket in baskets:
        unique_items = list({int(pid) for pid in basket if pid is not None})
        for i, item_a in enumerate(unique_items):
            for item_b in unique_items[i + 1 :]:
                counts.setdefault(item_a, {})
                counts.setdefault(item_b, {})
                counts[item_a][item_b] = counts[item_a].get(item_b, 0) + 1
                counts[item_b][item_a] = counts[item_b].get(item_a, 0) + 1

    cooccur: dict[int, list[dict]] = {}
    for product_id, related in counts.items():
        ranked = sorted(related.items(), key=lambda x: x[1], reverse=True)
        cooccur[product_id] = [
            {"productId": rid, "coCount": count}
            for rid, count in ranked[:TOP_COOCCUR_PER_ITEM]
        ]
    return cooccur


def train_product_model(payload: dict) -> dict:
    baskets = payload.get("baskets") or []
    records = payload.get("records") or []
    products = payload.get("products") or []

    if len(records) < MIN_RECORDS:
        return {
            "trained": False,
            "reason": "insufficient_data",
            "recordCount": len(records),
            "minRequired": MIN_RECORDS,
        }

    cooccur = _build_cooccurrence(baskets)
    joblib.dump(cooccur, COOCCUR_PATH)

    product_maps = _build_product_maps(products)
    user_avg_map = _build_user_avg_map(payload)
    features = list(payload.get("featureSchema") or FEATURES)

    positive_rows = [
        {**_feature_row(int(r["userId"]), int(r["productId"]), product_maps, user_avg_map, record=r), "label": 1}
        for r in records
    ]
    df_pos = pd.DataFrame(positive_rows)
    positive_keys = set(zip(df_pos["userId"], df_pos["productId"]))
    users = df_pos["userId"].unique().tolist()
    all_product_ids = list(product_maps.keys())

    trained_model = False
    metrics: dict[str, float | None] = {"accuracy": None, "rocAuc": None}

    if all_product_ids and len(users) > 0:
        neg_rows: list[dict] = []
        target_neg = min(len(df_pos) * 2, 8000)
        attempts = 0
        while len(neg_rows) < target_neg and attempts < target_neg * 5:
            attempts += 1
            uid = int(random.choice(users))
            pid = int(random.choice(all_product_ids))
            if (uid, pid) in positive_keys:
                continue
            row = _feature_row(uid, pid, product_maps, user_avg_map)
            row["label"] = 0
            neg_rows.append(row)

        from sklearn.metrics import accuracy_score, roc_auc_score
        from sklearn.model_selection import train_test_split

        df = pd.concat([df_pos, pd.DataFrame(neg_rows)], ignore_index=True)
        model = LGBMClassifier(
            n_estimators=120,
            learning_rate=0.08,
            max_depth=6,
            num_leaves=31,
            random_state=42,
            verbose=-1,
        )
        x = df[features]
        y = df["label"]
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

        joblib.dump(model, PRODUCT_MODEL_PATH)
        trained_model = True

    trained_at = datetime.now(timezone.utc).isoformat()
    meta = {
        "features": features,
        "recordCount": len(records),
        "basketCount": len(baskets),
        "cooccurItems": len(cooccur),
        "modelType": "LightGBMClassifier" if trained_model else "cooccurrence_only",
        "trainedAt": trained_at,
        "metrics": metrics,
    }
    joblib.dump(meta, PRODUCT_META_PATH)

    return {
        "trained": True,
        "recordCount": len(records),
        "basketCount": len(baskets),
        "cooccurItems": len(cooccur),
        "personalizedModel": trained_model,
        "trainedAt": trained_at,
        "metrics": metrics,
        "features": features,
    }


def _load_cooccur() -> dict:
    if COOCCUR_PATH.exists():
        return joblib.load(COOCCUR_PATH)
    return {}


def _load_product_model() -> LGBMClassifier | None:
    if PRODUCT_MODEL_PATH.exists():
        return joblib.load(PRODUCT_MODEL_PATH)
    return None


def _decorate(product_ids: list[int], product_map: dict, reason: str) -> list[dict]:
    items = []
    for pid in product_ids:
        info = product_map.get(pid)
        if not info:
            continue
        items.append(
            {
                "productId": pid,
                "productName": info.get("name"),
                "thumbnailUrl": info.get("thumbnailUrl"),
                "minPrice": info.get("minPrice"),
                "categoryId": info.get("categoryId"),
                "soldCount": info.get("soldCount"),
                "reason": reason,
            }
        )
    return items


def _popular_items(payload: dict, product_map: dict, exclude: set[int], top_k: int) -> list[dict]:
    popular = payload.get("popularProducts") or []
    ids = [int(p["productId"]) for p in popular if int(p["productId"]) not in exclude]
    items = _decorate(ids, product_map, "popular")
    if len(items) < top_k:
        chosen = {it["productId"] for it in items}
        extra_ids = [
            pid for pid in product_map.keys() if pid not in exclude and pid not in chosen
        ]
        items.extend(_decorate(extra_ids, product_map, "catalog"))
    return items[:top_k]


def _select_diverse_by_category(
    df: pd.DataFrame,
    *,
    top_k: int,
    max_per_category: int,
) -> pd.DataFrame:
    """Giữ top score nhưng mỗi categoryId tối đa max_per_category sản phẩm."""
    if max_per_category <= 0 or df.empty:
        return df.head(top_k)

    cat_counts: dict[int, int] = {}
    selected_indices: list = []
    for idx, row in df.iterrows():
        cat = int(row["categoryId"])
        if cat_counts.get(cat, 0) >= max_per_category:
            continue
        selected_indices.append(idx)
        cat_counts[cat] = cat_counts.get(cat, 0) + 1
        if len(selected_indices) >= top_k:
            break
    return df.loc[selected_indices]


def recommend_products(payload: dict) -> dict:
    mode = payload.get("mode", "user")
    top_k = int(payload.get("topK", 6))
    max_per_category = int(payload.get("maxPerCategory") or MAX_ITEMS_PER_CATEGORY)
    products = payload.get("products") or []
    product_map = {
        int(p["id"]): {
            "name": p.get("name"),
            "thumbnailUrl": p.get("thumbnailUrl"),
            "minPrice": p.get("minPrice"),
            "categoryId": int(p.get("categoryId") or 0),
            "soldCount": int(p.get("soldCount") or 0),
        }
        for p in products
    }

    if mode == "related":
        product_id = int(payload.get("productId") or 0)
        exclude = {product_id}
        cooccur = _load_cooccur()
        related = cooccur.get(product_id) or []
        ranked_ids = [int(r["productId"]) for r in related if int(r["productId"]) not in exclude]
        items = _decorate(ranked_ids, product_map, "bought_together")

        if len(items) < top_k:
            base = product_map.get(product_id)
            if base:
                same_cat = [
                    pid
                    for pid, info in product_map.items()
                    if info["categoryId"] == base["categoryId"]
                    and pid not in exclude
                    and not any(it["productId"] == pid for it in items)
                ]
                items.extend(_decorate(same_cat, product_map, "same_category"))

        return {
            "strategy": "item_cooccurrence" if related else "same_category",
            "items": items[:top_k],
            "modelUsed": bool(related),
        }

    history = payload.get("history") or []
    user_id = payload.get("userId")
    purchased_ids = {int(h["productId"]) for h in history}

    if not history or user_id is None:
        items = _popular_items(payload, product_map, set(), top_k)
        return {"strategy": "cold_start", "items": items, "modelUsed": False}

    model = _load_product_model()
    candidate_ids = [pid for pid in product_map.keys() if pid not in purchased_ids]
    features = _active_features()
    product_maps = _build_product_maps(products)
    user_avg_map = {int(user_id): float(payload.get("avgPriceUser") or 0)}

    if model is not None and candidate_ids:
        rows = [
            _feature_row(int(user_id), pid, product_maps, user_avg_map)
            for pid in candidate_ids
        ]
        df = pd.DataFrame(rows)
        df["score"] = model.predict_proba(df[features])[:, 1]
        df = df.sort_values("score", ascending=False)
        df = _select_diverse_by_category(
            df, top_k=top_k, max_per_category=max_per_category
        )

        items = []
        for _, row in df.iterrows():
            pid = int(row["productId"])
            info = product_map[pid]
            items.append(
                {
                    "productId": pid,
                    "productName": info["name"],
                    "thumbnailUrl": info["thumbnailUrl"],
                    "minPrice": info["minPrice"],
                    "categoryId": info["categoryId"],
                    "soldCount": info["soldCount"],
                    "score": round(float(row["score"]), 4),
                    "reason": "ml_prediction",
                }
            )
        return {
            "strategy": "ml_personalized",
            "items": items,
            "modelUsed": True,
            "featuresUsed": features,
            "maxPerCategory": max_per_category,
        }

    fav_categories = {int(h.get("categoryId") or 0) for h in history}
    same_cat = [
        pid
        for pid, info in product_map.items()
        if info["categoryId"] in fav_categories and pid not in purchased_ids
    ]
    items = _decorate(same_cat, product_map, "history_category")
    if len(items) < top_k:
        items.extend(_popular_items(payload, product_map, purchased_ids, top_k - len(items)))
    return {"strategy": "history_heuristic", "items": items[:top_k], "modelUsed": False}
