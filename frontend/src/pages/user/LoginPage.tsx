import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Lock, UserRound } from "lucide-react";
import { FormLoginSchema, type formLogin } from "../../schemas/FormLoginSchema";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { login } from "../../redux/slices/user/authSlice";
import type { LoginRequest } from "../../types/auth";
import LoadingButton from "../../components/ui/common/LoadingButton";
import AuthShell from "../../components/ui/user/auth/AuthShell";

const inputClass =
  "h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pl-11 text-sm outline-none transition-all hover:border-sky-200 hover:bg-white focus:border-sky-400 focus:bg-white focus:ring-1 focus:ring-sky-100";

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const loginLoading = useAppSelector(
    (state) => state.ui.loadingMap["auth/login"] || false,
  );
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from
    ? `${location.state.from.pathname}${location.state.from.search || ""}`
    : "/home";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<formLogin>({
    resolver: zodResolver(FormLoginSchema),
    mode: "onChange",
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("rememberUser");
    if (savedUser) {
      setValue("username", savedUser);
      setValue("rememberMe", true);
    }
  }, [setValue]);

  const onSubmit = (dt: formLogin) => {
    const data: LoginRequest = {
      username: dt.username,
      password: dt.password,
    };

    if (dt.rememberMe) {
      localStorage.setItem("rememberUser", dt.username);
    } else {
      localStorage.removeItem("rememberUser");
    }

    dispatch(login({ data }))
      .unwrap()
      .then((res) => {
        if (res.data.accessToken && res.data.user) {
          toast.success(
            "Đăng nhập thành công. B-Hub rất vui được gặp lại bạn.",
          );
          setTimeout(() => navigate(from, { replace: true }), 700);
        }
      });
  };

  return (
    <AuthShell
      image="/img/login.png"
      imageAlt="Đăng nhập B-Hub"
      eyebrow="Tài khoản B-Hub"
      title="Chào mừng quay trở lại"
      description="Đăng nhập để đặt sân, theo dõi lịch chơi, quản lý đơn hàng và kết nối cùng cộng đồng cầu lông."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-sky-700">Đăng nhập</p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            Vào tài khoản
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Nhập thông tin của bạn để tiếp tục sử dụng B-Hub.
          </p>
        </div>

        <label className="block">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-slate-700">
              Tên đăng nhập
            </span>
            <span className="text-xs text-rose-500">
              {errors.username?.message || ""}
            </span>
          </div>
          <div className="relative">
            <UserRound
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              {...register("username")}
              placeholder="Nhập tên đăng nhập"
              className={inputClass}
            />
          </div>
        </label>

        <label className="block">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-slate-700">Mật khẩu</span>
            <span className="text-xs text-rose-500">
              {errors.password?.message || ""}
            </span>
          </div>
          <div className="relative">
            <Lock
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="password"
              {...register("password")}
              placeholder="Nhập mật khẩu"
              className={inputClass}
            />
          </div>
        </label>

        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="inline-flex items-center gap-2 text-slate-600">
            <input
              type="checkbox"
              {...register("rememberMe")}
              className="h-4 w-4 rounded border-slate-300 text-sky-600"
            />
            Ghi nhớ tài khoản
          </label>
          <Link
            to="/forgot-pass"
            className="font-medium text-sky-700 hover:text-sky-600"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <LoadingButton
          loading={loginLoading}
          type="submit"
          className="h-12 w-full rounded-2xl text-sm font-semibold"
        >
          Đăng nhập
        </LoadingButton>

        <p className="text-center text-sm text-slate-500">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="font-semibold text-sky-700">
            Tạo tài khoản
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default LoginPage;
