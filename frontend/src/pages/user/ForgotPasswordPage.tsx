import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { AtSign } from "lucide-react";
import {
  FormForgotPasswordSchema,
  type formForgotPassword,
} from "../../schemas/FormForgotPasswordSchema";
import type { OtpFlowData, OtpSendRequest } from "../../types/auth";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { otpSend, setOtpFlow } from "../../redux/slices/user/authSlice";
import LoadingButton from "../../components/ui/common/LoadingButton";
import AuthShell from "../../components/ui/user/auth/AuthShell";
import { OTP_TYPE } from "../../utils/constants/otpType";

const RESEND_EXPIRE_KEY = "otp_resend_at";

const ForgotPasswordPage = () => {
  const dispatch = useAppDispatch();
  const sendLoading = useAppSelector(
    (state) => state.ui.loadingMap["auth/otpSend"],
  );
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
    const data: OtpSendRequest = {
      email: dt.email,
      type: OTP_TYPE.RESET_PASSWORD,
    };
    const otpData: OtpFlowData = {
      email: dt.email,
      type: OTP_TYPE.RESET_PASSWORD,
    };

    await dispatch(otpSend({ data }))
      .unwrap()
      .then(() => {
        toast.success("Mã OTP đã được gửi. Vui lòng kiểm tra email.");
        dispatch(setOtpFlow({ data: otpData }));
        setTimeout(() => navigate("/verify-otp"), 700);
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
    <AuthShell
      image="/img/forget-pass.webp"
      imageAlt="Quên mật khẩu"
      eyebrow="Khôi phục tài khoản"
      title="Lấy lại quyền truy cập"
      description="Nhập email đã đăng ký, B-Hub sẽ gửi mã OTP để bạn đặt lại mật khẩu an toàn."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-sky-700">Quên mật khẩu</p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            Nhận mã xác thực
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Nhập email của bạn để nhận mã OTP đặt lại mật khẩu.
          </p>
        </div>

        <label className="block">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-slate-700">
              Email đăng ký
            </span>
            <span className="text-xs text-rose-500">
              {errors.email?.message || ""}
            </span>
          </div>
          <div className="relative">
            <AtSign
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="email"
              {...register("email")}
              placeholder="Nhập email"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pl-11 text-sm outline-none transition-all hover:border-sky-200 hover:bg-white focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
            />
          </div>
        </label>

        <LoadingButton
          loading={sendLoading}
          type="submit"
          className="h-12 w-full rounded-2xl text-sm font-semibold"
        >
          Gửi mã OTP
        </LoadingButton>

        <p className="text-center text-sm text-slate-500">
          Nhớ mật khẩu?{" "}
          <Link to="/login" className="font-semibold text-sky-700">
            Đăng nhập ngay
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default ForgotPasswordPage;
