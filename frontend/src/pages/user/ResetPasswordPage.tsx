import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  FormResetPasswordSchema,
  type formResetPassword,
} from "../../schemas/FormForgotPasswordSchema";
import type { ResetPasswordRequest } from "../../types/auth";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { resetPassword } from "../../redux/slices/user/authSlice";
import LoadingButton from "../../components/ui/common/LoadingButton";
import PasswordInput from "../../components/ui/common/PasswordInput";

const ResetPasswordPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const resetPasswordLoading = useAppSelector(
    (state) => state.ui.loadingMap["auth/resetPassword"],
  );
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<formResetPassword>({
    resolver: zodResolver(FormResetPasswordSchema),
    mode: "onChange",
  });

  const newPasswordValue = watch("newPassword");

  const onSubmit = async (dt: formResetPassword) => {
    const resetToken = localStorage.getItem("resetToken");
    if (!resetToken) {
      toast.error(
        "Không tìm thấy phiên đặt lại mật khẩu. Vui lòng yêu cầu mã OTP mới để tiếp tục.",
      );
      return;
    }

    const data: ResetPasswordRequest = {
      resetToken,
      newPassword: dt.newPassword,
    };

    await dispatch(resetPassword({ data }))
      .unwrap()
      .then(() => {
        localStorage.removeItem("resetToken");
        toast.success("Mật khẩu đã được đổi thành công");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      });
  };

  return (
    <div className="p-20 w-3/4 mx-auto">
      <div className="grid grid-cols-2 rounded-2xl gap-5 border border-gray-200">
        <div className="relative hidden md:block">
          <img
            src="/img/reset-password.webp"
            alt="Đặt lại mật khẩu"
            className="w-full h-full object-cover rounded-l-2xl"
          />

          <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-10 rounded-l-2xl">
            <div className="text-white text-center">
              <h2 className="text-3xl font-bold mb-3">Tạo mật khẩu mới</h2>
              <p className="text-sm">
                Thiết lập mật khẩu mới để khôi phục quyền truy cập vào tài khoản
                của bạn.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-1">Đặt lại mật khẩu</h2>
            <p className="text-sm text-gray-500">
              Nhập mật khẩu mới cho tài khoản của bạn.
            </p>
          </div>

          {/* New Password */}
          <div>
            <div className="flex flex-row items-center justify-between">
              <label className="block text-gray-700 font-medium mb-1">
                Mật khẩu mới
              </label>
              <p className="text-red-500 text-xs min-h-[1.5rem] transition-all duration-200">
                {errors.newPassword?.message || " "}
              </p>
            </div>
            <PasswordInput
              register={register}
              field={"newPassword"}
              value={newPasswordValue}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <div className="flex flex-row items-center justify-between">
              <label className="block text-gray-700 font-medium mb-1">
                Xác nhận mật khẩu
              </label>
              <p className="text-red-500 text-xs min-h-[1.5rem] transition-all duration-200">
                {errors.confirmPassword?.message || " "}
              </p>
            </div>
            <PasswordInput register={register} field={"confirmPassword"} />
          </div>

          <LoadingButton
            loading={resetPasswordLoading}
            type="submit"
            className="w-full"
          >
            Cập nhật mật khẩu
          </LoadingButton>

          <p className="text-center text-gray-500 mt-5">
            Đã nhớ mật khẩu?{" "}
            <a href="/login" className="text-sky-600 hover:underline">
              Đăng nhập
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
