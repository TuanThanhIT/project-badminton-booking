export const REVIEW_STATUS = Object.freeze({
  CAN_REVIEW: "CAN_REVIEW",
  REVIEWED: "REVIEWED",
  NOT_ELIGIBLE: "NOT_ELIGIBLE",
});

export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  CAN_REVIEW: "Đánh giá",
  REVIEWED: "Sửa đánh giá",
  NOT_ELIGIBLE: "Chưa thể đánh giá",
};
