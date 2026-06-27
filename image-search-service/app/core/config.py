from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "badminton-image-search-service"
    host: str = "0.0.0.0"
    port: int = 8001

    text_model_name: str = "sentence-transformers/clip-ViT-B-32-multilingual-v1"
    image_model_name: str = "sentence-transformers/clip-ViT-B-32"
    device: str = "cpu"

    index_path: Path = Path("data/index/product_vectors.faiss")
    metadata_path: Path = Path("data/index/product_metadata.json")
    products_csv_path: Path = Path("data/processed/products.csv")

    image_timeout_seconds: int = 20
    default_limit: int = 12
    max_limit: int = 50
    image_weight: float = Field(default=0.65, ge=0.0, le=1.0)
    text_weight: float = Field(default=0.35, ge=0.0, le=1.0)

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()

