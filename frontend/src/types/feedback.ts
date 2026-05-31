import type { ApiResponse } from "./api";

export type FeedbackRating = 1 | 2 | 3 | 4 | 5;

export type CreateFeedbackRequest = {
  orderId: number;
  variantId: number;
  content: string;
  rating: FeedbackRating;
};

export type FeedbackData = {
  id: number;
  userId: number;
  orderId: string;
  variantId: string;
  content: string;
  rating: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateFeedbackResponse = ApiResponse<FeedbackData>;

export type FeedbackDetailData = {
  feedbackId: number;
  content: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
};

export type FeedbackDetailResponse = ApiResponse<FeedbackDetailData>;

export type FeedbackDetailRequest = {
  orderId: number;
  variantId: number;
};

export type UpdateFeedbackRequest = {
  orderId: number;
  variantId: number;

  content?: string;
  rating?: FeedbackRating;
};
export type UpdateFeedbackResponse = ApiResponse<FeedbackData>;

export type DeleteFeedbackRequest = {
  feedbackId: number;
};

export type DeleteFeedbackResponse = ApiResponse<null>;

export type UpsertBranchFeedbackRequest = {
  branchId: number;
  content: string;
  rating: FeedbackRating;
};

export type UpsertBranchFeedbackResponse = ApiResponse<FeedbackDetailData>;
