from typing import Any

from pydantic import BaseModel, Field


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
    sessionsLast30Days: int = 0
    ordersLast30Days: int = 0
    daysSinceLastBooking: int | None = None
    lastBranchId: int | None = None
    lastBranchName: str | None = None
    avgHour: float | None = None


class AdminInsightsRequest(BaseModel):
    occupancy: list[OccupancyRow] = Field(default_factory=list)
    userActivity: list[UserActivityRow] = Field(default_factory=list)
    lowFillThreshold: float = Field(default=40.0, ge=0, le=100)
    churnDaysThreshold: int = Field(default=21, ge=1)
    periodStart: str | None = None
    periodEnd: str | None = None
    customerLookbackDays: int = Field(default=30, ge=1)
    vipMinSessions: int = Field(default=2, ge=1)
    segmentTopK: int = Field(default=20, ge=1, le=100)
    secondBookingNudgeDays: int = Field(default=7, ge=1)


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
