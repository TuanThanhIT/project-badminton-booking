from __future__ import annotations

from io import BytesIO
from pathlib import Path

import requests
from PIL import Image


def open_image_bytes(content: bytes) -> Image.Image:
    return Image.open(BytesIO(content)).convert("RGB")


def open_image_location(location: str, timeout_seconds: int = 20) -> Image.Image:
    if location.startswith("http://") or location.startswith("https://"):
        response = requests.get(location, timeout=timeout_seconds)
        response.raise_for_status()
        return open_image_bytes(response.content)
    return Image.open(Path(location)).convert("RGB")

