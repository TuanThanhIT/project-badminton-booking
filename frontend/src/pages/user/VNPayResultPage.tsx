import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  Wallet,
  Clock,
  PackageCheck,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { walletCallback } from "../../redux/slices/user/walletSlice";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import {
  clearCheckoutSession,
  orderCallback,
} from "../../redux/slices/user/orderSlice";
import type { VNPayCallbackRequest } from "../../types/wallet";
import { deleteAllCartItem } from "../../redux/slices/user/cartSlice";

/* COUNT UP */
const useCountUp = (end: number, duration = 1200) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setValue(Math.floor(start));
    }, 16);

    return () => clearInterval(timer);
  }, [end]);

  return value;
};

const VNPayResultPage = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart.cart);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  /* ===== PARAMS ===== */
  const vnp_Amount = searchParams.get("vnp_Amount") ?? "";
  const vnp_BankCode = searchParams.get("vnp_BankCode") ?? "";
  const vnp_ResponseCode = searchParams.get("vnp_ResponseCode") ?? "";
  const vnp_TransactionStatus = searchParams.get("vnp_TransactionStatus") ?? "";
  const vnp_TxnRef = searchParams.get("vnp_TxnRef") ?? "";
  const vnp_SecureHash = searchParams.get("vnp_SecureHash") ?? "";
  const vnp_TransactionNo = searchParams.get("vnp_TransactionNo") ?? "";
  const vnp_OrderInfo = searchParams.get("vnp_OrderInfo") ?? "";
  const vnp_PayDate = searchParams.get("vnp_PayDate") ?? "";
  const vnp_TmnCode = searchParams.get("vnp_TmnCode") ?? "";
  const vnp_BankTranNo = searchParams.get("vnp_BankTranNo") ?? "";
  const vnp_CardType = searchParams.get("vnp_CardType") ?? "";

  const hasValidParams = vnp_TxnRef && vnp_Amount && vnp_ResponseCode;
  const amount = Number(vnp_Amount) / 100;

  /* ✅ VNPay success (chỉ là bước 1) */
  const vnpSuccess =
    hasValidParams &&
    vnp_ResponseCode === "00" &&
    vnp_TransactionStatus === "00";

  const animatedAmount = useCountUp(amount);

  /* ===== FLOW ===== */
  const isTopup =
    vnp_OrderInfo?.includes("wallet") || vnp_OrderInfo?.includes("topup");

  /* ===== STATE BACKEND ===== */
  const [callbackDone, setCallbackDone] = useState(false);
  const [callbackSuccess, setCallbackSuccess] = useState(false);

  /* ===== FINAL RESULT ===== */
  const isSuccess = vnpSuccess && callbackSuccess;

  /* ===== API CALL ===== */
  useEffect(() => {
    if (!hasValidParams || !cart) return;

    const key = `vnpay_${vnp_TxnRef}`;

    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "done");

      const payload: VNPayCallbackRequest = {
        vnp_Amount,
        vnp_BankCode,
        vnp_BankTranNo,
        vnp_CardType,
        vnp_OrderInfo,
        vnp_PayDate,
        vnp_ResponseCode,
        vnp_TmnCode,
        vnp_TransactionNo,
        vnp_TransactionStatus,
        vnp_TxnRef,
        vnp_SecureHash,
      };

      if (vnpSuccess) {
        if (isTopup) {
          dispatch(walletCallback({ data: payload }))
            .unwrap()
            .then(() => {
              toast.success("Hoàn tất giao dịch nạp ví");
              setCallbackSuccess(true);
            })
            .catch(() => {
              setCallbackSuccess(false);
            })
            .finally(() => setCallbackDone(true));
        } else {
          dispatch(orderCallback({ data: payload }))
            .unwrap()
            .then(() => {
              toast.success("Hoàn tất giao dịch thanh toán đơn hàng");

              dispatch(clearCheckoutSession({ data: { cartId: cart.id } }));
              dispatch(deleteAllCartItem());

              localStorage.removeItem("addressSelectedId");
              localStorage.removeItem("discountCode");

              setCallbackSuccess(true);
            })
            .catch(() => {
              setCallbackSuccess(false);
            })
            .finally(() => setCallbackDone(true));
        }
      } else {
        toast.error("Thanh toán thất bại hoặc bị hủy");
        setCallbackSuccess(false);
        setCallbackDone(true);
      }
    }
  }, [vnp_TxnRef, hasValidParams]);

  /* ❗ CHẶN render sai khi chưa xong callback */
  if (!callbackDone) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Đang xử lý thanh toán...
      </div>
    );
  }

  const StatusIcon = isSuccess ? CheckCircle : XCircle;

  /* ===== TEXT ===== */
  const title = isTopup
    ? isSuccess
      ? "Nạp tiền thành công"
      : "Nạp tiền thất bại"
    : isSuccess
      ? "Thanh toán đơn hàng thành công"
      : "Thanh toán đơn hàng thất bại";

  const desc = isTopup
    ? isSuccess
      ? "Tiền đã được cộng vào ví 🎉"
      : "Nạp tiền không thành công"
    : isSuccess
      ? "Đơn hàng đang được xử lý 🚀"
      : "Thanh toán đơn hàng thất bại";

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 overflow-hidden px-4">
      {isSuccess && <Confetti numberOfPieces={120} recycle={false} />}

      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute w-[500px] h-[500px] bg-sky-200 blur-[120px] rounded-full top-[-100px] left-[-100px]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl bg-white/80 backdrop-blur-xl border border-sky-300 rounded-3xl p-10 z-10"
      >
        {/* HEADER */}
        <div className="flex items-center gap-6 mb-10">
          <motion.div className="relative">
            <motion.div
              animate={{ scale: [1, 2], opacity: [0.4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`absolute inset-0 rounded-full ${
                isSuccess ? "bg-green-400" : "bg-red-400"
              }`}
            />

            <div className="bg-white p-5 rounded-full relative z-10">
              <StatusIcon
                className={`w-16 h-16 ${
                  isSuccess ? "text-green-500" : "text-red-500"
                }`}
              />
            </div>
          </motion.div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
            <p className="text-gray-600 mt-2">{desc}</p>
          </div>
        </div>

        {/* PROGRESS (KHÁC NHAU) */}
        <div className="relative mb-14 px-6">
          <div className="absolute top-6 left-0 w-full h-1 bg-gray-200 rounded-full" />

          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: isSuccess ? "100%" : "50%",
            }}
            transition={{ duration: 1.2 }}
            className="absolute top-6 left-0 h-1 bg-gradient-to-r from-sky-400 to-sky-600 rounded-full"
          />

          <div className="flex justify-between relative z-10">
            {isTopup ? (
              <>
                <Step active icon={<Wallet />} label="Thanh toán" />
                <Step
                  active={isSuccess}
                  icon={<CheckCircle />}
                  label="Hoàn tất"
                />
                <Step icon={<Clock />} label="Xử lý" />
              </>
            ) : (
              <>
                <Step active icon={<PackageCheck />} label="Đặt hàng" />
                <Step
                  active={isSuccess}
                  icon={<CheckCircle />}
                  label="Thanh toán"
                />
                <Step icon={<Truck />} label="Vận chuyển" />
              </>
            )}
          </div>
        </div>

        {/* INFO */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          <GlowCard>
            <p className="text-sm text-gray-500 mb-2">Số tiền</p>
            <p className="text-2xl font-bold text-sky-600">
              {animatedAmount.toLocaleString()} VND
            </p>
          </GlowCard>

          <GlowCard>
            <p className="text-sm text-gray-500 mb-2">Ngân hàng</p>
            <p className="text-lg font-semibold text-gray-800">
              {vnp_BankCode || "VNPay"}
            </p>
          </GlowCard>

          <GlowCard>
            <p className="text-sm text-gray-500 mb-2">Mã giao dịch</p>
            <p className="text-lg font-semibold">{vnp_TxnRef}</p>
          </GlowCard>

          <GlowCard>
            <p className="text-sm text-gray-500 mb-2">Trạng thái</p>
            <p
              className={`text-lg font-semibold ${
                isSuccess ? "text-green-600" : "text-red-500"
              }`}
            >
              {isSuccess ? "Thành công" : "Thất bại"}
            </p>
          </GlowCard>
        </div>

        {/* ACTION */}
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(isTopup ? "/wallet" : "/orders")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold shadow"
          >
            <ArrowLeft size={18} />
            {isTopup ? "Quay lại ví" : "Xem đơn hàng"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default VNPayResultPage;

/* STEP */
const Step = ({ icon, label, active }: any) => (
  <div className="flex flex-col items-center">
    <div
      className={`w-12 h-12 flex items-center justify-center rounded-full ${
        active ? "bg-sky-500 text-white" : "bg-gray-200 text-gray-500"
      }`}
    >
      {icon}
    </div>
    <span className="mt-2 text-sm">{label}</span>
  </div>
);

/* CARD */
const GlowCard = ({ children }: any) => (
  <motion.div
    whileHover={{ y: -4, boxShadow: "0 0 25px rgba(56,189,248,0.3)" }}
    className="bg-white border border-sky-200 rounded-xl p-6 shadow-sm"
  >
    {children}
  </motion.div>
);
