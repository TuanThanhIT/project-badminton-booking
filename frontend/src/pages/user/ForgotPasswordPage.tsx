import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  FormForgotPasswordSchema,
  type formForgotPassword,
} from "../../schemas/FormForgotPasswordSchema";
import type { OtpSendRequest } from "../../types/auth";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { otpSend } from "../../redux/slices/user/authSlice";
import LoadingButton from "../../components/ui/common/LoadingButton";
import InputForm from "../../components/ui/common/InputForm";
import PasswordInput from "../../components/ui/common/PasswordInput";

const ForgotPasswordPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.ui.loadingCount > 0);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formForgotPassword>({
    resolver: zodResolver(FormForgotPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (dt: formForgotPassword) => {
    const { email, newPassword } = dt;
    const data: OtpSendRequest = {
      email,
    };
    const res = await dispatch(otpSend({ data }));
    if (otpSend.fulfilled.match(res)) {
      toast.success("Mã OTP đã được gửi. Vui lòng kiểm tra email.");
      setTimeout(() => {
        navigate("/verify-otp", { state: { email, newPassword } });
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-white">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center">Quên mật khẩu</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email đăng ký
            </label>
            <InputForm
              register={register}
              error={errors.email}
              field={"email"}
            ></InputForm>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Mật khẩu mới
            </label>
            <PasswordInput
              register={register}
              error={errors.newPassword}
              field={"newPassword"}
            ></PasswordInput>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Nhập lại mật khẩu
            </label>
            <PasswordInput
              register={register}
              error={errors.confirmPassword}
              field={"confirmPassword"}
            ></PasswordInput>
          </div>

          <LoadingButton
            loading={loading}
            children={"Gửi yêu cầu"}
            type="submit"
            className="w-full"
          ></LoadingButton>
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
