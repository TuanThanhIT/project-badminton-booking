import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const images = [
  "/img/san-so-11.webp",
  "/img/san-so-14.jpg",
  "/img/san-so-18.jpeg",
];

const CourtSection = () => {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  const next = () => setIndex((prev) => (prev + 1) % images.length);
  const prev = () =>
    setIndex((prev) => (prev - 1 + images.length) % images.length);

  useEffect(() => {
    const timer = setInterval(next, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center gap-5">
      <h3 className="text-3xl font-bold text-sky-800">Sân cầu lông</h3>
      <div className="w-24 h-1 rounded-full bg-gradient-to-r from-sky-500 to-sky-700 shadow-md transition-all duration-300 hover:scale-x-125 hover:shadow-lg"></div>

      {/* Container full width */}
      <div className="w-full bg-white">
        <div className="flex flex-col md:flex-row gap-10 w-full">
          {/* Slider ảnh bên trái */}
          <div className="relative w-full md:w-1/2 h-80 md:h-96 overflow-hidden rounded-lg">
            <div
              className="flex h-full transition-transform duration-700 w-full"
              style={{
                width: `${images.length * 100}%`,
                transform: `translateX(-${index * (100 / images.length)}%)`,
              }}
            >
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Sân ${i + 1}`}
                  className="w-[calc(100%/3)] h-full object-cover flex-shrink-0 rounded-lg"
                />
              ))}
            </div>

            {/* Nút Prev */}
            <button
              onClick={prev}
              className="absolute top-1/2 left-3 -translate-y-1/2 bg-white/40 hover:bg-white/60 text-white p-3 rounded-full shadow-lg transition z-20"
            >
              ❮
            </button>

            {/* Nút Next */}
            <button
              onClick={next}
              className="absolute top-1/2 right-3 -translate-y-1/2 bg-white/40 hover:bg-white/60 text-white p-3 rounded-full shadow-lg transition z-20"
            >
              ❯
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 w-full flex justify-center gap-3 z-20">
              {images.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-colors duration-300 ${
                    i === index ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Thông tin bên phải */}
          <div className="w-full md:w-1/2 flex flex-col justify-center gap-4">
            <h4 className="text-2xl font-bold text-gray-800">
              B-Hub – Sân cầu lông chuyên nghiệp
            </h4>

            <p className="text-gray-700 leading-relaxed">
              B-Hub tự hào mang đến hệ thống sân cầu lông hiện đại, đạt chuẩn
              thi đấu, thích hợp cho cả vận động viên chuyên nghiệp và người mới
              tập luyện. Sân được thiết kế với{" "}
              <span className="font-semibold text-sky-600">
                mặt gỗ chất lượng cao
              </span>
              , giảm chấn thương và tối ưu khả năng bật nhảy.
            </p>

            <p className="text-gray-700 leading-relaxed">
              Không gian tại B-Hub rộng rãi, thoáng mát với{" "}
              <span className="font-semibold text-sky-600">
                hệ thống đèn LED hiện đại
              </span>
              , phục vụ tập luyện từ{" "}
              <span className="font-semibold text-sky-600">
                6h sáng đến 22h tối
              </span>
              . Hệ thống thông gió tốt giúp người chơi luôn cảm thấy thoải mái
              ngay cả giờ cao điểm.
            </p>

            <p className="text-gray-700 leading-relaxed">
              Ngoài sân chất lượng, B-Hub cung cấp nhiều tiện ích hỗ trợ:
            </p>

            <ul className="list-disc list-inside text-gray-700">
              <li>Phòng thay đồ sạch sẽ, tiện nghi</li>
              <li>Cho thuê vợt và cầu đầy đủ, bảo trì thường xuyên</li>
              <li>Không gian nghỉ ngơi rộng rãi, có quầy nước giải khát</li>
              <li>Đội ngũ nhân viên thân thiện, hỗ trợ tận tình</li>
            </ul>

            <p className="text-gray-700 leading-relaxed">
              Hãy đến B-Hub để trải nghiệm không gian luyện tập chuyên nghiệp,
              nâng cao kỹ năng và tận hưởng những trận cầu vui vẻ cùng bạn bè.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={() => navigate("/booking")}
          className="px-6 py-2 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors duration-200"
        >
          Xem tất cả
        </button>
      </div>
    </div>
  );
};

export default CourtSection;
