import { createServer } from "http";
import dotenv from "dotenv";
import { testConnection } from "./config/db.js";
import { initSocket } from "./socket/index.js";
import createApp from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 8080;
const app = createApp();
const httpServer = createServer(app);

initSocket(httpServer);

const startServer = async () => {
  await testConnection();

  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Unable to start server:", error);
  process.exit(1);
});
