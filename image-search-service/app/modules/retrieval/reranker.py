from __future__ import annotations

from app.core.config import get_settings
from app.modules.image.color_extractor import metadata_colors
from app.modules.text.query_parser import ParsedQuery


def rerank_results(
    hits: list[dict],
    parsed_query: ParsedQuery,
) -> list[dict]:
    settings = get_settings()
    reranked = []
    for hit in hits:
        score = float(hit["score"])
        reasons = [f"vector_similarity={score:.4f}"]

        desired_color = parsed_query.desired_color
        colors = metadata_colors(hit.get("color") or hit.get("colors"))
        if desired_color:
            if desired_color in colors:
                score += settings.color_match_bonus
                reasons.append(f"color_match={desired_color}")
            elif colors:
                score -= settings.color_mismatch_penalty
                reasons.append(f"color_mismatch={desired_color}")
            else:
                reasons.append(f"color_unknown={desired_color}")

        hit = {**hit, "score": round(score, 6), "reasons": reasons}
        reranked.append(hit)

    return sorted(reranked, key=lambda item: item["score"], reverse=True)
