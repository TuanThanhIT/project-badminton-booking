import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const DEFAULT_AI_MODERATION_URL = "http://127.0.0.1:8001";
const DEFAULT_AI_MODERATION_TIMEOUT_MS = 8000;

const getAiModerationConfig = () => {
  const configuredTimeout = Number(process.env.AI_MODERATION_TIMEOUT_MS);

  return {
    baseUrl: (
      process.env.AI_MODERATION_URL || DEFAULT_AI_MODERATION_URL
    ).replace(/\/+$/, ""),
    timeout:
      Number.isFinite(configuredTimeout) && configuredTimeout > 0
        ? configuredTimeout
        : DEFAULT_AI_MODERATION_TIMEOUT_MS,
  };
};

const formatAiErrorResponse = (data) => {
  if (typeof data === "string") {
    return data.trim();
  }

  if (data === null || data === undefined) {
    return "";
  }

  try {
    return JSON.stringify(data);
  } catch {
    return String(data);
  }
};

export const predictModerationText = async (text) => {
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Moderation text must be a non-empty string.");
  }

  const { baseUrl, timeout } = getAiModerationConfig();

  try {
    const response = await axios.post(
      `${baseUrl}/predict`,
      { text: text.trim() },
      {
        timeout,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    if (!axios.isAxiosError(error)) {
      throw error;
    }

    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      throw new Error(`AI moderation request timed out after ${timeout}ms.`);
    }

    if (error.response) {
      const errorText = formatAiErrorResponse(error.response.data);
      const detail = errorText ? `: ${errorText}` : "";

      throw new Error(
        `AI moderation service returned HTTP ${error.response.status}${detail}`,
      );
    }

    throw new Error(
      `Unable to connect to AI moderation service at ${baseUrl}: ${error.message}`,
    );
  }
};

export const decideModerationAction = (aiResult) => {
  const label = aiResult?.label;
  const confidence = Number(aiResult?.confidence);

  if (label === "normal" && confidence >= 0.85) {
    return { action: "ALLOW", reason: "Nội dung hợp lệ." };
  }

  if (label === "spam" && confidence >= 0.9) {
    return { action: "BLOCK", reason: "Nội dung có dấu hiệu spam." };
  }

  if (label === "offensive" && confidence >= 0.9) {
    return {
      action: "BLOCK",
      reason: "Nội dung có dấu hiệu công kích hoặc xúc phạm.",
    };
  }

  if (label === "unauthorized_ad" && confidence >= 0.9) {
    return {
      action: "REVIEW",
      reason:
        "Nội dung có dấu hiệu quảng cáo trái phép, cần quản trị viên duyệt.",
    };
  }

  return {
    action: "REVIEW",
    reason: "AI chưa đủ chắc chắn, cần quản trị viên duyệt.",
  };
};
