import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormLoginSchema, type formLogin } from "../../schemas/FormLoginSchema";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { login } from "../../redux/slices/user/authSlice";
import type { LoginRequest } from "../../types/auth";
import LoadingButton from "../../components/ui/common/LoadingButton";
import PasswordInput from "../../components/ui/common/PasswordInput";
import InputForm from "../../components/ui/common/InputForm";

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.ui.loadingCount > 0);

  const { user, token } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const location = useLocation();
  const from = location.state?.from
    ? `${location.state.from.pathname}${location.state.from.search || ""}`
    : "/home";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formLogin>({
    resolver: zodResolver(FormLoginSchema),
    defaultValues: { username: "user1", password: "123456789" },
    mode: "onChange",
  });

  const onSubmit = (dt: formLogin) => {
    const data: LoginRequest = {
      username: dt.username,
      password: dt.password,
    };
    dispatch(login({ data })).unwrap();
  };

  /*
    Xử lý khi login thành công
  */
  useEffect(() => {
    if (token && user) {
      localStorage.setItem("access_token", token);
      toast.success("Đăng nhập thành công. B-Hub rất vui được gặp lại bạn.");
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 2000);
    }
  }, [token, user]);

  return (
    <div className="p-20 w-3/4 mx-auto">
      <div className="grid grid-cols-2 rounded-2xl gap-5 border border-gray-200">
        <div className="h-full">
          <img
            src="/img/login.jpg"
            alt="Đăng nhập"
            className="w-full h-full object-cover rounded-l-2xl"
          />
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-between gap-2 p-10"
        >
          <h1 className="font-bold text-2xl">
            Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục...
          </h1>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Tên đăng nhập
            </label>
            <InputForm
              register={register}
              error={errors.username}
              field={"username"}
            ></InputForm>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Mật khẩu
            </label>
            <PasswordInput
              register={register}
              error={errors.password}
              field={"password"}
            ></PasswordInput>
          </div>
          {/* <input
            type="password"
            placeholder="Mật khẩu"
            {...register("password")}
            className="border-0 p-2 px-4 rounded-md mb-3 shadow-sm outline-0"
          ></input>
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )} */}

          <div className="flex flex-row justify-between mb-3">
            <div>
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                className="mr-1 cursor-pointer"
              />
              <label>Ghi nhớ đăng nhập</label>
            </div>
            <Link
              to="/forgotpass"
              className="text-blue-700 hover:text-red-500 underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <LoadingButton loading={loading} type="submit">
            Đăng nhập
          </LoadingButton>

          <label>
            Chưa có tài khoản? Đăng ký{" "}
            <Link to="/register" className="text-blue-700 hover:text-red-500">
              tại đây
            </Link>
          </label>
        </form>
      </div>
    </div>
  );
};
export default LoginPage;
