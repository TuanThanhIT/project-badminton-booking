import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { toast } from "react-toastify";
import {
  Loader2,
  Package,
  CalendarClock,
  DollarSign,
  XCircle,
  CreditCard,
  MapPin,
  Calendar1,
} from "lucide-react";

import type { ApiErrorType } from "../../types/error";
import type { MomoPaymentRequest } from "../../types/order";
import momoService from "../../services/customer/momoService";
import {
  cancelBooking,
  clearBookingsError,
  getBookings,
} from "../../store/slices/customer/bookingSlice";
import type {
  BookingCancelRequest,
  BookingResponse,
} from "../../types/booking";
import CancelForm from "../../components/ui/customer+employee/CancelForm";

const statusColor = {
  Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Paid: "bg-blue-50 text-blue-700 border-blue-200",
  Confirmed: "bg-purple-50 text-purple-700 border-purple-200",
} as const;

type ActiveStatus = keyof typeof statusColor;

const statusLabelVN: Record<ActiveStatus | "All", string> = {
  All: "Tất cả",
  Pending: "Đang chờ",
  Paid: "Đã thanh toán",
  Confirmed: "Đã xác nhận",
};

const BookingPage = () => {
  const dispatch = useAppDispatch();
  const { bookings, loading, error } = useAppSelector((s) => s.booking);

  const [filterStatus, setFilterStatus] = useState<ActiveStatus | "All">("All");
  const [openCancel, setOpenCancel] = useState(false);
  const [bookingId, setBookingId] = useState<number>(0);

  useEffect(() => {
    dispatch(getBookings());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearBookingsError());
    }
  }, [error, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-white">
        <Loader2 className="w-10 h-10 text-sky-600 animate-spin mb-3" />
        <p className="text-gray-600 font-medium">Đang tải lịch đặt sân...</p>
      </div>
    );
  }

  const activeBookings = bookings.filter((b) =>
    ["Pending", "Paid", "Confirmed"].includes(b.bookingStatus)
  );

  const filteredBookings =
    filterStatus === "All"
      ? activeBookings
      : activeBookings.filter((b) => b.bookingStatus === filterStatus);

  const handlePaymentAgain = async (bookingId: number, totalAmount: number) => {
    try {
      const momoBookingId = `${bookingId}_${Date.now()}`;
      const data: MomoPaymentRequest = {
        entityId: momoBookingId,
        amount: totalAmount,
        orderInfo: `Thanh toán đơn đặt sân #${bookingId}`,
        type: "booking",
      };
      const res = await momoService.createMoMoPaymentService(data);
      if (res.data.payUrl) {
        window.location.href = res.data.payUrl;
      } else toast.error("Không tạo được đường dẫn thanh toán Momo");
    } catch (error: any) {
      const apiError = error as ApiErrorType;
      toast.error(apiError.userMessage || "Tạo thanh toán Momo thất bại");
    }
  };

  const renderBookingCard = (booking: BookingResponse, index: number) => {
    const statusStyle = {
      Pending:
        "bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1",
      Paid: "bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1",
      Confirmed:
        "bg-orange-50 text-orange-700 border-orange-200 flex items-center gap-1",
    } as const;

    return (
      <div
        key={booking.id || index}
        className="relative border-l-2 border-sky-100 pl-6 mb-8"
      >
        {/* Chấm trạng thái */}
        <div
          className={`absolute -left-[10px] top-2 w-5 h-5 rounded-full ring-4 ring-white shadow-sm ${
            booking.bookingStatus === "Pending"
              ? "bg-yellow-500"
              : booking.bookingStatus === "Paid"
              ? "bg-blue-500"
              : "bg-orange-500"
          }`}
        />

        {/* Card chính */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 mb-6">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-start mb-4">
            <div className="flex-1 min-w-[200px]">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Calendar1 className="w-5 h-5 text-sky-600" />
                Lịch đặt sân #{String(booking.id).padStart(3, "0")}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <CalendarClock className="w-4 h-4 text-sky-600" />
                <span>
                  {new Date(booking.createdDate).toLocaleString("vi-VN")}
                </span>
              </div>
            </div>

            <div
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
                statusStyle[booking.bookingStatus as keyof typeof statusStyle]
              }`}
            >
              {
                statusLabelVN[
                  booking.bookingStatus as keyof typeof statusLabelVN
                ]
              }
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
          <div className="w-full mt-4 text-sm text-gray-700 space-y-4">
            {/* Tổng tiền (để hẳn bên trái, một hàng riêng) */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-4 h-4 text-sky-600" />
                <span>Thanh toán:</span>
                <span className="font-medium">
                  {booking.paymentBooking.paymentMethod}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sky-700 font-bold text-xl">
                <DollarSign className="w-5 h-5" />
                <span>{booking.totalAmount.toLocaleString("vi-VN")}₫</span>
              </div>
            </div>

            {/* Ghi chú full width */}
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-700">
              <span className="font-medium">Ghi chú:</span>{" "}
              {booking.note || "không có ghi chú nào"}
            </div>

            {/* Các nút bên phải */}
            <div className="flex justify-end items-center gap-3">
              {booking.paymentBooking.paymentMethod === "Momo" &&
                booking.bookingStatus === "Pending" && (
                  <button
                    onClick={() =>
                      handlePaymentAgain(booking.id, booking.totalAmount)
                    }
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 shadow-sm text-sm font-medium"
                  >
                    <CreditCard size={16} />
                    Thanh toán
                  </button>
                )}

              {(booking.bookingStatus === "Pending" ||
                booking.bookingStatus === "Paid") && (
                <button
                  onClick={() => {
                    setBookingId(booking.id);
                    setOpenCancel(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 shadow-sm text-sm font-medium"
                >
                  <XCircle size={16} />
                  Hủy
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const onSubmit = async (dt: any) => {
    try {
      const data: BookingCancelRequest = {
        bookingId,
        cancelReason: dt.cancelReason,
      };
      const res = await dispatch(cancelBooking({ data })).unwrap();
      toast.success(res.message);
      await dispatch(getBookings());
      setOpenCancel(false);
    } catch (error) {
      // không xử lý lỗi nữa
    }
  };

  const renderFormCancel = () => (
    <CancelForm
      onSubmit={onSubmit}
      setOpenCancel={setOpenCancel}
      type="booking"
    />
  );

  return (
    <div className="min-h-screen bg-white p-10 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Package className="w-8 h-8 text-sky-700" />
          <h1 className="text-3xl font-bold text-sky-800">
            Lịch đặt sân của bạn
          </h1>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-3 mb-10">
          {(["All", "Pending", "Paid", "Confirmed"] as const).map((status) => {
            const count =
              status === "All"
                ? activeBookings.length
                : activeBookings.filter((o) => o.bookingStatus === status)
                    .length;

            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm border transition ${
                  filterStatus === status
                    ? "bg-sky-600 text-white border-sky-600 shadow"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-sky-50 hover:border-sky-200"
                }`}
              >
                {statusLabelVN[status]}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    filterStatus === status
                      ? "bg-white text-sky-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Booking list */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-6">
            {filteredBookings.map(renderBookingCard)}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">
              Không có lịch đặt sân
            </h3>
            <p className="text-sm text-gray-500">
              Hiện tại bạn chưa có lịch đặt sân nào cho trạng thái này.
            </p>
          </div>
        )}

        {openCancel && renderFormCancel()}
      </div>
    </div>
  );
};

export default BookingPage;
