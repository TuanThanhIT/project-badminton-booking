import { useNavigate } from "react-router-dom";
import { CheckCircle, Star, Sparkles } from "lucide-react";
import { useEffect } from "react";

const BookingSuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith("selectedSlots_") ||
        key.startsWith("bookingAmount_")
      ) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#E3F2FD] to-white p-6 overflow-hidden">
      {/* Icon check chính với animation bounce */}
      <div className="bg-[#0288D1]/10 rounded-full p-6 mb-6 animate-bounce z-10">
        <CheckCircle className="text-[#0288D1] w-20 h-20" />
      </div>

      {/* Các icon nhỏ sinh động xung quanh */}
      <Star className="absolute top-10 left-10 text-yellow-400 w-6 h-6 animate-pulse" />
      <Star className="absolute top-20 right-16 text-yellow-300 w-5 h-5 animate-pulse delay-100" />
      <Sparkles className="absolute bottom-20 left-1/3 text-pink-400 w-5 h-5 animate-ping" />
      <Sparkles className="absolute bottom-16 right-1/4 text-purple-400 w-6 h-6 animate-ping delay-200" />

      <h1 className="text-4xl font-bold text-[#0288D1] mb-3 text-center flex items-center justify-center gap-2 animate-fadeIn z-10">
        <Sparkles className="w-10 h-10 text-[#0288D1]" />
        Đặt sân thành công!
      </h1>

      {/* Thông báo fade-in chậm */}
      <p className="text-gray-700 text-center mb-6 animate-fadeIn animation-delay-200 z-10">
        Cảm ơn bạn đã đặt sân. Lịch của bạn đã được ghi nhận và sẽ được xác nhận
        sớm nhất.
      </p>

      {/* Nút quay lại Lịch sử đặt sân */}
      <button
        onClick={() => navigate("/bookings")}
        className="bg-[#0288D1] text-white px-8 py-3 rounded-xl shadow-md hover:bg-[#0277BD] hover:shadow-xl hover:scale-105 transition-all font-medium z-10"
      >
        Lịch đặt sân của tôi
      </button>
    </div>
  );
};

export default BookingSuccessPage;
