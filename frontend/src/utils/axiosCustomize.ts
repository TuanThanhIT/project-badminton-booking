import axios from "axios";
import { getStore } from "../redux/storeRef";
import { refreshTokenThunk } from "../redux/slices/user/authSlice";
import type { ApiErrorType } from "../types/error";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 5000,
  withCredentials: true,
});

let isRefreshing = false;
let queue: ((token: string | null) => void)[] = [];

const processQueue = (token: string | null) => {
  queue.forEach((cb) => cb(token));
  queue = [];
};

// attach access token
instance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest: any = error.config;
    const statusCode = error.response?.status ?? 500;
    const data = error.response?.data;

    if (!originalRequest || !originalRequest.url) {
      return Promise.reject({
        statusCode,
        message: data?.message,
        success: false,
        errors: data?.errors || null,
      } satisfies ApiErrorType);
    }

    // không xử lý refresh cho API refresh
    if (originalRequest.url?.includes("/user/auth/refresh-token")) {
      return Promise.reject({
        statusCode,
        message: data?.message || "Refresh token failed",
        success: false,
        errors: data?.errors || null,
      } satisfies ApiErrorType);
    }

    // lỗi khác 401
    if (statusCode !== 401) {
      return Promise.reject({
        statusCode,
        message: data?.message || "Có lỗi xảy ra",
        success: data?.success || false,
        errors: data?.errors || null,
      } satisfies ApiErrorType);
    }

    // tránh loop
    if (originalRequest._retry) {
      return Promise.reject({
        statusCode: 401,
        message: "Unauthorized",
        success: false,
        errors: undefined,
      } satisfies ApiErrorType);
    }

    // nếu đang refresh → đẩy request vào queue
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push((token) => {
          if (!token) {
            return reject({
              statusCode: 401,
              message: "Refresh failed",
              success: false,
              errors: null,
            });
          }
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(instance(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const store = getStore();
      const result = await store.dispatch(refreshTokenThunk()).unwrap();
      const newToken = result.data.accessToken;
      localStorage.setItem("accessToken", newToken);
      processQueue(newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return instance(originalRequest);
    } catch (err: any) {
      processQueue(null);
      return Promise.reject({
        statusCode: err?.statusCode ?? 401,
        message: err?.message ?? "Refresh token expired",
        success: false,
        errors: err?.errors ?? null,
      } satisfies ApiErrorType);
    } finally {
      isRefreshing = false;
    }
  },
);

export default instance;
