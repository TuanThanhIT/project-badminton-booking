import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from "./config/db.js";
import initRoleRoute from "./routes/admin/roleRoute.js";
import initWebRoutes from "./routes/customer/webRoute.js";
import initAuthRoute from "./routes/customer/authRoute.js";
import { errorHandlingMiddleware } from "./middlewares/errorHandling.js";
import initUserRoute from "./routes/customer/userRoute.js";
import initCateRoute from "./routes/admin/cateRoute.js";
import initProductRoute from "./routes/admin/productRoute.js";

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

// Admin
initRoleRoute(app);
initCateRoute(app);
initProductRoute(app);

app.use(errorHandlingMiddleware);

sequelize.sync({ force: false }).then(() => {
  console.log("Database synced");
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
