export interface PaymentState {
  type: "daily" | "monthly";

  branchId: number;
  branchName: string;

  courtId: number;
  courtName: string;

  startTime: string;
  endTime: string;

  totalAmount: number;

  bookingDate?: string;

  startDate?: string;
  endDate?: string;

  totalSessions?: number;

  daysOfWeek?: string[];
}
