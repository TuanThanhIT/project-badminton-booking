import type { ApiResponse } from "./api";
import type { VNPayCallbackRequest } from "./wallet";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PAID"
  | "COMPLETED"
  | "CANCELLED";

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

export type BookingCallbackRequest = VNPayCallbackRequest;
export type BookingCallbackResponse = ApiResponse<null>;

export type BookingItem = {
  bookingId: number;
  bookingStatus: BookingStatus;
  totalAmount: number;
  note?: string | null;
  createdDate: string;
  branch: {
    branchName: string;
    address: string;
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
