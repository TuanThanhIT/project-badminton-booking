// api/axiosInstance.ts
import axios, { AxiosError, type AxiosResponse } from "axios";

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

    if (statusCode === 401) {
      localStorage.removeItem("access_token");
    }

    return Promise.reject({
      statusCode,
      message: data?.message || "Có lỗi xảy ra",
      errors: data?.errors || null,
    });
  },
);

export default instance;
