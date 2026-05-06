import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import sequelize from "./config/db.js";
import { createServer } from "http";
import { initSocket } from "./socket/index.js";
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
initAuthRoute(app);
initCateRoute(app);
initProductRoute(app);
initBranchRoute(app);
initCourtRoute(app);
initBookingRoute(app);
initCartRoute(app);
initWalletRoute(app);
initAddressRoute(app);

// Post
initPostRoute(app);
initPostSocialRoute(app);
initProfileRoute(app);
initConversationRoute(app);
initUserSearchRoute(app);

// create http server
const httpServer = createServer(app);

// init socket
initSocket(httpServer);

app.use(errorHandler);

sequelize.sync({ alter: true }).then(() => {
  console.log("Database synced");
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
