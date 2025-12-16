import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import dashboardController from "../../controllers/admin/dashboardController.js";

const dashboardRoute = express.Router();

const initDashboardAdminRoute = (app) => {
  // 1. Lượt đặt sân hôm nay
  dashboardRoute.get(
    "/bookings-today",
    auth,
    authorize("ADMIN"),
    dashboardController.getTodayBookingCount
  );

  // 2. Doanh thu 7 ngày gần nhất
  dashboardRoute.get(
    "/revenue-7days",
    auth,
    authorize("ADMIN"),
    dashboardController.getRevenueLast7Days
  );

  // 3. Đơn bán lẻ hôm nay
  dashboardRoute.get(
    "/retail-today",
    auth,
    authorize("ADMIN"),
    dashboardController.getTodayRetailOrder
  );

  // 4. Top sản phẩm bán chạy
  dashboardRoute.get(
    "/top-products",
    auth,
    authorize("ADMIN"),
    dashboardController.getTopProduct
  );

  // 5. Top đồ uống bán chạy
  dashboardRoute.get(
    "/top-beverages",
    auth,
    authorize("ADMIN"),
    dashboardController.getTopBeverage
  );

  // 6. Cảnh báo tồn kho thấp
  dashboardRoute.get(
    "/low-stock",
    auth,
    authorize("ADMIN"),
    dashboardController.getLowStockWarning
  );

  // Gắn route vào app
  app.use("/admin/dashboard", dashboardRoute);
};

export default initDashboardAdminRoute;
