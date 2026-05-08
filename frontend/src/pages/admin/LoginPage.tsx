// pages/admin/LoginPage.tsx

import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormLoginSchema, type formLogin } from "../../schemas/FormLoginSchema";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { login, logout, logoutLocal } from "../../redux/slices/user/authSlice";
import type { LoginRequest } from "../../types/auth";
import LoadingButton from "../../components/ui/common/LoadingButton";
import InputForm from "../../components/ui/common/InputForm";
import PasswordInput from "../../components/ui/common/PasswordInput";
import { useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import { ROLE_NAME } from "../../utils/constants/role";

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
  }, []);

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
        }, 1500);
      });
  };

  return (
    <div
      className="
        h-full
        w-full

        flex items-center justify-center

        px-4 py-4
      "
    >
      <div
        className="
          w-full
          max-w-5xl

          grid lg:grid-cols-2

          rounded-[28px]
          overflow-hidden

          border border-sky-100
          bg-white/90
          backdrop-blur-xl

          shadow-[0_18px_60px_rgba(14,165,233,0.10)]
        "
      >
        {/* IMAGE */}
        <div className="relative hidden lg:block h-[460px]">
          <img src="/img/admin.png" className="w-full h-full object-cover" />

          <div
            className="
              absolute inset-0

              bg-gradient-to-br
              from-sky-950/70
              via-sky-900/40
              to-cyan-900/40

              flex flex-col
              justify-end

              p-8
            "
          >
            <div
              className="
                inline-flex
                items-center
                gap-2

                w-fit

                px-4 py-2
                rounded-full

                bg-white/15
                backdrop-blur-md
                border border-white/20

                text-white
                text-xs
                font-semibold
              "
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Portal
            </div>

            <h2
              className="
                mt-4
                text-[28px]
                leading-tight
                font-black
                tracking-tight
                text-white
              "
            >
              B-Hub
              <span className="block text-sky-300">Admin System</span>
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-white/80 max-w-md">
              Đăng nhập để quản lý vận hành, người dùng và hoạt động hệ thống.
            </p>
          </div>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="
            flex flex-col
            justify-center

            px-8 lg:px-10
            py-8
          "
        >
          {/* HEADER */}
          <div className="mb-6">
            <div
              className="
                inline-flex
                items-center
                gap-2

                px-4 py-2
                rounded-full

                bg-sky-50
                border border-sky-100

                text-sky-700
                text-xs
                font-semibold
              "
            >
              Secure Admin Access
            </div>

            <h1
              className="
                mt-4
                text-[28px]
                font-black
                tracking-tight
                text-slate-900
              "
            >
              Đăng nhập Admin
            </h1>

            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Khu vực dành cho quản trị hệ thống.
            </p>
          </div>

          {/* USERNAME */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-slate-700 text-sm">
                Tên đăng nhập
              </label>

              <p className="text-red-500 text-xs min-h-[18px]">
                {errors.username?.message || " "}
              </p>
            </div>

            <InputForm
              register={register}
              field={"username"}
              textHolder={"Nhập tên đăng nhập"}
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-slate-700 text-sm">
                Mật khẩu
              </label>

              <p className="text-red-500 text-xs min-h-[18px]">
                {errors.password?.message || " "}
              </p>
            </div>

            <PasswordInput register={register} field={"password"} />
          </div>

          {/* REMEMBER */}
          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              {...register("rememberMe")}
              className="
                w-4 h-4
                rounded
                border-slate-300
                cursor-pointer
              "
            />

            <label className="ml-3 text-sm text-slate-600 font-medium">
              Ghi nhớ tài khoản
            </label>
          </div>

          {/* BUTTON */}
          <LoadingButton loading={loginLoading} type="submit">
            Đăng nhập hệ thống
          </LoadingButton>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
