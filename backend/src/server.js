import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from "./config/db.js";
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

// Admin
initRoleRoute(app);
initCateAdminRoute(app);
initProductAdminRoute(app);
initDiscountAdminRoute(app);

app.use(errorHandlingMiddleware);

sequelize.sync({ force: false }).then(() => {
  console.log("Database synced");
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
