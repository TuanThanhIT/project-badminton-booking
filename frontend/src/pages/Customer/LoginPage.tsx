import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormLoginSchema, type formLogin } from "../../schemas/FormLoginSchema";

const LoginPage = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<formLogin>({
    resolver: zodResolver(FormLoginSchema),
    defaultValues: { username: "emilys", password: "emilyspass" },
    mode: "onChange",
  });

  const onSubmit = async (data: formLogin) => {};

  error ? <div className="text-red-400">{error}</div> : "";

  return (
    <div className="p-20 w-3/4 mx-auto">
      <div className="grid grid-cols-2 shadow-sm rounded-2xl gap-5 text-sm">
        <div className="flex justify-center p-3">
          <img src="/img/login.jpg"></img>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-between gap-2 p-10"
        >
          <h1 className="font-bold text-2xl">
            Welcome back! Please Sign in to continue
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

          <div className="flex flex-row justify-between mb-3">
            <div>
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                className="mr-1 cursor-pointer"
              />
              <label>Remember me</label>
            </div>
            <Link
              to="/forgotpass"
              className="text-blue-700 hover:text-red-500 underline"
            >
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            className="cursor-pointer bg-blue-500 rounded-2xl text-white py-1 hover:bg-blue-800 text-lg"
            disabled={!isDirty && !isValid}
          >
            Sign in
          </button>
          <label>
            Don't have an account? Register{" "}
            <Link
              to="/customer/register"
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
export default LoginPage;
