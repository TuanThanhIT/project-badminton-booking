import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import {
  FormResetPasswordSchema,
  type formResetPassword,
} from "../../schemas/FormForgotPasswordSchema";
import type { ResetPasswordRequest } from "../../types/auth";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { resetPassword } from "../../redux/slices/user/authSlice";
import LoadingButton from "../../components/ui/common/LoadingButton";
import AuthShell from "../../components/ui/user/auth/AuthShell";

const inputClass =
  "h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pl-11 text-sm outline-none transition-all hover:border-sky-200 hover:bg-white focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100";

const ResetPasswordPage = () => {
  const dispatch = useAppDispatch();
  const resetPasswordLoading = useAppSelector(
    (state) => state.ui.loadingMap["auth/resetPassword"],
  );
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
    const resetToken = localStorage.getItem("resetToken");
    if (!resetToken) {
      toast.error(
        "Không tìm thấy phiên đặt lại mật khẩu. Vui lòng yêu cầu mã OTP mới.",
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
        setTimeout(() => navigate("/login"), 700);
      });
  };

  return (
    <AuthShell
      image="/img/reset-password.webp"
      imageAlt="Đặt lại mật khẩu"
      eyebrow="Bảo mật tài khoản"
      title="Tạo mật khẩu mới"
      description="Thiết lập mật khẩu mới để khôi phục quyền truy cập và tiếp tục sử dụng các dịch vụ của B-Hub."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-sky-700">
            Đặt lại mật khẩu
          </p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            Mật khẩu mới
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Chọn mật khẩu đủ mạnh để bảo vệ tài khoản của bạn.
          </p>
        </div>

        {[
          {
            field: "newPassword" as const,
            label: "Mật khẩu mới",
            placeholder: "Nhập mật khẩu mới",
            error: errors.newPassword?.message,
          },
          {
            field: "confirmPassword" as const,
            label: "Xác nhận mật khẩu",
            placeholder: "Nhập lại mật khẩu",
            error: errors.confirmPassword?.message,
          },
        ].map((item) => (
          <label key={item.field} className="block">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-700">
                {item.label}
              </span>
              <span className="text-xs text-rose-500">{item.error || ""}</span>
            </div>
            <div className="relative">
              <Lock
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="password"
                {...register(item.field)}
                placeholder={item.placeholder}
                className={inputClass}
              />
            </div>
          </label>
        ))}

        <LoadingButton
          loading={resetPasswordLoading}
          type="submit"
          className="h-12 w-full rounded-2xl text-sm font-semibold"
        >
          Cập nhật mật khẩu
        </LoadingButton>

        <p className="text-center text-sm text-slate-500">
          Đã nhớ mật khẩu?{" "}
          <Link to="/login" className="font-semibold text-sky-700">
            Đăng nhập
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default ResetPasswordPage;
