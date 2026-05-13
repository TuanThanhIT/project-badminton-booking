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
  User,
  ChevronDown,
  FileText,
} from "lucide-react";

const ContactPage = () => {
  const inputClass =
    "w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-2xl text-slate-800 shadow-sm focus:ring-4 focus:ring-sky-100 focus:border-sky-400 hover:border-sky-200 outline-none transition-all duration-300 placeholder:text-slate-400";

  const labelClass = "text-sm font-semibold text-slate-700";

  return (
    <div className="bg-white text-slate-800 font-sans">
      {/* HERO SECTION */}
      <section className="relative bg-sky-950 py-20 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_35%)]" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-sky-800/30 skew-x-12 translate-x-20" />
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-400/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2">
              <span className="inline-block mb-5 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-sky-100 text-sm font-semibold">
                Trung tâm hỗ trợ B-Hub
              </span>

              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                Kết nối với <span className="text-sky-300">B-Hub</span>
              </h1>

              <p className="text-lg sm:text-xl text-sky-100 mb-8 leading-relaxed">
                Bạn có câu hỏi về việc đặt sân, mua sắm dụng cụ hay muốn hợp
                tác? Đội ngũ B-Hub luôn sẵn sàng hỗ trợ bạn 24/7.
              </p>

              <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-sky-100 bg-white/10 border border-white/10 px-4 py-2 rounded-full">
                  <HeadphonesIcon size={18} />
                  <span className="text-sm">Hỗ trợ trực tuyến 24/7</span>
                </div>

                <div className="flex items-center gap-2 text-sky-100 bg-white/10 border border-white/10 px-4 py-2 rounded-full">
                  <MessageSquare size={18} />
                  <span className="text-sm">Phản hồi trong 15 phút</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block lg:w-1/3">
              <div className="relative">
                <div className="absolute inset-0 bg-sky-400/20 blur-2xl rounded-[2rem] scale-105" />

                <div className="relative bg-white/10 backdrop-blur-md p-4 rounded-[2rem] border border-white/20 shadow-2xl">
                  <img
                    src="./img/contact.avif"
                    alt="Contact Illustration"
                    className="w-full h-80 object-cover rounded-[1.5rem]"
                  />

                  <div className="absolute -bottom-5 left-6 right-6 bg-white rounded-2xl shadow-xl p-4 border border-sky-100">
                    <p className="text-sm font-semibold text-slate-900">
                      B-Hub Care
                    </p>
                    <p className="text-xs text-slate-500">
                      Luôn sẵn sàng hỗ trợ đặt sân và mua sắm
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-14 relative z-20">
        {/* CONTACT INFO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {[
            {
              icon: <MapPin />,
              title: "Địa chỉ",
              content: "456 Nguyễn Văn Bảo, Gò Vấp, TP.HCM",
              color: "text-sky-600",
              bg: "bg-sky-50",
            },
            {
              icon: <Phone />,
              title: "Điện thoại",
              content: "0901 234 567",
              subContent: "(028) 3894 123",
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              icon: <Mail />,
              title: "Email",
              content: "support@bhub.vn",
              subContent: "info@bhub.vn",
              color: "text-rose-600",
              bg: "bg-rose-50",
            },
            {
              icon: <Clock />,
              title: "Giờ mở cửa",
              content: "06:00 - 23:00",
              subContent: "Tất cả các ngày trong tuần",
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 sm:p-7 rounded-3xl shadow-[0_12px_34px_rgba(15,23,42,0.08)] border border-slate-200/80 hover:-translate-y-1.5 hover:shadow-[0_18px_45px_rgba(14,165,233,0.14)] hover:border-sky-200 transition-all duration-300 group"
            >
              <div
                className={`${item.bg} ${item.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}
              >
                {React.cloneElement(item.icon, { size: 28 })}
              </div>

              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {item.title}
              </h3>

              <p className="text-slate-700 font-medium text-sm leading-relaxed">
                {item.content}
              </p>

              {item.subContent && (
                <p className="text-slate-500 text-xs mt-1">{item.subContent}</p>
              )}
            </div>
          ))}
        </div>

        {/* FORM + MAP */}
        <div className="relative py-16 sm:py-20 lg:py-24">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-50/80 via-white to-white rounded-[3rem]" />

          <div className="relative z-10 grid lg:grid-cols-12 gap-8 lg:gap-10">
            {/* FORM */}
            <div className="lg:col-span-7">
              <div className="relative bg-white rounded-[2rem] shadow-[0_14px_45px_rgba(15,23,42,0.09)] border border-slate-200/80 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-sky-300 via-sky-400 to-sky-500" />

                <div className="p-5 sm:p-8 md:p-10">
                  <div className="flex items-start justify-between gap-5 mb-8">
                    <div>
                      <p className="text-sm font-semibold text-sky-600 mb-2">
                        Liên hệ tư vấn
                      </p>

                      <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-2">
                        Gửi tin nhắn cho chúng tôi
                      </h2>

                      <p className="text-slate-600 leading-relaxed">
                        Điền thông tin bên dưới, B-Hub sẽ phản hồi trong thời
                        gian sớm nhất.
                      </p>
                    </div>

                    <div className="hidden md:flex w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 items-center justify-center shadow-sm border border-sky-100">
                      <Send size={26} />
                    </div>
                  </div>

                  <form className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className={labelClass}>Họ và tên</label>

                        <div className="relative">
                          <User
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            type="text"
                            placeholder="Nguyễn Văn A"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className={labelClass}>Số điện thoại</label>

                        <div className="relative">
                          <Phone
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            type="text"
                            placeholder="09xx xxx xxx"
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className={labelClass}>Email</label>

                      <div className="relative">
                        <Mail
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="email"
                          placeholder="example@gmail.com"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className={labelClass}>Vấn đề cần hỗ trợ</label>

                      <div className="relative">
                        <MessageSquare
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <select
                          className={`${inputClass} pr-12 appearance-none cursor-pointer`}
                        >
                          <option>Đặt sân cầu lông</option>
                          <option>Tư vấn mua dụng cụ</option>
                          <option>Hợp tác kinh doanh</option>
                          <option>Góp ý dịch vụ</option>
                        </select>

                        <ChevronDown
                          size={20}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className={labelClass}>Nội dung chi tiết</label>

                      <div className="relative">
                        <FileText
                          size={18}
                          className="absolute left-4 top-5 text-slate-400"
                        />
                        <textarea
                          rows={5}
                          placeholder="Nhập nội dung bạn cần hỗ trợ..."
                          className={`${inputClass} resize-none leading-relaxed`}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className="w-full bg-sky-500 hover:bg-sky-600 active:scale-[0.98] text-white font-semibold py-4 rounded-2xl shadow-lg shadow-sky-100 hover:shadow-sky-200 transition-all duration-300 flex items-center justify-center gap-3 group"
                    >
                      <Send
                        size={20}
                        className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                      />
                      Gửi liên hệ ngay
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* MAP & SOCIAL */}
            <div className="lg:col-span-5 flex flex-col gap-6 lg:gap-8">
              <div className="bg-white p-4 rounded-[2rem] shadow-[0_14px_45px_rgba(15,23,42,0.09)] border border-slate-200/80 h-[360px] sm:h-[430px] overflow-hidden">
                <iframe
                  title="map"
                  src="https://www.google.com/maps?q=456 Nguyễn Văn Bảo, Gò Vấp, TP.HCM&output=embed"
                  className="w-full h-full rounded-[1.5rem] border-0 transition-all duration-500"
                  loading="lazy"
                />
              </div>

              <div className="relative bg-sky-950 p-7 sm:p-9 rounded-[2rem] text-white overflow-hidden shadow-[0_14px_45px_rgba(15,23,42,0.14)]">
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-sky-400/20 rounded-full blur-2xl" />

                <div className="relative z-10">
                  <h3 className="text-2xl font-semibold mb-4">
                    Theo dõi B-Hub
                  </h3>

                  <p className="text-sky-100 mb-7 text-sm leading-relaxed">
                    Cập nhật tin tức mới nhất về các giải đấu, chương trình
                    khuyến mãi sân và các mẫu vợt mới nhất.
                  </p>

                  <div className="flex gap-4">
                    {[Facebook, Instagram, Youtube].map((Icon, index) => (
                      <a
                        key={index}
                        href="#"
                        className="w-12 h-12 bg-white/10 hover:bg-sky-500 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1 border border-white/10"
                      >
                        <Icon size={23} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FINAL CTA */}
      <section className="bg-slate-50 py-16 sm:py-20 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-50 text-sky-600 rounded-3xl mb-8 shadow-[0_12px_30px_rgba(14,165,233,0.12)] border border-sky-100">
            <Phone size={40} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-4">
            Bạn đang đứng tại sân và cần hỗ trợ gấp?
          </h2>

          <p className="text-slate-600 mb-10 text-base sm:text-lg leading-relaxed">
            Gọi ngay Hotline phản hồi nhanh. Nhân viên trực sân sẽ hỗ trợ ngay
            lập tức.
          </p>

          <a
            href="tel:0901234567"
            className="inline-flex items-center justify-center bg-white border border-sky-200 text-sky-700 hover:bg-sky-500 hover:text-white px-10 sm:px-12 py-4 rounded-full font-semibold text-lg sm:text-xl transition-all shadow-[0_12px_30px_rgba(14,165,233,0.12)] hover:-translate-y-1"
          >
            0901 234 567
          </a>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
