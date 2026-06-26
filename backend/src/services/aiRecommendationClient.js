import axios from "axios";
import dotenv from "dotenv";
import BadRequestError from "../errors/BadRequestError.js";

dotenv.config();

const getBaseUrl = () =>
  (process.env.AI_SERVICE_URL || "http://localhost:8000").replace(/\/$/, "");

const getTimeout = () => Number(process.env.AI_SERVICE_TIMEOUT_MS || 30000);

const client = axios.create({
  timeout: getTimeout(),
  headers: { "Content-Type": "application/json" },
});

const handleError = (err, action) => {
  if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
    throw new BadRequestError(
      "AI Service chưa sẵn sàng. Kiểm tra AI_SERVICE_URL hoặc khởi động ai-service.",
    );
  }
  const detail = err.response?.data?.detail || err.message;
  throw new BadRequestError(`AI Service (${action}): ${detail}`);
};

export const checkAiServiceHealth = async () => {
  try {
    const { data } = await client.get(`${getBaseUrl()}/health`);
    return data;
  } catch (err) {
    handleError(err, "health");
  }
};

export const getAdminInsights = async (payload) => {
  try {
    const { data } = await client.post(
      `${getBaseUrl()}/api/v1/recommend/admin`,
      payload,
    );
    return data?.data ?? data;
  } catch (err) {
    handleError(err, "recommend/admin");
  }
};

export const trainProductModel = async (payload) => {
  try {
    const { data } = await client.post(
      `${getBaseUrl()}/api/v1/product/train`,
      payload,
    );
    return data?.data ?? data;
  } catch (err) {
    handleError(err, "product/train");
  }
};

export const getProductRecommendations = async (payload) => {
  try {
    const { data } = await client.post(
      `${getBaseUrl()}/api/v1/recommend/product`,
      payload,
    );
    return data?.data ?? data;
  } catch (err) {
    handleError(err, "recommend/product");
  }
};

export default {
  checkAiServiceHealth,
  getAdminInsights,
  trainProductModel,
  getProductRecommendations,
};
