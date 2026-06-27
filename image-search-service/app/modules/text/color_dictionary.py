from __future__ import annotations


COLOR_ALIASES = {
    "white": ["white", "trang"],
    "black": ["black", "den"],
    "red": ["red", "do"],
    "blue": ["blue", "xanh duong", "xanh"],
    "green": ["green", "xanh la"],
    "yellow": ["yellow", "vang"],
    "orange": ["orange", "cam"],
    "pink": ["pink", "hong"],
    "purple": ["purple", "tim"],
    "gray": ["gray", "grey", "xam"],
}


def normalize_color(value: str | None) -> str | None:
    if not value:
        return None
    lowered = value.lower()
    for color, aliases in COLOR_ALIASES.items():
        if color in lowered or any(alias in lowered for alias in aliases):
            return color
    return value.strip().lower() or None


def detect_color(text: str | None) -> str | None:
    return normalize_color(text)

