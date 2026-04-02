import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type {
  OtpSendRequest,
  OtpVerifyRequest,
  ResetPasswordRequest,
} from "../../types/auth";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  clearOtpFlow,
  otpSend,
  otpVerify,
  resetPassword,
  setOtpFlow,
} from "../../redux/slices/user/authSlice";

import { walletWithdrawConfirm } from "../../redux/slices/user/walletSlice";

const OTPPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const loading = useAppSelector((state) => state.ui.loadingCount > 0);
  const otpFlow = useAppSelector((state) => state.auth.otpFlow);
  const { email, withdrawRequestId, type } = otpFlow;

  useEffect(() => {
    if (!otpFlow.email) {
      const saved = sessionStorage.getItem("otpFlow");
      if (saved) {
        dispatch(setOtpFlow(JSON.parse(saved)));
      }
    }
  }, []);

  const getInitialCountdown = () => {
    const time = localStorage.getItem("countdown");
    return time ? parseInt(time, 10) : 300;
  };
  const [countdown, setCountdown] = useState(getInitialCountdown); // 5 phút

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
    index: number,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => {
        const newValue = c - 1;
        localStorage.setItem("countdown", newValue.toString());
        return newValue;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Khi countdown = 0 → xóa localStorage
  useEffect(() => {
    if (countdown <= 0) {
      localStorage.removeItem("countdown");
    }
  }, [countdown]);

  const handleSubmitOpt = async () => {
    const otpCode: string = otp.join("");
    // RESET PASSWORD
    if (type === "RESET-PASSWORD") {
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    // WITHDRAW CONFIRM
    if (withdrawRequestId && email) {
      await dispatch(
        walletWithdrawConfirm({
          data: { withdrawRequestId, otpCode },
        }),
      ).unwrap();
      toast.success("Xác nhận rút tiền thành công");
      dispatch(clearOtpFlow());
      setTimeout(() => navigate("/wallet"), 2000);
      return;
    }

    // VERIFY REGISTER
    if (email) {
      await dispatch(
        otpVerify({
          data: { email, otpCode },
        }),
      ).unwrap();
      toast.success("Xác thực tài khoản đăng ký thành công");
      dispatch(clearOtpFlow());
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    setCountdown(300); // reset 5 phút
    setOtp(Array(6).fill("")); // xóa OTP cũ
  };

  const handleResendOtp = async () => {
    if (!email) return;
    const data: OtpSendRequest = {
      email,
    };
    await dispatch(otpSend({ data }))
      .unwrap()
      .then(() => {
        setCountdown(300); // reset 5 phút
        setOtp(Array(6).fill("")); // xóa OTP cũ
        toast.success("Mã OTP đã được gửi. Vui lòng kiểm tra email.");
      });
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
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
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
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white py-3 rounded-full font-medium shadow-md transition disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              Đang xác thực
              <span className="flex">
                <span className="animate-pulse">.</span>
                <span className="animate-pulse delay-150">.</span>
                <span className="animate-pulse delay-300">.</span>
              </span>
            </>
          ) : (
            "Xác thực"
          )}
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
