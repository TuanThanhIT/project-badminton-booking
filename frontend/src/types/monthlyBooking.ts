import type { ApiResponse } from "./api";

export type MonthlyBookingRequest = {
  branchId: number;
  courtId: number;

  startDate: string;
  endDate: string;

  daysOfWeek: string[];

  startTime: string;
  endTime: string;

  totalAmount?: number;
  discountId?: number | null;
  paymentMethod: "VNPAY" | "WALLET";

  note?: string;
};

export type MonthlyBookingResult = {
  monthlyBooking: {
    id: number;
  };

  booking: {
    id: number;
  };

  discountAmount?: number;
  paymentMethod?: "VNPAY" | "WALLET";
  paymentUrl?: string;
  totalSessions: number;
};

export type MonthlyBookingResponse = ApiResponse<MonthlyBookingResult>;

export type CalculateMonthlyBookingRequest = {
  branchId: number;
  courtId: number;
  startDate: string;
  endDate: string;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
};

export type MonthlyBookingCalculateData = {
  totalSessions: number;
  duration: number;
  totalAmount: number;
  averagePricePerSession: number;
};
export type MonthlyBookingCalculateResponse =
  ApiResponse<MonthlyBookingCalculateData>;
