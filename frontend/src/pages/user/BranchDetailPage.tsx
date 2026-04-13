import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { getBranchById } from "../../redux/slices/user/branchSlice";
import type { BranchDetailRequest } from "../../types/branch";
import {
  MapPin,
  Phone,
  Image as ImageIcon,
  CalendarCheck2,
  ArrowLeft,
  Info,
  CheckCircle2,
  Clock,
} from "lucide-react";

const BranchDetailPage = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { branchDetail } = useAppSelector((state) => state.branch);

  const [showAllImages, setShowAllImages] = useState(false);

  useEffect(() => {
    if (branchId) {
      const data: BranchDetailRequest = { branchId: Number(branchId) };
      dispatch(getBranchById({ data }));
    }
  }, [branchId, dispatch]);

  if (!branchDetail) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
        <p className="mt-4 text-gray-500 font-medium">
          Đang tải thông tin chi nhánh...
        </p>
      </div>
    );
  }

  const imagesToShow = showAllImages
    ? branchDetail.images
    : branchDetail.images.slice(0, 5); // Tăng lên 5 ảnh để làm layout grid đẹp hơn

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans">
      {/* 1. NÚT QUAY LẠI & BREADCRUMB */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-sky-600 transition-colors font-medium"
        >
          <ArrowLeft size={20} /> Quay lại danh sách
        </button>
      </div>

      {/* 2. GALLERY GRID - Kiểu hiện đại */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-3 h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-lg">
          {/* Ảnh chính lớn */}
          <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden">
            <img
              src={branchDetail.thumbnailUrl}
              alt="Main"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all"></div>
          </div>

          {/* Các ảnh phụ */}
          {branchDetail.images.slice(0, 4).map((img, idx) => (
            <div
              key={img.id}
              className="hidden md:block relative group overflow-hidden"
            >
              <img
                src={img.imageUrl}
                alt={`Gallery ${idx}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {idx === 3 &&
                branchDetail.images.length > 4 &&
                !showAllImages && (
                  <button
                    onClick={() => setShowAllImages(true)}
                    className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white hover:bg-black/60 transition-all"
                  >
                    <ImageIcon size={24} className="mb-2" />
                    <span className="font-bold">
                      +{branchDetail.images.length - 4} ảnh khác
                    </span>
                  </button>
                )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 3. NỘI DUNG CHÍNH (Bên trái) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Header Info */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Đang hoạt động
                </span>
                <span className="bg-sky-100 text-sky-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Sân chất lượng cao
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
                {branchDetail.branchName}
              </h1>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="bg-white p-2 rounded-xl shadow-sm text-sky-600">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">
                      Vị trí sân
                    </p>
                    <p className="text-gray-700 font-medium">
                      {branchDetail.fullAddress}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="bg-white p-2 rounded-xl shadow-sm text-green-600">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">
                      Số điện thoại
                    </p>
                    <p className="text-gray-700 font-medium">
                      {branchDetail.phoneNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Area */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center">
                  <Info size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Giới thiệu chi tiết
                </h2>
              </div>

              <div
                className="prose prose-sky max-w-none text-gray-600 leading-relaxed 
                           [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4"
                dangerouslySetInnerHTML={{
                  __html: branchDetail.description,
                }}
              />

              {/* Tiện ích sân - (Hardcode dựa trên thực tế thường có) */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">
                  Tiện ích đi kèm:
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    "Wifi miễn phí",
                    "Bãi xe rộng rãi",
                    "Căng tin dịch vụ",
                    "Ghế ngồi khán giả",
                    "Thảm th đấu chuẩn",
                    "Phòng thay đồ",
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-gray-500"
                    >
                      <CheckCircle2 size={16} className="text-green-500" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* All Images Section (If toggled) */}
            {showAllImages && (
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Tất cả hình ảnh
                  </h2>
                  <button
                    onClick={() => setShowAllImages(false)}
                    className="text-sky-600 font-bold hover:underline"
                  >
                    Thu gọn
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {branchDetail.images.map((img) => (
                    <div
                      key={img.id}
                      className="aspect-video rounded-xl overflow-hidden shadow-sm"
                    >
                      <img
                        src={img.imageUrl}
                        className="w-full h-full object-cover"
                        alt="Gallery"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. SIDEBAR - Đặt sân (Bên phải - Sticky) */}
          <div className="lg:col-span-4">
            <div className="sticky top-10 bg-sky-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-sky-200">
              <div className="flex items-center gap-3 mb-6 text-sky-300">
                <CalendarCheck2 size={24} />
                <span className="font-bold tracking-widest uppercase text-sm">
                  Booking Now
                </span>
              </div>

              <h3 className="text-2xl font-bold mb-2">Bắt đầu trận đấu?</h3>
              <p className="text-sky-200/80 text-sm mb-8">
                Hệ thống tự động khóa sân ngay khi bạn hoàn tất đặt lịch.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between py-3 border-b border-white/10 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-sky-400" />
                    <span>Giờ mở cửa:</span>
                  </div>
                  <span className="font-bold">06:00 - 23:00</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/10 text-sm">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} className="text-sky-400" />
                    <span>Số lượng sân:</span>
                  </div>
                  <span className="font-bold">10 Sân tiêu chuẩn</span>
                </div>
              </div>

              <button className="w-full bg-white text-sky-900 font-extrabold py-4 rounded-2xl hover:bg-sky-50 transition-all transform hover:scale-[1.02] shadow-xl flex items-center justify-center gap-2">
                ĐẶT SÂN NGAY TẠI ĐÂY
              </button>

              <p className="mt-6 text-center text-xs text-sky-300/60 leading-relaxed">
                * Lưu ý: Vui lòng có mặt trước 10 phút để nhận sân và chuẩn bị
                trang thiết bị.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchDetailPage;
