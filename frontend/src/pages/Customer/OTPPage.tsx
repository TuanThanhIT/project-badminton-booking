// OTPPage.tsx
import React, { useEffect, useState, useRef } from "react";
import authService from "../../services/authService";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { ApiErrorType } from "../../types/error";

const OTPPage: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [countdown, setCountdown] = useState(300); // 5 phút
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const location = useLocation();
  const email = location.state?.email;

  const navigate = useNavigate();

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmitOpt = async () => {
    try {
      const otpCode: string = otp.join("");
      const dataOtp = {
        email,
        otpCode,
      };
      console.log("dataOtp", dataOtp);
      const res = await authService.verifyOtpService(dataOtp);
      toast.success(res.data.message);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      const apiError = error as ApiErrorType;
      toast.error(apiError.userMessage);
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await authService.sendOtpService(email);
      setCountdown(300); // reset 5 phút
      setOtp(Array(6).fill("")); // xóa OTP cũ
      toast.success(res.data.message);
    } catch (error) {
      const apiError = error as ApiErrorType;
      toast.error(apiError.userMessage);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // auto focus next
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 text-center">
        <h2 className="text-2xl font-semibold text-sky-600 mb-2">
          Xác thực OTP
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Vui lòng nhập mã OTP được gửi đến email
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-between mb-6">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
            />
          ))}
        </div>

        <button
          onClick={handleSubmitOpt}
          className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white py-3 rounded-full font-medium shadow-md transition"
        >
          Xác thực
        </button>

        <div className="mt-4 text-sm text-gray-600">
          {countdown > 0 ? (
            <p>
              Mã OTP sẽ hết hạn sau{" "}
              <span className="font-semibold text-sky-600">
                {formatTime(countdown)}
              </span>
            </p>
          ) : (
            <p className="text-red-500 font-medium">Mã OTP đã hết hạn!</p>
          )}

          {/* Button gửi lại OTP nhỏ */}
          <button
            onClick={handleResendOtp}
            disabled={countdown > 0}
            className={`mt-1 text-xs font-medium transition-colors ${
              countdown > 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-sky-600 hover:text-sky-800"
            }`}
          >
            Gửi lại OTP
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPPage;
