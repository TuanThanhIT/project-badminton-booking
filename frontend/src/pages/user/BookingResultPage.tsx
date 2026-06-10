import {
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Home,
  ReceiptText,
  RotateCcw,
  Wallet,
  XCircle,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "../../redux/hook";
import {
  getBookingById,
  retryBookingVNPay,
} from "../../redux/slices/user/bookingSlice";
import { formatBookingCode } from "../../utils/booking";

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

const BookingResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bookingId = searchParams.get("bookingId");
  const [bookingData, setBookingData] = useState<any>(null);
  const [verified, setVerified] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const isSuccess = bookingData?.isSuccess;
  const amount = Number(bookingData?.amount || 0);
  const animatedAmount = useCountUp(amount);

  const method = bookingData?.paymentMethod;
  const isWallet = method === "WALLET";
  const isPayAtCourt = method === "COD" || method === "CASH";
  const canRetryPayment = Boolean(bookingData?.canRetryPayment);

  const dispatch = useAppDispatch();

  const handleRetryPayment = async () => {
    if (!bookingData?.bookingId) return;

    try {
      setIsRetrying(true);
      const res = await dispatch(
        retryBookingVNPay({ bookingId: Number(bookingData.bookingId) }),
      ).unwrap();
      window.location.href = res.data.paymentUrl;
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    if (!bookingId) {
      setVerified(true);
      return;
    }

    const fetchBooking = async () => {
      try {
        const res = await dispatch(
          getBookingById({ bookingId: Number(bookingId) }),
        ).unwrap();

        setBookingData(res.data);
        localStorage.removeItem("bookingDiscountCode");
      } catch {
        setBookingData(null);
      } finally {
        setVerified(true);
      }
    };

    fetchBooking();
  }, [bookingId, dispatch]);

  if (!verified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-sm">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />

          <p className="text-sm font-medium text-slate-600">
            Đang kiểm tra lịch sân...
          </p>
        </div>
      </div>
    );
  }

  const title = isSuccess
    ? "Thanh toán thành công"
    : canRetryPayment
      ? "Lịch sân đang chờ thanh toán"
      : "Thanh toán thất bại";

  const description = isSuccess
    ? "Lịch sân đã được thanh toán. Bạn có thể xem lại chi tiết trong mục lịch sân."
    : canRetryPayment
      ? "Thanh toán chưa hoàn tất. Lịch sân vẫn được giữ trong thời gian ngắn, bạn có thể thanh toán lại ngay."
      : "Giao dịch không hợp lệ hoặc đã bị hủy. Vui lòng kiểm tra lại giao dịch hoặc thử lại.";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <section className="relative overflow-hidden bg-sky-950 py-12 sm:py-14 lg:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.24),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_35%)]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-sky-100">
            <ReceiptText size={16} className="text-sky-300" />
            Kết quả đặt sân
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
                <InfoCard label="Mã lịch sân">
                  <span className="font-mono text-xl font-semibold text-sky-700">
                    {formatBookingCode(
                      bookingData.bookingId,
                      bookingData.createdAt,
                    )}
                  </span>
                </InfoCard>

                <InfoCard label="Tổng thanh toán">
                  <span className="text-xl font-semibold text-slate-900">
                    {animatedAmount.toLocaleString()} VND
                  </span>
                </InfoCard>

                <InfoCard label="Phương thức">
                  <span className="text-base font-medium text-slate-800">
                    {isPayAtCourt
                      ? "Thanh toán tại sân"
                      : isWallet
                        ? "Ví B-Hub"
                        : method || "VNPay"}
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
                  <Step
                    active
                    icon={<CalendarCheck size={18} />}
                    label="Đặt lịch"
                  />

                  <Step
                    active
                    icon={<Wallet size={18} />}
                    label="Đã thanh toán"
                  />

                  <Step
                    icon={<ClipboardList size={18} />}
                    label="Xem lịch sân"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-50/70 p-5 sm:p-6">
              <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center">
                <p className="font-semibold text-red-600">
                  {canRetryPayment
                    ? "Lịch sân vẫn đang được giữ"
                    : "Không tìm thấy giao dịch hợp lệ"}
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  {canRetryPayment
                    ? "Bạn có thể thanh toán lại trước khi hết thời gian giữ lịch."
                    : "Vui lòng kiểm tra lại giao dịch hoặc quay lại để thử thanh toán lần nữa."}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-100 p-5 sm:flex-row sm:justify-between sm:p-6">
            <ActionButton onClick={() => navigate("/home")}>
              <Home size={18} />
              Trang chủ
            </ActionButton>

            {isSuccess ? (
              <ActionButton primary onClick={() => navigate("/bookings")}>
                <ClipboardList size={18} />
                Xem lịch sân
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
              <ActionButton primary onClick={() => navigate(-1)}>
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

export default BookingResultPage;
