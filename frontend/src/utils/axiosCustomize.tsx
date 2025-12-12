import axios from "axios";
import type {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL as string,
  timeout: 5000,
});

// Interceptor request: gắn token nếu có
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor response: xử lý lỗi chung
instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (
    error: AxiosError<{ statusCode: number; message: string; stack?: string }>
  ) => {
    if (error.response?.data?.message) {
      return Promise.reject(new Error(error.response.data.message));
    }
    return Promise.reject(new Error("Có lỗi xảy ra, vui lòng thử lại."));
  }
);

export default instance;