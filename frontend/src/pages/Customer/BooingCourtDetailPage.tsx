import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { toast } from "react-toastify";
import {
  clearCourtError,
  getCourtPrice,
  getCourtSchedule,
  setBookingAmountLocal,
  updateBookingAmountLocal,
} from "../../store/slices/customer/courtSlice";
import {
  Loader2,
  CreditCard,
  Smartphone,
  DollarSign,
  Check,
} from "lucide-react";
import type {
  CourtScheduleInfo,
  CourtScheduleResponse,
} from "../../types/court";
import {
  applyDiscountBooking,
  clearDiscountError,
  updateDiscountBooking,
} from "../../store/slices/customer/discountSlice";
import type { AddBookingRequest } from "../../types/booking";
import {
  addBooking,
  clearBookingsError,
} from "../../store/slices/customer/bookingSlice";
import type { ApiErrorType } from "../../types/error";
import type { MomoPaymentRequest } from "../../types/order";
import momoService from "../../services/Customer/momoService";
import {
  clearBookingFeedbackError,
  getBookingFeedback,
} from "../../store/slices/customer/bookingFeedbackSlice";
import ReviewList from "../../components/ui/customer+employee/ReviewList";
import Swal from "sweetalert2";

const BookingCourtDetailPage = () => {
  const { id } = useParams();
  const courtId = Number(id);
  const [searchParams] = useSearchParams();
  const date = searchParams.get("date") ?? "";
  const weekday = searchParams.get("weekday") ?? "";

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const courtLoading = useAppSelector((state) => state.court.loading);
  const courtSchedule = useAppSelector((state) => state.court.courtSchedule);
  const bookingAmount = useAppSelector((state) => state.court.bookingAmount);
  const discountError = useAppSelector((state) => state.discount.error);
  const courtError = useAppSelector((state) => state.court.error);
  const bookingError = useAppSelector((state) => state.booking.error);
  const bookingFeedbackLoading = useAppSelector(
    (state) => state.bookingFeedback.loading
  );
  const bookingFeedbackError = useAppSelector(
    (state) => state.bookingFeedback.error
  );
  const bookingFeedbacks = useAppSelector(
    (state) => state.bookingFeedback.bookingFeedbacks
  );

  const [selectedSlots, setSelectedSlots] = useState<CourtScheduleInfo[]>(
    () => {
      const arr = JSON.parse(
        localStorage.getItem(`selectedSlots_${courtId}`) || "[]"
      );
      return arr;
    }
  );
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "MOMO">("COD");
  const [code, setCode] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [checkApply, setCheckApply] = useState<boolean>(false);
  const [finalPrice, setFinalPrice] = useState<number>();

  useEffect(() => {
    const error =
      discountError || courtError || bookingFeedbackError || bookingError;
    if (error) {
      toast.error(error);
      if (courtError) {
        dispatch(clearCourtError());
      }
      if (discountError) {
        dispatch(clearDiscountError());
        setCode("");
      }
      if (bookingFeedbackError) {
        dispatch(clearBookingFeedbackError());
      }
      if (bookingError) {
        dispatch(clearBookingsError());
      }
    }
  }, [discountError, courtError, bookingFeedbackError, bookingError, dispatch]);

  useEffect(() => {
    const data = { courtId, date };
    dispatch(getCourtSchedule({ data }));
    dispatch(getCourtPrice());
  }, [dispatch, courtId, date]);

  useEffect(() => {
    const data = { courtId };
    dispatch(getBookingFeedback({ data }));
  }, [dispatch]);

  // Lấy booking amount ra nếu có và dispatch để cập nhật lại state.bookingAmount
  useEffect(() => {
    const savedAmount = localStorage.getItem(`bookingAmount_${courtId}`);
    const amount = Number(savedAmount);
    if (savedAmount) {
      dispatch(setBookingAmountLocal({ amount }));
    }
  }, [dispatch]);

  const toggleSlot = (slot: CourtScheduleInfo) => {
    if (!slot.isAvailable) return;

    let newSelectedSlots: CourtScheduleInfo[] = [];
    const exists = selectedSlots.some((x) => x.id === slot.id);

    if (exists) {
      newSelectedSlots = selectedSlots.filter((x) => x.id !== slot.id);
    } else {
      if (selectedSlots.length >= 3) {
        toast.error("Chỉ được chọn tối đa 3 khung giờ/sân/ngày!");
        return;
      }
      newSelectedSlots = [...selectedSlots, slot];
    }

    setSelectedSlots(newSelectedSlots);
    localStorage.setItem(
      `selectedSlots_${courtId}`,
      JSON.stringify(newSelectedSlots)
    );

    // Gửi luôn giá trị mới
    dispatch(
      updateBookingAmountLocal({
        selectedSlots: newSelectedSlots,
        weekday,
        courtId,
      })
    );
  };

  if (courtLoading || bookingFeedbackLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] text-sky-700">
        <Loader2 className="w-10 h-10 animate-spin mb-3" />
        <p className="text-lg font-semibold">Đang tải dữ liệu...</p>
      </div>
    );
  }

  const handleDiscount = async (code: string) => {
    try {
      if (bookingAmount === 0) {
        toast.error(
          "Vui lòng chọn khung giờ đặt sân trước khi áp mã giảm giá!"
        );
        return;
      }
      const res = await dispatch(
        applyDiscountBooking({ code, bookingAmount })
      ).unwrap();
      toast.success("Áp mã giảm giá sản phẩm thành công!");
      setFinalPrice(res.finalPrice);
      setCheckApply(true);
    } catch (error) {
      // lỗi đã xử lý cục bộ
    }
  };

  const handleCheckout = async () => {
    const result = await Swal.fire({
      title: "Xác nhận đặt sân",
      text: "Bạn có chắc chắn đặt sân với các khung giờ đã lựa chọn?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Chắc chắn",
      cancelButtonText: "Hủy",
    });
    if (result.isConfirmed) {
      if (checkApply && code) {
        await dispatch(updateDiscountBooking({ code }));
      }

      const bookingDetails =
        selectedSlots.map((slot) => ({
          courtScheduleId: slot.id,
        })) || [];

      const bookingData: AddBookingRequest = {
        bookingStatus: "Pending",
        totalAmount: finalPrice ?? bookingAmount,
        code,
        note,
        bookingDetails,
        paymentAmount: finalPrice ?? bookingAmount,
        paymentMethod,
        paymentStatus: "Pending",
      };

      const resultAction = await dispatch(addBooking({ data: bookingData }));

      if (addBooking.fulfilled.match(resultAction)) {
        const bookingId = resultAction.payload.bookingId;
        if (paymentMethod === "COD") {
          toast.success(resultAction.payload.message);
          setTimeout(() => navigate("/booking/success"), 2000);
        } else if (paymentMethod === "MOMO") {
          try {
            const momoBookingId = `${bookingId}_${Date.now()}`;
            const data: MomoPaymentRequest = {
              entityId: momoBookingId,
              amount: bookingData.paymentAmount,
              orderInfo: `Thanh toán đơn đặt sân #${bookingId}`,
              type: "booking",
            };
            const res = await momoService.createMoMoPaymentService(data);
            if (res.data.payUrl) {
              window.location.href = res.data.payUrl;
            } else {
              toast.error("Không tạo được đường dẫn thanh toán Momo");
            }
          } catch (error: any) {
            const apiError = error as ApiErrorType;
            toast.error(apiError.userMessage || "Tạo thanh toán Momo thất bại");
          }
        }
      }
    }
  };

  const court = courtSchedule as CourtScheduleResponse | undefined;

  return (
    <div className="p-4 grid grid-cols-7 gap-4">
      {/* LEFT 70% */}
      <div className="col-span-5 space-y-6 rounded-lg">
        {/* Court Info */}
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start bg-white p-4">
          {/* Ảnh sân */}
          <div className="relative">
            <img
              src={court?.thumbnailUrl}
              className="w-40 h-40 md:w-48 md:h-48 object-cover rounded-2xl shadow-xl border border-gray-100"
            />
          </div>

          {/* Thông tin sân */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-sky-700 drop-shadow-md">
              {court?.name}
            </h1>
            <p className="flex items-center text-gray-600 mt-3 text-sm md:text-base gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-sky-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13 21.314l-4.657-4.657a8 8 0 1111.314 0z"
                />
              </svg>
              {court?.location}
            </p>
            <p className="mt-2 text-gray-500 text-sm md:text-base">
              Chọn khung giờ, thanh toán trực tuyến hoặc trực tiếp tại sân.
            </p>
          </div>
        </div>

        {/* Time Slots */}
        <div className="bg-white p-4">
          <h3 className="text-xl font-semibold mb-3">Chọn khung giờ</h3>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {court?.courtSchedules.map((slot) => {
              const isSelected = selectedSlots.some((x) => x.id === slot.id);
              const disabled = !slot.isAvailable;

              return (
                <button
                  key={slot.id}
                  onClick={() => toggleSlot(slot)}
                  disabled={disabled}
                  className={`
    relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 transform
    ${
      disabled
        ? "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
        : "hover:scale-105 hover:border-green-500"
    }
    ${
      isSelected
        ? "bg-green-300 text-green-900 border-green-500 font-semibold"
        : !disabled
        ? "bg-white text-gray-700 border-gray-200"
        : ""
    }
  `}
                >
                  <span className="font-medium mb-1">
                    {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                  </span>

                  <span
                    className={`
      text-xs font-semibold px-3 py-1 rounded-full
      ${
        isSelected
          ? "bg-green-600 text-white"
          : disabled
          ? "bg-gray-400 text-gray-200"
          : "bg-gray-100 text-gray-700"
      }
    `}
                  >
                    60'
                  </span>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-5 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-300 rounded border"></div>
              <span>Khung giờ đã chọn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white rounded border"></div>
              <span>Khung giờ có thể chọn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded border"></div>
              <span>Không khả dụng</span>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-10 p-4">
          <ReviewList bookingFeedbacks={bookingFeedbacks} type="booking" />
        </div>
      </div>

      {/* RIGHT 30% — PAYMENT */}
      <div className="col-span-2">
        <div className="bg-white p-6 sticky top-4 space-y-6 border border-gray-300 rounded-lg">
          <h3 className="text-2xl font-bold text-sky-700 text-center">
            Thông tin thanh toán
          </h3>

          {/* Sân */}
          <div className="flex flex-row gap-3 justify-center">
            <span className="text-2xl font-bold text-gray-800">
              {court?.name}
            </span>
          </div>

          {/* Khung giờ đã chọn */}
          <div className="flex flex-col gap-2">
            <span className="font-medium text-gray-700">Khung giờ đã chọn</span>
            {selectedSlots.length === 0 ? (
              <p className="text-gray-400 text-sm">Chưa chọn</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {court?.courtSchedules
                  .filter((x) => selectedSlots.some((s) => s.id === x.id))
                  .map((slot) => (
                    <span
                      key={slot.id}
                      className="text-sm px-3 py-1 rounded-full bg-sky-100 text-sky-700 font-medium shadow-sm"
                    >
                      {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Mã giảm giá */}
          <div className="flex gap-2 flex-col">
            <div className="font-medium text-gray-700">
              Mã giảm giá (nếu có)
            </div>
            <div className="flex flex-row justify-between gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Nhập mã giảm giá"
                className="flex-1 border border-gray-300 p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
              />
              <button
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 rounded-xl shadow-md transition"
                onClick={() => handleDiscount(code)}
              >
                Áp mã
              </button>
            </div>
          </div>

          {/* Ghi chú */}
          <div className="flex flex-col gap-2 mt-4">
            <label className="font-medium text-gray-700">Ghi chú</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú khi đặt sân"
              className="border border-gray-300 p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
            />
          </div>

          {/* Phương thức thanh toán */}
          <div className="flex flex-col gap-4">
            <span className="font-medium text-gray-700">
              Phương thức thanh toán
            </span>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* COD */}
              <label
                className={`relative flex items-center gap-3 cursor-pointer border rounded-xl p-3 transition 
          ${
            paymentMethod === "COD"
              ? "bg-[#E3F2FD] border-[#0288D1] shadow-md"
              : "hover:bg-[#E3F2FD] border-gray-300"
          }`}
              >
                <input
                  type="radio"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="absolute opacity-0 w-0 h-0"
                />
                <DollarSign className="w-6 h-6 text-[#0288D1] flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800 text-sm">
                    Thanh toán khi đến sân
                  </span>
                  <span className="text-xs text-gray-500">(COD)</span>
                </div>
                {paymentMethod === "COD" && (
                  <div className="ml-auto text-white bg-[#0288D1] w-5 h-5 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </label>

              {/* MoMo */}
              <label
                className={`relative flex items-center gap-3 cursor-pointer border rounded-xl p-3 transition 
          ${
            paymentMethod === "MOMO"
              ? "bg-[#E3F2FD] border-[#0288D1] shadow-md"
              : "hover:bg-[#E3F2FD] border-gray-300"
          }`}
              >
                <input
                  type="radio"
                  checked={paymentMethod === "MOMO"}
                  onChange={() => setPaymentMethod("MOMO")}
                  className="absolute opacity-0 w-0 h-0"
                />
                <Smartphone className="w-6 h-6 text-[#0288D1] flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800 text-sm">
                    Thanh toán online
                  </span>
                  <span className="text-xs text-gray-500">qua MoMo</span>
                </div>
                {paymentMethod === "MOMO" && (
                  <div className="ml-auto text-white bg-[#0288D1] w-5 h-5 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Tạm tính */}
          <div className="flex justify-between items-center p-3">
            <span className="text-gray-800 text-lg font-bold">Tạm tính:</span>
            <span className="text-2xl font-extrabold text-green-600">
              {finalPrice ?? bookingAmount} đ
            </span>
          </div>

          {/* Nút xác nhận */}
          <button
            onClick={handleCheckout}
            className="w-full mt-5 py-3 bg-[#0288D1] text-white rounded-xl font-semibold hover:bg-[#0277BD] transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <CreditCard size={20} />
            {paymentMethod === "COD"
              ? "Đặt sân ngay - Thanh toán khi đến sân"
              : "Thanh toán an toàn qua Momo"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingCourtDetailPage;
