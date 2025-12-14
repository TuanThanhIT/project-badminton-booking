export type AddBookingRequest = {
  bookingStatus: string;
  totalAmount: number;
  code: string;
  note: string;
  bookingDetails: {
    courtScheduleId: number;
  }[];
  paymentAmount: number;
  paymentMethod: string;
  paymentStatus: string;
};

export type AddBookingResponse = {
  message: string;
  bookingId: number;
};

export type CourtInfo = {
  id: number;
  name: string;
  thumbnailUrl: string;
  date: string;
};

export type BookingPaymentInfo = {
  paymentMethod: string;
};

export type BookingResponse = {
  id: number;
  bookingStatus: "Pending" | "Paid" | "Confirmed" | "Completed" | "Cancelled";
  totalAmount: number;
  note: string | null;
  createdDate: string;
  court: CourtInfo;
  timeSlots: string[];
  paymentBooking: BookingPaymentInfo;
  review?: boolean;
};

export type BookingListResponse = BookingResponse[];

export type BookingCancelResponse = {
  message: string;
};

export type BookingCancelRequest = {
  bookingId: number;
  cancelReason: string;
};

export type BookingUserInfo = {
  username: string;
  Profile: {
    fullName: string;
    address: string;
    phoneNumber: string;
  };
};

export type BookingEplResponse = {
  id: number;
  bookingStatus: "Pending" | "Paid" | "Confirmed" | "Completed" | "Cancelled";
  totalAmount: number;
  note: string | null;
  createdDate: string;
  court: CourtInfo;
  timeSlots: string[];
  paymentBooking: BookingPaymentInfo;
  user: BookingUserInfo;
};

export type BookingListEplResponse = {
  bookings: BookingEplResponse[];
  total: number;
  page: number;
  limit: number;
};

export type BookingEplRequest = {
  status: string;
  keyword: string;
  date: string;
  page: number | undefined;
  limit: number | undefined;
};

export type BookingConfirmRequest = {
  bookingId: number;
};

export type BookingConfirmResponse = {
  message: string;
};

export type BookingCompleteRequest = {
  bookingId: number;
};

export type BookingCompleteResponse = {
  message: string;
};

export type BookingCancelEplResponse = {
  message: string;
};

export type BookingCancelEplRequest = {
  bookingId: number;
  cancelReason: string;
};

export type CountBookingRequest = {
  date?: string;
};

export type CountBookingResponse = {
  status: string;
  count: number;
}[];
