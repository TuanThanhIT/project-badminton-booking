import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormRegisterSchema,
  type formRegister,
} from "../../schemas/FormRegisterSchema";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { registerAccount, setOtpFlow } from "../../redux/slices/user/authSlice";
import type { OtpFlowData, RegisterRequest } from "../../types/auth";
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
    const dta: OtpFlowData = {
      email,
      type: "REGISTER",
    };
    await dispatch(registerAccount({ data }))
      .unwrap()
      .then(() => {
        toast.success("Đăng kí tài khoản người dùng thành công");
        dispatch(setOtpFlow({ data: dta }));
        setTimeout(() => {
          navigate("/verify-otp");
        }, 1000);
      });
  };

  return (
    <div className="p-20 w-3/4 mx-auto">
      <div className="grid grid-cols-2 rounded-2xl gap-5 border border-gray-200">
        <div className="h-full">
          <img
            src="/img/register.jpg"
            alt="Đăng nhập"
            className="w-full h-full object-cover rounded-l-2xl"
          />
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-between gap-5 p-10"
        >
          <h1 className="font-bold text-2xl">
            Tham gia cùng chúng tôi và không bỏ lỡ điều gì - ĐĂNG KÝ NGAY!
          </h1>

          <div className="flex flex-col gap-2">
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

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Email
              </label>
              <InputForm
                register={register}
                error={errors.email}
                field={"email"}
              ></InputForm>
            </div>
          </div>

          <div className="flex flex-col gap-2">
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
          </div>
        </form>
      </div>
    </div>
  );
};
export default RegisterPage;
