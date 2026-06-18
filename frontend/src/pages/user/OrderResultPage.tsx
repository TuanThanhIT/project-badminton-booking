import {
  CheckCircle2,
  ClipboardList,
  Home,
  PackageCheck,
  RotateCcw,
  Truck,
  Wallet,
  XCircle,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "../../redux/hook";
import {
  getOrderGroupId,
  retryOrderVNPay,
} from "../../redux/slices/user/orderSlice";
import { getCart } from "../../redux/slices/user/cartSlice";
import type { OrderGroupIdRequest } from "../../types/order";
import { formatOrderCode } from "../../utils/order";

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

const OrderResultPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const orderGroupId = searchParams.get("orderGroupId") || "--";
  const [orderData, setOrderData] = useState<any>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [verified, setVerified] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const method = orderData?.paymentMethod;
  const amount = Number(orderData?.amount || 0);
  const orderId = orderData?.orderGroupId || "--";
  const createdAt = orderData?.createdAt ?? null;

  const isWallet = method === "WALLET";
  const isCOD = method === "COD";
  const canRetryPayment = Boolean(orderData?.canRetryPayment);
  const animatedAmount = useCountUp(amount);

  const handleRetryPayment = async () => {
    if (!orderData?.orderGroupId) return;

    try {
      setIsRetrying(true);
      const res = await dispatch(
        retryOrderVNPay({ orderGroupId: Number(orderData.orderGroupId) }),
      ).unwrap();
      window.location.href = res.data.paymentUrl;
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    if (!orderGroupId || orderGroupId === "--") {
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

        if (result.isSuccess) {
          dispatch(getCart());

          sessionStorage.removeItem("checkoutCartId");
          sessionStorage.removeItem("checkoutCartItemIds");
          sessionStorage.removeItem("checkoutBuyNowItem");
          localStorage.removeItem("addressSelectedId");
          localStorage.removeItem("discountCode");
        }
      } catch {
        setIsSuccess(false);
      } finally {
        setVerified(true);
      }
    };

    fetchOrder();
  }, [dispatch, orderGroupId]);

  if (!verified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-sm">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-600">
            Đang kiểm tra đơn hàng...
          </p>
        </div>
      </div>
    );
  }

  const title = isSuccess
    ? isWallet
      ? "Thanh toán thành công"
      : "Đặt hàng thành công"
    : canRetryPayment
      ? "Đơn hàng đang chờ thanh toán"
      : "Thanh toán thất bại";

  const description = isSuccess
    ? isWallet
      ? "Giao dịch đã hoàn tất. Bạn có thể theo dõi trạng thái đơn hàng trong trung tâm đơn hàng."
      : "Đơn hàng đã được tạo. B-Hub sẽ tiếp nhận và xử lý trong thời gian sớm nhất."
    : canRetryPayment
      ? "Thanh toán chưa hoàn tất. Đơn hàng vẫn được giữ trong thời gian ngắn, bạn có thể thanh toán lại ngay."
      : "Giao dịch không hợp lệ hoặc đã bị hủy. Bạn có thể quay lại giỏ hàng để thử lại.";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <section className="user-hero-surface py-12 sm:py-14 lg:py-16">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="user-hero-badge">
            <PackageCheck />
            Kết quả đơn hàng
          </div>
          <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-sky-100 sm:text-base">
            {description}
          </p>
        </div>
      </section>

      <main className="relative z-10 mx-auto -mt-8 max-w-5xl px-4 pb-14 sm:px-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-5 border-b border-slate-100 p-6 sm:flex-row sm:items-center">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
                isSuccess
                  ? "bg-emerald-50 text-emerald-600"
                  : canRetryPayment
                    ? "bg-amber-50 text-amber-600"
                    : "bg-red-50 text-red-500"
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="h-9 w-9" />
              ) : canRetryPayment ? (
                <RotateCcw className="h-9 w-9" />
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

          {isSuccess ? (
            <>
              <div className="grid grid-cols-1 gap-4 bg-slate-50/70 p-5 sm:grid-cols-2 sm:p-6">
                <InfoCard label="Mã đơn hàng">
                  <span className="font-mono text-xl font-semibold text-sky-700">
                    {formatOrderCode(orderId, createdAt)}
                  </span>
                </InfoCard>

                <InfoCard label="Tổng thanh toán">
                  <span className="text-xl font-semibold text-slate-900">
                    {animatedAmount.toLocaleString()} VND
                  </span>
                </InfoCard>

                <InfoCard label="Phương thức">
                  <span className="text-base font-medium text-slate-800">
                    {isCOD
                      ? "Thanh toán khi nhận hàng"
                      : isWallet
                        ? "Ví B-Hub"
                        : "VNPay"}
                  </span>
                </InfoCard>

                <InfoCard label="Trạng thái">
                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
                    <CheckCircle2 size={15} />
                    Thành công
                  </span>
                </InfoCard>
              </div>

              <div className="border-t border-slate-100 p-5 sm:p-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Step active icon={<CheckCircle2 size={18} />} label="Đặt hàng" />
                  <Step
                    active={isWallet}
                    icon={isWallet ? <Wallet size={18} /> : <PackageCheck size={18} />}
                    label={isWallet ? "Đã thanh toán" : "Chờ xác nhận"}
                  />
                  <Step icon={<Truck size={18} />} label="Vận chuyển" />
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-50/70 p-5 sm:p-6">
              <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center">
                <p className="font-semibold text-red-600">
                  {canRetryPayment
                    ? "Đơn hàng vẫn đang được giữ"
                    : "Không tìm thấy thông tin đơn hàng hợp lệ"}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {canRetryPayment
                    ? "Bạn có thể thanh toán lại trước khi hết thời gian giữ đơn."
                    : "Vui lòng kiểm tra lại giao dịch hoặc quay về giỏ hàng để thử lại."}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-100 p-5 sm:flex-row sm:justify-between sm:p-6">
            <ActionButton onClick={() => navigate("/")}>
              <Home size={18} />
              Trang chủ
            </ActionButton>

            {isSuccess ? (
              <ActionButton primary onClick={() => navigate("/orders")}>
                <ClipboardList size={18} />
                Xem đơn hàng
              </ActionButton>
            ) : canRetryPayment ? (
              <ActionButton
                primary
                onClick={handleRetryPayment}
                disabled={isRetrying}
              >
                <RotateCcw size={18} />
                {isRetrying ? "Đang tạo lại..." : "Thanh toán lại"}
              </ActionButton>
            ) : (
              <ActionButton primary onClick={() => navigate("/cart")}>
                <RotateCcw size={18} />
                Thử lại
              </ActionButton>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

const InfoCard = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4">
    <p className="mb-2 text-sm text-slate-500">{label}</p>
    <div>{children}</div>
  </div>
);

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
    className={`flex items-center gap-3 rounded-2xl border p-4 ${
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

const ActionButton = ({
  children,
  primary,
  onClick,
  disabled,
}: {
  children: ReactNode;
  primary?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all ${
      primary
        ? "bg-sky-600 text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
    }`}
  >
    {children}
  </button>
);

export default OrderResultPage;
