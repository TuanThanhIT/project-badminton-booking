import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, XCircle, Star, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useAppDispatch } from "../../store/hook";
import { deleteAllCart } from "../../store/slices/customer/cartSlice";

const MomoReturnPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const params = new URLSearchParams(location.search);
  const resultCode = params.get("resultCode");
  const message = params.get("message") || "";
  const type = params.get("type") || "order"; // order hoặc booking

  const isSuccess = resultCode === "0";

  useEffect(() => {
    if (isSuccess) {
      if (type === "order") {
        dispatch(deleteAllCart()); // xóa giỏ hàng
      } else if (type === "booking") {
        Object.keys(localStorage).forEach((key) => {
          if (
            key.startsWith("selectedSlots_") ||
            key.startsWith("bookingAmount_")
          ) {
            localStorage.removeItem(key);
          }
        });
      }
    }
  }, [dispatch, isSuccess, type]);

  // Nút quay lại
  const handleGoBack = () => {
    if (type === "order") navigate("/orders");
    else if (type === "booking") navigate("/bookings");
    else navigate("/"); // fallback
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#E3F2FD] to-white p-6 overflow-hidden">
      {/* Icon chính */}
      <div
        className={`rounded-full p-6 mb-6 animate-bounce z-10 ${
          isSuccess ? "bg-[#0288D1]/10" : "bg-red-200/30"
        }`}
      >
        {isSuccess ? (
          <CheckCircle className="text-[#0288D1] w-20 h-20" />
        ) : (
          <XCircle className="text-red-500 w-20 h-20" />
        )}
      </div>

      {/* Các icon nhỏ */}
      <Star className="absolute top-10 left-10 text-yellow-400 w-6 h-6 animate-pulse" />
      <Star className="absolute top-20 right-16 text-yellow-300 w-5 h-5 animate-pulse delay-100" />
      <Sparkles className="absolute bottom-20 left-1/3 text-pink-400 w-5 h-5 animate-ping" />
      <Sparkles className="absolute bottom-16 right-1/4 text-purple-400 w-6 h-6 animate-ping delay-200" />

      {/* Tiêu đề */}
      <h1
        className={`text-4xl font-bold mb-3 text-center flex items-center justify-center gap-2 animate-fadeIn z-10 ${
          isSuccess ? "text-[#0288D1]" : "text-red-500"
        }`}
      >
        {isSuccess ? (
          <Sparkles className="w-10 h-10 text-[#0288D1]" />
        ) : (
          <XCircle className="w-10 h-10 text-red-500" />
        )}
        {isSuccess
          ? type === "order"
            ? "Thanh toán đơn hàng thành công!"
            : "Thanh toán cho đặt sân thành công!"
          : "Thanh toán không thành công"}
      </h1>

      {/* Thông báo chi tiết */}
      <p className="text-gray-700 text-center mb-6 animate-fadeIn animation-delay-200 z-10">
        {isSuccess
          ? type === "order"
            ? "Cảm ơn bạn! Đơn hàng của bạn đã được thanh toán thành công."
            : "Cảm ơn bạn! Lịch đặt sân của bạn đã thanh toán thành công."
          : `Rất tiếc! Thanh toán chưa hoàn tất. ${
              message ? `Chi tiết: ${message}` : ""
            } Hãy thử lại hoặc chọn phương thức khác.`}
      </p>

      {/* Nút quay lại */}
      <button
        onClick={handleGoBack}
        className={`px-8 py-3 rounded-xl shadow-md hover:scale-105 transition-all font-medium z-10 ${
          isSuccess
            ? "bg-[#0288D1] text-white hover:bg-[#0277BD] hover:shadow-xl"
            : "bg-red-500 text-white hover:bg-red-600 hover:shadow-lg"
        }`}
      >
        {type === "order"
          ? "Đơn hàng của tôi"
          : type === "booking"
          ? "Lịch sân của tôi"
          : "Quay lại"}
      </button>
    </div>
  );
};

export default MomoReturnPage;
