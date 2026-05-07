// workers/ghnWebhookWorker.js
import { Worker } from "bullmq";
import { redisClient } from "../config/redis.js";
import { ghnWebhookService } from "../services/user/ghnWebhookService.js";

export const ghnWebhookWorker = new Worker(
  "ghn-webhook",
  async (job) => {
    const data = job.data;

    console.log("Processing:", data.OrderCode, data.Status);

    await ghnWebhookService(data);
  },
  {
    connection: redisClient,
    concurrency: 5, // xử lý song song 5 job
  },
);

// log lỗi
ghnWebhookWorker.on("failed", (job, err) => {
  console.error("Job failed:", job.id, err.message);
});

ghnWebhookWorker.on("completed", (job) => {
  console.log("Job done:", job.id);
});
