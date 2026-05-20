import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { AtSign, Lock, UserRound } from "lucide-react";
import {
  FormRegisterSchema,
  type formRegister,
} from "../../schemas/FormRegisterSchema";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { registerAccount, setOtpFlow } from "../../redux/slices/user/authSlice";
import type { OtpFlowData, RegisterRequest } from "../../types/auth";
import LoadingButton from "../../components/ui/common/LoadingButton";
import AuthShell from "../../components/ui/user/auth/AuthShell";
import { OTP_TYPE } from "../../utils/constants/otpType";

const inputClass =
  "h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pl-11 text-sm outline-none transition-all hover:border-sky-200 hover:bg-white focus:border-sky-400 focus:bg-white focus:ring-1 focus:ring-sky-100";

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const registerLoading = useAppSelector(
    (state) => state.ui.loadingMap["auth/registerAccount"],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formRegister>({
    resolver: zodResolver(FormRegisterSchema),
    mode: "onChange",
  });

  const onSubmit = async (dt: formRegister) => {
    const data: RegisterRequest = {
      username: dt.username,
      password: dt.password,
      email: dt.email,
    };
    const otpData: OtpFlowData = {
      email: dt.email,
      type: OTP_TYPE.REGISTER,
    };

    await dispatch(registerAccount({ data }))
      .unwrap()
      .then(() => {
        toast.success("Đăng ký tài khoản thành công. Vui lòng xác thực OTP.");
        dispatch(setOtpFlow({ data: otpData }));
        setTimeout(() => navigate("/verify-otp"), 700);
      });
  };

  return (
    <AuthShell
      image="img/register.jpg"
      imageAlt="Đăng ký B-Hub"
      eyebrow="Thành viên mới"
      title="Tạo tài khoản B-Hub"
      description="Tạo tài khoản để đặt sân nhanh, mua sắm dụng cụ và lưu lại toàn bộ lịch sử chơi của bạn."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-sky-700">Đăng ký</p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            Bắt đầu với B-Hub
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Điền thông tin bên dưới để tạo tài khoản mới.
          </p>
        </div>

        {[
          {
            field: "username" as const,
            label: "Tên đăng nhập",
            placeholder: "Nhập tên đăng nhập",
            icon: UserRound,
            error: errors.username?.message,
            type: "text",
          },
          {
            field: "email" as const,
            label: "Email",
            placeholder: "Nhập email",
            icon: AtSign,
            error: errors.email?.message,
            type: "email",
          },
          {
            field: "password" as const,
            label: "Mật khẩu",
            placeholder: "Nhập mật khẩu",
            icon: Lock,
            error: errors.password?.message,
            type: "password",
          },
          {
            field: "confirmPassword" as const,
            label: "Xác nhận mật khẩu",
            placeholder: "Nhập lại mật khẩu",
            icon: Lock,
            error: errors.confirmPassword?.message,
            type: "password",
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
              <item.icon
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type={item.type}
                {...register(item.field)}
                placeholder={item.placeholder}
                className={inputClass}
              />
            </div>
          </label>
        ))}

        <LoadingButton
          loading={registerLoading}
          type="submit"
          className="h-12 w-full rounded-2xl text-sm font-semibold"
        >
          Tạo tài khoản
        </LoadingButton>

        <p className="text-center text-sm text-slate-500">
          Đã có tài khoản?{" "}
          <Link to="/login" className="font-semibold text-sky-700">
            Đăng nhập
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default RegisterPage;
