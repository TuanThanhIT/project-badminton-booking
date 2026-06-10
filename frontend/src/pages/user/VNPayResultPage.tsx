import {
  CheckCircle2,
  Clock,
  Home,
  PackageCheck,
  ReceiptText,
  RotateCcw,
  Truck,
  Wallet,
  XCircle,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "../../redux/hook";
import { walletCallback } from "../../redux/slices/user/walletSlice";
import { toast } from "react-toastify";
import { orderCallback } from "../../redux/slices/user/orderSlice";
import { bookingCallback } from "../../redux/slices/user/bookingSlice";
import type { VNPayCallbackRequest } from "../../types/wallet";
import { getCart } from "../../redux/slices/user/cartSlice";

/* COUNT UP */
const useCountUp = (end: number, duration = 900) => {
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
  }, [end, duration]);

  return value;
};

const VNPayResultPage = () => {
  const dispatch = useAppDispatch();
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

  const hasValidParams = Boolean(vnp_TxnRef && vnp_Amount && vnp_ResponseCode);
  const amount = Number(vnp_Amount || 0) / 100;

  const isTopup =
    vnp_OrderInfo?.toLowerCase().includes("wallet") ||
    vnp_OrderInfo?.toLowerCase().includes("topup");
  const isBooking = vnp_OrderInfo?.toLowerCase().includes("booking");
  const bookingIdFromOrderInfo =
    vnp_OrderInfo.match(/booking_(\d+)/i)?.[1] || "";
  const orderGroupIdFromOrderInfo =
    vnp_OrderInfo.match(/order_(\d+)/i)?.[1] || "";

  const vnpSuccess =
    hasValidParams &&
    vnp_ResponseCode === "00" &&
    vnp_TransactionStatus === "00";

  const animatedAmount = useCountUp(amount);

  /* ===== STATE BACKEND ===== */
  const [callbackDone, setCallbackDone] = useState(false);
  const [callbackSuccess, setCallbackSuccess] = useState(false);

  /* ===== FINAL RESULT ===== */
  const isSuccess = vnpSuccess && callbackSuccess;

  /* ===== API CALL ===== */
  useEffect(() => {
    if (!hasValidParams) {
      setCallbackSuccess(false);
      setCallbackDone(true);
      return;
    }

    const key = `vnpay_${vnp_TxnRef}`;

    if (sessionStorage.getItem(key)) {
      setCallbackSuccess(vnpSuccess);
      setCallbackDone(true);
      return;
    }

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

    if (isTopup) {
      dispatch(walletCallback({ data: payload }))
        .unwrap()
        .then(() => {
          if (vnpSuccess) {
            toast.success("Hoàn tất giao dịch nạp ví");
            setCallbackSuccess(true);
            return;
          }

          toast.error("Thanh toán thất bại hoặc bị hủy");
          setCallbackSuccess(false);
        })
        .catch(() => {
          setCallbackSuccess(false);
        })
        .finally(() => setCallbackDone(true));

      return;
    }

    if (!vnpSuccess) {
      toast.error("Thanh toán thất bại hoặc bị hủy");
      setCallbackSuccess(false);
      setCallbackDone(true);
      return;
    }

    if (isBooking) {
      dispatch(bookingCallback({ data: payload }))
        .unwrap()
        .then(() => {
          toast.success("Hoàn tất giao dịch thanh toán đặt sân");
          setCallbackSuccess(true);
        })
        .catch(() => {
          setCallbackSuccess(false);
        })
        .finally(() => setCallbackDone(true));

      return;
    }

    dispatch(orderCallback({ data: payload }))
      .unwrap()
      .then(() => {
        toast.success("Hoàn tất giao dịch thanh toán đơn hàng");

        dispatch(getCart());

        sessionStorage.removeItem("checkoutCartId");
        sessionStorage.removeItem("checkoutCartItemIds");
        sessionStorage.removeItem("checkoutBuyNowItem");
        localStorage.removeItem("addressSelectedId");
        localStorage.removeItem("discountCode");

        setCallbackSuccess(true);
      })
      .catch(() => {
        setCallbackSuccess(false);
      })
      .finally(() => setCallbackDone(true));
  }, [
    dispatch,
    hasValidParams,
    isBooking,
    isTopup,
    vnpSuccess,
    vnp_Amount,
    vnp_BankCode,
    vnp_BankTranNo,
    vnp_CardType,
    vnp_OrderInfo,
    vnp_PayDate,
    vnp_ResponseCode,
    vnp_SecureHash,
    vnp_TmnCode,
    vnp_TransactionNo,
    vnp_TransactionStatus,
    vnp_TxnRef,
  ]);

  useEffect(() => {
    if (!callbackDone || !isBooking || !bookingIdFromOrderInfo) return;

    navigate(`/booking-result?bookingId=${bookingIdFromOrderInfo}`, {
      replace: true,
    });
  }, [bookingIdFromOrderInfo, callbackDone, isBooking, navigate]);

  if (!callbackDone) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-sm">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-600">
            Đang xử lý thanh toán...
          </p>
        </div>
      </div>
    );
  }

  if (isBooking && bookingIdFromOrderInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-sm">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-600">
            Đang chuyển đến kết quả lịch sân...
          </p>
        </div>
      </div>
    );
  }

  const title = isTopup
    ? isSuccess
      ? "Nạp tiền thành công"
      : "Nạp tiền thất bại"
    : isSuccess
      ? "Thanh toán thành công"
      : "Thanh toán thất bại";

  const description = isTopup
    ? isSuccess
      ? "Giao dịch đã hoàn tất. Số tiền đã được cộng vào ví B-Hub của bạn."
      : "Giao dịch nạp ví không hợp lệ, đã bị hủy hoặc xử lý không thành công."
    : isSuccess
      ? "Đơn hàng đã được thanh toán. B-Hub sẽ tiếp nhận và xử lý trong thời gian sớm nhất."
      : "Giao dịch không hợp lệ hoặc đã bị hủy. Bạn có thể quay lại giỏ hàng để thử lại.";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      {/* HERO */}
      <section className="relative overflow-hidden bg-sky-950 py-12 sm:py-14 lg:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.24),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_35%)]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-sky-100">
            <ReceiptText size={16} className="text-sky-300" />
            Kết quả giao dịch VNPay
          </div>

          <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
            {title}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-sky-100 sm:text-base">
            {description}
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <main className="relative z-10 mx-auto -mt-8 max-w-5xl px-4 pb-14 sm:px-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
          {/* STATUS HEADER */}
          <div className="flex flex-col gap-5 border-b border-slate-100 p-6 sm:flex-row sm:items-center">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
                isSuccess
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-500"
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="h-9 w-9" />
              ) : (
                <XCircle className="h-9 w-9" />
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xl font-semibold text-slate-900">{title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {description}
              </p>
            </div>
          </div>

          {/* INFO */}
          <div className="grid grid-cols-1 gap-4 bg-slate-50/70 p-5 sm:grid-cols-2 sm:p-6">
            <InfoCard label="Số tiền">
              <span className="text-xl font-semibold text-slate-900">
                {animatedAmount.toLocaleString()} VND
              </span>
            </InfoCard>

            <InfoCard label="Ngân hàng">
              <span className="text-base font-medium text-slate-800">
                {vnp_BankCode || "VNPay"}
              </span>
            </InfoCard>

            <InfoCard label="Mã giao dịch">
              <span className="break-all font-mono text-base font-semibold text-sky-700">
                {vnp_TxnRef || "--"}
              </span>
            </InfoCard>

            <InfoCard label="Trạng thái">
              <span
                className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
                  isSuccess
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {isSuccess ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                {isSuccess ? "Thành công" : "Thất bại"}
              </span>
            </InfoCard>
          </div>

          {/* PROGRESS */}
          <div className="border-t border-slate-100 p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {isTopup ? (
                <>
                  <Step active icon={<Wallet size={18} />} label="Thanh toán" />
                  <Step
                    active={isSuccess}
                    icon={
                      isSuccess ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <Clock size={18} />
                      )
                    }
                    label={isSuccess ? "Hoàn tất" : "Chưa hoàn tất"}
                  />
                  <Step icon={<Clock size={18} />} label="Xử lý giao dịch" />
                </>
              ) : (
                <>
                  <Step
                    active
                    icon={<PackageCheck size={18} />}
                    label="Đặt hàng"
                  />
                  <Step
                    active={isSuccess}
                    icon={
                      isSuccess ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <XCircle size={18} />
                      )
                    }
                    label={isSuccess ? "Đã thanh toán" : "Thanh toán lỗi"}
                  />
                  <Step icon={<Truck size={18} />} label="Vận chuyển" />
                </>
              )}
            </div>
          </div>

          {/* FAILED MESSAGE */}
          {!isSuccess && (
            <div className="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-6">
              <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center">
                <p className="font-semibold text-red-600">
                  Giao dịch chưa được xác nhận thành công
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Vui lòng kiểm tra lại thông tin giao dịch hoặc thực hiện lại
                  thanh toán.
                </p>
              </div>
            </div>
          )}

          {/* ACTION */}
          <div className="flex flex-col gap-3 border-t border-slate-100 p-5 sm:flex-row sm:justify-between sm:p-6">
            <ActionButton onClick={() => navigate("/home")}>
              <Home size={18} />
              Trang chủ
            </ActionButton>

            {isSuccess ? (
              <ActionButton
                primary
                onClick={() =>
                  navigate(
                    isTopup
                      ? "/wallet"
                      : isBooking && bookingIdFromOrderInfo
                        ? `/booking-result?bookingId=${bookingIdFromOrderInfo}`
                        : isBooking
                          ? "/bookings"
                          : "/orders",
                  )
                }
              >
                {isTopup ? <Wallet size={18} /> : <PackageCheck size={18} />}
                {isTopup ? "Quay lại ví" : "Xem đơn hàng"}
              </ActionButton>
            ) : (
              <ActionButton
                primary
                onClick={() =>
                  navigate(
                    isTopup
                      ? "/wallet"
                      : isBooking && bookingIdFromOrderInfo
                        ? `/booking-result?bookingId=${bookingIdFromOrderInfo}`
                        : orderGroupIdFromOrderInfo
                          ? `/order-result?orderGroupId=${orderGroupIdFromOrderInfo}`
                          : isBooking
                            ? "/courts"
                            : "/cart",
                  )
                }
              >
                <RotateCcw size={18} />
                {isTopup ? "Thử nạp lại" : "Thử lại"}
              </ActionButton>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

/* INFO CARD */
const InfoCard = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm">
    <p className="mb-2 text-sm text-slate-500">{label}</p>
    <div>{children}</div>
  </div>
);

/* STEP */
const Step = ({
  icon,
  label,
  active,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
}) => (
  <div
    className={`flex items-center gap-3 rounded-2xl border p-4 transition-all ${
      active
        ? "border-sky-200 bg-sky-50 text-sky-700"
        : "border-slate-200 bg-white text-slate-500"
    }`}
  >
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
        active ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500"
      }`}
    >
      {icon}
    </div>

    <span className="text-sm font-medium">{label}</span>
  </div>
);

/* ACTION BUTTON */
const ActionButton = ({
  children,
  primary,
  onClick,
}: {
  children: ReactNode;
  primary?: boolean;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all active:scale-[0.98] ${
      primary
        ? "bg-sky-600 text-white shadow-sm hover:bg-sky-700"
        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
    }`}
  >
    {children}
  </button>
);

export default VNPayResultPage;
