import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  FormForgotPasswordSchema,
  FormResetPasswordSchema,
  type formForgotPassword,
  type formResetPassword,
} from "../../schemas/FormForgotPasswordSchema";
import type { OtpFlowData, OtpSendRequest } from "../../types/auth";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { otpSend, setOtpFlow } from "../../redux/slices/user/authSlice";
import LoadingButton from "../../components/ui/common/LoadingButton";
import PasswordInput from "../../components/ui/common/PasswordInput";

const ResetPasswordPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {email, otpCode} = useAppSelector((state) => state.auth.otpFlow.);
  const loading = useAppSelector((state) => state.ui.loadingCount > 0);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formResetPassword>({
    resolver: zodResolver(FormResetPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (dt: formResetPassword) => {
    const data: ResetPasswordRequest = {
      email,
      
    };
    const dta: OtpFlowData = {
      email,
      type: "RESET-PASSWORD",
    };
    await dispatch(otpSend({ data }))
      .unwrap()
      .then(() => {
        toast.success("Mã OTP đã được gửi. Vui lòng kiểm tra email.");
        dispatch(setOtpFlow({ data: dta }));
        setTimeout(() => {
          navigate("/verify-otp");
        }, 3000);
      });
  };

  return (
    <div className="p-20 w-3/4 mx-auto">
      <div className="grid grid-cols-2 rounded-2xl gap-5 border border-gray-200">
        <div className="h-full">
          <img
            src="/img/forgetpass.webp"
            alt="Đăng nhập"
            className="w-full h-full object-cover rounded-l-2xl"
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-10">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Đặt lại mật khẩu!
          </h2>

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

          <p className="text-center text-gray-500 mt-5">
            Nhớ mật khẩu?{" "}
            <a href="/login" className="text-sky-600 hover:underline">
              Đăng nhập ngay
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
