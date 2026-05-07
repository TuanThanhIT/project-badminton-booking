// queues/ghnWebhookQueue.js
import { Queue } from "bullmq";
import { redisClient } from "../config/redis.js";

export const ghnWebhookQueue = new Queue("ghn-webhook", {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 5, // retry 5 lần
    backoff: {
      type: "exponential",
      delay: 3000, // 3s → 6s → 12s...
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
