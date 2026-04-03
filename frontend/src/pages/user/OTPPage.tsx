import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { OtpSendRequest, OtpVerifyRequest } from "../../types/auth";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  clearOtpFlow,
  otpSend,
  otpVerify,
  otpVerifyReset,
} from "../../redux/slices/user/authSlice";
import { walletWithdrawConfirm } from "../../redux/slices/user/walletSlice";
import type { WalletWithdrawConfirmRequest } from "../../types/wallet";
import { OTP_TYPE } from "../../constants/otpType";
import { showConfirmDialog } from "../../utils/swalHelper";

const OTPPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const OTP_EXPIRE_KEY = "otp_expire_at";
  const RESEND_EXPIRE_KEY = "otp_resend_at";

  const otpFlow = useAppSelector((state) => state.auth.otpFlow);
  const sendLoading = useAppSelector(
    (state) => state.ui.loadingMap["auth/otpSend"],
  );
  // loading tổng
  const globalLoading = useAppSelector((state) =>
    Object.values(state.ui.loadingMap).some(Boolean),
  );

  const { email, withdrawRequestId, type } = otpFlow;

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ===== GET REMAINING TIME FROM LOCALSTORAGE =====
  const getRemainingTime = (key: string) => {
    const expireAt = localStorage.getItem(key);
    if (!expireAt) return 0;

    const diff = Math.floor((Number(expireAt) - Date.now()) / 1000);
    console.log("diff", diff);
    return diff > 0 ? diff : 0;
  };

  const [otpExpire, setOtpExpire] = useState(() =>
    getRemainingTime(OTP_EXPIRE_KEY),
  );

  const [resendCooldown, setResendCooldown] = useState(() =>
    getRemainingTime(RESEND_EXPIRE_KEY),
  );

  // ===== FIRST LOAD → SET OTP 5 MINUTES =====
  useEffect(() => {
    const expireAt = localStorage.getItem(OTP_EXPIRE_KEY);

    if (!expireAt) {
      const newExpire = Date.now() + 300 * 1000;
      localStorage.setItem(OTP_EXPIRE_KEY, newExpire.toString());
      setOtpExpire(300);
    }
  }, []);

  // ===== TIMER =====
  useEffect(() => {
    const timer = setInterval(() => {
      setOtpExpire((prev) => (prev > 0 ? prev - 1 : 0));
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ===== AUTO FOCUS =====
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (otpExpire === 0) {
      setResendCooldown(0);
      localStorage.removeItem(RESEND_EXPIRE_KEY);
    }
  }, [otpExpire]);

  // ===== EXIT =====
  const handleExit = async () => {
    const confirmedExit = await showConfirmDialog(
      "Xác nhận thoát",
      "Bạn có chắc chắn muốn thoát khỏi bước xác thực OTP ?",
      "Chắc chắn",
      "Hủy",
    );

    if (!confirmedExit) return;

    setOtp(Array(6).fill(""));
    setOtpExpire(0);
    setResendCooldown(0);

    localStorage.removeItem(OTP_EXPIRE_KEY);
    localStorage.removeItem(RESEND_EXPIRE_KEY);
    dispatch(clearOtpFlow());

    if (type === OTP_TYPE.WITHDRAW_REQUEST) {
      navigate("/wallet");
    } else {
      navigate("/login");
    }
  };

  // ===== FORMAT TIME =====
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ===== INPUT CHANGE =====
  const handleChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

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

  // ===== VERIFY OTP =====
  const handleSubmitOtp = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      toast.warning("Vui lòng nhập đầy đủ 6 chữ số của mã OTP.");
      return;
    }

    // RESET PASSWORD
    if (type === OTP_TYPE.RESET_PASSWORD) {
      if (!email) {
        toast.error(
          "Phiên xác thực đã hết hạn. Vui lòng yêu cầu mã OTP mới để tiếp tục.",
        );
        return;
      }

      const data: OtpVerifyRequest = { email, otpCode };

      await dispatch(otpVerifyReset({ data }))
        .unwrap()
        .then((res) => {
          localStorage.setItem("resetToken", res.data.resetToken);
          toast.success("Xác thực thành công. Bạn có thể đặt lại mật khẩu.");
          dispatch(clearOtpFlow());
          localStorage.removeItem(OTP_EXPIRE_KEY);
          localStorage.removeItem(RESEND_EXPIRE_KEY);

          setTimeout(() => navigate("/reset-password"), 2000);
        })
        .catch(() => {
          setOtp(Array(6).fill(""));
        });
    }

    // WITHDRAW
    if (type === OTP_TYPE.WITHDRAW_REQUEST) {
      if (!withdrawRequestId) {
        toast.error(
          "Không tìm thấy yêu cầu rút tiền. Vui lòng thử lại từ trang ví.",
        );
        return;
      }

      const data: WalletWithdrawConfirmRequest = {
        withdrawRequestId,
        otpCode,
      };

      await dispatch(walletWithdrawConfirm({ data }))
        .unwrap()
        .then(() => {
          toast.success("Xác nhận rút tiền thành công.");
          dispatch(clearOtpFlow());
          localStorage.removeItem(OTP_EXPIRE_KEY);
          localStorage.removeItem(RESEND_EXPIRE_KEY);

          setTimeout(() => navigate("/wallet"), 2000);
        })
        .catch(() => {
          setOtp(Array(6).fill(""));
        });
    }

    // REGISTER
    if (type === OTP_TYPE.REGISTER) {
      if (!email) {
        toast.error(
          "Không tìm thấy thông tin đăng ký. Vui lòng thực hiện lại bước đăng ký.",
        );
        return;
      }

      const data: OtpVerifyRequest = { email, otpCode };

      await dispatch(otpVerify({ data }))
        .unwrap()
        .then(() => {
          toast.success("Tài khoản đã được xác thực thành công.");
          dispatch(clearOtpFlow());
          localStorage.removeItem(OTP_EXPIRE_KEY);
          localStorage.removeItem(RESEND_EXPIRE_KEY);

          setTimeout(() => navigate("/login"), 2000);
        })
        .catch(() => {
          setOtp(Array(6).fill(""));
        });
    }
  };

  // ===== RESEND OTP =====
  const handleResendOtp = async () => {
    if (!email || !type) return;

    const data: OtpSendRequest = { email, type };

    await dispatch(otpSend({ data }))
      .unwrap()
      .then(() => {
        const otpExpireAt = Date.now() + 300 * 1000;
        const resendExpireAt = Date.now() + 60 * 1000;

        localStorage.setItem(OTP_EXPIRE_KEY, otpExpireAt.toString());
        localStorage.setItem(RESEND_EXPIRE_KEY, resendExpireAt.toString());

        setOtpExpire(300);
        setResendCooldown(60);
        setOtp(Array(6).fill(""));

        toast.success("Mã OTP đã được gửi lại.");
      })
      .catch((error) => {
        const remainingTime = error?.data?.remainingTime;

        if (remainingTime) {
          const resendExpireAt = Date.now() + remainingTime * 1000;
          localStorage.setItem(RESEND_EXPIRE_KEY, resendExpireAt.toString());

          setResendCooldown(remainingTime);

          toast.warning(`Vui lòng đợi ${remainingTime}s trước khi gửi lại OTP`);
        }
      });
  };

  return (
    <div className="flex items-center justify-center p-10">
      <div className="w-3/4 max-w-5xl grid grid-cols-2 bg-white rounded-2xl gap-5 border border-gray-200 overflow-hidden">
        {/* LEFT IMAGE */}
        <div className="relative hidden md:block">
          <img
            src="/img/verify-otp.jpg"
            alt="Xác thực OTP"
            className="w-full h-full object-cover rounded-l-2xl"
          />

          <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-10 rounded-l-2xl">
            <div className="text-white text-center">
              <h2 className="text-3xl font-bold mb-3">Xác minh danh tính</h2>
              <p className="text-sm">
                Nhập mã OTP được gửi đến email để hoàn tất quá trình xác thực và
                tiếp tục truy cập hệ thống.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="flex flex-col justify-center px-12 py-10 relative">
          <button
            onClick={handleExit}
            className="absolute top-5 right-6 text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Nhập mã xác thực
          </h1>

          <p className="text-gray-500 text-sm mb-8">
            Chúng tôi đã gửi mã OTP tới
            <span className="text-sky-600 font-medium"> {email}</span>. Vui lòng
            nhập mã để tiếp tục.
          </p>

          {/* OTP INPUT */}
          <div className="flex justify-between gap-3 mb-8">
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
                className="w-14 h-14 text-center text-xl font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              />
            ))}
          </div>

          <button
            onClick={handleSubmitOtp}
            disabled={globalLoading || otpExpire === 0}
            className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white py-3 rounded-xl font-medium shadow-md transition disabled:opacity-60"
          >
            {globalLoading ? "Đang xác minh..." : "Xác nhận mã OTP"}
          </button>

          <div className="mt-5 text-center text-sm text-gray-600">
            {otpExpire > 0 ? (
              <p>
                Mã OTP sẽ hết hạn sau{" "}
                <span className="font-semibold text-sky-600">
                  {formatTime(otpExpire)}
                </span>
              </p>
            ) : (
              <p className="text-red-500 font-medium">
                Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.
              </p>
            )}
          </div>

          <button
            onClick={handleResendOtp}
            disabled={resendCooldown > 0}
            className={`mt-3 text-sm font-medium transition ${
              resendCooldown > 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-sky-600 hover:text-sky-800"
            }`}
          >
            {sendLoading
              ? "Đang gửi mã..."
              : resendCooldown > 0
                ? `Gửi lại OTP sau ${resendCooldown}s`
                : "Gửi lại mã OTP"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPPage;
