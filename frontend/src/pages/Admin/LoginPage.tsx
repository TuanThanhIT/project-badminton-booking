import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormLoginSchema, type formLogin } from "../../schemas/FormLoginSchema";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../components/contexts/authContext";
import type { ApiErrorType } from "../../types/error";
import authService from "../../services/admin/authService";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<formLogin>({
    resolver: zodResolver(FormLoginSchema),
    defaultValues: { username: "admin", password: "123456789" },
    mode: "onChange",
  });

  const onSubmit = async (data: formLogin) => {
    try {
      const res = await authService.loginAdminService(data);
      localStorage.setItem("access_token", res.data.access_token);

      setAuth({
        isAuthenticated: true,
        user: {
          id: res.data?.user?.id || 0,
          email: res.data?.user?.email || "",
          username: res.data?.user?.username || "",
          role: res.data?.user?.role || "",
        },
      });

      toast.success("Đăng nhập thành công! B-Hub rất vui được gặp lại bạn");
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 2000);
    } catch (error) {
      const apiError = error as ApiErrorType;
      toast.error(apiError.userMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 bg-white border border-gray-300 rounded-2xl w-full max-w-4xl">
        {/* Bên hình minh họa */}
        <div className="flex items-center justify-center bg-sky-600 rounded-l-2xl">
          <img
            src="/img/logo-admin.webp"
            alt="Đăng nhập nhân viên"
            className="w-full h-full object-cover rounded-l-2xl"
          />
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-center gap-4 p-10"
        >
          <h1 className="text-3xl font-bold text-sky-700 mb-6 text-center">
            Chào mừng quản trị viên của B-Hub
          </h1>

          {/* Username */}
          <div className="flex flex-col gap-1">
            <label className="font-medium">Tên đăng nhập</label>
            <input
              placeholder="Tên đăng nhập"
              {...register("username")}
              className="rounded-md shadow-sm p-2 px-4 outline-none border border-gray-300 focus:ring-2 focus:ring-sky-400"
            />
            {/* Dành trước không gian cho lỗi */}
            <p className="text-red-500 text-sm h-5">
              {errors.username ? errors.username.message : ""}
            </p>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="font-medium">Mật khẩu</label>
            <input
              type="password"
              placeholder="Mật khẩu"
              {...register("password")}
              className="rounded-md shadow-sm p-2 px-4 outline-none border border-gray-300 focus:ring-2 focus:ring-sky-400"
            />
            <p className="text-red-500 text-sm h-5">
              {errors.password ? errors.password.message : ""}
            </p>
          </div>

          {/* Remember me */}
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              className="mr-1 cursor-pointer"
            />
            <label htmlFor="rememberMe">Ghi nhớ đăng nhập</label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="bg-sky-600 hover:bg-sky-700 text-white py-2 rounded-2xl font-semibold text-lg transition"
            disabled={!isDirty && !isValid}
          >
            Đăng nhập
          </button>

          <p className="text-center text-gray-500 text-sm mt-3">
            Tài khoản admin được cấp bởi quản lý.
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
