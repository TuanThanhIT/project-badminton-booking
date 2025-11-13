import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import {
  FormForgotPasswordSchema,
  type formForgotPassword,
} from "../../schemas/FormForgotPasswordSchema";
import type { ApiErrorType } from "../../types/error";
import authService from "../../services/authService";

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<formForgotPassword>({
    resolver: zodResolver(FormForgotPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: formForgotPassword) => {
    try {
      const { email, newPassword } = data;
      const res = await authService.sendOtpService({ email });
      toast.success(res.data.message);
      setTimeout(() => {
        navigate("/verify-otp", { state: { email, newPassword } });
      }, 3000);
    } catch (error) {
      const apiError = error as ApiErrorType;
      toast.error(apiError.userMessage || "Gửi yêu cầu thất bại!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-white">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-600 mb-6 text-center">
          Quên mật khẩu
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email đăng ký
            </label>
            <input
              type="email"
              placeholder="Nhập email của bạn"
              {...register("email")}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-400 focus:ring-red-300"
                  : "border-gray-300 focus:ring-sky-300"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Mật khẩu mới
            </label>
            <input
              type="password"
              placeholder="Nhập mật khẩu mới"
              {...register("newPassword")}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${
                errors.newPassword
                  ? "border-red-400 focus:ring-red-300"
                  : "border-gray-300 focus:ring-sky-300"
              }`}
            />
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Nhập lại mật khẩu
            </label>
            <input
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              {...register("confirmPassword")}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${
                errors.confirmPassword
                  ? "border-red-400 focus:ring-red-300"
                  : "border-gray-300 focus:ring-sky-300"
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid || !isDirty}
            className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed
             text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-200"
          >
            Gửi yêu cầu
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Nhớ mật khẩu?{" "}
          <a href="/login" className="text-sky-600 hover:underline">
            Đăng nhập ngay
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
