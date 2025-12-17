import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from "./config/db.js";
import { createServer } from "http";
import { initSocket } from "./socket/index.js";
import initRoleRoute from "./routes/admin/roleRoute.js";
import initWebRoutes from "./routes/customer/webRoute.js";
import initAuthRoute from "./routes/customer/authRoute.js";
import { errorHandlingMiddleware } from "./middlewares/errorHandling.js";
import initUserRoute from "./routes/customer/userRoute.js";
import initCateAdminRoute from "./routes/admin/cateRoute.js";
import initCateCustomerRoute from "./routes/customer/cateRoute.js";
import initProductAdminRoute from "./routes/admin/productRoute.js";
import initProductCustomerRoute from "./routes/customer/productRoute.js";
import initCartCustomerRoute from "./routes/customer/cartRoute.js";
import initDiscountAdminRoute from "./routes/admin/discountRoute.js";
import initDiscountCustomerRoute from "./routes/customer/discountRoute.js";
import initOrderCustomerRoute from "./routes/customer/orderRoute.js";
import initMomoCustomerRoute from "./routes/customer/momoRoute.js";
import initProductFeedbackCustomerRoute from "./routes/customer/productFeedbackRoute.js";
import initContactCustomerRoute from "./routes/customer/contactRoute.js";
import initCourtAdminRoute from "./routes/admin/courtRoute.js";
import initCourtCustomerRoute from "./routes/customer/courtRoute.js";
import initDiscountBookingCustomerRoute from "./routes/customer/discountBooking.js";
import initDiscountBookingAdminRoute from "./routes/admin/discountBookingRoute.js";
import initBookingCustomerRoute from "./routes/customer/bookingRoute.js";
import initBookingFeedbackCustomerRoute from "./routes/customer/bookingFeedbackRoute.js";
import initAuthEmployeeRoute from "./routes/employee/authRoute.js";
import initWorkShiftAdminRoute from "./routes/admin/workShiftRoute.js";
import initWorkShiftEmployeeRoute from "./routes/employee/workShiftRoute.js";
import initOrderEmployeeRoute from "./routes/employee/orderRoute.js";
import initBookingEmployeeRoute from "./routes/employee/bookingRoute.js";
import initCourtEmployeeRoute from "./routes/employee/courtRoute.js";
import initBeverageAdminRoute from "./routes/admin/beverageRoute.js";
import initBeverageEmployeeRoute from "./routes/employee/beverageRoute.js";
import initProductEmployeeRoute from "./routes/employee/productRoute.js";
import initDraftEmployeeRoute from "./routes/employee/draftRoute.js";
import initOfflineEmployeeRoute from "./routes/employee/offlineRoute.js";
import initNotificationEmployeeRoute from "./routes/employee/notificationRoute.js";
import initNotificationCustomerRoute from "./routes/customer/notificationRoute.js";
import initAdminAuthRoute from "./routes/admin/authRoute.js";
import initUserAdminAuthRoute from "./routes/admin/usersRoute.js";
import initOrderAdminRoute from "./routes/admin/orderRoute.js";
import initBookingAdminRoute from "./routes/admin/bookingRoute.js";
import initRevenueAdminRoute from "./routes/admin/revenueRoute.js";
import initDashboardAdminRoute from "./routes/admin/dashboardRoute.js";
import initNotificationAdminRoute from "./routes/admin/notificationRoute.js";
import initAdminWorkShiftEmployeeRoute from "./routes/admin/workShiftEmployeeRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8088;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// Customer
initWebRoutes(app);
initAuthRoute(app);
initUserRoute(app);
initCateCustomerRoute(app);
initProductCustomerRoute(app);
initCartCustomerRoute(app);
initDiscountCustomerRoute(app);
initOrderCustomerRoute(app);
initMomoCustomerRoute(app);
initProductFeedbackCustomerRoute(app);
initContactCustomerRoute(app);
initCourtCustomerRoute(app);
initDiscountBookingCustomerRoute(app);
initBookingCustomerRoute(app);
initBookingFeedbackCustomerRoute(app);

// Admin
initAdminAuthRoute(app);
initRoleRoute(app);
initCateAdminRoute(app);
initProductAdminRoute(app);
initDiscountAdminRoute(app);
initCourtAdminRoute(app);
initDiscountBookingAdminRoute(app);
initWorkShiftAdminRoute(app);
initBeverageAdminRoute(app);
initNotificationCustomerRoute(app);
initUserAdminAuthRoute(app);
initOrderAdminRoute(app);
initBookingAdminRoute(app);
initRevenueAdminRoute(app);
initDashboardAdminRoute(app);
initNotificationAdminRoute(app);
initAdminWorkShiftEmployeeRoute(app);

// Employee
initAuthEmployeeRoute(app);
initWorkShiftEmployeeRoute(app);
initOrderEmployeeRoute(app);
initBookingEmployeeRoute(app);
initCourtEmployeeRoute(app);
initBeverageEmployeeRoute(app);
initProductEmployeeRoute(app);
initDraftEmployeeRoute(app);
initOfflineEmployeeRoute(app);
initNotificationEmployeeRoute(app);

// create http server
const httpServer = createServer(app);

// init socket
initSocket(httpServer);

app.use(errorHandlingMiddleware);

sequelize.sync({ force: false }).then(() => {
  console.log("Database synced");
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
