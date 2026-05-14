import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CalendarDays,
  Clock,
  Filter,
  MapPin,
  ReceiptText,
  RotateCcw,
  SearchCheck,
  WalletCards,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { getMyBookings } from "../../redux/slices/user/bookingSlice";

const STATUS_LABEL: Record<string, string> = {
  ALL: "Tất cả",
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  PAID: "Đã thanh toán",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  CONFIRMED: "bg-sky-50 text-sky-700 ring-1 ring-sky-100",
  PAID: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  COMPLETED: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  CANCELLED: "bg-red-50 text-red-600 ring-1 ring-red-100",
};

const PAYMENT_LABEL: Record<string, string> = {
  COD: "Thanh toán tại sân",
  VNPAY: "VNPay",
  WALLET: "Ví B-Hub",
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thất bại",
};

const TABS = ["ALL", "PENDING", "PAID", "CONFIRMED", "COMPLETED", "CANCELLED"];

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all hover:border-sky-200 hover:bg-white focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100";

const BookingPage = () => {
  const dispatch = useAppDispatch();
  const { bookings, pagination } = useAppSelector((state) => state.booking);
  const [status, setStatus] = useState("ALL");
  const [date, setDate] = useState("");

  useEffect(() => {
    dispatch(
      getMyBookings({
        data: {
          page: 1,
          limit: 20,
          status: status === "ALL" ? undefined : status,
          date: date || undefined,
        },
      }),
    );
  }, [dispatch, status, date]);

  const stats = useMemo(() => {
    const totalAmount = bookings.reduce(
      (sum, item) => sum + Number(item.totalAmount || 0),
      0,
    );
    const paidCount = bookings.filter((item) =>
      ["PAID", "CONFIRMED", "COMPLETED"].includes(item.bookingStatus),
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
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <section className="relative overflow-hidden bg-sky-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_32%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-sky-100">
                <CalendarDays size={16} className="text-sky-300" />
                Trung tâm lịch sân
              </div>

              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
                Lịch đặt sân của tôi
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-sky-100 sm:text-lg">
                Theo dõi lịch đã đặt, trạng thái xử lý và phương thức thanh
                toán cho từng buổi chơi tại B-Hub.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:min-w-[420px]">
              {[
                { icon: ReceiptText, label: "Lịch đặt", value: stats.count },
                { icon: SearchCheck, label: "Đã xử lý", value: stats.paidCount },
                {
                  icon: WalletCards,
                  label: "Tổng hiển thị",
                  value: `${stats.totalAmount.toLocaleString()}đ`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/10 px-3 py-4 text-white backdrop-blur-sm sm:px-4"
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

      <main className="relative z-10 mx-auto -mt-6 max-w-[1220px] px-4 pb-10 sm:px-6">
        <section className="mb-6 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
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

          <div className="space-y-5 p-5">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatus(tab)}
                  className={`shrink-0 rounded-2xl border px-4 py-2.5 text-sm font-medium transition-all ${
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
                  onChange={(event) => setDate(event.target.value)}
                  className={`${inputClass} pl-11`}
                />
                <Calendar
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                Danh sách lịch sân
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Xem chi nhánh, sân, khung giờ và trạng thái thanh toán.
              </p>
            </div>
            <span className="w-fit rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-500">
              {pagination?.total || bookings.length} kết quả
            </span>
          </div>

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
              {bookings.map((booking) => (
                <article
                  key={booking.bookingId}
                  className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50/40"
                >
                  <div className="border-b border-slate-100 bg-white p-5">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="mb-3 flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
                            <CalendarDays size={20} />
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              Mã lịch sân
                            </p>
                            <p className="text-lg font-semibold text-slate-800">
                              BK#{booking.bookingId}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-medium ${
                            STATUS_CLASS[booking.bookingStatus] ||
                            STATUS_CLASS.PENDING
                          }`}
                        >
                          {STATUS_LABEL[booking.bookingStatus] ||
                            booking.bookingStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center sm:min-w-[360px]">
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
                          <p className="text-[11px] font-medium uppercase text-slate-400">
                            Phương thức
                          </p>
                          <p className="mt-1 truncate text-sm font-medium text-slate-700">
                            {PAYMENT_LABEL[booking.payment?.method || "COD"] ||
                              booking.payment?.method ||
                              "Thanh toán tại sân"}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-sky-100 bg-sky-50 px-3 py-3">
                          <p className="text-[11px] font-medium uppercase text-sky-500">
                            Tổng tiền
                          </p>
                          <p className="mt-1 text-sm font-semibold text-sky-700">
                            {Number(booking.totalAmount).toLocaleString()}đ
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 bg-slate-50/80 p-4 md:grid-cols-[minmax(0,1fr)_220px]">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4">
                        <MapPin size={18} className="mt-0.5 text-sky-600" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800">
                            {booking.branch.branchName}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {booking.branch.address}
                          </p>
                        </div>
                      </div>

                      {booking.details.map((detail, index) => (
                        <div
                          key={`${booking.bookingId}-${index}`}
                          className="grid gap-3 rounded-2xl border border-slate-100 bg-white p-4 sm:grid-cols-3"
                        >
                          <p className="font-semibold text-slate-800">
                            {detail.courtName}
                          </p>
                          <p className="flex items-center gap-2 text-sm text-slate-600">
                            <CalendarDays size={15} />
                            {detail.playDate}
                          </p>
                          <p className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock size={15} />
                            {detail.startTime} - {detail.endTime}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-sky-100 bg-white p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Thanh toán
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-sky-700">
                        {Number(booking.totalAmount).toLocaleString()}đ
                      </p>
                      <p className="mt-3 text-sm text-slate-600">
                        {PAYMENT_LABEL[booking.payment?.status || "PENDING"] ||
                          booking.payment?.status ||
                          "Chờ thanh toán"}
                      </p>
                      <p className="mt-3 text-xs text-slate-500">
                        Tạo lúc{" "}
                        {new Date(booking.createdDate).toLocaleDateString(
                          "vi-VN",
                        )}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default BookingPage;
