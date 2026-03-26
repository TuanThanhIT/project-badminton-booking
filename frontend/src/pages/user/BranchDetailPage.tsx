import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { getBranchById } from "../../redux/slices/user/branchSlice";
import type { BranchDetailRequest } from "../../types/branch";

const BranchDetailPage = () => {
  const { branchId } = useParams();
  const dispatch = useAppDispatch();
  const { branchDetail } = useAppSelector((state) => state.branch);

  const [showAllImages, setShowAllImages] = useState(false);

  useEffect(() => {
    if (branchId) {
      const data: BranchDetailRequest = { branchId: Number(branchId) };
      dispatch(getBranchById({ data }));
    }
  }, [branchId]);

  if (!branchDetail) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold">
        Loading...
      </div>
    );
  }

  const imagesToShow = showAllImages
    ? branchDetail.images
    : branchDetail.images.slice(0, 4);

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      {/* Banner */}
      <div className="w-full h-[300px] md:h-[420px] overflow-hidden">
        <img
          src={branchDetail.thumbnailUrl}
          alt="thumbnail"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {branchDetail.branchName}
              </h1>
              <p className="text-gray-600">📍 {branchDetail.fullAddress}</p>
              <p className="text-gray-600">📞 {branchDetail.phoneNumber}</p>
            </div>

            <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
              Đặt sân ngay
            </button>
          </div>
        </div>

        {/* Gallery */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Hình ảnh sân</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {imagesToShow.map((img) => (
              <div
                key={img.id}
                className="h-[160px] rounded-lg overflow-hidden"
              >
                <img
                  src={img.imageUrl}
                  alt="gallery"
                  className="w-full h-full object-cover hover:scale-105 transition"
                />
              </div>
            ))}
          </div>

          {branchDetail.images.length > 4 && (
            <div className="text-center mt-4">
              <button
                onClick={() => setShowAllImages(!showAllImages)}
                className="px-5 py-2 border rounded-lg hover:bg-gray-100"
              >
                {showAllImages ? "Thu gọn" : "Xem tất cả ảnh"}
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Thông tin sân</h2>

          <div
            className="prose max-w-none break-words"
            dangerouslySetInnerHTML={{
              __html: branchDetail.description,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BranchDetailPage;
