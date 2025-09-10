import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormRegisterSchema,
  type formRegister,
} from "../../schemas/FormRegisterSchema";
import { ArrowRight } from "lucide-react";

const RegisterPage = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<formRegister>({
    resolver: zodResolver(FormRegisterSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: formRegister) => {};

  error ? <div className="text-red-400">{error}</div> : "";

  return (
    <div className="p-20 w-3/4 mx-auto">
      <div className="grid grid-cols-2 shadow-sm rounded-2xl gap-5 text-sm">
        <div className="flex justify-center p-3">
          <img src="/img/register.jpg"></img>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-between gap-2 p-10"
        >
          <h1 className="font-bold text-2xl">
            Join us and never miss a thing - REGISTER!
          </h1>
          <label>Username </label>
          <input
            placeholder="Username"
            {...register("username")}
            className="rounded-md mb-3 shadow-lg p-2 px-4 outline-0"
          ></input>
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username.message}</p>
          )}

          <label>Password</label>
          <input
            placeholder="Password"
            {...register("password")}
            className="border-0 p-2 px-4 rounded-md mb-3 shadow-lg outline-0"
          ></input>
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}

          <label>Email</label>
          <input
            placeholder="Email"
            {...register("email")}
            className="border-0 p-2 px-4 rounded-md mb-3 shadow-lg outline-0"
          ></input>
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
          <button
            type="submit"
            className="cursor-pointer bg-blue-500 rounded-2xl text-white text-lg py-1 hover:bg-blue-800"
            disabled={!isDirty && !isValid}
          >
            Sign up
          </button>
          <label>
            Already have an account? Login{" "}
            <Link
              to="/customer/login"
              className="text-blue-700 hover:text-red-500"
            >
              here
            </Link>
          </label>
        </form>
      </div>
    </div>
  );
};
export default RegisterPage;
