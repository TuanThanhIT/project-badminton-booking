import { createServer } from "http";
import dotenv from "dotenv";
import { testConnection } from "./config/db.js";
import { initSocket } from "./socket/index.js";
import createApp from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "0.0.0.0";
const app = createApp();
const httpServer = createServer(app);

initSocket(httpServer);

const startServer = async () => {
  await testConnection();

  httpServer.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Unable to start server:", error);
  process.exit(1);
});
