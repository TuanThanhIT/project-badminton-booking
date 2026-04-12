import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  FormForgotPasswordSchema,
  type formForgotPassword,
} from "../../schemas/FormForgotPasswordSchema";
import type { OtpFlowData, OtpSendRequest } from "../../types/auth";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { otpSend, setOtpFlow } from "../../redux/slices/user/authSlice";
import LoadingButton from "../../components/ui/common/LoadingButton";
import InputForm from "../../components/ui/common/InputForm";
import { OTP_TYPE } from "../../constants/otpType";

const ForgotPasswordPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const sendLoading = useAppSelector(
    (state) => state.ui.loadingMap["auth/otpSend"],
  );
  const navigate = useNavigate();

  const RESEND_EXPIRE_KEY = "otp_resend_at";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formForgotPassword>({
    resolver: zodResolver(FormForgotPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (dt: formForgotPassword) => {
    const { email } = dt;
    const data: OtpSendRequest = {
      email,
      type: OTP_TYPE.RESET_PASSWORD,
    };
    const dta: OtpFlowData = {
      email,
      type: OTP_TYPE.RESET_PASSWORD,
    };
    await dispatch(otpSend({ data }))
      .unwrap()
      .then(() => {
        toast.success("Mã OTP đã được gửi. Vui lòng kiểm tra email.");
        dispatch(setOtpFlow({ data: dta }));
        setTimeout(() => {
          navigate("/verify-otp");
        }, 1000);
      })
      .catch((error) => {
        const remainingTime = error?.data?.remainingTime;

        if (remainingTime) {
          const resendExpireAt = Date.now() + remainingTime * 1000;
          localStorage.setItem(RESEND_EXPIRE_KEY, resendExpireAt.toString());
          toast.warning(`Vui lòng đợi ${remainingTime}s trước khi gửi lại OTP`);
        }
      });
  };

  return (
    <div className="p-20 w-3/4 mx-auto">
      <div className="grid grid-cols-2 rounded-2xl gap-5 border border-gray-200">
        <div className="relative hidden md:block">
          <img
            src="/img/forget-pass.webp"
            alt="Quên mật khẩu"
            className="w-full h-full object-cover rounded-l-2xl"
          />

          <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-10 rounded-l-2xl">
            <div className="text-white text-center">
              <h2 className="text-3xl font-bold mb-3">Quên mật khẩu?</h2>
              <p className="text-sm">
                Nhập email đã đăng ký để nhận hướng dẫn đặt lại mật khẩu và truy
                cập lại tài khoản của bạn.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-1">Khôi phục mật khẩu</h2>
            <p className="text-sm text-gray-500">
              Nhập email đã đăng ký để nhận mã xác thực đặt lại mật khẩu.
            </p>
          </div>

          {/* Email */}
          <div>
            <div className="flex flex-row items-center justify-between">
              <label className="block text-gray-700 font-medium mb-1">
                Email đăng ký
              </label>
              <p className="text-red-500 text-xs min-h-[1.5rem] transition-all duration-200">
                {errors.email?.message || " "}
              </p>
            </div>
            <InputForm
              register={register}
              error={errors.email}
              field={"email"}
            />
          </div>

          <LoadingButton loading={sendLoading} type="submit" className="w-full">
            Gửi yêu cầu
          </LoadingButton>

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

export default ForgotPasswordPage;
