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

export type ProductFeedbackRequest = {
  productId: number;
};

export type ProductFeedbackResponse = {
  rating: number;
  content: string;
  updatedDate: string;
  userId: number;
  username: string;
  avatar: string;
}[];
