from __future__ import annotations


COLOR_ALIASES: dict[str, set[str]] = {
    "white": {"white", "trang", "mau trang", "màu trắng", "trang ngoc", "trắng ngọc"},
    "black": {"black", "den", "đen", "mau den", "màu đen"},
    "blue": {"blue", "xanh duong", "xanh dương", "navy", "xanh bien", "xanh biển"},
    "green": {"green", "xanh la", "xanh lá", "xanh luc", "xanh lục"},
    "red": {"red", "do", "đỏ", "mau do", "màu đỏ"},
    "yellow": {"yellow", "vang", "vàng", "mau vang", "màu vàng"},
    "orange": {"orange", "cam", "mau cam", "màu cam"},
    "pink": {"pink", "hong", "hồng", "mau hong", "màu hồng"},
    "purple": {"purple", "tim", "tím", "mau tim", "màu tím"},
    "gray": {"gray", "grey", "xam", "xám", "ghi", "mau xam", "màu xám"},
    "brown": {"brown", "nau", "nâu", "mau nau", "màu nâu"},
}


def normalize_color(value: str | None) -> str | None:
    if not value:
        return None
    lowered = value.strip().lower()
    for canonical, aliases in COLOR_ALIASES.items():
        if lowered == canonical or lowered in aliases:
            return canonical
    for canonical, aliases in COLOR_ALIASES.items():
        if any(alias in lowered for alias in aliases):
            return canonical
    return lowered or None
