import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Ban,
  Banknote,
  Building2,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Landmark,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  UserRound,
  WalletCards,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  approveCancelEmployeeBooking,
  cancelNoShowEmployeeBooking,
  completeEmployeeBooking,
  confirmEmployeeBooking,
  getEmployeeBookingDetail,
  getEmployeeBookings,
  rejectCancelEmployeeBooking,
} from "../../redux/slices/employee/bookingSlice";
import type { BookingStatus, EmployeeBooking } from "../../types/booking";
import { formatBookingCode } from "../../utils/booking";
import { showConfirmDialog, showTextareaDialog } from "../../utils/swalHelper";

const BOOKING_TABS: { value: BookingStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "CANCEL_REQUESTED", label: "Yêu cầu hủy" },
  { value: "COMPLETED", label: "Hoàn tất" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "FAILED", label: "Thất bại" },
];

const BOOKING_LABEL: Record<BookingStatus, string> = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  CANCEL_REQUESTED: "Yêu cầu hủy",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
  FAILED: "Thất bại",
};

const statusClass: Record<BookingStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-sky-50 text-sky-700 border-sky-200",
  CANCEL_REQUESTED: "bg-orange-50 text-orange-700 border-orange-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-slate-100 text-slate-600 border-slate-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
};

const PAYMENT_LABEL: Record<string, string> = {
  COD: "Thanh toán tại sân",
  CASH: "Tiền mặt",
  BANK: "Chuyển khoản ngân hàng",
  VNPAY: "VNPay",
  WALLET: "Ví B-Hub",
  UNPAID: "Chưa thanh toán",
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  PARTIALLY_REFUNDED: "Hoàn tiền một phần",
  REFUNDED: "Đã hoàn tiền",
  FAILED: "Thất bại",
};

const paymentStatusClass: Record<string, string> = {
  UNPAID: "bg-slate-50 text-slate-600 border-slate-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PARTIALLY_REFUNDED: "bg-violet-50 text-violet-700 border-violet-200",
  REFUNDED: "bg-violet-50 text-violet-700 border-violet-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
};

const paymentDotClass: Record<string, string> = {
  UNPAID: "bg-slate-400",
  PENDING: "bg-amber-500",
  PAID: "bg-emerald-500",
  PARTIALLY_REFUNDED: "bg-violet-500",
  REFUNDED: "bg-violet-500",
  FAILED: "bg-red-500",
};

const COMPLETION_PAYMENT_METHODS = [
  {
    value: "CASH",
    label: "Tiền mặt",
    description: "Khách thanh toán tại quầy",
    icon: Banknote,
  },
  {
    value: "BANK",
    label: "Chuyển khoản",
    description: "Khách chuyển khoản ngân hàng",
    icon: Landmark,
  },
  {
    value: "VNPAY",
    label: "VNPay",
    description: "Quét mã thanh toán",
    icon: CreditCard,
  },
] as const;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDateTime = (value?: string | null) => {
  if (!value) return "--";
  return new Date(value).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDate = (value?: string | null) => {
  if (!value) return "--";
  return new Date(value).toLocaleDateString("vi-VN");
};

const EmployeeBookingsPage = () => {
  const dispatch = useAppDispatch();

  const { bookings, selectedBooking, summary, pagination } = useAppSelector(
    (state) => state.employeeBooking,
  );

  const loadingMap = useAppSelector((state) => state.ui.loadingMap);

  const [status, setStatus] = useState<BookingStatus | "ALL">("ALL");
  const [keyword, setKeyword] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [completionPaymentMethod, setCompletionPaymentMethod] = useState<
    "CASH" | "BANK" | "VNPAY"
  >("CASH");

  const listLoading = loadingMap["employeeBooking/getEmployeeBookings"];
  const detailLoading = loadingMap["employeeBooking/getEmployeeBookingDetail"];

  const actionLoading = useMemo(
    () =>
      Object.entries(loadingMap).some(
        ([key, value]) =>
          key.startsWith("employeeBooking/") &&
          !key.includes("getEmployee") &&
          value,
      ),
    [loadingMap],
  );

  const fetchBookings = () => {
    dispatch(
      getEmployeeBookings({
        params: {
          status,
          keyword,
          date: date || undefined,
          page,
          limit: 12,
        },
      }),
    );
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchBookings, 300);
    return () => window.clearTimeout(timer);
  }, [dispatch, status, keyword, date, page]);

  useEffect(() => {
    if (!selectedBooking && bookings[0]) {
      dispatch(getEmployeeBookingDetail({ bookingId: bookings[0].id }));
    }
  }, [dispatch, bookings, selectedBooking]);

  const selectBooking = (booking: EmployeeBooking) => {
    dispatch(getEmployeeBookingDetail({ bookingId: booking.id }));
  };

  const refreshDetail = (bookingId: number) => {
    fetchBookings();
    dispatch(getEmployeeBookingDetail({ bookingId }));
  };

  const approveCancel = async (booking: EmployeeBooking) => {
    const hasPaid = booking.payment?.paymentStatus === "PAID";

    const confirmMessage = hasPaid
      ? "Xác nhận hủy lịch và hoàn tiền vào ví khách hàng?"
      : "Xác nhận hủy lịch đặt sân này?";

    const confirmed = await showConfirmDialog(
      "Duyệt yêu cầu hủy lịch",
      confirmMessage,
      hasPaid ? "Hủy & hoàn tiền" : "Hủy lịch",
      "Đóng",
    );
    if (!confirmed) return;

    try {
      const res = await dispatch(
        approveCancelEmployeeBooking({ bookingId: booking.id }),
      ).unwrap();

      const refund = res.data?.refund;

      toast.success(
        refund?.refunded
          ? `${res.message}. Đã hoàn ${formatCurrency(
              refund.refundAmount,
            )} vào ví.`
          : res.message,
      );

      refreshDetail(booking.id);
    } catch {
      // global middleware handles API errors
    }
  };

  const rejectCancel = async (bookingId: number) => {
    const reason = await showTextareaDialog({
      title: "Từ chối yêu cầu hủy lịch",
      text: "Nhập lý do để khách hàng biết vì sao yêu cầu hủy chưa được chấp nhận.",
      placeholder: "Ví dụ: Lịch đã sát giờ chơi, không đủ điều kiện hủy...",
      confirmText: "Từ chối yêu cầu",
      requiredMessage: "Vui lòng nhập lý do từ chối",
    });
    if (!reason) return;

    try {
      const res = await dispatch(
        rejectCancelEmployeeBooking({ bookingId, data: { reason } }),
      ).unwrap();

      toast.success(res.message);
      refreshDetail(bookingId);
    } catch {
      // global middleware handles API errors
    }
  };

  const confirmBooking = async (bookingId: number) => {
    const confirmed = await showConfirmDialog(
      "Xác nhận lịch sân",
      "Xác nhận giữ sân cho lịch này?",
      "Xác nhận",
      "Đóng",
    );
    if (!confirmed) return;

    try {
      const res = await dispatch(
        confirmEmployeeBooking({ bookingId }),
      ).unwrap();

      toast.success(res.message);
      refreshDetail(bookingId);
    } catch {
      // global middleware handles API errors
    }
  };

  const completeBooking = async (booking: EmployeeBooking) => {
    const isPaid = booking.payment?.paymentStatus === "PAID";

    const message = isPaid
      ? "Xác nhận hoàn thành lịch sân này?"
      : `Xác nhận khách đã thanh toán bằng ${
          PAYMENT_LABEL[completionPaymentMethod]
        } và hoàn thành lịch sân?`;

    const confirmed = await showConfirmDialog(
      "Hoàn thành lịch sân",
      message,
      isPaid ? "Hoàn thành" : "Thu tiền & hoàn thành",
      "Đóng",
    );
    if (!confirmed) return;

    try {
      const res = await dispatch(
        completeEmployeeBooking({
          bookingId: booking.id,
          data: isPaid ? undefined : { paymentMethod: completionPaymentMethod },
        }),
      ).unwrap();

      toast.success(res.message);
      refreshDetail(booking.id);
    } catch {
      // global middleware handles API errors
    }
  };

  const cancelNoShow = async (bookingId: number) => {
    const reason = await showTextareaDialog({
      title: "Hủy lịch sân",
      text: "Lịch đang chờ xác nhận nên sẽ được hủy trực tiếp. Vui lòng nhập lý do hủy.",
      placeholder: "Nhập lý do hủy lịch sân...",
      defaultValue: "Khách không đến nhận sân",
      confirmText: "Tiếp tục hủy",
      requiredMessage: "Vui lòng nhập lý do hủy lịch sân",
    });

    if (!reason) return;

    const confirmed = await showConfirmDialog(
      "Xác nhận hủy lịch",
      "Bạn chắc chắn muốn hủy lịch sân này?",
      "Hủy lịch",
      "Đóng",
    );
    if (!confirmed) return;

    try {
      const res = await dispatch(
        cancelNoShowEmployeeBooking({ bookingId, data: { reason } }),
      ).unwrap();

      const refund = res.data?.refund;

      toast.success(
        refund?.refunded
          ? `${res.message}. Đã hoàn ${formatCurrency(
              refund.refundAmount,
            )} vào ví.`
          : res.message,
      );

      refreshDetail(bookingId);
    } catch {
      // global middleware handles API errors
    }
  };

  const canDirectCancel = (booking: EmployeeBooking) =>
    booking.bookingStatus === "PENDING";

  return (
    <div className="h-[calc(100vh-84px)] overflow-hidden bg-slate-50 px-3 py-4 sm:px-5 2xl:px-8">
      <div className="mx-auto grid h-full min-h-0 w-full max-w-[1880px] items-stretch gap-5 xl:grid-cols-[1.15fr_1.25fr]">
        {/* LEFT */}
        <section className="flex h-full min-h-0 flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          {/* HEADER */}
          <div className="mb-3 flex shrink-0 flex-col justify-between gap-2 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-bold text-sky-700">Vận hành đặt sân</p>

              <h2 className="mt-1 text-2xl font-extrabold text-slate-800">
                Lịch đặt sân
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Theo dõi lịch, xác nhận thanh toán và xử lý yêu cầu hủy sân.
              </p>
            </div>

            <button
              onClick={fetchBookings}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Làm mới
            </button>
          </div>

          {/* FILTER */}
          <div className="mb-3 grid shrink-0 gap-2 lg:grid-cols-[1fr_155px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setPage(1);
                }}
                placeholder="Tìm mã lịch, tên khách, email..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-normal text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:bg-white focus:ring-1 focus:ring-sky-100"
              />
            </div>

            <input
              type="date"
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-1 focus:ring-sky-100"
            />
          </div>

          {/* TABS */}
          <div className="mb-3 flex shrink-0 flex-wrap gap-2">
            {BOOKING_TABS.map((tab) => {
              const active = status === tab.value;

              return (
                <button
                  key={tab.value}
                  onClick={() => {
                    setStatus(tab.value);
                    setPage(1);
                  }}
                  className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "border-sky-300 bg-sky-50 text-sky-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  {tab.label}

                  {tab.value !== "ALL" && summary[tab.value] ? (
                    <span
                      className={`ml-2 rounded-full px-1.5 py-0.5 text-[11px] font-medium ${
                        active
                          ? "bg-white text-sky-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {summary[tab.value]}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* LIST SCROLL */}
          <div className="relative min-h-0 flex-1 overflow-y-auto pb-4 pr-1">
            <div className="space-y-2">
              {bookings.map((booking) => {
                const active = selectedBooking?.id === booking.id;
                const urgent = booking.bookingStatus === "CANCEL_REQUESTED";
                const firstDetail = booking.details[0];
                const paymentStatus =
                  booking.payment?.paymentStatus || "UNPAID";

                return (
                  <button
                    key={booking.id}
                    onClick={() => selectBooking(booking)}
                    className={`group w-full rounded-[16px] border px-4 py-3.5 text-left transition ${
                      active
                        ? "border-sky-300 bg-sky-50 shadow-sm"
                        : urgent
                          ? "border-orange-200 bg-orange-50/70 hover:bg-orange-50"
                          : "border-slate-200 bg-white hover:border-sky-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex min-w-0 items-start justify-between gap-4">
                      {/* LEFT INFO */}
                      <div className="min-w-0 flex-1">
                        {/* CODE + STATUS */}
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <p className="font-mono text-[14px] font-semibold leading-none text-sky-700">
                            #
                            {formatBookingCode(booking.id, booking.createdDate)}
                          </p>

                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium leading-none ${
                              statusClass[booking.bookingStatus]
                            }`}
                          >
                            {BOOKING_LABEL[booking.bookingStatus]}
                          </span>

                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium leading-none ${
                              paymentStatusClass[paymentStatus] ||
                              paymentStatusClass.UNPAID
                            }`}
                          >
                            <span
                              className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                                paymentDotClass[paymentStatus] ||
                                paymentDotClass.UNPAID
                              }`}
                            />
                            {PAYMENT_LABEL[paymentStatus] || paymentStatus}
                          </span>
                        </div>

                        {/* CUSTOMER */}
                        <div className="mt-2.5 flex min-w-0 items-start gap-2">
                          <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sky-100 text-xs font-semibold text-sky-600">
                            {(booking.user?.username || "K")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-800">
                              {booking.user?.username || "Khách hàng"}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {booking.user?.email || "--"}
                            </p>
                          </div>
                        </div>

                        {/* BOOKING INFO */}
                        <div className="mt-2.5 flex min-w-0 items-start gap-2">
                          <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sky-50 text-sky-600">
                            <MapPin className="h-3.5 w-3.5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-800">
                              {booking.branch?.branchName || "--"}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {firstDetail
                                ? `${formatDate(firstDetail.playDate)} • ${firstDetail.startTime} - ${firstDetail.endTime}`
                                : "Chưa có khung giờ"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT PRICE */}
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <p className="whitespace-nowrap rounded-xl bg-sky-100 px-3 py-1.5 text-sm font-semibold leading-none text-sky-700">
                          {formatCurrency(booking.totalAmount)}
                        </p>

                        <p className="whitespace-nowrap text-[11px] font-normal text-slate-500">
                          {formatDateTime(booking.createdDate)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}

              {!listLoading && bookings.length === 0 && (
                <div className="grid min-h-[260px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
                  <div>
                    <CalendarDays className="mx-auto h-9 w-9 text-slate-300" />
                    <p className="mt-3 text-xs font-medium text-slate-500">
                      Không có lịch đặt sân phù hợp.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {listLoading && (
              <div className="absolute inset-0 grid place-items-center rounded-2xl bg-white/70 backdrop-blur-[1px]">
                <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
              </div>
            )}
          </div>

          {/* PAGINATION */}
          <div className="mt-4 flex shrink-0 items-center justify-between border-t border-slate-100 py-3 text-xs">
            <span className="font-medium text-slate-500">
              Tổng {pagination.total} lịch
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Trước
              </button>

              <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-semibold text-slate-700">
                {pagination.page}/{Math.max(1, pagination.totalPages)}
              </span>

              <button
                onClick={() =>
                  setPage((value) => Math.min(pagination.totalPages, value + 1))
                }
                disabled={page >= pagination.totalPages}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT */}
        <section className="h-full min-h-0 overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          {!selectedBooking ? (
            <div className="grid h-full min-h-0 place-items-center rounded-3xl bg-slate-50 text-center">
              <div>
                <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-500">
                  Chọn một lịch để xem chi tiết.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative h-full min-h-0 overflow-y-auto pb-5 pr-1">
              <div className="mb-5 rounded-[28px] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-slate-50 p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-mono text-2xl font-bold text-sky-700">
                        #
                        {formatBookingCode(
                          selectedBooking.id,
                          selectedBooking.createdDate,
                        )}
                      </h2>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          statusClass[selectedBooking.bookingStatus]
                        }`}
                      >
                        {BOOKING_LABEL[selectedBooking.bookingStatus]}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          paymentStatusClass[
                            selectedBooking.payment?.paymentStatus || "UNPAID"
                          ] || paymentStatusClass.UNPAID
                        }`}
                      >
                        <span
                          className={`mr-1.5 inline-block h-2 w-2 rounded-full ${
                            paymentDotClass[
                              selectedBooking.payment?.paymentStatus || "UNPAID"
                            ] || paymentDotClass.UNPAID
                          }`}
                        />
                        {PAYMENT_LABEL[
                          selectedBooking.payment?.paymentStatus || "UNPAID"
                        ] ||
                          selectedBooking.payment?.paymentStatus ||
                          "--"}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
                        <Building2 className="h-3.5 w-3.5 text-sky-500" />
                        {selectedBooking.branch?.branchName || "--"}
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
                        <CalendarClock className="h-3.5 w-3.5 text-sky-500" />
                        {formatDateTime(selectedBooking.createdDate)}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-white px-5 py-4 shadow-sm lg:text-right">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Tổng thanh toán
                    </p>

                    <p className="mt-1 text-3xl font-bold text-sky-700">
                      {formatCurrency(selectedBooking.totalAmount)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {selectedBooking.bookingStatus === "PENDING" && (
                    <>
                      <button
                        onClick={() => confirmBooking(selectedBooking.id)}
                        disabled={actionLoading}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {actionLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        Xác nhận
                      </button>

                      {canDirectCancel(selectedBooking) && (
                        <button
                          onClick={() => cancelNoShow(selectedBooking.id)}
                          disabled={actionLoading}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-4 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {actionLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Ban className="h-4 w-4" />
                          )}
                          Hủy lịch
                        </button>
                      )}
                    </>
                  )}

                  {selectedBooking.bookingStatus === "CONFIRMED" && (
                    <button
                      onClick={() => completeBooking(selectedBooking)}
                      disabled={actionLoading}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      {selectedBooking.payment?.paymentStatus === "PAID"
                        ? "Hoàn thành"
                        : "Thu tiền & hoàn thành"}
                    </button>
                  )}

                  {selectedBooking.bookingStatus === "CANCEL_REQUESTED" && (
                    <>
                      <button
                        onClick={() => approveCancel(selectedBooking)}
                        disabled={actionLoading}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {actionLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        Duyệt hủy
                      </button>

                      <button
                        onClick={() => rejectCancel(selectedBooking.id)}
                        disabled={actionLoading}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <XCircle className="h-4 w-4" />
                        Từ chối
                      </button>
                    </>
                  )}
                </div>
              </div>

              {(selectedBooking.cancelReason ||
                selectedBooking.cancelRejectReason) && (
                <div className="mb-5 rounded-3xl border border-orange-100 bg-orange-50/80 p-4 text-sm text-orange-800">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

                    <div className="space-y-1">
                      {selectedBooking.cancelReason && (
                        <p>
                          <span className="font-semibold">Lý do hủy:</span>{" "}
                          {selectedBooking.cancelReason}
                        </p>
                      )}

                      {selectedBooking.cancelRejectReason && (
                        <p>
                          <span className="font-semibold">Lý do từ chối:</span>{" "}
                          {selectedBooking.cancelRejectReason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
                    <span className="grid h-9 w-9 place-items-center rounded-2xl bg-sky-50 text-sky-600">
                      <UserRound className="h-4 w-4" />
                    </span>
                    Khách hàng
                  </h3>

                  <div className="space-y-3 text-sm">
                    {/* USER */}
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sky-50 text-sm font-semibold text-sky-700">
                        {(selectedBooking.user?.username || "K")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-700">
                          {selectedBooking.user?.username || "--"}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {selectedBooking.user?.email || "--"}
                        </p>
                      </div>
                    </div>

                    {/* NOTE */}
                    <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
                      <p className="mb-1 text-xs font-medium text-slate-500">
                        Ghi chú
                      </p>

                      <p className="truncate font-sans text-[13px] font-medium tracking-tight text-sky-700">
                        {selectedBooking.note || "--"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-700 text-sm">
                    <span className="grid h-9 w-9 place-items-center rounded-2xl bg-sky-50 text-sky-600">
                      <WalletCards className="h-4 w-4" />
                    </span>
                    Thanh toán
                  </h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="mb-1 text-xs font-medium text-slate-500">
                        Phương thức
                      </span>

                      <span className="truncate font-sans text-[13px] font-medium tracking-tight text-sky-700">
                        {PAYMENT_LABEL[
                          selectedBooking.payment?.paymentMethod || "COD"
                        ] ||
                          selectedBooking.payment?.paymentMethod ||
                          "--"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="mb-1 text-xs font-medium text-slate-500">
                        Trạng thái
                      </span>

                      <span className="truncate font-sans text-[13px] font-medium tracking-tight text-sky-700">
                        {PAYMENT_LABEL[
                          selectedBooking.payment?.paymentStatus || "PENDING"
                        ] ||
                          selectedBooking.payment?.paymentStatus ||
                          "--"}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-4 rounded-xl bg-sky-50 px-3 py-2.5">
                      <span className="text-sm font-medium text-sky-700">
                        Tổng tiền
                      </span>

                      <span className="text-base font-bold text-sky-700">
                        {formatCurrency(selectedBooking.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {selectedBooking.bookingStatus === "CONFIRMED" &&
                    selectedBooking.payment?.paymentStatus !== "PAID" && (
                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Phương thức thanh toán
                        </p>

                        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1 2xl:grid-cols-3">
                          {COMPLETION_PAYMENT_METHODS.map((method) => {
                            const Icon = method.icon;
                            const active =
                              completionPaymentMethod === method.value;

                            return (
                              <button
                                key={method.value}
                                type="button"
                                onClick={() =>
                                  setCompletionPaymentMethod(method.value)
                                }
                                className={`rounded-2xl border p-3 text-left transition ${
                                  active
                                    ? "border-sky-300 bg-sky-50 text-sky-800 shadow-sm"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`grid h-9 w-9 place-items-center rounded-xl ${
                                      active
                                        ? "bg-white text-sky-600 shadow-sm"
                                        : "bg-slate-50 text-slate-500"
                                    }`}
                                  >
                                    <Icon className="h-4 w-4" />
                                  </span>

                                  <span className="min-w-0">
                                    <span className="block text-sm font-semibold">
                                      {method.label}
                                    </span>
                                    <span className="block truncate text-xs font-normal text-slate-500">
                                      {method.description}
                                    </span>
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <h3 className="text-sm font-bold text-slate-700">
                    Khung sân
                  </h3>
                </div>

                <div className="divide-y divide-slate-100">
                  {selectedBooking.details.map((detail) => (
                    <div
                      key={detail.id}
                      className="grid items-center gap-3 px-4 py-4 text-sm md:grid-cols-[1fr_170px_170px_130px]"
                    >
                      <p className="font-semibold text-slate-700">
                        {detail.courtName || `Sân #${detail.courtId}`}
                      </p>

                      <p className="flex items-center gap-2 font-normal text-slate-600">
                        <CalendarDays className="h-4 w-4 text-sky-600" />
                        {formatDate(detail.playDate)}
                      </p>

                      <p className="flex items-center gap-2 font-normal text-slate-600">
                        <Clock3 className="h-4 w-4 text-sky-600" />
                        {detail.startTime} - {detail.endTime}
                      </p>

                      <p className="font-semibold text-slate-800 md:text-right">
                        {formatCurrency(detail.price)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_300px]">
                <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
                    <span className="grid h-9 w-9 place-items-center rounded-2xl bg-sky-50 text-sky-600">
                      <MapPin className="h-4 w-4" />
                    </span>
                    Chi nhánh
                  </h3>

                  <div className="min-w-0 space-y-2 text-sm font-normal text-slate-600">
                    <p className="truncate font-semibold text-slate-700">
                      {selectedBooking.branch?.branchName || "--"}
                    </p>

                    <p
                      title={
                        [
                          selectedBooking.branch?.address,
                          selectedBooking.branch?.wardName,
                          selectedBooking.branch?.districtName,
                          selectedBooking.branch?.provinceName,
                        ]
                          .filter(Boolean)
                          .join(", ") || "--"
                      }
                      className="max-w-full font-sans text-[13px] font-medium tracking-tight text-slate-600"
                    >
                      {[
                        selectedBooking.branch?.address,
                        selectedBooking.branch?.wardName,
                        selectedBooking.branch?.districtName,
                      ]
                        .filter(Boolean)
                        .join(", ") || "--"}
                    </p>

                    <p className="font-sans text-[13px] font-medium tracking-tight text-slate-600">
                      {selectedBooking.branch?.phoneNumber || "--"}
                    </p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
                  <h3 className="mb-4 text-sm font-bold text-slate-700">
                    Hoàn tiền
                  </h3>

                  <div className="space-y-3 text-sm font-normal text-slate-600">
                    <div className="flex justify-between gap-3">
                      <span>Đã hoàn</span>
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(
                          selectedBooking.payment?.refundAmount || 0,
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span>Thời gian</span>
                      <span className="text-right font-semibold text-slate-800">
                        {formatDateTime(selectedBooking.payment?.refundAt)}
                      </span>
                    </div>

                    <div className="border-t border-slate-200 pt-3">
                      <div className="flex justify-between text-base font-semibold text-slate-800">
                        <span>Tổng</span>
                        <span>
                          {formatCurrency(selectedBooking.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {detailLoading && (
                <div className="absolute inset-0 grid place-items-center rounded-3xl bg-white/70 backdrop-blur-[1px]">
                  <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default EmployeeBookingsPage;
