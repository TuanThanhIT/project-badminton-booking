export type AddFeedbackRequest = {
  content: string;
  rating: number;
  bookingId: number;
  courtId: number;
};

export type AddFeedbackResponse = {
  message: string;
};

export type UpdateFeedbackRequest = {
  content: string;
  rating: number;
  bookingId: number;
};

export type UpdateFeedbackResponse = {
  message: string;
};

export type BookingFeedBackDetailResponse = {
  content: string;
  rating: number;
  updatedDate: string;
};

export type BookingFeedbackDetailRequest = {
  bookingId: number;
};

export type BookingFeedbackRequest = {
  courtId: number;
};

export type BookingFeedbackResponse = {
  rating: number;
  content: string;
  updatedDate: string;
  userId: number;
  username: string;
  avatar: string;
}[];
