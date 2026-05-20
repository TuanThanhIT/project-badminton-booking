// pages/admin/LoginPage.tsx

import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Lock, ShieldCheck, UserRound } from "lucide-react";
import { FormLoginSchema, type formLogin } from "../../schemas/FormLoginSchema";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { login, logout, logoutLocal } from "../../redux/slices/user/authSlice";
import type { LoginRequest } from "../../types/auth";
import LoadingButton from "../../components/ui/common/LoadingButton";
import { ROLE_NAME } from "../../utils/constants/role";

const inputClass =
  "h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pl-11 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-sky-200 hover:bg-white focus:border-sky-400 focus:bg-white focus:ring-1 focus:ring-sky-100";

const LoginPage = () => {
  const dispatch = useAppDispatch();

  const loginLoading = useAppSelector(
    (state) => state.ui.loadingMap["user/login"] || false,
  );

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from
    ? `${location.state.from.pathname}${location.state.from.search || ""}`
    : "/admin/dashboard";

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
    const savedUser = localStorage.getItem("rememberMe");

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
      localStorage.setItem("rememberMe", dt.username);
    } else {
      localStorage.removeItem("rememberMe");
    }

    dispatch(login({ data }))
      .unwrap()
      .then((res) => {
        const user = res.data.user;

        if (user?.role !== ROLE_NAME.ADMIN) {
          toast.error("Tài khoản không phải Admin");
          dispatch(logoutLocal());
          dispatch(logout());
          return;
        }

        toast.success("Đăng nhập Admin thành công");

        setTimeout(() => {
          navigate(from, { replace: true });
        }, 700);
      });
  };

  return (
    <div className="h-full w-full overflow-hidden bg-slate-50 px-4 py-4 text-slate-700 sm:px-6">
      <div className="mx-auto grid h-full w-full max-w-6xl items-center">
        <div className="max-h-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative hidden h-[min(510px,calc(100vh-180px))] overflow-hidden lg:block">
            <img
              src="/img/admin.png"
              alt="Admin B-Hub"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/75 via-sky-950/40 to-slate-900/10" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-white">
              <Link
                to="/home"
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-sky-100 backdrop-blur-sm transition hover:bg-white/15"
              >
                Về B-Hub
              </Link>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-sky-100 backdrop-blur-sm">
                <ShieldCheck size={16} />
                Admin Portal
              </div>
              <h1 className="mt-4 max-w-lg text-3xl font-extrabold leading-tight tracking-tight">
                Quản trị hệ thống B-Hub
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-sky-100">
                Đăng nhập để quản lý người dùng, vận hành nền tảng và theo dõi
                hoạt động hệ thống.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center p-5 sm:p-8 lg:h-[min(510px,calc(100vh-180px))]">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full max-w-md space-y-4"
            >
              <div>
                <p className="text-sm font-semibold text-sky-700">
                  Secure Admin Access
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                  Đăng nhập Admin
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Khu vực dành cho quản trị viên B-Hub.
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
                  <span className="text-sm font-medium text-slate-700">
                    Mật khẩu
                  </span>
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

              <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  {...register("rememberMe")}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600"
                />
                Ghi nhớ tài khoản
              </label>

              <LoadingButton
                loading={loginLoading}
                type="submit"
                className="h-12 w-full rounded-2xl text-sm font-semibold"
              >
                Đăng nhập
              </LoadingButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
