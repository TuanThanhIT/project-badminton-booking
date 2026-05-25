import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import sequelize from "./config/db.js";
import { createServer } from "http";
import { initSocket } from "./socket/index.js";
import errorHandler from "./middlewares/errorHandler.js";
import "./models/index.js";
import "./workers/ghnWebhookWorker.js";

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
import initWebhookRoute from "./routes/user/webhookRoute.js";
import initFeedbackRoute from "./routes/user/feedbackRoute.js";
import initNotificationRoute from "./routes/user/notificationRoute.js";
import initHomeRoute from "./routes/user/homeRoute.js";
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8088;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(cookieParser());

// User
initHomeRoute(app);
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

// Post
initPostRoute(app);
initPostSocialRoute(app);
initProfileRoute(app);
initConversationRoute(app);
initUserSearchRoute(app);

// Employee
initEmployeeOrderRoute(app);

// Admin
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

// create http server
const httpServer = createServer(app);

// init socket
initSocket(httpServer);

app.use(errorHandler);

sequelize.sync().then(() => {
  console.log("Database synced");
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
