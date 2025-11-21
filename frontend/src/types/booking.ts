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
