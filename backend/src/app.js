import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/errorHandler.js";
import "./models/index.js";

import initAuthRoute from "./routes/user/authRoute.js";
import initCateRoute from "./routes/user/cateRoute.js";
import initProductRoute from "./routes/user/productRoute.js";
import initBranchRoute from "./routes/user/branchRoute.js";
import initCourtRoute from "./routes/user/courtRoute.js";
import initBookingRoute from "./routes/user/bookingRoute.js";
import initCartRoute from "./routes/user/cartRoute.js";
import initWalletRoute from "./routes/user/walletRoute.js";
import initAddressRoute from "./routes/user/addressRoute.js";
import initPostRoute from "./routes/user/postRoute.js";
import initPostSocialRoute from "./routes/user/postSocialRoute.js";
import initProfileRoute from "./routes/user/profileRoute.js";
import initConversationRoute from "./routes/user/conversationRoute.js";
import initUserSearchRoute from "./routes/user/userSearchRoute.js";
import initMonthlyBookingRoute from "./routes/user/monthlyBookingRoute.js";
import initOrderRoute from "./routes/user/orderRoute.js";
import initDiscountRoute from "./routes/user/discountRoute.js";
import initEmployeeOrderRoute from "./routes/employee/orderRoute.js";
import initEmployeeWorkShiftRoute from "./routes/employee/workShiftRoute.js";
import initEmployeeCounterRoute from "./routes/employee/counterRoute.js";
import initEmployeeBookingRoute from "./routes/employee/bookingRoute.js";
import initWebhookRoute from "./routes/user/webhookRoute.js";
import initCourtRouteManager from "./routes/manager/courtRoute.js";
import initBranchRouteManager from "./routes/manager/branchRoute.js";
import initEmployeeRouteManager from "./routes/manager/employeeRoute.js";
import initBeverageRouteManager from "./routes/manager/beverageRoute.js";
import initProductRouteManager from "./routes/manager/productRoute.js";
import initWorkShiftRouteManager from "./routes/manager/workShiftRoute.js";
import initSalaryRouteManager from "./routes/manager/salaryRoute.js";
import initRevenueRouteManager from "./routes/manager/revenueRoute.js";
import initOrderRouteManager from "./routes/manager/orderRoute.js";
import initBookingRouteManager from "./routes/manager/bookingRoute.js";
import initConversationRouteManager from "./routes/manager/conversationRoute.js";
import initSupplierRouteManager from "./routes/manager/supplierRoute.js";
import initPurchaseReceiptRouteManager from "./routes/manager/purchaseReceiptRoute.js";
import initInventoryRouteManager from "./routes/manager/inventoryRoute.js";
import initFeedbackRoute from "./routes/user/feedbackRoute.js";
import initNotificationRoute from "./routes/user/notificationRoute.js";
import initHomeRoute from "./routes/user/homeRoute.js";
import initLocationRoute from "./routes/user/locationRoute.js";
import initAdminUserRoute from "./routes/admin/userRoute.js";
import initAdminBranchRoute from "./routes/admin/branchRoute.js";
import initAdminManagerRoute from "./routes/admin/managerRoute.js";
import initAdminProductRoute from "./routes/admin/productRoute.js";
import initAdminBeverageRoute from "./routes/admin/beverageRoute.js";
import initAdminPostRoute from "./routes/admin/postRoute.js";
import initAdminDiscountRoute from "./routes/admin/discountRoute.js";
import initAdminFeedbackRoute from "./routes/admin/feedbackRoute.js";
import initAdminFinanceRoute from "./routes/admin/financeRoute.js";
import initAdminRevenueRoute from "./routes/admin/revenueRoute.js";
import initAdminCategoryRoute from "./routes/admin/categoryRoute.js";
import initAdminUploadRoute from "./routes/admin/uploadRoute.js";
import initAdminCoachApplicationRoute from "./routes/admin/coachApplicationRoute.js";
import initCoachClassRoute from "./routes/user/coachClassRoute.js";
import initCoachApplicationRoute from "./routes/user/coachApplicationRoute.js";
import initAiRoute from "./routes/user/aiRoute.js";
import initAdminAiRecommendationRoute from "./routes/admin/aiRecommendationRoute.js";
import initAdminSupplierRoute from "./routes/admin/supplierRoute.js";
import initAdminPurchaseReceiptRoute from "./routes/admin/purchaseReceiptRoute.js";
import initAdminInventoryRoute from "./routes/admin/inventoryRoute.js";

dotenv.config();

export const createApp = () => {
  const app = express();
  const allowedOrigins = [
    ...(process.env.CORS_ORIGIN || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ];

  app.set("trust proxy", 1);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    }),
  );
  app.use(cookieParser());

  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });

  initHomeRoute(app);
  initLocationRoute(app);
  initAuthRoute(app);
  initCateRoute(app);
  initProductRoute(app);
  initBranchRoute(app);
  initCourtRoute(app);
  initBookingRoute(app);
  initCartRoute(app);
  initWalletRoute(app);
  initAddressRoute(app);
  initMonthlyBookingRoute(app);
  initOrderRoute(app);
  initDiscountRoute(app);
  initWebhookRoute(app);
  initFeedbackRoute(app);
  initNotificationRoute(app);

  initPostRoute(app);
  initPostSocialRoute(app);
  initProfileRoute(app);
  initConversationRoute(app);
  initUserSearchRoute(app);
  initCoachClassRoute(app);
  initCoachApplicationRoute(app);
  initAiRoute(app);

  initEmployeeOrderRoute(app);
  initEmployeeWorkShiftRoute(app);
  initEmployeeCounterRoute(app);
  initEmployeeBookingRoute(app);

  initAdminUserRoute(app);
  initAdminBranchRoute(app);
  initAdminManagerRoute(app);
  initAdminProductRoute(app);
  initAdminBeverageRoute(app);
  initAdminPostRoute(app);
  initAdminDiscountRoute(app);
  initAdminFeedbackRoute(app);
  initAdminFinanceRoute(app);
  initAdminRevenueRoute(app);
  initAdminCategoryRoute(app);
  initAdminUploadRoute(app);
  initAdminCoachApplicationRoute(app);
  initAdminSupplierRoute(app);
  initAdminPurchaseReceiptRoute(app);
  initAdminInventoryRoute(app);
  initAdminAiRecommendationRoute(app);

  initCourtRouteManager(app);
  initBranchRouteManager(app);
  initEmployeeRouteManager(app);
  initBeverageRouteManager(app);
  initProductRouteManager(app);
  initWorkShiftRouteManager(app);
  initSalaryRouteManager(app);
  initRevenueRouteManager(app);
  initOrderRouteManager(app);
  initBookingRouteManager(app);
  initConversationRouteManager(app);
  initSupplierRouteManager(app);
  initPurchaseReceiptRouteManager(app);
  initInventoryRouteManager(app);

  app.use(errorHandler);

  return app;
};

export default createApp;
