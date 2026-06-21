from typing import Any

from pydantic import BaseModel, Field


class BookingRecord(BaseModel):
    userId: int
    branchId: int
    courtId: int | None = None
    hour: int = Field(ge=0, le=23)
    dayOfWeek: int = Field(ge=0, le=6, description="0=Monday ... 6=Sunday")


class TrainRequest(BaseModel):
    records: list[BookingRecord] = Field(default_factory=list)


class BranchInfo(BaseModel):
    id: int
    name: str
    address: str | None = None
    courtCount: int = 0


class DiscountInfo(BaseModel):
    id: int
    code: str
    type: str
    value: float
    applyType: str


class UserHistoryItem(BaseModel):
    branchId: int
    branchName: str | None = None
    hour: int
    dayOfWeek: int
    playDate: str | None = None


class UserRecommendRequest(BaseModel):
    userId: int | None = None
    isNewUser: bool = False
    history: list[UserHistoryItem] = Field(default_factory=list)
    branches: list[BranchInfo] = Field(default_factory=list)
    popularBranches: list[dict[str, Any]] = Field(default_factory=list)
    popularTimeSlots: list[dict[str, Any]] = Field(default_factory=list)
    activeDiscounts: list[DiscountInfo] = Field(default_factory=list)
    topK: int = Field(default=5, ge=1, le=20)


class OccupancyRow(BaseModel):
    branchId: int
    branchName: str
    hour: int
    bookedCount: int
    capacity: int
    fillRate: float


class UserActivityRow(BaseModel):
    userId: int
    fullName: str | None = None
    email: str | None = None
    totalBookings: int
    completedBookings: int
    daysSinceLastBooking: int | None = None
    lastBranchId: int | None = None
    lastBranchName: str | None = None
    avgHour: float | None = None


class AdminInsightsRequest(BaseModel):
    occupancy: list[OccupancyRow] = Field(default_factory=list)
    userActivity: list[UserActivityRow] = Field(default_factory=list)
    lowFillThreshold: float = Field(default=40.0, ge=0, le=100)
    churnDaysThreshold: int = Field(default=21, ge=1)


class ProductTrainRecord(BaseModel):
    userId: int
    productId: int
    categoryId: int = 0


class ProductCatalogItem(BaseModel):
    id: int
    name: str | None = None
    thumbnailUrl: str | None = None
    minPrice: float | None = None
    categoryId: int = 0


class ProductTrainRequest(BaseModel):
    baskets: list[list[int]] = Field(default_factory=list)
    records: list[ProductTrainRecord] = Field(default_factory=list)
    products: list[ProductCatalogItem] = Field(default_factory=list)


class ProductHistoryItem(BaseModel):
    productId: int
    categoryId: int = 0


class ProductRecommendRequest(BaseModel):
    mode: str = Field(default="user", description="user | related")
    userId: int | None = None
    productId: int | None = None
    history: list[ProductHistoryItem] = Field(default_factory=list)
    products: list[ProductCatalogItem] = Field(default_factory=list)
    popularProducts: list[dict[str, Any]] = Field(default_factory=list)
    topK: int = Field(default=6, ge=1, le=20)


class ApiResponse(BaseModel):
    success: bool = True
    data: dict[str, Any] = Field(default_factory=dict)
    message: str | None = None
