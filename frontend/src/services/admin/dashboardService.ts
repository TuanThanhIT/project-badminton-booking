import type {
  DashboardBookingResponse,
  DashboardLowStockResponse,
  DashboardRetailOrderResponse,
  DashboardRevenue7DaysResponse,
  DashboardTopBeveragesResponse,
  DashboardTopProductsResponse,
  DashboardWorkShiftResponse,
} from "../../types/dashboard";
import instance from "../../utils/axiosCustomize";

const getDashboardBookingService = () => {
  return instance.get<DashboardBookingResponse>(
    "/admin/dashboard/bookings-today"
  );
};
const getDashboardRevenue7DaysService = () => {
  return instance.get<DashboardRevenue7DaysResponse>(
    "/admin/dashboard/revenue-7days"
  );
};
const getDashboardRetailOrderService = () => {
  return instance.get<DashboardRetailOrderResponse>(
    "/admin/dashboard/retail-today"
  );
};
const getTopBeveragesService = () => {
  return instance.get<DashboardTopBeveragesResponse>(
    "/admin/dashboard/top-beverages"
  );
};
const getTopProductsService = () => {
  return instance.get<DashboardTopProductsResponse>(
    "/admin/dashboard/top-products"
  );
};
const getLowStockService = () => {
  return instance.get<DashboardLowStockResponse>("/admin/dashboard/low-stock");
};

const getWorkShiftService = () => {
  return instance.get<DashboardWorkShiftResponse>(
    "/admin/dashboard/work-shift-current"
  );
};

const dashboardService = {
  getDashboardBookingService,
  getDashboardRetailOrderService,
  getDashboardRevenue7DaysService,
  getLowStockService,
  getTopProductsService,
  getTopBeveragesService,
  getWorkShiftService,
};

export default dashboardService;
