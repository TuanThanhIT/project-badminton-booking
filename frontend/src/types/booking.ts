import type { ApiResponse } from "./api";
import type { VNPayCallbackRequest } from "./wallet";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCEL_REQUESTED"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED";

export type CreateBookingRequest = {
  branchId: number;
  courtId: number;
  playDate: string;
  startTime: string;
  endTime: string;
  paymentMethod: "COD" | "VNPAY" | "WALLET";
  discountId?: number | null;
  note?: string;
};

export type CreateBookingData = {
  bookingId: number;
  amount: number;
  paymentMethod: string;
  paymentUrl?: string;
  status: BookingStatus;
};

export type CreateBookingResponse = ApiResponse<CreateBookingData>;

export type RetryBookingPaymentResponse = ApiResponse<{
  bookingId: number;
  amount: number;
  paymentUrl: string;
}>;

export type BookingCallbackRequest = VNPayCallbackRequest;
export type BookingCallbackResponse = ApiResponse<null>;

export type WalletBookingConfirmRequest = {
  email: string;
  otpCode: string;
  bookingId: number;
};

export type WalletBookingConfirmResponse = ApiResponse<{
  bookingId: number;
  amount: number;
}>;

export type BookingItem = {
  bookingId: number;
  bookingStatus: BookingStatus;
  previousBookingStatus?: BookingStatus | null;
  totalAmount: number;
  note?: string | null;
  cancelReason?: string | null;
  cancelRejectReason?: string | null;
  cancelRequestedAt?: string | null;
  cancelHandledAt?: string | null;
  cancelledAt?: string | null;
  createdDate: string;
  branch: {
    branchName: string;
    address: string;
    wardName: string;
    districtName: string;
    provinceName: string;
  };
  payment: {
    method: string;
    status: string;
  } | null;
  details: {
    courtId: number;
    courtName: string;
    playDate: string;
    startTime: string;
    endTime: string;
    price: number;
  }[];
};

export type BookingPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type MyBookingsRequest = {
  page?: number;
  limit?: number;
  status?: string;
  date?: string;
};

export type MyBookingsResponse = ApiResponse<{
  items: BookingItem[];
  pagination: BookingPagination;
}>;

export type CancelBookingRequest = {
  reason?: string;
  cancelReason?: string;
};

export type CancelBookingResponse = ApiResponse<{
  mode: "CANCELLED" | "REQUESTED";
  bookingId: number;
  refund?: {
    refunded: boolean;
    refundAmount: number;
  };
}>;

export type EmployeeBookingPayment = {
  id: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentAmount: number;
  paidAt: string | null;
  refundAmount: number;
  refundAt: string | null;
} | null;

export type EmployeeBooking = {
  id: number;
  bookingStatus: BookingStatus;
  previousBookingStatus?: BookingStatus | null;
  totalAmount: number;
  note?: string | null;
  cancelledBy?: string | null;
  cancelReason?: string | null;
  cancelRejectReason?: string | null;
  cancelRequestedAt?: string | null;
  cancelHandledAt?: string | null;
  cancelledAt?: string | null;
  createdDate: string;
  updatedDate: string;
  branch: {
    id: number;
    branchName: string;
    address: string;
    wardName: string;
    districtName: string;
    provinceName: string;
    phoneNumber?: string;
  } | null;
  user: {
    id: number;
    username: string;
    email: string;
  } | null;
  payment: EmployeeBookingPayment;
  details: {
    id: number;
    courtId: number;
    courtName?: string | null;
    playDate: string;
    startTime: string;
    endTime: string;
    price: number;
  }[];
};

export type EmployeeBookingSummary = Partial<Record<BookingStatus, number>>;

export type EmployeeBookingsRequest = {
  status?: BookingStatus | "ALL";
  keyword?: string;
  date?: string;
  page?: number;
  limit?: number;
};

export type EmployeeBookingsData = {
  items: EmployeeBooking[];
  summary: EmployeeBookingSummary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type EmployeeBookingsResponse = ApiResponse<EmployeeBookingsData>;
export type EmployeeBookingDetailResponse = ApiResponse<EmployeeBooking>;
export type EmployeeBookingActionResponse = ApiResponse<{
  refund?: {
    refunded: boolean;
    refundAmount: number;
  };
} | null>;

export type RejectEmployeeBookingActionRequest = {
  reason?: string;
};

export type CompleteEmployeeBookingRequest = {
  paymentMethod?: "CASH" | "VNPAY" | "BANK";
};
