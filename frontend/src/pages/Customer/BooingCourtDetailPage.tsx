import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { toast } from "react-toastify";
import {
  clearCourtError,
  getCourtPrice,
  getCourtSchedule,
  setBookingAmountLocal,
  updateBookingAmountLocal,
} from "../../store/slices/courtSlice";
import {
  Loader2,
  Info,
  Star,
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
} from "../../store/slices/discountSlice";

interface ProductFeedbackResponse {
  userId: number;
  username: string;
  avatar: string;
  content: string;
  rating: number;
  updatedDate: string;
}

const BookingCourtDetailPage = () => {
  const { id } = useParams();
  const courtId = Number(id);
  const [searchParams] = useSearchParams();
  const date = searchParams.get("date") ?? "";
  const weekday = searchParams.get("weekday") ?? "";

  const dispatch = useAppDispatch();
  const { loading, courtSchedule, bookingAmount } = useAppSelector(
    (state) => state.court
  );
  const discountError = useAppSelector((state) => state.discount.error);
  const courtError = useAppSelector((state) => state.court.error);

  const [selectedSlots, setSelectedSlots] = useState<CourtScheduleInfo[]>(
    () => {
      const arr = JSON.parse(localStorage.getItem("selectedSlots") || "[]");
      return arr;
    }
  );
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "MOMO">("COD");
  const [discountCode, setDiscountCode] = useState<string>("");
  const [apply, setCheckApply] = useState<boolean>(false);
  const [finalPrice, setFinalPrice] = useState<number>();

  useEffect(() => {
    const error = discountError || courtError;
    if (error) {
      toast.error(error);
      if (courtError) {
        dispatch(clearCourtError());
      }
      if (discountError) {
        dispatch(clearDiscountError());
      }
    }
  }, [discountError, courtError, dispatch]);

  useEffect(() => {
    const data = { courtId, date };
    dispatch(getCourtSchedule({ data }));
    dispatch(getCourtPrice());
  }, [dispatch, courtId, date]);

  // Lấy booking amount ra nếu có và dispatch để cập nhật lại state.bookingAmount
  useEffect(() => {
    const savedAmount = localStorage.getItem("bookingAmount");
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
        toast.error("Khách hàng được chọn tối đa 3 khung giờ một ngày!");
        return;
      }
      newSelectedSlots = [...selectedSlots, slot];
    }

    setSelectedSlots(newSelectedSlots);
    localStorage.setItem("selectedSlots", JSON.stringify(newSelectedSlots));

    // Gửi luôn giá trị mới
    dispatch(
      updateBookingAmountLocal({
        selectedSlots: newSelectedSlots,
        weekday,
      })
    );
  };

  if (loading) {
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

  const court = courtSchedule as CourtScheduleResponse | undefined;

  // Dữ liệu giả cho review demo
  const fakeReviews: ProductFeedbackResponse[] = [
    {
      userId: 1,
      username: "Nguyen Van A",
      avatar: "https://i.pravatar.cc/50?img=1",
      content: "Sân rất đẹp, phục vụ tốt",
      rating: 5,
      updatedDate: new Date().toISOString(),
    },
    {
      userId: 2,
      username: "Tran Thi B",
      avatar: "https://i.pravatar.cc/50?img=2",
      content: "Giá hơi cao nhưng chất lượng ổn",
      rating: 4,
      updatedDate: new Date().toISOString(),
    },
  ];

  return (
    <div className="p-4 grid grid-cols-7 gap-4">
      {/* LEFT 70% */}
      <div className="col-span-5 space-y-6 border border-gray-300 rounded-lg">
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
        p-3 text-sm rounded-xl border shadow-md transition-all
        ${
          disabled
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "hover:bg-green-50"
        }
        ${
          isSelected
            ? "bg-green-300 text-green-800 border-green-500 font-semibold"
            : "bg-white text-gray-700"
        }
      `}
                >
                  {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
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
          <h3 className="text-2xl font-bold mb-6 text-gray-700">
            Đánh giá từ khách hàng
          </h3>
          <div className="space-y-6">
            {fakeReviews.length === 0 && (
              <p className="flex items-center gap-2 text-gray-600">
                <Info className="w-5 h-5 text-gray-500" />
                Sân chưa có đánh giá nào
              </p>
            )}
            {fakeReviews.map((review) => {
              const date = new Date(review.updatedDate);
              const formatted = date.toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div
                  key={review.userId}
                  className="flex gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200"
                >
                  <img
                    src={review.avatar}
                    alt={review.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h6 className="font-semibold text-lg text-gray-700">
                        {review.username}
                      </h6>
                      <span className="text-sm text-gray-500">{formatted}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={20}
                          className={
                            star <= review.rating
                              ? "fill-yellow-400 stroke-yellow-400"
                              : "stroke-gray-300"
                          }
                        />
                      ))}
                    </div>
                    <p className="text-gray-700">{review.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
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
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="Nhập mã giảm giá"
                className="flex-1 border border-gray-300 p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
              />
              <button
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 rounded-xl shadow-md transition"
                onClick={() => handleDiscount(discountCode)}
              >
                Áp mã
              </button>
            </div>
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
          <button className="w-full mt-5 py-3 bg-[#0288D1] text-white rounded-xl font-semibold hover:bg-[#0277BD] transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
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
