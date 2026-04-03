import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormLoginSchema, type formLogin } from "../../schemas/FormLoginSchema";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { login } from "../../redux/slices/user/authSlice";
import type { LoginRequest } from "../../types/auth";
import LoadingButton from "../../components/ui/common/LoadingButton";
import PasswordInput from "../../components/ui/common/PasswordInput";
import InputForm from "../../components/ui/common/InputForm";
import { useEffect } from "react";

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const loginLoading = useAppSelector(
    (state) => state.ui.loadingMap["auth/login"],
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
  }, []);

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
        const accessToken = res.data.accessToken;
        const user = res.data.user;
        if (accessToken && user) {
          toast.success(
            "Đăng nhập thành công. B-Hub rất vui được gặp lại bạn.",
          );
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 2000);
        }
      });
  };

  return (
    <div className="p-20 w-3/4 mx-auto">
      <div className="grid grid-cols-2 rounded-2xl gap-5 border border-gray-200">
        <div className="relative hidden md:block">
          <img
            src="/img/login.jpg"
            alt="Đăng nhập"
            className="w-full h-full object-cover rounded-l-2xl"
          />

          <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-10 rounded-l-2xl">
            <div className="text-white text-center">
              <h2 className="text-3xl font-bold mb-3">
                Chào mừng quay trở lại
              </h2>
              <p className="text-sm">
                Đăng nhập để truy cập tài khoản và tiếp tục sử dụng các tính
                năng của hệ thống.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-between gap-3 p-10"
        >
          <div>
            <h1 className="font-bold text-2xl mb-1">Đăng nhập tài khoản</h1>
            <p className="text-gray-500 text-sm">
              Vui lòng nhập thông tin đăng nhập để tiếp tục.
            </p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Tên đăng nhập
            </label>
            <InputForm
              register={register}
              error={errors.username}
              field={"username"}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Mật khẩu
            </label>
            <PasswordInput
              register={register}
              error={errors.password}
              field={"password"}
            />
          </div>

          <div className="flex flex-row justify-between items-center mb-3">
            <div>
              <input
                type="checkbox"
                {...register("rememberMe")}
                className="mr-1 cursor-pointer"
              />
              <label htmlFor="rememberMe">Ghi nhớ tài khoản</label>
            </div>

            <Link
              to="/forgot-pass"
              className="text-blue-700 hover:text-red-500 underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <LoadingButton loading={loginLoading} type="submit">
            Đăng nhập
          </LoadingButton>

          <p className="text-sm text-center mt-2">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-blue-700 hover:text-red-500 font-medium"
            >
              Tạo tài khoản
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
export default LoginPage;
