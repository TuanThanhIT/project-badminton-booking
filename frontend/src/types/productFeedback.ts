export type AddOrUpdateFeedbackRequest = {
  content: string;
  rating: number;
  orderDetailId: number;
};

export type AddOrUpdateFeedbackResponse = {
  message: string;
};

export type ProductFeedBackDetailResponse = {
  content: string;
  rating: number;
  updatedDate: string;
};

export type ProductFeedbackDetailRequest = {
  orderDetailId: number;
};
