import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  HeadphonesIcon,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";

const ContactPage = () => {
  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* 1. HERO SECTION */}
      <section className="relative bg-sky-900 py-24 overflow-hidden">
        {/* Họa tiết nền */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-sky-800/50 skew-x-12 transform translate-x-20"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2">
              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                Kết nối với <span className="text-sky-400">B-Hub</span>
              </h1>
              <p className="text-xl text-sky-100 mb-8 leading-relaxed">
                Bạn có câu hỏi về việc đặt sân, mua sắm dụng cụ hay muốn hợp
                tác? Đội ngũ B-Hub luôn sẵn sàng hỗ trợ bạn 24/7.
              </p>
              <div className="flex items-center gap-6 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-sky-200">
                  <HeadphonesIcon size={20} />
                  <span>Hỗ trợ trực tuyến 24/7</span>
                </div>
                <div className="flex items-center gap-2 text-sky-200">
                  <MessageSquare size={20} />
                  <span>Phản hồi trong 15 phút</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block lg:w-1/3">
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl">
                <img
                  src="https://plus.unsplash.com/premium_photo-1680297354569-1c0046c9d125?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Contact Illustration"
                  className="w-full h-auto animate-bounce-slow"
                  style={{ animationDuration: "3s" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        {/* 2. CONTACT INFO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <MapPin />,
              title: "Địa chỉ",
              content: "456 Nguyễn Văn Bảo, Gò Vấp, TP.HCM",
              color: "text-blue-500",
              bg: "bg-blue-50",
            },
            {
              icon: <Phone />,
              title: "Điện thoại",
              content: "0901 234 567",
              subContent: "(028) 3894 123",
              color: "text-green-500",
              bg: "bg-green-50",
            },
            {
              icon: <Mail />,
              title: "Email",
              content: "support@bhub.vn",
              subContent: "info@bhub.vn",
              color: "text-red-500",
              bg: "bg-red-50",
            },
            {
              icon: <Clock />,
              title: "Giờ mở cửa",
              content: "06:00 - 23:00",
              subContent: "Tất cả các ngày trong tuần",
              color: "text-amber-500",
              bg: "bg-amber-50",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:-translate-y-2 transition-all duration-300 group"
            >
              <div
                className={`${item.bg} ${item.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
              >
                {React.cloneElement(item.icon, { size: 28 })}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 font-medium text-sm leading-relaxed">
                {item.content}
              </p>
              {item.subContent && (
                <p className="text-gray-400 text-xs mt-1">{item.subContent}</p>
              )}
            </div>
          ))}
        </div>

        {/* 3. FORM + MAP */}
        <div className="grid lg:grid-cols-12 gap-12 py-24">
          {/* FORM */}
          <div className="lg:col-span-7 bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-sky-100 border border-gray-50">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Gửi tin nhắn cho chúng tôi
              </h2>
              <p className="text-gray-500">
                Chúng tôi sẽ phản hồi sớm nhất có thể.
              </p>
            </div>

            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    placeholder="09xx xxx xxx"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">
                  Vấn đề cần hỗ trợ
                </label>
                <select className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer text-gray-600">
                  <option>Đặt sân cầu lông</option>
                  <option>Tư vấn mua dụng cụ</option>
                  <option>Hợp tác kinh doanh</option>
                  <option>Góp ý dịch vụ</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">
                  Nội dung chi tiết
                </label>
                <textarea
                  rows={4}
                  placeholder="Nhập nội dung bạn cần hỗ trợ..."
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all resize-none"
                ></textarea>
              </div>

              <button className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-sky-200 transition-all flex items-center justify-center gap-3 group">
                <Send
                  size={20}
                  className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                />
                Gửi liên hệ ngay
              </button>
            </form>
          </div>

          {/* MAP & SOCIAL */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl shadow-sky-100 border border-gray-50 h-[400px] overflow-hidden">
              <iframe
                title="map"
                src="https://www.google.com/maps?q=456 Nguyễn Văn Bảo, Gò Vấp, TP.HCM&output=embed"
                className="w-full h-full rounded-[2rem] border-0 grayscale hover:grayscale-0 transition-all duration-500"
                loading="lazy"
              ></iframe>
            </div>

            <div className="bg-sky-900 p-10 rounded-[2.5rem] text-white">
              <h3 className="text-2xl font-bold mb-6">Theo dõi B-Hub</h3>
              <p className="text-sky-200 mb-8 text-sm leading-relaxed">
                Cập nhật tin tức mới nhất về các giải đấu, chương trình khuyến
                mãi sân và các mẫu vợt mới nhất tại fanpage của chúng tôi.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-12 h-12 bg-white/10 hover:bg-sky-500 rounded-xl flex items-center justify-center transition-all"
                >
                  <Facebook size={24} />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 bg-white/10 hover:bg-pink-500 rounded-xl flex items-center justify-center transition-all"
                >
                  <Instagram size={24} />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 bg-white/10 hover:bg-red-500 rounded-xl flex items-center justify-center transition-all"
                >
                  <Youtube size={24} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FINAL CTA */}
      <section className="bg-gray-50 py-20 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-100 text-sky-600 rounded-full mb-8">
            <Phone size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Bạn đang đứng tại sân và cần hỗ trợ gấp?
          </h2>
          <p className="text-gray-600 mb-10 text-lg">
            Gọi ngay Hotline phản hồi nhanh của chúng tôi. Nhân viên trực sân sẽ
            hỗ trợ bạn ngay lập tức.
          </p>
          <a
            href="tel:0901234567"
            className="inline-block bg-white border-2 border-sky-600 text-sky-600 hover:bg-sky-600 hover:text-white px-12 py-4 rounded-full font-extrabold text-xl transition-all shadow-xl shadow-sky-100"
          >
            0901 234 567
          </a>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
