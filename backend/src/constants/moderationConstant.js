export const POST_MODERATION_STATUS = Object.freeze({
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REVIEW_REQUIRED: "REVIEW_REQUIRED",
  REJECTED: "REJECTED",
});

export const MODERATION_LABEL = Object.freeze({
  NORMAL: "normal",
  SPAM: "spam",
  UNAUTHORIZED_AD: "unauthorized_ad",
  OFFENSIVE: "offensive",
});

export const MODERATION_ACTION = Object.freeze({
  ALLOW: "ALLOW",
  REVIEW: "REVIEW",
  BLOCK: "BLOCK",
});

export const ACCOUNT_STATUS = Object.freeze({
  ACTIVE: "ACTIVE",
  WARNING: "WARNING",
  SUSPENDED: "SUSPENDED",
  BANNED: "BANNED",
});

export const MODERATION_TARGET_TYPE = Object.freeze({
  POST: "POST",
  COMMENT: "COMMENT",
});

export const VIOLATION_ACTION = Object.freeze({
  BLOCK: "BLOCK",
  REVIEW_REJECTED: "REVIEW_REJECTED",
  ADMIN_REJECTED: "ADMIN_REJECTED",
});

export const MODERATION_SOURCE = Object.freeze({
  AI: "AI",
  ADMIN: "ADMIN",
});
