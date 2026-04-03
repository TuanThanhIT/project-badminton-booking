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
import { OTP_TYPE } from "../../constants/otpType";

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const registerLoading = useAppSelector(
    (state) => state.ui.loadingMap["auth/register"],
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<formRegister>({
    resolver: zodResolver(FormRegisterSchema),
    mode: "onChange",
  });

  const passwordValue = watch("password");

  const onSubmit = async (dt: formRegister) => {
    const { email, username, password } = dt;
    const data: RegisterRequest = {
      username,
      password,
      email,
    };
    const dta: OtpFlowData = {
      email,
      type: OTP_TYPE.REGISTER,
    };
    await dispatch(registerAccount({ data }))
      .unwrap()
      .then(() => {
        toast.success("Đăng kí tài khoản người dùng thành công");
        dispatch(setOtpFlow({ data: dta }));
        setTimeout(() => {
          navigate("/verify-otp");
        }, 2000);
      });
  };

  return (
    <div className="p-20 w-3/4 mx-auto">
      <div className="grid grid-cols-2 rounded-2xl gap-5 border border-gray-200">
        <div className="relative hidden md:block">
          <img
            src="/img/register.jpg"
            alt="Đăng ký"
            className="w-full h-full object-cover rounded-l-2xl"
          />

          <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-10 rounded-l-2xl">
            <div className="text-white text-center">
              <h2 className="text-3xl font-bold mb-3">Tạo tài khoản mới</h2>
              <p className="text-sm">
                Đăng ký để bắt đầu sử dụng hệ thống và khám phá đầy đủ các tính
                năng dành cho bạn.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-between gap-5 p-10"
        >
          <div>
            <h1 className="font-bold text-2xl mb-1">Đăng ký tài khoản</h1>
            <p className="text-sm text-gray-500">
              Điền thông tin bên dưới để tạo tài khoản mới.
            </p>
          </div>

          <div className="flex flex-col gap-2">
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
                Email
              </label>
              <InputForm
                register={register}
                error={errors.email}
                field={"email"}
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
                value={passwordValue}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Xác nhận mật khẩu
              </label>
              <PasswordInput
                register={register}
                error={errors.confirmPassword}
                field={"confirmPassword"}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <LoadingButton loading={registerLoading} type="submit">
              Tạo tài khoản
            </LoadingButton>

            <p className="text-sm text-center">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="text-blue-700 hover:text-red-500 text-sm font-medium"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
export default RegisterPage;
