import { Queue } from "bullmq";
import { redisClient } from "../config/redis.js";
import {
  AI_TRAINING_JOB,
  AI_TRAINING_QUEUE_NAME,
} from "../constants/aiRecommendationConstant.js";

export const aiTrainingQueue = new Queue(AI_TRAINING_QUEUE_NAME, {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 60000,
    },
    removeOnComplete: 20,
    removeOnFail: 50,
  },
});

const getCronPattern = () =>
  process.env.AI_TRAINING_CRON?.trim() || AI_TRAINING_JOB.DEFAULT_CRON;

/**
 * Đăng ký repeatable job train lại model định kỳ (mặc định 3:00 sáng mỗi ngày).
 * Xóa các repeatable cũ trước khi thêm để tránh trùng khi đổi lịch.
 */
export const scheduleNightlyTraining = async () => {
  const pattern = getCronPattern();

  const existing = await aiTrainingQueue.getRepeatableJobs();
  await Promise.all(
    existing.map((job) =>
      aiTrainingQueue.removeRepeatableByKey(job.key).catch(() => {}),
    ),
  );

  await aiTrainingQueue.add(
    AI_TRAINING_JOB.SCHEDULED,
    { trigger: "cron" },
    {
      repeat: {
        pattern,
        tz: AI_TRAINING_JOB.TIMEZONE,
      },
      jobId: AI_TRAINING_JOB.REPEAT_KEY,
    },
  );

  console.log(
    `[ai-training] Scheduled nightly retrain with cron "${pattern}" (${AI_TRAINING_JOB.TIMEZONE}).`,
  );

  return { pattern, timezone: AI_TRAINING_JOB.TIMEZONE };
};

/** Đưa một job train ngay lập tức vào hàng đợi (gọi từ Admin nếu muốn train nền). */
export const enqueueImmediateTraining = async () =>
  aiTrainingQueue.add(AI_TRAINING_JOB.SCHEDULED, { trigger: "manual" });
