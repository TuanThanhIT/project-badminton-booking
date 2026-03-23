import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormRegisterSchema,
  type formRegister,
} from "../../schemas/FormRegisterSchema";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { registerAccount } from "../../redux/slices/user/authSlice";
import type { RegisterRequest } from "../../types/auth";
import { toast } from "react-toastify";
import LoadingButton from "../../components/ui/common/LoadingButton";
import InputForm from "../../components/ui/common/InputForm";
import PasswordInput from "../../components/ui/common/PasswordInput";

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.ui.loadingCount > 0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formRegister>({
    resolver: zodResolver(FormRegisterSchema),
    mode: "onChange",
  });

  const onSubmit = async (dt: formRegister) => {
    const { email, username, password } = dt;
    const data: RegisterRequest = {
      username,
      password,
      email,
    };
    const res = await dispatch(registerAccount({ data }));
    if (registerAccount.fulfilled.match(res)) {
      toast.success("Đăng kí tài khoản người dùng thành công");
      setTimeout(() => {
        navigate("/verify-otp", { state: { email } });
      }, 3000);
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
          <InputForm
            register={register}
            error={errors.username}
            field={"username"}
          ></InputForm>

          <label>Mật khẩu</label>
          <PasswordInput
            register={register}
            error={errors.password}
            field={"password"}
          ></PasswordInput>

          <label>Email</label>
          <InputForm
            register={register}
            error={errors.email}
            field={"email"}
          ></InputForm>

          <LoadingButton
            loading={loading}
            children={"Đăng ký"}
            type="submit"
          ></LoadingButton>

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
