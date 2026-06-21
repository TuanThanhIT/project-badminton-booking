from __future__ import annotations

import random
from datetime import datetime, timezone
from pathlib import Path

import joblib
import pandas as pd
from lightgbm import LGBMClassifier

MODEL_DIR = Path(__file__).resolve().parent.parent.parent / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

COOCCUR_PATH = MODEL_DIR / "product_cooccur.joblib"
PRODUCT_MODEL_PATH = MODEL_DIR / "product_lgbm.joblib"
PRODUCT_META_PATH = MODEL_DIR / "product_meta.joblib"

FEATURES = ["userId", "productId", "categoryId"]
MIN_RECORDS = 10
TOP_COOCCUR_PER_ITEM = 12


def product_model_ready() -> bool:
    return COOCCUR_PATH.exists() or PRODUCT_MODEL_PATH.exists()


def _meta() -> dict:
    if PRODUCT_META_PATH.exists():
        return joblib.load(PRODUCT_META_PATH)
    return {}


def get_product_model_info() -> dict:
    if not product_model_ready():
        return {"ready": False}
    return {"ready": True, **_meta()}


def _build_cooccurrence(baskets: list[list[int]]) -> dict[int, list[dict]]:
    """Đếm số lần các cặp sản phẩm xuất hiện chung trong một đơn hàng."""
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

    category_of = {int(p["id"]): int(p.get("categoryId") or 0) for p in products}
    all_product_ids = list(category_of.keys())

    df_pos = pd.DataFrame(records)
    df_pos["label"] = 1
    positive_keys = set(zip(df_pos["userId"], df_pos["productId"]))
    users = df_pos["userId"].unique().tolist()

    trained_model = False
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
            neg_rows.append(
                {
                    "userId": uid,
                    "productId": pid,
                    "categoryId": category_of.get(pid, 0),
                    "label": 0,
                }
            )

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
        metrics: dict[str, float | None] = {"accuracy": None, "rocAuc": None}
        x = df[FEATURES]
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
    else:
        metrics = {"accuracy": None, "rocAuc": None}

    trained_at = datetime.now(timezone.utc).isoformat()
    joblib.dump(
        {
            "features": FEATURES,
            "recordCount": len(records),
            "basketCount": len(baskets),
            "cooccurItems": len(cooccur),
            "modelType": "LightGBMClassifier" if trained_model else "cooccurrence_only",
            "trainedAt": trained_at,
            "metrics": metrics,
        },
        PRODUCT_META_PATH,
    )

    return {
        "trained": True,
        "recordCount": len(records),
        "basketCount": len(baskets),
        "cooccurItems": len(cooccur),
        "personalizedModel": trained_model,
        "trainedAt": trained_at,
        "metrics": metrics,
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
                "reason": reason,
            }
        )
    return items


def _popular_items(payload: dict, product_map: dict, exclude: set[int], top_k: int) -> list[dict]:
    popular = payload.get("popularProducts") or []
    ids = [int(p["productId"]) for p in popular if int(p["productId"]) not in exclude]
    items = _decorate(ids, product_map, "popular")
    if len(items) < top_k:
        # bổ sung bằng catalog nếu chưa đủ
        chosen = {it["productId"] for it in items}
        extra_ids = [
            pid
            for pid in product_map.keys()
            if pid not in exclude and pid not in chosen
        ]
        items.extend(_decorate(extra_ids, product_map, "catalog"))
    return items[:top_k]


def recommend_products(payload: dict) -> dict:
    mode = payload.get("mode", "user")
    top_k = int(payload.get("topK", 6))
    products = payload.get("products") or []
    product_map = {
        int(p["id"]): {
            "name": p.get("name"),
            "thumbnailUrl": p.get("thumbnailUrl"),
            "minPrice": p.get("minPrice"),
            "categoryId": int(p.get("categoryId") or 0),
        }
        for p in products
    }

    # ===== Mode 1: sản phẩm thường mua kèm (item-to-item) =====
    if mode == "related":
        product_id = int(payload.get("productId") or 0)
        exclude = {product_id}
        cooccur = _load_cooccur()
        related = cooccur.get(product_id) or []
        ranked_ids = [int(r["productId"]) for r in related if int(r["productId"]) not in exclude]

        items = _decorate(ranked_ids, product_map, "bought_together")

        # fallback: cùng danh mục
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

    # ===== Mode 2: gợi ý cá nhân hóa cho user =====
    history = payload.get("history") or []
    user_id = payload.get("userId")
    purchased_ids = {int(h["productId"]) for h in history}

    if not history or user_id is None:
        items = _popular_items(payload, product_map, set(), top_k)
        return {"strategy": "cold_start", "items": items, "modelUsed": False}

    model = _load_product_model()
    candidate_ids = [pid for pid in product_map.keys() if pid not in purchased_ids]

    if model is not None and candidate_ids:
        rows = [
            {
                "userId": int(user_id),
                "productId": pid,
                "categoryId": product_map[pid]["categoryId"],
            }
            for pid in candidate_ids
        ]
        df = pd.DataFrame(rows)
        df["score"] = model.predict_proba(df[FEATURES])[:, 1]
        df = df.sort_values("score", ascending=False).head(top_k)

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
                    "score": round(float(row["score"]), 4),
                    "reason": "ml_prediction",
                }
            )
        return {"strategy": "ml_personalized", "items": items, "modelUsed": True}

    # fallback: ưu tiên cùng danh mục đã mua, rồi phổ biến
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
