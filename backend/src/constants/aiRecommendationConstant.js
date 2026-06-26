export const AI_RECOMMENDATION_DEFAULTS = Object.freeze({
  TOP_K: 12,
  TRAINING_LOOKBACK_DAYS: 180,
  OCCUPANCY_LOOKBACK_DAYS: 30,
  /** Khung có % lấp đầy dưới ngưỡng → gợi ý KM (giờ nào thì do data quyết định). */
  LOW_FILL_THRESHOLD: 40,
  /** Số khung % cao nhất / chi nhánh → cao điểm (giờ nào thì do data quyết định). */
  PEAK_SLOTS_PER_BRANCH: 3,
  /** Giới hạn hiển thị cao điểm toàn hệ thống. */
  MAX_PEAK_SLOTS_GLOBAL: 15,
  CHURN_DAYS_THRESHOLD: 21,
  NEW_USER_BOOKING_THRESHOLD: 1,
  /** Cửa sổ rolling đếm suất chơi / phân nhóm khách (ngày). */
  CUSTOMER_ACTIVITY_LOOKBACK_DAYS: 30,
  /** Tối thiểu suất trong cửa sổ để vào nhóm tri ân. */
  VIP_MIN_SESSIONS: 2,
  /** Số khách tối đa hiển thị mỗi nhóm. */
  CUSTOMER_SEGMENT_TOP_K: 20,
  /** Khách 1 đơn, quá ngày này chưa đặt lần 2 → nhắc tái kích hoạt. */
  SECOND_BOOKING_NUDGE_DAYS: 7,
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
