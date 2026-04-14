import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import type { BranchDetailRequest } from "../../types/branch";
import {
  MapPin,
  Phone,
  ArrowLeft,
  Info,
  Clock,
  User,
  CalendarCheck2,
} from "lucide-react";
import { getBranchDetail } from "../../redux/slices/user/branchSlice";

const BranchDetailPage = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { branchDetail } = useAppSelector((state) => state.branch);

  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    if (branchId) {
      const data: BranchDetailRequest = { branchId: Number(branchId) };
      dispatch(getBranchDetail({ data }));
    }
  }, [branchId, dispatch]);

  useEffect(() => {
    if (branchDetail?.images?.length) {
      setActiveImage(branchDetail.images[0].imageUrl);
    }
  }, [branchDetail]);

  if (!branchDetail) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
        <p className="mt-3 text-gray-500">Đang tải thông tin chi nhánh...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* BACK */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-sky-600 transition"
        >
          <ArrowLeft size={18} />
          Quay lại
        </button>
      </div>

      {/* IMAGE GALLERY */}
      <div className="max-w-7xl mx-auto px-6 mb-10">
        {/* MAIN IMAGE */}
        <img
          src={activeImage}
          className="w-full h-[420px] object-cover rounded-xl"
        />

        {/* THUMBNAILS */}
        <div className="flex gap-3 mt-4 overflow-x-auto">
          {branchDetail.images.map((img) => (
            <img
              key={img.id}
              src={img.imageUrl}
              onClick={() => setActiveImage(img.imageUrl)}
              className={`w-[120px] h-[80px] object-cover rounded-lg cursor-pointer border
                ${
                  activeImage === img.imageUrl
                    ? "border-sky-500"
                    : "border-gray-200"
                }`}
            />
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-10">
        {/* LEFT */}
        <div className="lg:col-span-8 space-y-10">
          {/* INFO */}
          <div>
            <h1 className="text-3xl font-bold mb-6">
              {branchDetail.branchName}
            </h1>

            <div className="space-y-4 text-gray-700">
              <div className="flex items-start gap-3">
                <MapPin className="text-sky-600" size={20} />
                <div>
                  <p className="text-sm text-gray-400">Địa chỉ</p>
                  <p>{branchDetail.fullAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="text-green-600" size={20} />
                <div>
                  <p className="text-sm text-gray-400">Điện thoại</p>
                  <p>{branchDetail.phoneNumber}</p>
                </div>
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Info size={20} />
              Giới thiệu chi nhánh
            </h2>

            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: branchDetail.description,
              }}
            />
          </div>

          {/* MANAGERS */}
          {branchDetail.managers?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-5">Quản lý chi nhánh</h2>

              <div className="space-y-4">
                {branchDetail.managers.map((m, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="bg-sky-100 p-3 rounded-full">
                      <User className="text-sky-600" />
                    </div>

                    <div>
                      <p className="font-semibold">{m.fullName}</p>
                      <p className="text-sm text-gray-500">{m.email}</p>
                      <p className="text-sm text-gray-500">{m.phoneNumber}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MAP */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Vị trí chi nhánh</h2>

            <iframe
              title="map"
              src={`https://www.google.com/maps?q=${branchDetail.latitude},${branchDetail.longitude}&z=16&output=embed`}
              className="w-full h-[420px] rounded-xl"
              loading="lazy"
            />
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-4">
          <div className="sticky top-10 bg-white border rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-bold mb-6">
              Đặt sân tại {branchDetail.branchName}
            </h3>

            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <Clock size={16} />
                  Giờ mở cửa
                </span>
                <span className="font-semibold">06:00 - 23:00</span>
              </div>

              <div className="flex justify-between">
                <span>Số lượng sân</span>
                <span className="font-semibold">10 sân</span>
              </div>

              <div className="flex justify-between">
                <span>Đặt sân online</span>
                <span className="text-green-600 font-semibold">Có hỗ trợ</span>
              </div>
            </div>

            <button className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2">
              <CalendarCheck2 size={20} />
              Đặt sân ngay
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              Hệ thống sẽ giữ sân trong 5 phút sau khi đặt
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchDetailPage;
