import express from "express";
import dotenv from "dotenv";
import initWebRoutes from "./routes/webRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8088;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initWebRoutes(app);

app.listen(PORT, () => {
  console.log(`Server is listening on port http://localhost:${PORT}`);
});
