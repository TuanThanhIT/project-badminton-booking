import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormRegisterSchema,
  type formRegister,
} from "../../schemas/FormRegisterSchema";
import authService from "../../services/authService";
import { toast } from "react-toastify";
import type { ApiErrorType } from "../../types/error";

const RegisterPage = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<formRegister>({
    resolver: zodResolver(FormRegisterSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: formRegister) => {
    try {
      const res = await authService.registerService(data);
      toast.success(res.data.message);
      const email = res.data.safeUser.email;
      setTimeout(() => {
        navigate("/verify-otp", { state: { email } });
      }, 3000);
    } catch (error) {
      const apiError = error as ApiErrorType;
      toast.error(apiError.userMessage);
    }
  };

  return (
    <div className="p-20 w-3/4 mx-auto">
      <div className="grid grid-cols-2 rounded-2xl gap-5 text-sm border border-gray-200">
        <div className="flex justify-center p-3">
          <img src="/img/register.jpg"></img>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-between gap-2 p-10"
        >
          <h1 className="font-bold text-2xl">
            Tham gia cùng chúng tôi và không bỏ lỡ điều gì - ĐĂNG KÝ NGAY!
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
            type="password"
            placeholder="Mật khẩu"
            {...register("password")}
            className="border-0 p-2 px-4 rounded-md mb-3 shadow-sm outline-0"
          ></input>
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}

          <label>Email</label>
          <input
            placeholder="Email"
            {...register("email")}
            className="border-0 p-2 px-4 rounded-md mb-3 shadow-sm outline-0"
          ></input>
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
          <button
            type="submit"
            className="bg-blue-500 rounded-2xl text-white text-lg py-1 hover:bg-blue-800"
            disabled={!isDirty && !isValid}
          >
            Đăng ký
          </button>
          <label>
            Đã có tài khoản? Đăng nhập{" "}
            <Link to="/login" className="text-blue-700 hover:text-red-500">
              tại đây
            </Link>
          </label>
        </form>
      </div>
    </div>
  );
};
export default RegisterPage;
