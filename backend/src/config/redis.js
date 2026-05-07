// config/redis.js
import IORedis from "ioredis";

export const redisClient = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});
