from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass

from app.ml.image_search.text_processing.color_dictionary import COLOR_ALIASES, normalize_color


@dataclass(frozen=True)
class ParsedQuery:
    raw_query: str
    semantic_query: str
    desired_color: str | None = None
    category_key: str | None = None
    category_terms: tuple[str, ...] = ()
    excluded_terms: tuple[str, ...] = ()
    min_price: float | None = None
    max_price: float | None = None
    wants_similar: bool = False

    @property
    def has_structured_filters(self) -> bool:
        return bool(
            self.category_key
            or self.desired_color
            or self.min_price is not None
            or self.max_price is not None
        )


def normalize_text(value: str | None) -> str:
    text = unicodedata.normalize("NFD", value or "")
    text = "".join(char for char in text if unicodedata.category(char) != "Mn")
    text = text.replace("đ", "d").replace("Đ", "D").lower()
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", text)).strip()


CATEGORY_RULES = [
    {
        "key": "shoe",
        "terms": ("giay cau long",),
        "aliases": ("giay cau long", "giay danh cau", "doi giay"),
        "excluded": ("lot giay", "de lot"),
    },
    {
        "key": "insole",
        "terms": ("lot giay",),
        "aliases": ("lot giay", "de lot"),
        "excluded": (),
    },
    {
        "key": "racket",
        "terms": ("vot cau long",),
        "aliases": ("vot cau long", "cay vot", "vot danh cau"),
        "excluded": (),
    },
    {
        "key": "shirt",
        "terms": ("ao cau long", "ao the thao"),
        "aliases": ("ao cau long", "ao the thao", "ao danh cau"),
        "excluded": (),
    },
    {
        "key": "shorts",
        "terms": ("quan cau long",),
        "aliases": ("quan cau long", "quan danh cau"),
        "excluded": (),
    },
    {
        "key": "skirt",
        "terms": ("vay cau long",),
        "aliases": ("vay cau long", "vay danh cau"),
        "excluded": (),
    },
    {
        "key": "backpack",
        "terms": ("balo cau long",),
        "aliases": ("balo cau long", "ba lo cau long"),
        "excluded": (),
    },
    {
        "key": "bag",
        "terms": ("tui vot cau long", "tui cau long"),
        "aliases": ("tui vot cau long", "tui cau long", "tui dung vot"),
        "excluded": ("balo", "ba lo"),
    },
    {
        "key": "shuttle",
        "terms": ("qua cau long", "ong cau long"),
        "aliases": ("qua cau long", "ong cau long"),
        "excluded": (),
    },
    {
        "key": "string",
        "terms": ("cuoc", "day cuoc"),
        "aliases": ("cuoc dan vot", "day cuoc", "cuoc cau long"),
        "excluded": (),
    },
    {
        "key": "socks",
        "terms": ("vo cau long", "tat cau long"),
        "aliases": ("vo cau long", "tat cau long"),
        "excluded": (),
    },
    {
        "key": "keychain",
        "terms": ("moc khoa cau long", "moc khoa", "moc khoc"),
        "aliases": ("moc khoa cau long", "moc khoa", "moc khoc", "keychain"),
        "excluded": (),
    },
]


def parse_price(value: str | None) -> float | None:
    raw = re.sub(r"\s+", "", value or "").lower()
    million_match = re.match(r"^(\d+(?:[.,]\d+)?)(?:tr|trieu|m|million)$", raw)
    if million_match:
        return float(million_match.group(1).replace(",", ".")) * 1_000_000

    thousand_match = re.match(r"^(\d+(?:[.,]\d+)?)(?:k|nghin)$", raw)
    if thousand_match:
        return float(thousand_match.group(1).replace(",", ".")) * 1_000

    digits = re.sub(r"[^\d]", "", raw)
    return float(digits) if digits else None


def detect_category(normalized_query: str) -> dict | None:
    for rule in CATEGORY_RULES:
        has_alias = any(alias in normalized_query for alias in rule["aliases"])
        has_excluded = any(excluded in normalized_query for excluded in rule["excluded"])
        if has_alias and not has_excluded:
            return rule
    return None


def detect_price_bounds(normalized_query: str) -> tuple[float | None, float | None]:
    price_token = r"(\d[\d.,]*(?:\s*(?:tr|trieu|m|million|k|nghin))?)"
    range_match = re.search(
        rf"(?:tu|trong khoang)\s*{price_token}\s*(?:den|-|toi)\s*{price_token}",
        normalized_query,
    )
    if range_match:
        return parse_price(range_match.group(1)), parse_price(range_match.group(2))

    max_price = None
    min_price = None
    max_patterns = [
        rf"(?:gia\s*)?(?:duoi|nho hon|be hon|khong qua|toi da|<=|<)\s*{price_token}",
        rf"{price_token}\s*(?:tro xuong|do lai)",
    ]
    min_patterns = [
        rf"(?:gia\s*)?(?:tren|lon hon|cao hon|tu|>=|>)\s*{price_token}",
        rf"{price_token}\s*(?:tro len)",
    ]

    for pattern in max_patterns:
        match = re.search(pattern, normalized_query)
        if match:
            max_price = parse_price(match.group(1))
            break
    for pattern in min_patterns:
        match = re.search(pattern, normalized_query)
        if match:
            min_price = parse_price(match.group(1))
            break
    return min_price, max_price


def detect_color(raw_query: str, normalized_query: str) -> str | None:
    lowered = raw_query.lower()
    for canonical, aliases in COLOR_ALIASES.items():
        patterns = {canonical, *aliases, *(normalize_text(alias) for alias in aliases)}
        for pattern in patterns:
            normalized_pattern = normalize_text(pattern)
            if (
                re.search(rf"(?<!\w){re.escape(pattern)}(?!\w)", lowered)
                or re.search(rf"(?<!\w){re.escape(normalized_pattern)}(?!\w)", normalized_query)
            ):
                return normalize_color(canonical)
    return None


def parse_query(query: str | None) -> ParsedQuery:
    raw = (query or "").strip()
    lowered = raw.lower()
    normalized = normalize_text(raw)
    desired_color = detect_color(raw, normalized)
    category_rule = detect_category(normalized)
    min_price, max_price = detect_price_bounds(normalized)

    wants_similar = any(
        token in normalized
        for token in ["tuong tu", "similar", "giong", "giong nhu"]
    )
    semantic = lowered
    semantic = re.sub(
        r"\b(tim|search|find|san pham|mau|nhung|gia|duoi|tren|tu|den|toi|khong qua|toi da)\b",
        " ",
        semantic,
    )
    semantic = re.sub(r"\s+", " ", semantic).strip()

    return ParsedQuery(
        raw_query=raw,
        semantic_query=semantic or raw,
        desired_color=desired_color,
        category_key=category_rule["key"] if category_rule else None,
        category_terms=tuple(category_rule["terms"]) if category_rule else (),
        excluded_terms=tuple(category_rule["excluded"]) if category_rule else (),
        min_price=min_price,
        max_price=max_price,
        wants_similar=wants_similar,
    )
