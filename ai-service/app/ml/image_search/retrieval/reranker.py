from __future__ import annotations

from app.ml.image_search.config.config import get_settings
from app.ml.image_search.image_processing.color_extractor import metadata_colors
from app.ml.image_search.text_processing.query_parser import ParsedQuery, normalize_text


STOPWORDS = {
    "tim",
    "search",
    "find",
    "san",
    "pham",
    "mau",
    "gia",
    "duoi",
    "tren",
    "tu",
    "den",
    "toi",
    "khong",
    "qua",
    "cho",
    "nguoi",
    "moi",
    "giong",
    "tuong",
    "tu",
    "similar",
}


def rerank_results(
    hits: list[dict],
    parsed_query: ParsedQuery,
) -> list[dict]:
    settings = get_settings()
    reranked = []
    query_tokens = _important_tokens(parsed_query.semantic_query)
    for hit in hits:
        score = float(hit["score"])
        reasons = [f"vector_similarity={score:.4f}"]
        searchable_text = normalize_text(
            " ".join(
                str(hit.get(key) or "")
                for key in ["name", "brand", "category", "color"]
            )
        )
        name_text = normalize_text(str(hit.get("name") or ""))

        if parsed_query.category_terms:
            if any(term in searchable_text for term in parsed_query.category_terms):
                score += 0.22
                reasons.append(f"category_match={parsed_query.category_key}")
            else:
                score -= 0.25
                reasons.append(f"category_mismatch={parsed_query.category_key}")

        desired_color = parsed_query.desired_color
        colors = metadata_colors(hit.get("color") or hit.get("colors"))
        if desired_color:
            if desired_color in colors:
                score += settings.color_match_bonus + 0.06
                reasons.append(f"color_match={desired_color}")
            elif colors:
                score -= settings.color_mismatch_penalty + 0.12
                reasons.append(f"color_mismatch={desired_color}")
            else:
                reasons.append(f"color_unknown={desired_color}")

        if query_tokens:
            matched_tokens = [token for token in query_tokens if token in searchable_text]
            if matched_tokens:
                token_bonus = min(0.18, len(matched_tokens) * 0.035)
                score += token_bonus
                reasons.append(f"keyword_match={','.join(matched_tokens[:5])}")
            name_matches = [token for token in query_tokens if token in name_text]
            if name_matches:
                score += min(0.16, len(name_matches) * 0.04)
                reasons.append(f"name_match={','.join(name_matches[:5])}")

        price = _item_price(hit)
        if parsed_query.min_price is not None:
            if price is not None and price >= parsed_query.min_price:
                score += 0.04
                reasons.append("min_price_match")
            else:
                score -= 0.08
                reasons.append("min_price_mismatch")
        if parsed_query.max_price is not None:
            if price is not None and price <= parsed_query.max_price:
                score += 0.06
                reasons.append("max_price_match")
            else:
                score -= 0.12
                reasons.append("max_price_mismatch")

        hit = {**hit, "score": round(score, 6), "reasons": reasons}
        reranked.append(hit)

    return sorted(reranked, key=lambda item: item["score"], reverse=True)


def _important_tokens(value: str | None) -> list[str]:
    tokens = []
    for token in normalize_text(value).split():
        if len(token) < 2 or token in STOPWORDS:
            continue
        if token not in tokens:
            tokens.append(token)
    return tokens


def _item_price(item: dict) -> float | None:
    try:
        price = float(item.get("price"))
        return price if price >= 0 else None
    except (TypeError, ValueError):
        return None
