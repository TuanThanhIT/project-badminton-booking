import React, { useState } from "react";
import { UserRound, Lock } from "lucide-react";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Please fill in both username and password.");
      return;
    }

    setError("");
    alert("Đăng nhập thành công!");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-400 to-blue-100">
      <div className="bg-white w-[90%] max-w-5xl h-[80%] rounded-2xl shadow-2xl flex overflow-hidden">
        {/* Left side */}
        <div className="relative w-1/2">
          <img
            src="/img/bg-admin-login.jpg"
            alt="House background"
            className="w-full h-[80%] object-cover"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-black/50"></div>

          {/* Logo + Text content */}
          <div className="absolute top-8 left-8 text-white flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-wide">B-Hub</span>
          </div>

          {/* Slogan */}
          <div className="absolute bottom-12 left-10 text-white">
            <h2 className="text-3xl font-bold mb-2">
              Find Your <span className="text-blue-400">Perfect</span> Space
            </h2>
            <p className="text-white/80 w-3/4">
              Connect to your personal entertainment space—simple, reliable, and
              inspiring.
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="w-1/2 flex flex-col justify-center items-center px-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 pb-3">
            Get Started
          </h1>
          <p className="text-gray-500 mb-6">
            Welcome back! Please log in to continue.
          </p>

          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
            {/* Username */}
            <div
              className={`flex items-center border rounded-lg px-3 py-2 ${
                error && !username ? "border-red-500" : "border-gray-300"
              } focus-within:border-blue-500`}
            >
              <UserRound className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Enter your username"
                className="w-full outline-none text-gray-700"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Password */}
            <div
              className={`flex items-center border rounded-lg px-3 py-2 ${
                error && !password ? "border-red-500" : "border-gray-300"
              } focus-within:border-blue-500`}
            >
              <Lock className="text-gray-400 mr-2" />
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full outline-none text-gray-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 text-gray-600">
                <input type="checkbox" className="accent-blue-600 w-4 h-4" />
                <span>Remember me</span>
              </label>

              <a href="#" className="text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
