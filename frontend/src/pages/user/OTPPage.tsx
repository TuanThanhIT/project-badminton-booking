import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { X } from "lucide-react";
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
import { OTP_TYPE } from "../../utils/constants/otpType";
import { showConfirmDialog } from "../../utils/swalHelper";
import type { WalletOrderConfirmRequest } from "../../types/order";
import { walletOrderConfirm } from "../../redux/slices/user/orderSlice";
import { getCart } from "../../redux/slices/user/cartSlice";
import AuthShell from "../../components/ui/user/auth/AuthShell";

const OTP_EXPIRE_KEY = "otp_expire_at";
const RESEND_EXPIRE_KEY = "otp_resend_at";

const OTPPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const otpFlow = useAppSelector((state) => state.auth.otpFlow);
  const sendLoading = useAppSelector(
    (state) => state.ui.loadingMap["auth/otpSend"],
  );
  const globalLoading = useAppSelector((state) =>
    Object.values(state.ui.loadingMap).some(Boolean),
  );

  const { email, withdrawRequestId, type, orderGroupId } = otpFlow;
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const getRemainingTime = (key: string) => {
    const expireAt = localStorage.getItem(key);
    if (!expireAt) return 0;
    const diff = Math.floor((Number(expireAt) - Date.now()) / 1000);
    return diff > 0 ? diff : 0;
  };

  const [otpExpire, setOtpExpire] = useState(() =>
    getRemainingTime(OTP_EXPIRE_KEY),
  );
  const [resendCooldown, setResendCooldown] = useState(() =>
    getRemainingTime(RESEND_EXPIRE_KEY),
  );

  useEffect(() => {
    const expireAt = localStorage.getItem(OTP_EXPIRE_KEY);
    if (!expireAt) {
      const newExpire = Date.now() + 300 * 1000;
      localStorage.setItem(OTP_EXPIRE_KEY, newExpire.toString());
      setOtpExpire(300);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setOtpExpire((prev) => (prev > 0 ? prev - 1 : 0));
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (otpExpire === 0) {
      setResendCooldown(0);
      localStorage.removeItem(RESEND_EXPIRE_KEY);
    }
  }, [otpExpire]);

  const clearOtpSession = () => {
    setOtp(Array(6).fill(""));
    setOtpExpire(0);
    setResendCooldown(0);
    localStorage.removeItem(OTP_EXPIRE_KEY);
    localStorage.removeItem(RESEND_EXPIRE_KEY);
    dispatch(clearOtpFlow());
  };

  const handleExit = async () => {
    const confirmedExit = await showConfirmDialog(
      "Xác nhận thoát",
      "Bạn có chắc chắn muốn thoát khỏi bước xác thực OTP?",
      "Chắc chắn",
      "Hủy",
    );

    if (!confirmedExit) return;
    clearOtpSession();
    navigate(type === OTP_TYPE.WITHDRAW_REQUEST ? "/wallet" : "/login");
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
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

  const handleSubmitOtp = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast.warning("Vui lòng nhập đầy đủ 6 chữ số của mã OTP.");
      return;
    }

    if (type === OTP_TYPE.RESET_PASSWORD) {
      if (!email) {
        toast.error("Phiên xác thực đã hết hạn. Vui lòng yêu cầu mã OTP mới.");
        return;
      }

      const data: OtpVerifyRequest = { email, otpCode };
      await dispatch(otpVerifyReset({ data }))
        .unwrap()
        .then((res) => {
          localStorage.setItem("resetToken", res.data.resetToken);
          toast.success("Xác thực thành công. Bạn có thể đặt lại mật khẩu.");
          clearOtpSession();
          setTimeout(() => navigate("/reset-password"), 700);
        })
        .catch(() => setOtp(Array(6).fill("")));
    }

    if (type === OTP_TYPE.WITHDRAW_REQUEST) {
      if (!withdrawRequestId || !email) {
        toast.error("Phiên xác thực rút tiền không hợp lệ.");
        return;
      }

      const data: WalletWithdrawConfirmRequest = {
        withdrawRequestId,
        otpCode,
        email,
      };
      await dispatch(walletWithdrawConfirm({ data }))
        .unwrap()
        .then(() => {
          toast.success("Xác nhận rút tiền thành công.");
          clearOtpSession();
          setTimeout(() => navigate("/wallet"), 700);
        })
        .catch(() => setOtp(Array(6).fill("")));
    }

    if (type === OTP_TYPE.REGISTER) {
      if (!email) {
        toast.error("Không tìm thấy thông tin đăng ký. Vui lòng đăng ký lại.");
        return;
      }

      const data: OtpVerifyRequest = { email, otpCode };
      await dispatch(otpVerify({ data }))
        .unwrap()
        .then(() => {
          toast.success("Tài khoản đã được xác thực thành công.");
          clearOtpSession();
          setTimeout(() => navigate("/login"), 700);
        })
        .catch(() => setOtp(Array(6).fill("")));
    }

    if (type === OTP_TYPE.WALLET_PAYMENT) {
      if (!email || !orderGroupId) {
        toast.error("Không tìm thấy thông tin thanh toán. Vui lòng thử lại.");
        return;
      }

      const data: WalletOrderConfirmRequest = { email, otpCode, orderGroupId };
      await dispatch(walletOrderConfirm({ data }))
        .unwrap()
        .then((res) => {
          toast.success("Xác nhận thanh toán đơn hàng thành công.");
          dispatch(getCart());
          sessionStorage.removeItem("checkoutCartId");
          sessionStorage.removeItem("checkoutCartItemIds");
          sessionStorage.removeItem("checkoutBuyNowItem");
          clearOtpSession();
          setTimeout(() => {
            navigate(`/order-result?orderGroupId=${res.data.orderGroupId}`);
          }, 700);
        })
        .catch(() => setOtp(Array(6).fill("")));
    }
  };

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
    <AuthShell
      image="/img/verify-otp.jpg"
      imageAlt="Xác thực OTP"
      eyebrow="Xác thực bảo mật"
      title="Kiểm tra email của bạn"
      description="Nhập mã OTP được gửi đến email để hoàn tất đăng ký, đặt lại mật khẩu hoặc xác nhận giao dịch."
    >
      <div className="relative space-y-6">
        <button
          type="button"
          onClick={handleExit}
          className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600"
        >
          <X size={18} />
        </button>

        <div className="pr-12">
          <p className="text-sm font-semibold text-sky-700">Mã OTP</p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            Nhập mã xác thực
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Chúng tôi đã gửi mã OTP tới{" "}
            <span className="font-semibold text-sky-700">{email}</span>.
          </p>
        </div>

        <div className="grid grid-cols-6 gap-2 sm:gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(event) => handleChange(event.target.value, index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className="h-14 rounded-2xl border border-slate-200 bg-slate-50 text-center text-xl font-bold text-slate-900 outline-none transition-all focus:border-sky-400 focus:bg-white focus:ring-1 focus:ring-sky-100"
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleSubmitOtp}
          disabled={globalLoading || otpExpire === 0}
          className="h-12 w-full rounded-2xl bg-sky-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {globalLoading ? "Đang xác minh..." : "Xác nhận mã OTP"}
        </button>

        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 text-center text-sm">
          {otpExpire > 0 ? (
            <p className="text-slate-600">
              Mã OTP sẽ hết hạn sau{" "}
              <span className="font-semibold text-sky-700">
                {formatTime(otpExpire)}
              </span>
            </p>
          ) : (
            <p className="font-medium text-rose-600">
              Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.
            </p>
          )}

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendCooldown > 0}
            className="mt-3 font-semibold text-sky-700 transition hover:text-sky-600 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {sendLoading
              ? "Đang gửi mã..."
              : resendCooldown > 0
                ? `Gửi lại OTP sau ${resendCooldown}s`
                : "Gửi lại mã OTP"}
          </button>
        </div>
      </div>
    </AuthShell>
  );
};

export default OTPPage;
