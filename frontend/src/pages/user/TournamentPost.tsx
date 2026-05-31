import {
  MoreHorizontal,
  X,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  Smartphone,
  ThumbsUp,
  MessageSquare,
  Share2,
  Users,
  Trophy,
  Info,
} from "lucide-react";

const TournamentPost = () => {
  return (
    <div className="max-w-4xl mx-auto my-8 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 font-sans">
      {/* 1. Header: Thông tin người đăng */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              alt="Avatar"
              className="w-12 h-12 rounded-full border-2 border-sky-100"
            />
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900">Nguyễn Văn A</h3>
              <span className="bg-sky-100 text-sky-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Giải đấu
              </span>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              6 ngày trước •{" "}
              <span className="hover:underline cursor-pointer">Công khai</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2 text-gray-400">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreHorizontal size={20} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* 2. Banner: Tiêu đề giải đấu */}
      <div className="relative mx-4 rounded-[2rem] overflow-hidden bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100">
        <div className="px-8 py-10 relative z-10">
          <div className="inline-block px-4 py-1 rounded-full border border-amber-500/30 text-amber-700 bg-amber-50 text-sm font-semibold mb-4">
            Giải phong trào Thủ Đức Open 2026
          </div>
          <h2 className="text-2xl font-black text-gray-800 leading-tight mb-2">
            Thể lệ, hạng mục, phí đăng ký xem trong <br />
            nội dung hoặc chi tiết giải.
          </h2>
        </div>

        {/* Minh họa cầu lông (Abstract) */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none">
          <Trophy size={200} className="text-sky-500 rotate-12 -mr-10 -mt-10" />
        </div>

        {/* Image silhouette giả lập người chơi (Optional) */}
        <div className="absolute right-10 bottom-0 h-full hidden md:block">
          <img
            src="https://www.pngall.com/wp-content/uploads/5/Badminton-Player-Silhouette-PNG.png"
            className="h-full object-contain opacity-60 filter brightness-0"
            alt="player"
          />
        </div>
      </div>

      {/* 3. Grid Information: Chi tiết */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cột 1: Ban tổ chức */}
        <div className="bg-sky-50/50 p-5 rounded-[2rem] border border-sky-100/50">
          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users size={18} className="text-sky-600" /> Ban tổ chức & Liên hệ
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <CheckCircle2 size={16} className="text-sky-500 shrink-0" />
              <span className="font-semibold text-gray-700">
                CLB Cầu lông Thủ Đức
              </span>
            </div>
            <div className="flex gap-3 text-gray-600">
              <MapPin size={16} className="text-sky-500 shrink-0" />
              <span>Linh Trung Arena, 231 Lê Văn Thủ Đức, TP.HCM • Sân 12</span>
            </div>
            <div className="flex gap-3 text-gray-600">
              <Phone size={16} className="text-sky-500 shrink-0" />
              <span>SĐT: 0901234567</span>
            </div>
            <div className="flex gap-3 text-gray-600">
              <Mail size={16} className="text-sky-500 shrink-0" />
              <span className="truncate">clb@example.com</span>
            </div>
          </div>
        </div>

        {/* Cột 2: Timeline */}
        <div className="bg-green-50/30 p-5 rounded-[2rem] border border-green-100/50">
          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-green-600" /> Timeline Sự Kiện
          </h4>
          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-green-200">
            <div>
              <div className="absolute left-0 w-4 h-4 bg-white border-2 border-green-500 rounded-full z-10"></div>
              <p className="text-xs font-bold text-green-600 uppercase">
                Đăng ký:
              </p>
              <div className="flex items-center gap-1 text-sm text-gray-700 font-medium">
                <Calendar size={14} /> 1-15 Mar 2026
              </div>
              <span className="inline-block mt-1 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded">
                OPEN
              </span>
            </div>
            <div>
              <div className="absolute left-0 w-4 h-4 bg-white border-2 border-gray-300 rounded-full z-10"></div>
              <p className="text-xs font-bold text-gray-500 uppercase">
                Ngày sự kiện:
              </p>
              <div className="flex items-center gap-1 text-sm text-gray-700 font-medium">
                <Calendar size={14} /> 20 Mar 2026
              </div>
            </div>
          </div>
        </div>

        {/* Cột 3: Thông tin chi tiết */}
        <div className="bg-amber-50/30 p-5 rounded-[2rem] border border-amber-100/50">
          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-tight">
            <Info size={18} className="text-amber-600" /> Thông tin Chi tiết
          </h4>
          <div className="grid grid-cols-2 gap-4 text-xs mb-4">
            <div>
              <p className="text-gray-400 font-bold mb-1">Thể lệ Phí</p>
              <p className="font-bold text-gray-700">đăng ký</p>
            </div>
            <div>
              <p className="text-gray-400 font-bold mb-1">Hạng mục</p>
              <ul className="list-disc list-inside font-bold text-gray-700">
                <li>Đơn nam</li>
                <li>Đôi nam nữ</li>
              </ul>
            </div>
          </div>
          <div className="pt-3 border-t border-amber-100">
            <p className="text-xs font-bold text-gray-400 mb-2 uppercase">
              Hình thức thanh toán
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-green-600">
                <CheckCircle2 size={14} /> Online/Offline
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-sky-600">
                <Smartphone size={14} /> Liên hệ trong app
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Đăng ký Ngay Button */}
      <div className="px-4 pb-4">
        <button className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-green-200">
          <Trophy size={20} />
          ĐĂNG KÝ NGAY
        </button>
      </div>

      {/* 5. Footer: Tương tác */}
      <div className="px-6 py-4 border-t border-gray-50">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border border-white">
                <ThumbsUp
                  size={10}
                  className="text-white"
                  fill="currentColor"
                />
              </div>
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border border-white">
                <span className="text-[10px]">❤️</span>
              </div>
            </div>
            <span className="text-sm text-gray-500">0</span>
          </div>
          <p className="text-sm text-gray-500 hover:underline cursor-pointer">
            0 bình luận
          </p>
        </div>

        <div className="flex border-t border-gray-100 pt-2">
          <button className="flex-1 py-2 flex items-center justify-center gap-2 text-gray-600 font-semibold hover:bg-gray-50 rounded-xl transition-colors">
            <ThumbsUp size={18} /> Thích
          </button>
          <button className="flex-1 py-2 flex items-center justify-center gap-2 text-gray-600 font-semibold hover:bg-gray-50 rounded-xl transition-colors">
            <MessageSquare size={18} /> Bình luận
          </button>
          <button className="flex-1 py-2 flex items-center justify-center gap-2 text-gray-600 font-semibold hover:bg-gray-50 rounded-xl transition-colors">
            <Share2 size={18} /> Chia sẻ
          </button>
        </div>
      </div>
    </div>
  );
};

export default TournamentPost;
