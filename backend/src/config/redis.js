import { createClient } from "redis";

export const redisClient = createClient({
  url: "redis://localhost:6379",
});

redisClient.connect();

redisClient.on("error", (err) => {
  console.log("Redis error:", err);
});
