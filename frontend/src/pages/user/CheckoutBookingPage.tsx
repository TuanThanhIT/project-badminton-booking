import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  Receipt,
  ShieldCheck,
  Ticket,
  Wallet,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { createBooking } from "../../redux/slices/user/bookingSlice";
import { createMonthlyBooking } from "../../redux/slices/user/monthlyBookingSlice";
import { otpSend, setOtpFlow } from "../../redux/slices/user/authSlice";
import {
  checkBookingDiscount,
  getDiscountsCheckout,
} from "../../redux/slices/user/discountSlice";
import DiscountsForm from "../../components/ui/user/discount/DiscountsForm";
import type { FormDiscount } from "../../schemas/FormDiscountSchema";
import type {
  DiscountCheckResult,
  DiscountRequest,
} from "../../types/discount";
import {
  BOOKING_PAYMENT_CONFIRM_MESSAGE,
  BOOKING_PAYMENT_METHOD,
  bookingPaymentMethodList,
  type BookingPaymentMethod,
} from "../../utils/constants/bookingPaymentMethod";
import { OTP_TYPE } from "../../utils/constants/otpType";
import type { OtpFlowData, OtpSendRequest } from "../../types/auth";
import { showConfirmDialog } from "../../utils/confirmDialog";

const iconMap = {
  cash: <Banknote size={18} />,
  vnpay: <CreditCard size={18} />,
  wallet: <Wallet size={18} />,
} as const;

const formatPrice = (value: number) =>
  `${Number(value || 0).toLocaleString()}đ`;

const CheckoutBookingPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const discounts = useAppSelector((state) => state.discount.discounts);
  const user = useAppSelector((state) => state.auth.user);

  const [selectedMethod, setSelectedMethod] = useState<BookingPaymentMethod>(
    BOOKING_PAYMENT_METHOD.CASH.value,
  );
  const [openDiscount, setOpenDiscount] = useState(false);
  const [appliedDiscount, setAppliedDiscount] =
    useState<DiscountCheckResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const totalAmount = Number(state?.totalAmount || 0);
  const discountAmount = appliedDiscount?.discountValue ?? 0;
  const finalAmount = appliedDiscount?.finalAmount ?? totalAmount;

  const availablePaymentMethods =
    state?.type === "monthly"
      ? bookingPaymentMethodList.filter(
          (method) => method.value !== BOOKING_PAYMENT_METHOD.CASH.value,
        )
      : bookingPaymentMethodList;

  const selectedPaymentLabel = useMemo(() => {
    return (
      bookingPaymentMethodList.find((method) => method.value === selectedMethod)
        ?.label || selectedMethod
    );
  }, [selectedMethod]);

  useEffect(() => {
    if (
      state?.type === "monthly" &&
      selectedMethod === BOOKING_PAYMENT_METHOD.CASH.value
    ) {
      setSelectedMethod(BOOKING_PAYMENT_METHOD.VNPAY.value);
    }
  }, [selectedMethod, state?.type]);

  useEffect(() => {
    if (!totalAmount) return;

    const data: DiscountRequest = {
      amount: totalAmount,
      targetType: "BOOKING",
    };

    dispatch(getDiscountsCheckout({ data }));
  }, [dispatch, totalAmount]);

  if (!state) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-700">
        <section className="h-36 bg-sky-950" />

        <main className="mx-auto -mt-20 flex max-w-7xl justify-center px-4 pb-16 sm:px-6">
          <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_18px_46px_rgba(15,23,42,0.1)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <AlertTriangle size={30} />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Không có thông tin thanh toán
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              Phiên đặt sân có thể đã hết hạn hoặc bạn truy cập trực tiếp vào
              trang thanh toán. Hãy chọn lại sân và khung giờ để tiếp tục.
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/courts")}
                className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                Quay lại đặt sân
              </button>

              <button
                type="button"
                onClick={() => navigate("/bookings")}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Xem lịch sân
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleApplyDiscount = (data: FormDiscount) => {
    if (!totalAmount) return;

    dispatch(
      checkBookingDiscount({
        code: data.code,
        bookingAmount: totalAmount,
      }),
    )
      .unwrap()
      .then((res) => {
        setAppliedDiscount(res.data);
        localStorage.setItem("bookingDiscountCode", data.code);
        setOpenDiscount(false);
        toast.success("Áp mã giảm giá đặt sân thành công");
      })
      .catch(() => {
        setAppliedDiscount(null);
        localStorage.removeItem("bookingDiscountCode");
      });
  };

  const handleBackFromCheckout = async () => {
    const confirmed = await showConfirmDialog(
      "Xác nhận thoát",
      "Bạn chưa hoàn tất thanh toán. Quay lại có thể làm gián đoạn lịch đặt hiện tại.",
      "Xác nhận",
      "Hủy",
      "danger",
    );

    if (!confirmed) return;
    navigate("/courts");
  };

  const handlePayNow = async () => {
    const confirmed = await showConfirmDialog(
      "Xác nhận đặt sân",
      BOOKING_PAYMENT_CONFIRM_MESSAGE[selectedMethod],
      "Xác nhận",
      "Hủy",
    );

    if (!confirmed) return;

    try {
      setSubmitting(true);

      if (state.type === "monthly") {
        const res = await dispatch(
          createMonthlyBooking({
            branchId: state.branchId,
            courtId: state.courtId,
            startDate: state.startDate,
            endDate: state.endDate,
            daysOfWeek: state.daysOfWeek || [],
            startTime: state.startTime,
            endTime: state.endTime,
            paymentMethod: selectedMethod as "VNPAY" | "WALLET",
            discountId: appliedDiscount?.discountId ?? null,
            note: appliedDiscount
              ? `Thanh toán: ${selectedPaymentLabel}. Mã giảm giá: ${appliedDiscount.code}`
              : `Thanh toán: ${selectedPaymentLabel}`,
          }),
        ).unwrap();

        if (res.data.paymentUrl) {
          window.location.href = res.data.paymentUrl;
          return;
        }

        if (selectedMethod === BOOKING_PAYMENT_METHOD.WALLET.value) {
          if (!user?.email) {
            toast.error("Không tìm thấy email tài khoản để gửi OTP.");
            return;
          }

          const flowData: OtpFlowData = {
            bookingId: res.data.booking.id,
            email: user.email,
            type: OTP_TYPE.WALLET_PAYMENT,
          };

          const otpData: OtpSendRequest = {
            email: user.email,
            type: OTP_TYPE.WALLET_PAYMENT,
          };

          dispatch(setOtpFlow({ data: flowData }));
          dispatch(otpSend({ data: otpData }));

          toast.success("Mã OTP xác nhận thanh toán đã được gửi đến email.");
          navigate("/verify-otp");
          return;
        }

        toast.success("Đã tạo lịch tháng, vui lòng hoàn tất thanh toán.");
        navigate(`/booking-result?bookingId=${res.data.booking.id}`);
        return;
      }

      const res = await dispatch(
        createBooking({
          data: {
            branchId: state.branchId,
            courtId: state.courtId,
            playDate: state.bookingDate,
            startTime: state.startTime,
            endTime: state.endTime,
            paymentMethod: selectedMethod,
            discountId: appliedDiscount?.discountId ?? null,
          },
        }),
      ).unwrap();

      if (res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl;
        return;
      }

      if (selectedMethod === BOOKING_PAYMENT_METHOD.WALLET.value) {
        if (!user?.email) {
          toast.error("Không tìm thấy email tài khoản để gửi OTP.");
          return;
        }

        const flowData: OtpFlowData = {
          bookingId: res.data.bookingId,
          email: user.email,
          type: OTP_TYPE.WALLET_PAYMENT,
        };

        const otpData: OtpSendRequest = {
          email: user.email,
          type: OTP_TYPE.WALLET_PAYMENT,
        };

        dispatch(setOtpFlow({ data: flowData }));
        dispatch(otpSend({ data: otpData }));

        toast.success("Mã OTP xác nhận thanh toán đã được gửi đến email.");
        navigate("/verify-otp");
        return;
      }

      toast.success("Đặt sân thành công, vui lòng thanh toán khi đến sân");
      navigate(`/booking-result?bookingId=${res.data.bookingId}`);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12 text-slate-700">
      <section className="relative h-44 overflow-hidden bg-sky-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_32%)]" />
      </section>

      <main className="relative z-10 mx-auto -mt-28 max-w-[1360px] px-4 sm:px-6 xl:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_46px_rgba(15,23,42,0.1)]">
          <div className="flex flex-col gap-5 border-b border-slate-100 px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={handleBackFromCheckout}
                className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                aria-label="Quay lại"
              >
                <ArrowLeft size={21} />
              </button>

              <div>
                <p className="text-sm font-medium text-sky-700">
                  B-Hub Booking
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Xác nhận đặt sân
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Kiểm tra thông tin lịch sân, chọn mã giảm giá và phương thức
                  thanh toán trước khi hoàn tất.
                </p>
              </div>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
              <Receipt size={17} />
              {state.type === "monthly" ? "Đặt sân tháng" : "Đặt sân theo ngày"}
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_400px]">
            <div className="space-y-7 p-5 sm:p-7 xl:p-8">
              <div>
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <CheckCircle2 size={20} className="text-sky-600" />
                  Thông tin lịch sân
                </h2>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white">
                      <MapPin size={21} />
                    </div>

                    <div>
                      <p className="text-base font-semibold text-slate-950">
                        {state.courtName}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {state.branchName}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                      <Calendar size={17} className="text-sky-600" />
                      {state.type === "daily"
                        ? state.bookingDate
                        : `${state.startDate} - ${state.endDate}`}
                    </div>

                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                      <Clock size={17} className="text-sky-600" />
                      {state.startTime} - {state.endTime}
                    </div>
                  </div>

                  {state.type === "monthly" && (
                    <div className="mt-3 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800">
                      {state.daysOfWeek?.join(", ")} • {state.totalSessions}{" "}
                      buổi
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-4">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                    <Ticket size={20} className="text-sky-600" />
                    Mã giảm giá
                  </h2>

                  <button
                    type="button"
                    onClick={() => setOpenDiscount(true)}
                    className="rounded-2xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600"
                  >
                    {appliedDiscount ? "Đổi mã" : "Chọn mã"}
                  </button>
                </div>

                {appliedDiscount ? (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    Đã áp dụng mã{" "}
                    <span className="font-semibold">
                      {appliedDiscount.code}
                    </span>
                    , giảm {formatPrice(discountAmount)}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    Chọn mã phù hợp để giảm chi phí đặt sân.
                  </div>
                )}
              </div>

              <div>
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <CreditCard size={20} className="text-sky-600" />
                  Phương thức thanh toán
                </h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {availablePaymentMethods.map((method) => {
                    const active = selectedMethod === method.value;

                    return (
                      <button
                        type="button"
                        key={method.value}
                        onClick={() => setSelectedMethod(method.value)}
                        className={`rounded-2xl border p-5 text-left transition-all ${
                          active
                            ? "border-sky-300 bg-sky-50 shadow-sm"
                            : "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/60"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                            {iconMap[method.icon]}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold leading-6 text-slate-800">
                              {method.label}
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {method.desc}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <aside className="border-t border-slate-100 bg-slate-50/80 p-5 sm:p-7 lg:border-l lg:border-t-0 xl:p-8">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <ShieldCheck size={20} className="text-sky-600" />
                  Tóm tắt thanh toán
                </h2>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-4 text-slate-600">
                    <span>Tiền sân</span>

                    <span className="font-medium text-slate-900">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between gap-4 text-emerald-600">
                      <span>Giảm giá</span>

                      <span className="font-medium">
                        -{formatPrice(discountAmount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between gap-4 text-slate-600">
                    <span>Phí dịch vụ</span>

                    <span className="font-medium text-slate-900">0đ</span>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold text-slate-700">
                      Tổng cộng
                    </span>

                    <span className="text-2xl font-bold text-sky-700">
                      {formatPrice(finalAmount)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-xs leading-5 text-emerald-700">
                  <ShieldCheck
                    size={26}
                    className="shrink-0 text-emerald-500"
                  />
                  Lịch đặt sẽ được ghi nhận ngay sau khi xác nhận thành công.
                </div>

                <button
                  type="button"
                  onClick={handlePayNow}
                  disabled={submitting}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CheckCircle2 size={18} />
                  {submitting ? "Đang xử lý..." : "Xác nhận đặt sân"}
                </button>
              </div>
            </aside>
          </div>
        </section>
      </main>

      {openDiscount && (
        <DiscountsForm
          setOpenDiscount={setOpenDiscount}
          onSubmit={handleApplyDiscount}
          discounts={discounts}
          storageKey="bookingDiscountCode"
        />
      )}
    </div>
  );
};

export default CheckoutBookingPage;
