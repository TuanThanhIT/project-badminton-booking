import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CalendarDays,
  Clock,
  ClipboardList,
  Filter,
  MapPin,
  ReceiptText,
  RotateCcw,
  SearchCheck,
  WalletCards,
  XCircle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { getMyBookings } from "../../redux/slices/user/bookingSlice";
import type { BookingItem } from "../../types/booking";
import { formatBookingCode } from "../../utils/booking";
import CancelBookingModal from "../../components/ui/user/booking/CancelBookingModal";
import PaginatedItems from "../../components/ui/user/pagination/PaginatedItems";

const STATUS_LABEL: Record<string, string> = {
  ALL: "Tất cả",
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Đã nhận sân",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  CONFIRMED: "bg-sky-50 text-sky-700 ring-1 ring-sky-100",
  CHECKED_IN: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100",
  COMPLETED: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  CANCELLED: "bg-red-50 text-red-600 ring-1 ring-red-100",
};

Object.assign(STATUS_LABEL, {
  CANCEL_REQUESTED: "Chờ xác nhận hủy",
  FAILED: "Thất bại",
});

Object.assign(STATUS_CLASS, {
  CANCEL_REQUESTED: "bg-orange-50 text-orange-700 ring-1 ring-orange-100",
  FAILED: "bg-red-50 text-red-600 ring-1 ring-red-100",
});

const PAYMENT_LABEL: Record<string, string> = {
  COD: "Thanh toán tại sân",
  VNPAY: "VNPay",
  WALLET: "Ví B-Hub",

  UNPAID: "Chưa thanh toán",
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thất bại",
  PARTIALLY_REFUNDED: "Hoàn tiền một phần",
  REFUNDED: "Đã hoàn tiền",
};

const PAYMENT_STATUS_CLASS: Record<string, string> = {
  UNPAID: "bg-slate-50 text-slate-600 ring-1 ring-slate-200",
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  PAID: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  FAILED: "bg-red-50 text-red-600 ring-1 ring-red-100",

  PARTIALLY_REFUNDED: "bg-orange-50 text-orange-700 ring-1 ring-orange-100",
  REFUNDED: "bg-violet-50 text-violet-700 ring-1 ring-violet-100",
};

const TABS = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "CANCEL_REQUESTED",
  "COMPLETED",
  "CANCELLED",
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition-all hover:border-sky-200 hover:bg-white focus:border-sky-400 focus:bg-white focus:ring-1 focus:ring-sky-100";

const BookingPage = () => {
  const dispatch = useAppDispatch();
  const { bookings, pagination } = useAppSelector((state) => state.booking);

  const [status, setStatus] = useState("ALL");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(
    null,
  );

  useEffect(() => {
    dispatch(
      getMyBookings({
        data: {
          page,
          limit: 5,
          status: status === "ALL" ? undefined : status,
          date: date || undefined,
        },
      }),
    );
  }, [dispatch, status, date, page]);

  const stats = useMemo(() => {
    const totalAmount = bookings.reduce(
      (sum, item) => sum + Number(item.totalAmount || 0),
      0,
    );

    const paidCount = bookings.filter(
      (item) =>
        item.payment?.status === "PAID" ||
        ["CONFIRMED", "CHECKED_IN", "COMPLETED"].includes(
          item.bookingStatus,
        ),
    ).length;

    return {
      count: pagination?.total || bookings.length,
      paidCount,
      totalAmount,
    };
  }, [bookings, pagination?.total]);

  const activeTabLabel = STATUS_LABEL[status] || "Tất cả";

  const resetFilters = () => {
    setStatus("ALL");
    setDate("");
    setPage(1);
  };

  const canCancelBooking = (booking: BookingItem) =>
    ["PENDING", "CONFIRMED"].includes(booking.bookingStatus) &&
    !booking.cancelRejectReason;

  const handleCancelBooking = (booking: BookingItem) => {
    setSelectedBooking(booking);
    setIsCancelModalOpen(true);
  };

  const handleCancelModalClose = () => {
    setIsCancelModalOpen(false);
    setSelectedBooking(null);
  };

  const handleCancelSuccess = () => {
    dispatch(
      getMyBookings({
        data: {
          page,
          limit: 5,
          status: status === "ALL" ? undefined : status,
          date: date || undefined,
        },
      }),
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <section className="user-hero-surface">
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-5 lg:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="user-hero-badge mb-4">
                <CalendarDays />
                Trung tâm lịch sân
              </div>

              <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
                Lịch đặt sân của tôi
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-relaxed text-sky-100 sm:text-lg">
                Theo dõi lịch đã đặt, trạng thái xử lý và phương thức thanh toán
                cho từng buổi chơi tại B-Hub.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-sky-100">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2">
                  <Calendar size={16} />
                  Quản lý lịch đã đặt
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2">
                  <Clock size={16} />
                  Theo dõi trạng thái
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 lg:min-w-[380px]">
              {[
                { icon: ReceiptText, label: "Lịch đặt", value: stats.count },
                {
                  icon: SearchCheck,
                  label: "Đã xử lý",
                  value: stats.paidCount,
                },
                {
                  icon: WalletCards,
                  label: "Tổng hiển thị",
                  value: `${stats.totalAmount.toLocaleString()}đ`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-white backdrop-blur-sm"
                >
                  <item.icon size={18} className="mb-2 text-sky-200" />

                  <p className="truncate text-xl font-semibold leading-none sm:text-2xl">
                    {item.value}
                  </p>

                  <p className="mt-2 text-xs text-sky-100">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto -mt-5 max-w-[1160px] px-4 pb-8 sm:px-5">
        {/* FILTER */}
        <section className="mb-5 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
                <Filter size={21} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Bộ lọc lịch sân
                </h2>

                <p className="text-sm text-slate-500">
                  Đang xem:{" "}
                  <span className="font-medium text-sky-700">
                    {activeTabLabel}
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="group inline-flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600"
            >
              <RotateCcw
                size={15}
                className="transition-transform duration-300 group-hover:rotate-180"
              />
              Xóa bộ lọc
            </button>
          </div>

          <div className="space-y-4 p-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setStatus(tab);
                    setPage(1);
                  }}
                  className={`shrink-0 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all ${
                    status === tab
                      ? "border-sky-300 bg-sky-50 text-sky-800 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                  }`}
                >
                  {STATUS_LABEL[tab]}
                </button>
              ))}
            </div>

            <div className="max-w-sm">
              <label className="mb-2 block text-[13px] font-medium text-slate-600">
                Lọc theo ngày chơi
              </label>

              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(event) => {
                    setDate(event.target.value);
                    setPage(1);
                  }}
                  className={`${inputClass} pl-11`}
                />

                <Calendar
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* BOOKING LIST BLOCK */}
        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
          {/* HEADER DANH SÁCH */}
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
                <ClipboardList size={21} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Danh sách lịch sân
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Xem chi nhánh, sân, khung giờ và trạng thái thanh toán.
                </p>
              </div>
            </div>

            <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500">
              {pagination?.total || bookings.length} kết quả
            </span>
          </div>

          {/* BODY DANH SÁCH */}
          <div className="bg-slate-50/70 p-4">
            {bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                <div className="mb-4 rounded-3xl bg-sky-50 p-4 text-sky-600">
                  <CalendarDays size={36} />
                </div>

                <p className="text-lg font-semibold text-slate-800">
                  Chưa có lịch đặt sân phù hợp
                </p>

                <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                  Hãy thử đổi bộ lọc hoặc đặt một lịch sân mới.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {bookings.map((booking) => {
                  const details = booking.details || [];
                  const isMonthlyBooking = details.length > 1;
                  const firstDetail = details[0];
                  const visibleDetails = details.slice(0, 6);
                  const hiddenDetailCount = Math.max(
                    0,
                    details.length - visibleDetails.length,
                  );
                  const courtNames = [
                    ...new Set(
                      details.map((detail) => detail.courtName).filter(Boolean),
                    ),
                  ];
                  const primaryCourtName =
                    courtNames.length === 1
                      ? courtNames[0]
                      : `${courtNames.length} sân`;
                  const dateRange =
                    details.length > 1
                      ? `${details[0].playDate} - ${
                          details[details.length - 1].playDate
                        }`
                      : firstDetail?.playDate || "--";

                  return (
                    <article
                      key={booking.bookingId}
                      className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md ${
                        isMonthlyBooking ? "border-sky-100" : "border-slate-200"
                      }`}
                    >
                      {/* HEADER LỊCH */}
                      <div className="border-b border-slate-100 bg-white p-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="min-w-0">
                            <div className="mb-3 flex items-center gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
                                <CalendarDays size={20} />
                              </div>

                              <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                  Mã lịch sân
                                </p>

                                <p className="mt-1 font-mono text-lg font-semibold text-sky-700">
                                  {formatBookingCode(
                                    booking.bookingId,
                                    booking.createdAt,
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-medium ${
                                  STATUS_CLASS[booking.bookingStatus] ||
                                  STATUS_CLASS.PENDING
                                }`}
                              >
                                {STATUS_LABEL[booking.bookingStatus] ||
                                  booking.bookingStatus}
                              </span>

                              <span
                                className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-medium ${
                                  PAYMENT_STATUS_CLASS[
                                    booking.payment?.status || "UNPAID"
                                  ] || PAYMENT_STATUS_CLASS.UNPAID
                                }`}
                              >
                                {PAYMENT_LABEL[
                                  booking.payment?.status || "UNPAID"
                                ] ||
                                  booking.payment?.status ||
                                  "--"}
                              </span>
                            </div>
                          </div>

                          <div className="w-full lg:w-[340px] lg:justify-self-end">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm text-center">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                                  Thanh toán
                                </p>

                                <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                                  {PAYMENT_LABEL[
                                    booking.payment?.method || "COD"
                                  ] ||
                                    booking.payment?.method ||
                                    "Thanh toán tại sân"}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                                  Tổng tiền
                                </p>

                                <p className="mt-1 text-lg font-semibold leading-none text-sky-700">
                                  {Number(booking.totalAmount).toLocaleString()}
                                  đ
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* BODY LỊCH */}
                      <div className="bg-gradient-to-br from-sky-50/35 via-white to-slate-50/80 p-4">
                        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                          {/* LEFT INFO */}
                          <div className="min-w-0">
                            {/* BRANCH */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="flex min-w-0 items-start gap-3">
                                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-100/80 text-sky-600">
                                  <MapPin size={18} />
                                </div>

                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-800">
                                    {booking.branch.branchName}
                                  </p>

                                  <p className="mt-1 text-sm text-slate-500">
                                    {[
                                      booking.branch.address,
                                      booking.branch.wardName,
                                      booking.branch.districtName,
                                      booking.branch.provinceName,
                                    ]
                                      .filter(Boolean)
                                      .join(", ")}
                                  </p>
                                </div>
                              </div>

                              {isMonthlyBooking && (
                                <span className="inline-flex w-fit shrink-0 items-center rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700">
                                  Lịch tháng
                                </span>
                              )}
                            </div>

                            {/* DETAILS */}
                            <div className="mt-5 border-t border-slate-200 pt-4">
                              {isMonthlyBooking ? (
                                <div className="space-y-3">
                                  <div className="grid gap-3 text-sm sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                                    <p className="font-semibold text-slate-800">
                                      {primaryCourtName || "--"}
                                    </p>

                                    <p className="flex items-center gap-2 text-slate-600">
                                      <Clock size={15} />
                                      {firstDetail?.startTime || "--"} -{" "}
                                      {firstDetail?.endTime || "--"}
                                    </p>

                                    <p className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                      {details.length} buổi
                                    </p>
                                  </div>

                                  <p className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                    <CalendarDays size={15} />
                                    {dateRange}
                                  </p>

                                  <div className="flex flex-wrap gap-2">
                                    {visibleDetails.map((detail, index) => (
                                      <span
                                        key={`${booking.bookingId}-${index}`}
                                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
                                      >
                                        {detail.playDate}
                                      </span>
                                    ))}

                                    {hiddenDetailCount > 0 && (
                                      <span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700">
                                        +{hiddenDetailCount} buổi
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="grid gap-3 sm:grid-cols-3">
                                  <p className="font-semibold text-slate-800">
                                    {firstDetail?.courtName || "--"}
                                  </p>

                                  <p className="flex items-center gap-2 text-sm text-slate-600">
                                    <CalendarDays size={15} />
                                    {firstDetail?.playDate || "--"}
                                  </p>

                                  <p className="flex items-center gap-2 text-sm text-slate-600">
                                    <Clock size={15} />
                                    {firstDetail?.startTime || "--"} -{" "}
                                    {firstDetail?.endTime || "--"}
                                  </p>
                                </div>
                              )}
                            </div>

                            {(canCancelBooking(booking) ||
                              booking.cancelRejectReason ||
                              (!canCancelBooking(booking) &&
                                booking.cancelReason)) && (
                              <div className="mt-4 border-t border-slate-200 pt-4">
                                {canCancelBooking(booking) ? (
                                  <button
                                    type="button"
                                    onClick={() => handleCancelBooking(booking)}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50"
                                  >
                                    <XCircle size={15} />
                                    Hủy lịch sân
                                  </button>
                                ) : (
                                  <div className="inline-block max-w-xl rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600">
                                    {booking.cancelRejectReason && (
                                      <p title={booking.cancelRejectReason}>
                                        <span className="font-semibold text-red-600">
                                          Từ chối hủy:
                                        </span>{" "}
                                        {booking.cancelRejectReason}
                                      </p>
                                    )}

                                    {booking.cancelReason && (
                                      <p title={booking.cancelReason}>
                                        <span className="font-semibold text-red-600">
                                          Lý do hủy:
                                        </span>{" "}
                                        {booking.cancelReason}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* PAYMENT */}
                          <div className="border-t border-sky-100/70 pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                              Thanh toán
                            </p>

                            <p className="mt-2 text-2xl font-semibold text-sky-700">
                              {Number(booking.totalAmount).toLocaleString()}đ
                            </p>

                            <p className="mt-3 text-sm text-slate-600">
                              {PAYMENT_LABEL[
                                booking.payment?.status || "PENDING"
                              ] ||
                                booking.payment?.status ||
                                "Chờ thanh toán"}
                            </p>

                            <p className="mt-3 text-xs text-slate-500">
                              Tạo lúc{" "}
                              {new Date(booking.createdAt).toLocaleDateString(
                                "vi-VN",
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="mt-5">
              <PaginatedItems
                total={pagination?.total || 0}
                limit={pagination?.limit || 5}
                page={page}
                onPageChange={setPage}
              />
            </div>
          </div>
        </section>
      </main>

      <CancelBookingModal
        booking={selectedBooking}
        isOpen={isCancelModalOpen}
        onClose={handleCancelModalClose}
        onSuccess={handleCancelSuccess}
      />
    </div>
  );
};

export default BookingPage;
