import {
  CheckCircle2,
  PackageCheck,
  Truck,
  Home,
  ClipboardList,
  Wallet,
  XCircle,
} from "lucide-react";
import { useEffect, useState, type JSX } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  clearCheckoutSession,
  getOrderGroupId,
} from "../../redux/slices/user/orderSlice";
import type {
  ClearCheckoutSessionRequest,
  OrderGroupIdRequest,
} from "../../types/order";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { deleteAllCartItem } from "../../redux/slices/user/cartSlice";
import { formatOrderCode } from "../../utils/order";

/* COUNT UP */
const useCountUp = (end: number, duration = 1200) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const stepTime = 16;
    const increment = end / (duration / stepTime);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setValue(Math.floor(start));
    }, stepTime);

    return () => clearInterval(timer);
  }, [end]);

  return value;
};

const OrderResultPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cart = useAppSelector((state) => state.cart.cart);
  const [searchParams] = useSearchParams();

  const orderGroupId = searchParams.get("orderGroupId") || "--";

  /* ===== STATE ===== */
  const [orderData, setOrderData] = useState<any>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [verified, setVerified] = useState(false);

  /* ===== DERIVED ===== */
  const method = orderData?.paymentMethod;
  const amount = Number(orderData?.amount || 0);
  const orderId = orderData?.orderGroupId || "--";
  const createdDate = orderData?.createdDate ?? null;

  const isWallet = method === "WALLET";
  const isCOD = method === "COD";

  const animatedAmount = useCountUp(amount);

  /* ===== VERIFY ORDER ===== */
  useEffect(() => {
    if (!orderGroupId || orderGroupId === "--" || !cart) {
      setVerified(true);
      setIsSuccess(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const data: OrderGroupIdRequest = {
          orderGroupId: Number(orderGroupId),
        };

        const res = await dispatch(getOrderGroupId({ data })).unwrap();

        const result = res.data;

        setOrderData(result);
        setIsSuccess(result.isSuccess);

        /* chỉ clear khi backend xác nhận */
        if (result.isSuccess) {
          const d: ClearCheckoutSessionRequest = {
            cartId: cart.id,
          };
          dispatch(clearCheckoutSession({ data: d }));
          dispatch(deleteAllCartItem());

          localStorage.removeItem("addressSelectedId");
          localStorage.removeItem("discountCode");
        }
      } catch (err) {
        setIsSuccess(false);
      } finally {
        setVerified(true);
      }
    };

    fetchOrder();
  }, [orderGroupId]);

  if (!verified) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Đang kiểm tra đơn hàng...
      </div>
    );
  }

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 overflow-hidden">
      {/* CONFETTI */}
      {isSuccess && <Confetti numberOfPieces={120} recycle={false} />}

      {/* BACKGROUND */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute w-[500px] h-[500px] bg-sky-200 blur-[120px] rounded-full top-[-100px] left-[-100px]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl bg-white/80 backdrop-blur-xl border border-sky-400 rounded-3xl p-10 z-10"
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

            <div
              className={`p-5 rounded-full relative z-10 ${
                isSuccess ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500" />
              )}
            </div>
          </motion.div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {isSuccess
                ? isWallet
                  ? "Thanh toán thành công"
                  : "Đặt hàng thành công"
                : "Thanh toán thất bại"}
            </h1>

            <p className="text-gray-600 mt-2">
              {isSuccess
                ? isWallet
                  ? "Giao dịch đã hoàn tất 🎉"
                  : "Đơn hàng đã được tạo 🎉"
                : "Giao dịch không hợp lệ hoặc đã bị hủy"}
            </p>
          </div>
        </div>

        {/* PROGRESS */}
        {isSuccess && (
          <div className="relative mb-14 px-6">
            <div className="absolute top-6 left-0 w-full h-1 bg-gray-200 rounded-full" />

            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: isWallet ? "calc(50% - 24px)" : "calc(0% + 24px)",
              }}
              transition={{ duration: 1.2 }}
              className="absolute top-6 left-0 h-1 bg-gradient-to-r from-sky-400 to-sky-600 rounded-full"
            />

            <div className="flex justify-between relative z-10">
              <Step active icon={<CheckCircle2 />} label="Đặt hàng" />

              <Step
                active={isWallet}
                icon={isWallet ? <Wallet /> : <PackageCheck />}
                label={isWallet ? "Đã thanh toán" : "Xác nhận"}
              />

              <Step icon={<Truck />} label="Vận chuyển" />
            </div>
          </div>
        )}

        {/* INFO */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          {isSuccess ? (
            <>
              <GlowCard>
                <p className="text-sm text-gray-500 mb-2">Mã đơn hàng</p>
                <p className="text-2xl font-mono font-bold text-sky-700">
                  {formatOrderCode(orderId, createdDate)}
                </p>
              </GlowCard>

              <GlowCard>
                <p className="text-sm text-gray-500 mb-2">Tổng thanh toán</p>
                <p className="text-2xl font-bold text-sky-600">
                  {animatedAmount.toLocaleString()} VND
                </p>
              </GlowCard>
            </>
          ) : (
            <GlowCard className="col-span-2 text-center">
              <p className="text-lg font-semibold text-red-500">
                Không tìm thấy thông tin đơn hàng hợp lệ
              </p>
            </GlowCard>
          )}
        </div>

        {/* ACTION */}
        <div className="flex justify-between gap-4">
          <ActionBtn onClick={() => navigate("/")}>
            <Home size={18} /> Trang chủ
          </ActionBtn>

          {isSuccess ? (
            <ActionBtn primary onClick={() => navigate("/orders")}>
              <ClipboardList size={18} /> Xem đơn hàng
            </ActionBtn>
          ) : (
            <ActionBtn primary onClick={() => navigate("/cart")}>
              Thử lại
            </ActionBtn>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default OrderResultPage;

/* ===== COMPONENT ===== */

const Step = ({
  icon,
  label,
  active,
}: {
  icon: JSX.Element;
  label: string;
  active?: boolean;
}) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="flex flex-col items-center"
  >
    <motion.div
      animate={
        active
          ? {
              scale: [1, 1.2, 1],
              boxShadow: [
                "0 0 0px rgba(56,189,248,0.4)",
                "0 0 20px rgba(56,189,248,0.6)",
                "0 0 0px rgba(56,189,248,0.4)",
              ],
            }
          : {}
      }
      transition={{ duration: 1, repeat: Infinity }}
      className={`w-12 h-12 flex items-center justify-center rounded-full ${
        active ? "bg-sky-500 text-white" : "bg-gray-200 text-gray-500"
      }`}
    >
      {icon}
    </motion.div>

    <span
      className={`mt-2 text-sm ${
        active ? "text-sky-600 font-semibold" : "text-gray-500"
      }`}
    >
      {label}
    </span>
  </motion.div>
);

const GlowCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div
    whileHover={{
      boxShadow: "0 0 25px rgba(56,189,248,0.3)",
      y: -4,
    }}
    className={`bg-white border border-sky-200 rounded-xl p-6 shadow-sm transition ${className}`}
  >
    {children}
  </motion.div>
);

const ActionBtn = ({
  children,
  primary,
  onClick,
}: {
  children: React.ReactNode;
  primary?: boolean;
  onClick?: () => void;
}) => (
  <motion.button
    whileHover={{ scale: 1.08 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition ${
      primary
        ? "bg-sky-500 text-white hover:bg-sky-600 shadow"
        : "border border-gray-300 hover:bg-gray-100"
    }`}
  >
    {children}
  </motion.button>
);
