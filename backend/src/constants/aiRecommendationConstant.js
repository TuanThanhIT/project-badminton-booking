export const AI_RECOMMENDATION_DEFAULTS = Object.freeze({
  TOP_K: 5,
  TRAINING_LOOKBACK_DAYS: 180,
  OCCUPANCY_LOOKBACK_DAYS: 30,
  LOW_FILL_THRESHOLD: 40,
  CHURN_DAYS_THRESHOLD: 21,
  NEW_USER_BOOKING_THRESHOLD: 1,
});

export const AI_RECOMMENDATION_AUDIENCE = Object.freeze({
  USER: "user",
  ADMIN: "admin",
});

export const AI_TRAINING_QUEUE_NAME = "ai-model-training";

export const AI_TRAINING_JOB = Object.freeze({
  SCHEDULED: "scheduled-retrain",
  REPEAT_KEY: "ai-nightly-retrain",
  // Mặc định 3:00 sáng mỗi ngày (giờ Việt Nam). Có thể override qua AI_TRAINING_CRON.
  DEFAULT_CRON: "0 3 * * *",
  TIMEZONE: "Asia/Ho_Chi_Minh",
});

export const DAY_OF_WEEK_TO_INDEX = Object.freeze({
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
});
