import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  CreditCard,
  MapPin,
  ReceiptText,
  RefreshCw,
  Search,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type {
  BookingStatus,
  EmployeeBooking,
  EmployeeBookingSummary,
} from "../../types/booking";
import { formatBookingCode, formatTimeRange } from "../../utils/booking";
import bookingService from "../../services/manager/bookingService";
import {
  ManagerEmptyState,
  ManagerPageHeader,
  managerInputClass,
} from "../../components/commons/manager/ManagerPage";
import TablePagination from "../../components/ui/user/pagination/TablePagination";

const LIMIT = 10;

const BOOKING_TABS: { value: BookingStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "CHECKED_IN", label: "Đã nhận sân" },
  { value: "CANCEL_REQUESTED", label: "Yêu cầu hủy" },
  { value: "COMPLETED", label: "Hoàn tất" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "FAILED", label: "Thất bại" },
];

const BOOKING_LABEL: Record<BookingStatus, string> = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Đã nhận sân",
  CANCEL_REQUESTED: "Yêu cầu hủy",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
  FAILED: "Thất bại",
};

const statusClass: Record<BookingStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  CONFIRMED: "border-sky-200 bg-sky-50 text-sky-700",
  CHECKED_IN: "border-indigo-200 bg-indigo-50 text-indigo-700",
  CANCEL_REQUESTED: "border-orange-200 bg-orange-50 text-orange-700",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CANCELLED: "border-slate-200 bg-slate-100 text-slate-700",
  FAILED: "border-red-200 bg-red-50 text-red-700",
};

const PAYMENT_LABEL: Record<string, string> = {
  COD: "Thanh toán tại sân",
  CASH: "Tiền mặt",
  BANK: "Chuyển khoản",
  VNPAY: "VNPay",
  WALLET: "Ví B-Hub",
  UNPAID: "Chưa thanh toán",
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  PARTIALLY_REFUNDED: "Hoàn tiền một phần",
  REFUNDED: "Đã hoàn tiền",
  FAILED: "Thất bại",
};

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

const getToday = () =>
  new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

const getFirstDetail = (booking?: EmployeeBooking | null) =>
  [...(booking?.details || [])].sort((a, b) =>
    `${a.playDate} ${a.startTime}`.localeCompare(
      `${b.playDate} ${b.startTime}`,
    ),
  )[0];

const BookingSchedulePage = () => {
  const [bookings, setBookings] = useState<EmployeeBooking[]>([]);
  const [selectedBooking, setSelectedBooking] =
    useState<EmployeeBooking | null>(null);
  const [summary, setSummary] = useState<EmployeeBookingSummary>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: LIMIT,
    total: 0,
    totalPages: 0,
  });
  const [status, setStatus] = useState<BookingStatus | "ALL">("ALL");
  const [keyword, setKeyword] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const totalVisibleAmount = useMemo(
    () =>
      bookings.reduce(
        (sum, booking) => sum + Number(booking.totalAmount || 0),
        0,
      ),
    [bookings],
  );

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getBookingsService({
        status,
        keyword: keyword.trim() || undefined,
        date: date || undefined,
        page,
        limit: LIMIT,
      });
      setBookings(res.data.data.items);
      setSummary(res.data.data.summary);
      setPagination(res.data.data.pagination);
      if (!selectedBooking && res.data.data.items[0]) {
        fetchBookingDetail(res.data.data.items[0].id);
      }
      if (
        selectedBooking &&
        !res.data.data.items.some((item) => item.id === selectedBooking.id)
      ) {
        setSelectedBooking(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingDetail = async (bookingId: number) => {
    setDetailLoading(true);
    try {
      const res = await bookingService.getBookingDetailService(bookingId);
      setSelectedBooking(res.data.data);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchBookings, 300);
    return () => window.clearTimeout(timer);
  }, [status, keyword, date, page]);

  useEffect(() => {
    setPage(1);
  }, [status, keyword, date]);

  const getTabCount = (value: BookingStatus | "ALL") => {
    if (value === "ALL") return pagination.total || 0;
    return summary[value] || 0;
  };

  return (
    <div className="space-y-6">
      <ManagerPageHeader
        eyebrow="Manager bookings"
        title="Quản lý lịch sân"
        description="Theo dõi lịch đặt sân theo trạng thái và xem nhanh chi tiết từng lịch."
        metrics={[
          { label: "Tổng lịch", value: pagination.total },
          {
            label: "Giá trị đang xem",
            value: formatCurrency(totalVisibleAmount),
          },
        ]}
      />

      <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-3 border-b border-slate-100 bg-slate-50/70 p-4 lg:grid-cols-[minmax(0,1fr)_190px_auto] lg:items-end">
          <label>
            <span className="mb-1 block text-xs font-medium text-slate-600">
              Tìm kiếm
            </span>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Mã lịch, username, email, SĐT..."
                className={`w-full pl-8 ${managerInputClass}`}
              />
            </div>
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-slate-600">
              Ngày chơi
            </span>
            <input
              type="date"
              value={date}
              max={getToday()}
              onChange={(event) => setDate(event.target.value)}
              className={`w-full ${managerInputClass}`}
            />
          </label>
          <button
            type="button"
            onClick={fetchBookings}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Làm mới
          </button>
        </div>

        <div className="px-4 py-3">
          <div className="flex flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-inner shadow-slate-100">
          {BOOKING_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatus(tab.value)}
              className={`group shrink-0 rounded-xl border px-3.5 py-2 text-[13px] font-bold transition-all duration-200 ${
                status === tab.value
                  ? "border-sky-600 bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-md shadow-sky-100"
                  : "border-transparent text-slate-500 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 rounded-full px-1.5 py-0.5 text-[11px] font-bold transition ${
                  status === tab.value
                    ? "bg-white/20 text-white"
                    : "bg-white text-sky-700 ring-1 ring-sky-100 group-hover:bg-white"
                }`}
              >
                {getTabCount(tab.value)}
              </span>
            </button>
          ))}
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:h-[calc(100dvh-330px)] xl:min-h-[560px] xl:grid-cols-[420px_minmax(0,1fr)] xl:items-stretch">
        <section
          className="flex min-h-[560px] flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm xl:h-full xl:min-h-0"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Danh sách lịch
              </h2>
              <p className="text-xs font-medium text-slate-500">
                {pagination.total} lịch phù hợp
              </p>
            </div>
            {loading ? (
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">
                Đang tải
              </span>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4">
            {bookings.length ? (
              bookings.map((booking) => {
                const firstDetail = getFirstDetail(booking);
                return (
                  <button
                    key={booking.id}
                    type="button"
                    onClick={() => fetchBookingDetail(booking.id)}
                    className={`w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 ${
                      selectedBooking?.id === booking.id
                        ? "border-sky-400 ring-2 ring-sky-100"
                        : "border-slate-200 hover:border-sky-200"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-sm font-bold text-sky-700">
                        {formatBookingCode(booking.id, booking.createdAt)}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-1 text-[11px] font-bold ${
                          statusClass[booking.bookingStatus]
                        }`}
                      >
                        {BOOKING_LABEL[booking.bookingStatus]}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-600">
                      <p className="font-semibold text-slate-800">
                        {booking.customer?.fullName ||
                          booking.user?.username ||
                          "Khách"}
                      </p>
                      <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <Clock3 className="h-3.5 w-3.5 text-sky-500" />
                        {firstDetail
                          ? `${formatDate(firstDetail.playDate)} · ${formatTimeRange(
                              firstDetail.startTime,
                              firstDetail.endTime,
                            )}`
                          : "Chưa có khung giờ"}
                      </p>
                      <p className="font-bold text-slate-900">
                        {formatCurrency(booking.totalAmount)}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <ManagerEmptyState
                icon={ReceiptText}
                title="Chưa có lịch phù hợp"
                description="Thử đổi trạng thái, ngày hoặc từ khóa tìm kiếm để xem lịch khác."
              />
            )}
          </div>

          <TablePagination
            page={page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            onPage={setPage}
            unit="lịch"
            alwaysShow
            compact
          />
        </section>

        <section className="min-h-[560px] overflow-y-auto rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm xl:h-full xl:min-h-0">
          {selectedBooking ? (
            <BookingDetailPanel
              booking={selectedBooking}
              detailLoading={detailLoading}
            />
          ) : (
            <ManagerEmptyState
              icon={CalendarDays}
              title="Chọn một lịch đặt sân"
              description="Chi tiết khách hàng, sân, thanh toán và trạng thái sẽ hiển thị tại đây."
            />
          )}
        </section>
      </div>
    </div>
  );
};

const BookingDetailPanel = ({
  booking,
  detailLoading,
}: {
  booking: EmployeeBooking;
  detailLoading: boolean;
}) => (
  <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-5">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-2xl font-bold text-sky-700">
            {formatBookingCode(booking.id, booking.createdAt)}
          </h2>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-bold ${
              statusClass[booking.bookingStatus]
            }`}
          >
            {BOOKING_LABEL[booking.bookingStatus]}
          </span>
        </div>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Tạo lúc {formatDateTime(booking.createdAt)}
        </p>
        {detailLoading ? (
          <p className="mt-1 text-xs font-semibold text-sky-600">
            Đang cập nhật chi tiết...
          </p>
        ) : null}
      </div>
      <div className="text-left lg:text-right">
        <p className="text-xs font-semibold text-slate-500">Tổng thanh toán</p>
        <p className="text-2xl font-bold text-slate-900">
          {formatCurrency(booking.totalAmount)}
        </p>
      </div>
    </div>

    <div className="grid gap-4 lg:grid-cols-2">
      <InfoPanel icon={UserRound} title="Khách hàng">
        <InfoRow
          label="Tên khách"
          value={booking.customer?.fullName || booking.user?.username || "--"}
        />
        <InfoRow label="Email" value={booking.user?.email || "--"} />
        <InfoRow
          label="Số điện thoại"
          value={booking.customer?.phoneNumber || "--"}
        />
      </InfoPanel>

      <InfoPanel icon={CreditCard} title="Thanh toán">
        <InfoRow
          label="Phương thức"
          value={PAYMENT_LABEL[booking.payment?.paymentMethod || ""] || "--"}
        />
        <InfoRow
          label="Trạng thái"
          value={PAYMENT_LABEL[booking.payment?.paymentStatus || ""] || "--"}
        />
        <InfoRow
          label="Đã thanh toán"
          value={formatCurrency(booking.payment?.paymentAmount || 0)}
        />
      </InfoPanel>
    </div>

    <InfoPanel icon={MapPin} title="Chi nhánh">
      <InfoRow
        label="Tên chi nhánh"
        value={booking.branch?.branchName || "--"}
      />
      <InfoRow
        label="Địa chỉ"
        value={
          booking.branch
            ? `${booking.branch.address}, ${booking.branch.districtName}, ${booking.branch.provinceName}`
            : "--"
        }
      />
      <InfoRow label="Điện thoại" value={booking.branch?.phoneNumber || "--"} />
    </InfoPanel>

    <InfoPanel icon={Clock3} title="Khung giờ sân">
      <div className="space-y-3">
        {booking.details.map((detail) => (
          <div
            key={detail.id}
            className="rounded-xl border border-slate-200 bg-white px-3 py-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold text-slate-900">
                {detail.courtName || `Sân #${detail.courtId}`}
              </p>
              <p className="font-bold text-sky-700">
                {formatCurrency(detail.price)}
              </p>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {formatDate(detail.playDate)} ·{" "}
              {formatTimeRange(detail.startTime, detail.endTime)}
            </p>
          </div>
        ))}
      </div>
    </InfoPanel>

    {(booking.cancelReason || booking.cancelRejectReason || booking.note) && (
      <InfoPanel icon={ReceiptText} title="Ghi chú">
        <InfoRow label="Ghi chú" value={booking.note || "--"} />
        <InfoRow label="Lý do hủy" value={booking.cancelReason || "--"} />
        <InfoRow
          label="Lý do từ chối hủy"
          value={booking.cancelRejectReason || "--"}
        />
      </InfoPanel>
    )}
  </div>
);

const InfoPanel = ({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) => (
  <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
        <Icon className="h-4 w-4" />
      </span>
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
    </div>
    <div className="space-y-2.5">{children}</div>
  </section>
);

const InfoRow = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-100">
    <p className="text-xs font-semibold text-slate-500">{label}</p>
    <p className="mt-1 break-words text-sm font-semibold text-slate-800">
      {value}
    </p>
  </div>
);

export default BookingSchedulePage;
