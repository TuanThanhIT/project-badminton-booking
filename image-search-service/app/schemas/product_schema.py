from pydantic import BaseModel, ConfigDict


class ProductMetadata(BaseModel):
    product_id: str
    name: str
    image_url: str
    brand: str | None = None
    category: str | None = None
    color: str | None = None
    description: str | None = None
    product_url: str | None = None
    price: float | None = None

    model_config = ConfigDict(extra="allow")
