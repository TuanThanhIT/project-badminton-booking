import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormLoginSchema, type formLogin } from "../../schemas/FormLoginSchema";
import authService from "../../services/authService";
import type { ApiErrorType } from "../../types/error";
import { toast } from "react-toastify";
import { useContext } from "react";
import { AuthContext } from "../../components/contexts/authContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);
  const location = useLocation();
  const from = location.state?.from
    ? `${location.state.from.pathname}${location.state.from.search || ""}`
    : "/home";

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<formLogin>({
    resolver: zodResolver(FormLoginSchema),
    defaultValues: { username: "user1", password: "123456" },
    mode: "onChange",
  });

  const onSubmit = async (data: formLogin) => {
    try {
      const res = await authService.loginService(data);
      localStorage.setItem("access_token", res.data.access_token);
      setAuth({
        isAuthenticated: true,
        user: {
          id: res.data?.user?.id || 0,
          email: res.data?.user?.email || "",
          username: res.data?.user?.username || "",
        },
      });

      toast.success("Đăng nhập thành công! B-Hub rất vui được gặp lại bạn");
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 2000);
    } catch (error) {
      const apiError = error as ApiErrorType;
      toast.error(apiError.userMessage);
    }
  };

  return (
    <div className="p-20 w-3/4 mx-auto">
      <div className="grid grid-cols-2 shadow-md rounded-2xl gap-5 text-sm">
        <div className="flex justify-center p-3">
          <img src="/img/login.jpg" alt="Đăng nhập"></img>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-between gap-2 p-10"
        >
          <h1 className="font-bold text-2xl">
            Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục
          </h1>
          <label>Tên đăng nhập</label>
          <input
            placeholder="Tên đăng nhập"
            {...register("username")}
            className="rounded-md mb-3 shadow-sm p-2 px-4 outline-0"
          ></input>
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username.message}</p>
          )}

          <label>Mật khẩu</label>
          <input
            placeholder="Mật khẩu"
            {...register("password")}
            className="border-0 p-2 px-4 rounded-md mb-3 shadow-sm outline-0"
          ></input>
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}

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
          <button
            type="submit"
            className="bg-blue-500 rounded-2xl text-white py-1 hover:bg-blue-800 text-lg"
            disabled={!isDirty && !isValid}
          >
            Đăng nhập
          </button>
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
