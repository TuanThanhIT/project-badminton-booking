import instance from "../../utils/axiosCustomize";

import type {
  MonthlyBookingRequest,
  MonthlyBookingResponse,
  CalculateMonthlyBookingRequest,
  MonthlyBookingCalculateResponse,
} from "../../types/monthlyBooking";

// ✅ CREATE BOOKING THÁNG
const createMonthlyBookingService = (data: MonthlyBookingRequest) => {
  return instance.post<MonthlyBookingResponse>("/user/monthly-bookings", data);
};

// ✅ CALCULATE BOOKING THÁNG
const calculateMonthlyBookingService = (
  data: CalculateMonthlyBookingRequest,
) => {
  return instance.post<MonthlyBookingCalculateResponse>(
    "/user/monthly-bookings/calculate",
    data,
  );
};

// ✅ EXPORT
const monthlyBookingService = {
  createMonthlyBookingService,
  calculateMonthlyBookingService,
};

export default monthlyBookingService;
