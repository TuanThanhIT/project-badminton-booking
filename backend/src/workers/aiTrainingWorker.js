import { Worker } from "bullmq";
import { redisClient } from "../config/redis.js";
import { AI_TRAINING_QUEUE_NAME } from "../constants/aiRecommendationConstant.js";
import aiRecommendationService from "../services/aiRecommendationService.js";

export const aiTrainingWorker = new Worker(
  AI_TRAINING_QUEUE_NAME,
  async (job) => {
    const trigger = job.data?.trigger || "unknown";
    console.log(`[ai-training] Start retrain (trigger=${trigger})...`);

    const result = await aiRecommendationService.trainModelService();

    console.log(
      `[ai-training] Done. records=${result.recordCount}, trained=${result.trainResult?.trained}`,
    );
    return result;
  },
  {
    connection: redisClient,
    concurrency: 1,
  },
);

aiTrainingWorker.on("failed", (job, err) => {
  console.error("[ai-training] Job failed:", job?.id, err.message);
});

aiTrainingWorker.on("completed", (job) => {
  console.log("[ai-training] Job completed:", job.id);
});
