from __future__ import annotations

import re
from dataclasses import dataclass

from app.ml.image_search.text_processing.color_dictionary import COLOR_ALIASES, normalize_color


@dataclass(frozen=True)
class ParsedQuery:
    raw_query: str
    semantic_query: str
    desired_color: str | None = None
    wants_similar: bool = False


def parse_query(query: str | None) -> ParsedQuery:
    raw = (query or "").strip()
    lowered = raw.lower()
    desired_color = None

    for canonical, aliases in COLOR_ALIASES.items():
        patterns = [canonical, *aliases]
        if any(re.search(rf"(?<!\w){re.escape(pattern)}(?!\w)", lowered) for pattern in patterns):
            desired_color = normalize_color(canonical)
            break

    wants_similar = any(token in lowered for token in ["tuong tu", "tương tự", "similar", "giong", "giống"])
    semantic = lowered
    semantic = re.sub(r"\b(tim|tìm|search|find|san pham|sản phẩm|mau|màu|nhung|nhưng)\b", " ", semantic)
    semantic = re.sub(r"\s+", " ", semantic).strip()

    return ParsedQuery(
        raw_query=raw,
        semantic_query=semantic or raw,
        desired_color=desired_color,
        wants_similar=wants_similar,
    )
