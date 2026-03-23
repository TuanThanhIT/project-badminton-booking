// api/axiosInstance.ts
import axios, { AxiosError, type AxiosResponse } from "axios";
import type { ApiErrorType } from "../types/error";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 5000,
});

// attach token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// response interceptor
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<any>) => {
    console.log("error>>", error);
    const statusCode = error.response?.status ?? 500;
    const data = error.response?.data;

    return Promise.reject({
      statusCode,
      success: data.success || false,
      message: data.message || "Có lỗi xảy ra",
      errors: data.errors || null,
    } satisfies ApiErrorType);
  },
);

export default instance;
