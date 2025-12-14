import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import {
  CalendarClock,
  DollarSign,
  MapPin,
  Search,
  Calendar1,
  Calendar,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import type {
  BookingEplRequest,
  BookingEplResponse,
  CountBookingRequest,
} from "../../types/booking";
import {
  clearBookingsError,
  countBookingByStatus,
  getBookings,
} from "../../store/slices/employee/bookingSlice";

import PaginatedItems from "../../components/ui/customer+employee/PaginatedItems";
import NiceBarChart from "../../components/ui/admin/BarChart";

const TABS = [
  { key: "All", label: "Tất cả" },
  { key: "Pending", label: "Đang chờ" },
  { key: "Paid", label: "Đã thanh toán" },
  { key: "Confirmed", label: "Đã xác nhận" },
  { key: "Completed", label: "Hoàn thành" },
  { key: "Cancelled", label: "Đã hủy" },
] as const;

const STATUS_LABEL: Record<string, string> = {
  Pending: "Đang chờ",
  Paid: "Đã thanh toán",
  Confirmed: "Đã xác nhận",
  Completed: "Hoàn thành",
  Cancelled: "Đã hủy",
};

const statusCardColor: Record<string, string> = {
  Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Paid: "bg-blue-50 text-blue-700 border-blue-200",
  Confirmed: "bg-orange-50 text-orange-700 border-orange-200",
  Completed: "bg-green-50 text-green-700 border-green-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
};

const BookingPage = () => {
  const dispatch = useAppDispatch();
  const { bookings, loading, error, countBookings } = useAppSelector(
    (state) => state.bookingEpl
  );
  const [activeTab, setActiveTab] = useState("All");

  // State tìm kiếm và ngày
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [page, setPage] = useState(1);
  const limit = 5;

  useEffect(() => {
    const params: BookingEplRequest = {
      status: activeTab === "All" ? "" : activeTab,
      // Bạn sẽ gửi searchText và selectedDate cho backend nếu cần
      keyword: searchText,
      date: selectedDate,
      page,
      limit,
    };
    dispatch(getBookings({ data: params }));
  }, [activeTab, searchText, selectedDate, page, limit, dispatch]);

  useEffect(() => {
    const params: CountBookingRequest = {
      date: selectedDate,
    };
    dispatch(countBookingByStatus({ data: params }));
  }, [dispatch, selectedDate]);

  const filteredBookings =
    activeTab === "All"
      ? bookings?.bookings ?? []
      : bookings?.bookings?.filter((b) => b.bookingStatus === activeTab) ?? [];

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearBookingsError());
    }
  }, [error, dispatch]);

  const renderCard = (booking: BookingEplResponse, index: number) => {
    const status = booking.bookingStatus;

    return (
      <div
        key={booking.id || index}
        className="relative border-l-2 border-sky-100 pl-6 mb-8"
      >
        {/* Dot trạng thái */}
        <div
          className={`absolute -left-[10px] top-2 w-5 h-5 rounded-full ring-4 ring-white shadow-sm ${
            statusCardColor[status]?.includes("yellow")
              ? "bg-yellow-500"
              : statusCardColor[status]?.includes("blue")
              ? "bg-blue-500"
              : statusCardColor[status]?.includes("orange")
              ? "bg-orange-500"
              : statusCardColor[status]?.includes("green")
              ? "bg-green-500"
              : "bg-red-500"
          }`}
        />

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5">
          {/* Header */}
          <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Calendar1 className="w-5 h-5 text-sky-600" />
              Lịch đặt sân #{String(booking.id).padStart(3, "0")}
            </h3>
            <div
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${statusCardColor[status]}`}
            >
              {STATUS_LABEL[status]}
            </div>
          </div>

          {/* User info */}
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-700 mb-2">
              Thông tin người đặt
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                <span className="font-semibold">Họ tên:</span>{" "}
                {booking.user.Profile?.fullName}
              </div>
              <div>
                <span className="font-semibold">Username:</span>{" "}
                {booking.user.username}
              </div>
              <div>
                <span className="font-semibold">Địa chỉ:</span>{" "}
                {booking.user.Profile?.address}
              </div>
              <div>
                <span className="font-semibold">SĐT:</span>{" "}
                {booking.user.Profile?.phoneNumber}
              </div>
              <div className="flex items-center gap-1 mt-1 text-gray-500 text-sm">
                <CalendarClock className="w-4 h-4 text-sky-600" />
                <span>
                  {new Date(booking.createdDate).toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
          </div>

          {/* Thông tin sân */}
          <div className="flex items-start gap-4 mb-4">
            {/* Ảnh sân */}
            <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
              <img
                src={booking.court.thumbnailUrl}
                alt={booking.court.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thông tin */}
            <div className="flex-1 flex flex-col justify-start">
              {/* Tên sân */}
              <h4 className="font-semibold text-gray-900 text-lg mb-2 truncate">
                {booking.court.name}
              </h4>

              {/* Ngày (basic) */}
              <span className="inline-block px-2 py-1 text-gray-700 text-sm mb-2">
                <span className="font-bold">Ngày đặt:</span>{" "}
                {booking.court.date}
              </span>

              {/* Khung giờ */}
              <div className="flex flex-wrap gap-2">
                {booking.timeSlots.map((slot, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 border border-green-300 text-green-800 text-sm font-medium rounded-full"
                  >
                    {slot}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center text-sm text-gray-600 flex-wrap gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="w-4 h-4 text-sky-600" />
              <span>Thanh toán:</span>
              <span className="font-medium text-gray-800">
                {booking.paymentBooking.paymentMethod}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sky-700 font-bold text-lg">
              <DollarSign className="w-4 h-4" />
              <span>{booking.totalAmount.toLocaleString("vi-VN")}₫</span>
            </div>
          </div>

          {/* Note */}
          <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-700 text-sm mb-4">
            <span className="font-medium">Ghi chú:</span>{" "}
            {booking.note || "không có ghi chú nào"}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-14 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl border border-gray-200 p-10 space-y-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="inline-flex items-center gap-2 text-2xl font-bold text-sky-700 mb-8 relative">
            Quản lý lịch đặt sân
            <span className="absolute left-0 -bottom-3 w-1/2 h-1 bg-sky-400 rounded-sm"></span>
          </h1>
          {/* Search + Date */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            {/* Input tìm kiếm */}
            <div className="flex items-center gap-2 w-84 bg-white border border-gray-300 rounded-full px-4 py-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên hoặc SĐT khách hàng..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="flex-1 outline-none text-sm placeholder-gray-400"
              />
            </div>

            {/* Input ngày */}
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
              <label
                htmlFor="date"
                className="text-gray-600 text-sm font-medium"
              >
                Chọn ngày:
              </label>
              <input
                id="date"
                type="date"
                className="border-none focus:ring-0 focus:outline-none text-sm"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          {/* ===== CHART ===== */}
          <div className="mb-10">
            <NiceBarChart data={countBookings} date={selectedDate} />
          </div>

          {/* ===== SECTION HEADER ===== */}
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-5 mt-5">
            Danh sách lịch đặt sân
          </h2>

          {/* Tabs + Count */}
          <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
            {/* Tabs */}
            <div className="flex flex-wrap gap-3">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition flex items-center gap-2 ${
                    activeTab === t.key
                      ? "bg-sky-600 text-white border-sky-600 shadow"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-sky-50"
                  }`}
                >
                  <span>{STATUS_LABEL[t.key] || t.label}</span>
                </button>
              ))}
            </div>

            {/* Count badge */}
            <div className="px-3 py-1 border-2 border-sky-500 text-sky-600 rounded-full text-sm font-medium">
              {filteredBookings.length} lịch đặt
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-sky-600 animate-spin mb-3" />
              <p className="text-gray-600 font-medium">
                Đang tải lịch đặt sân...
              </p>
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="space-y-6">{filteredBookings.map(renderCard)}</div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-1">
                Không có lịch đặt sân
              </h3>
              <p className="text-sm text-gray-500">
                Hiện tại chưa có lịch đặt sân nào cho trạng thái này.
              </p>
            </div>
          )}
        </div>

        {bookings && bookings.total > limit && (
          <PaginatedItems
            total={bookings.total ?? 0}
            limit={bookings.limit ?? limit}
            page={bookings.page ?? 1}
            onPageChange={(newPage) => setPage(newPage)}
          />
        )}
      </div>
    </div>
  );
};

export default BookingPage;
