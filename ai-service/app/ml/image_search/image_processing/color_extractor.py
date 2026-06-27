from __future__ import annotations

from collections import Counter

from PIL import Image

from app.ml.image_search.text_processing.color_dictionary import normalize_color


RGB_COLORS = {
    "white": (245, 245, 245),
    "black": (20, 20, 20),
    "blue": (30, 105, 210),
    "green": (40, 160, 80),
    "red": (220, 50, 50),
    "yellow": (235, 205, 45),
    "orange": (235, 130, 35),
    "pink": (230, 90, 160),
    "purple": (140, 75, 190),
    "gray": (130, 130, 130),
    "brown": (130, 85, 45),
}


def nearest_color_name(rgb: tuple[int, int, int]) -> str:
    red, green, blue = rgb
    return min(
        RGB_COLORS,
        key=lambda name: sum((channel - target) ** 2 for channel, target in zip((red, green, blue), RGB_COLORS[name])),
    )


def dominant_colors(image: Image.Image, top_k: int = 3) -> list[str]:
    thumbnail = image.convert("RGB")
    thumbnail.thumbnail((96, 96))
    pixels = list(thumbnail.getdata())
    names = [nearest_color_name(pixel) for pixel in pixels]
    return [name for name, _count in Counter(names).most_common(top_k)]


def metadata_colors(value: str | list[str] | None) -> list[str]:
    if isinstance(value, list):
        return [color for color in (normalize_color(item) for item in value) if color]
    if not value:
        return []
    parts = [item.strip() for item in value.replace("/", ",").replace("|", ",").split(",")]
    return [color for color in (normalize_color(item) for item in parts) if color]
