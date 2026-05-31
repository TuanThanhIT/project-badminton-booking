import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Lock, UserRound, UserRoundCheck } from "lucide-react";
import { FormLoginSchema, type formLogin } from "../../schemas/FormLoginSchema";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  employeeLogin,
  logout,
  logoutLocal,
} from "../../redux/slices/user/authSlice";
import type { LoginRequest } from "../../types/auth";
import LoadingButton from "../../components/ui/common/LoadingButton";
import { ROLE_NAME } from "../../utils/constants/role";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pl-11 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-sky-200 hover:bg-white focus:border-sky-400 focus:bg-white focus:ring-1 focus:ring-sky-100";

const LoginPage = () => {
  const dispatch = useAppDispatch();

  const loginLoading = useAppSelector(
    (state) => state.ui.loadingMap["auth/employeeLogin"] || false,
  );

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from
    ? `${location.state.from.pathname}${location.state.from.search || ""}`
    : "/employee/cash-register";

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

    dispatch(employeeLogin({ data }))
      .unwrap()
      .then((res) => {
        const user = res.data.user;

        if (user?.role !== ROLE_NAME.EMPLOYEE) {
          toast.error("Tài khoản không phải nhân viên");
          dispatch(logoutLocal());
          dispatch(logout());
          return;
        }

        toast.success("Đăng nhập Nhân viên thành công");

        setTimeout(() => {
          navigate(from, { replace: true });
        }, 700);
      });
  };

  return (
    <div className="flex min-h-full w-full items-center justify-center bg-slate-50 px-4 py-3 text-slate-700 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)] lg:grid lg:grid-cols-[1.02fr_0.98fr]">
          <div className="relative hidden h-[clamp(390px,calc(100dvh-170px),460px)] overflow-hidden lg:block">
            <img
              src="/img/employee.webp"
              alt="Employee B-Hub"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/75 via-sky-950/40 to-slate-900/10" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <Link
                to="/home"
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-sky-100 backdrop-blur-sm transition hover:bg-white/15"
              >
                Về B-Hub
              </Link>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-sky-100 backdrop-blur-sm">
                <UserRoundCheck size={16} />
                Employee Portal
              </div>
              <h1 className="mt-4 max-w-lg text-2xl font-extrabold leading-tight tracking-tight">
                Không gian nhân viên B-Hub
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-sky-100">
                Đăng nhập để xử lý ca trực, hỗ trợ đặt sân và theo dõi công việc
                hằng ngày.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center p-5 sm:p-7 lg:h-[clamp(390px,calc(100dvh-170px),460px)]">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full max-w-md space-y-3"
            >
              <div>
                <p className="text-sm font-semibold text-sky-700">
                  Secure Employee Access
                </p>
                <h2 className="mt-1.5 text-2xl font-extrabold text-slate-900">
                  Đăng nhập Employee
                </h2>
                <p className="mt-1.5 text-sm leading-6 text-slate-500">
                  Khu vực dành cho nhân viên B-Hub.
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
                className="h-11 w-full rounded-xl text-sm font-semibold"
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
