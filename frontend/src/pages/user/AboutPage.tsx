import React from "react";
import {
  Target,
  Eye,
  Gem,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Smartphone,
  Users,
  ShoppingBag,
  CalendarCheck2,
} from "lucide-react";

const AboutPage = () => {
  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* 1. HERO SECTION - Đậm chất thể thao & hiện đại */}
      <section className="relative bg-sky-900 py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0 100 L100 0 L100 100 Z" fill="white" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Nâng Tầm Trải Nghiệm <span className="text-sky-400">Cầu Lông</span>
          </h1>
          <p className="text-xl text-sky-100 max-w-3xl mx-auto leading-relaxed">
            B-Hub không chỉ là một ứng dụng đặt sân. Chúng tôi xây dựng một hệ
            sinh thái "All-in-one" giúp kết nối niềm đam mê thể thao với công
            nghệ hiện đại nhất.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <button className="bg-sky-500 hover:bg-sky-400 text-white px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg">
              Khám phá ngay
            </button>
            <button className="border border-sky-300 text-sky-100 hover:bg-white/10 px-8 py-3 rounded-full font-bold transition-all">
              Tìm hiểu thêm
            </button>
          </div>
        </div>
      </section>

      {/* 2. CÂU CHUYỆN & GIÁ TRỊ - Nhấn mạnh tính All-in-one */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-sky-100 rounded-full z-0"></div>
            <img
              src="https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=1000"
              alt="Badminton Court"
              className="rounded-2xl shadow-2xl relative z-10 w-full object-cover h-[450px]"
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-xl z-20 hidden md:block border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full text-green-600">
                  <Zap size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Real-time Booking
                  </p>
                  <p className="text-lg font-bold text-gray-800">
                    Cập nhật 0.5s
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
              B-Hub - Giải pháp chuyển đổi số toàn diện cho cộng đồng cầu lông
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Xuất phát từ những bất cập như trùng lịch (double-booking), quy
              trình đặt sân thủ công rườm rà và khó khăn trong việc tìm mua phụ
              kiện chính hãng, B-Hub ra đời để thay đổi tất cả.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Chúng tôi tiên phong ứng dụng công nghệ WebSocket và TypeScript để
              mang lại trải nghiệm mượt mà, chính xác tuyệt đối. Tại B-Hub, bạn
              không chỉ đặt sân, bạn đang tận hưởng sự tiện nghi.
            </p>

            <ul className="space-y-4">
              {[
                "Hệ thống All-in-one: Đặt sân, mua sắm & quản lý.",
                "Thanh toán MoMo & quét mã QR nhanh chóng.",
                "Minh bạch lịch trình, không lo trùng lịch.",
                "Hỗ trợ cộng đồng tìm đối thủ, giao lưu.",
              ].map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 font-medium text-gray-700"
                >
                  <CheckCircle2 className="text-sky-500" size={20} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 3. SỨ MỆNH - TẦM NHÌN (Dạng Card hiện đại) */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-14 h-14 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mb-6">
                <Target size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Sứ mệnh</h3>
              <p className="text-gray-600 leading-relaxed">
                Số hóa mọi quy trình vận hành sân bãi, giúp người chơi tiết kiệm
                thời gian và nâng cao sức khỏe cộng đồng thông qua công nghệ.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Eye size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Tầm nhìn</h3>
              <p className="text-gray-600 leading-relaxed">
                Trở thành hệ sinh thái thể thao trực tuyến lớn nhất Việt Nam,
                nơi mọi lông thủ đều tìm thấy thứ mình cần chỉ với một chạm.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <Gem size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Giá trị cốt lõi</h3>
              <p className="text-gray-600 leading-relaxed">
                Uy tín làm gốc, chất lượng làm nền tảng, công nghệ làm đòn bẩy
                và sự hài lòng của khách hàng là mục tiêu cuối cùng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DỊCH VỤ - Sát với yêu cầu chức năng */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Tính năng vượt trội tại B-Hub
          </h2>
          <p className="text-gray-500">
            Mọi dịch vụ bạn cần trong một nền tảng duy nhất
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <CalendarCheck2 />,
              title: "Đặt sân thông minh",
              desc: "Hiển thị sơ đồ sân trống real-time, đặt lịch và khóa sân ngay lập tức.",
            },
            {
              icon: <ShoppingBag />,
              title: "Cửa hàng thể thao",
              desc: "Cung cấp vợt, cầu, nước uống chính hãng với giá cả minh bạch.",
            },
            {
              icon: <ShieldCheck />,
              title: "Thanh toán an toàn",
              desc: "Tích hợp ví MoMo, thanh toán QR hoặc trực tiếp tại quầy linh hoạt.",
            },
            {
              icon: <Smartphone />,
              title: "Quản lý cá nhân",
              desc: "Theo dõi lịch sử giao dịch, đơn hàng và nhận thông báo nhắc lịch tự động.",
            },
          ].map((service, index) => (
            <div
              key={index}
              className="group p-8 border border-gray-100 rounded-2xl hover:bg-sky-900 transition-all duration-300"
            >
              <div className="text-sky-500 group-hover:text-sky-400 mb-4 transition-colors">
                {React.cloneElement(service.icon, { size: 40 })}
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-white transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-500 text-sm group-hover:text-sky-100 transition-colors leading-relaxed">
                {service.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CON SỐ ẤN TƯỢNG */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="bg-sky-900 rounded-[3rem] p-12 text-white">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-extrabold mb-2 text-sky-400">10+</p>
              <p className="text-sky-200 uppercase tracking-widest text-xs font-bold">
                Chi nhánh
              </p>
            </div>
            <div>
              <p className="text-4xl font-extrabold mb-2 text-sky-400">50+</p>
              <p className="text-sky-200 uppercase tracking-widest text-xs font-bold">
                Sân cầu lông
              </p>
            </div>
            <div>
              <p className="text-4xl font-extrabold mb-2 text-sky-400">
                1.000+
              </p>
              <p className="text-sky-200 uppercase tracking-widest text-xs font-bold">
                Khách hàng
              </p>
            </div>
            <div>
              <p className="text-4xl font-extrabold mb-2 text-sky-400">24/7</p>
              <p className="text-sky-200 uppercase tracking-widest text-xs font-bold">
                Hỗ trợ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA - Kêu gọi hành động */}
      <section className="py-20 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">
            Bạn đã sẵn sàng ra sân chưa?
          </h2>
          <p className="text-gray-600 mb-10 text-lg leading-relaxed">
            Đừng để việc tìm sân làm gián đoạn niềm đam mê của bạn. Hãy để B-Hub
            đồng hành cùng bạn trong mọi trận đấu.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-sky-600 text-white px-10 py-4 rounded-full font-bold shadow-xl hover:bg-sky-700 transition transform hover:-translate-y-1">
              Đặt sân ngay bây giờ
            </button>
            <button className="bg-gray-900 text-white px-10 py-4 rounded-full font-bold shadow-xl hover:bg-gray-800 transition transform hover:-translate-y-1 flex items-center justify-center gap-2">
              <Users size={20} /> Tìm đối giao lưu
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
