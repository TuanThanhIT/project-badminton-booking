import { useNavigate } from "react-router-dom";

const AboutUsSection = () => {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col justify-center items-center gap-10">
      {/* Tiêu đề */}
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-3xl font-bold text-sky-800">Về chúng tôi</h3>
        <div className="w-24 h-1 rounded-full bg-gradient-to-r from-sky-500 to-sky-700 shadow-md transition-all duration-300 hover:scale-x-125 hover:shadow-lg"></div>
      </div>

      {/* Container chính: ảnh bên trái, nội dung bên phải */}
      <div className="flex flex-col md:flex-row w-full max-w-7xl gap-10">
        {/* Ảnh minh họa 2 ảnh dọc */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <img
            src="/img/about-us.webp"
            alt="Về B-Hub 1"
            className="w-full h-64 md:h-48 object-cover rounded-xl shadow-md hover:scale-105 transition-transform duration-500"
          />
          <img
            src="/img/about-us-2.webp"
            alt="Về B-Hub 2"
            className="w-full h-64 md:h-48 object-cover rounded-xl shadow-md hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Nội dung */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <h4 className="text-2xl font-bold text-gray-800">
            B-Hub – Nơi Đam Mê Cầu Lông Bắt Đầu
          </h4>

          <p className="text-gray-700 leading-relaxed">
            B-Hub được tạo ra từ <b>niềm đam mê cầu lông</b> của những người
            chơi thực thụ. Chúng tôi muốn mang đến{" "}
            <b>trải nghiệm tuyệt vời cho mọi người chơi</b>, từ những ai mới tập
            luyện đến những vận động viên yêu cầu chất lượng cao.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Tại B-Hub, bạn không chỉ tìm thấy <b>dụng cụ cầu lông chính hãng</b>{" "}
            mà còn được đồng hành bởi đội ngũ nhiệt tình, thân thiện, luôn sẵn
            sàng tư vấn để mỗi trận đấu trở nên thú vị và trọn vẹn.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Chúng tôi cung cấp <b>các dịch vụ thuê sân chuyên nghiệp</b>, đặt
            lịch nhanh chóng và linh hoạt theo nhu cầu của từng người chơi, giúp
            bạn tận hưởng trọn vẹn những giờ luyện tập và thi đấu.
          </p>

          <p className="text-gray-700 leading-relaxed font-semibold">
            Chúng tôi tin rằng{" "}
            <span className="text-sky-600">cầu lông không chỉ là thể thao</span>
            , mà còn là niềm vui, sự gắn kết và đam mê. Hãy đến B-Hub để trải
            nghiệm không gian luyện tập chất lượng và cùng chia sẻ niềm đam mê
            với mọi người chơi khác.
          </p>

          <button
            onClick={() => navigate("/about")}
            className="mt-4 mx-auto w-max px-6 py-2 bg-sky-600 text-white font-semibold rounded-full hover:bg-sky-700 transition"
          >
            Tìm hiểu thêm
          </button>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
