// api/axiosInstance.ts
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL as string,
  timeout: 5000,
});

// Gắn token nếu có
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý lỗi tập trung
instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (
    error: AxiosError<{ statusCode: number; message: string; stack?: string }>
  ) => {
    const statusCode = error.response?.status;
    const backendMessage = error.response?.data?.message;

    let userMessage = "Có lỗi xảy ra, vui lòng thử lại."; // fallback mặc định
    const developerMessage = backendMessage || error.message;

    if (statusCode) {
      if (statusCode === 401) {
        // Token hết hạn hoặc không hợp lệ → chỉ cần logout
        localStorage.removeItem("access_token");
        userMessage = backendMessage || "Phiên đăng nhập đã hết hạn.";
      } else if (statusCode === 404) {
        userMessage = backendMessage || "Không tìm thấy tài nguyên.";
      } else if (statusCode >= 400 && statusCode < 500) {
        userMessage = backendMessage || "Yêu cầu không hợp lệ.";
      } else if (statusCode >= 500) {
        userMessage = "Hệ thống đang gặp sự cố, vui lòng thử lại sau!";
      }
    }

    // Trả về object lỗi chuẩn để frontend xử lý dễ
    return Promise.reject({
      statusCode,
      userMessage, // thông báo để show cho người dùng
      developerMessage, // thông báo kỹ thuật (có thể log ra console)
    });
  }
);

export default instance;
