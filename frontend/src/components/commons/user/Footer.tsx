import {
  Building2,
  CalendarCheck2,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShoppingBag,
  Youtube,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const linkClass =
    "text-sm text-slate-600 transition-colors hover:text-sky-700";

  const socialClass =
    "flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all hover:border-sky-200 hover:text-sky-700";

  return (
    <footer className="border-t border-slate-200 bg-[#f5f5f5] text-slate-700">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-10 2xl:px-14">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.75fr_0.75fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <img
                src="/img/logo_badminton.jpg"
                alt="B-Hub"
                className="h-12 w-12 rounded-2xl border border-slate-200 object-cover shadow-sm"
              />
              <div>
                <p className="text-2xl font-semibold tracking-tight text-slate-900">
                  B-Hub
                </p>
                <p className="text-sm text-slate-500">Badminton ecosystem</p>
              </div>
            </Link>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600">
              Nền tảng cầu lông đa chi nhánh giúp người chơi đặt sân, mua sắm
              dụng cụ, theo dõi đơn hàng và kết nối cộng đồng trong một trải
              nghiệm nhẹ nhàng, hiện đại.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:max-w-lg">
              {[
                { icon: Building2, label: "Đa chi nhánh" },
                { icon: CalendarCheck2, label: "Đặt sân nhanh" },
                { icon: ShoppingBag, label: "Shop cầu lông" },
                { icon: MessageCircle, label: "Cộng đồng" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
                >
                  <item.icon size={16} className="text-sky-600" />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Khám phá</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/branches" className={linkClass}>
                  Hệ thống chi nhánh
                </Link>
              </li>
              <li>
                <Link to="/booking" className={linkClass}>
                  Đặt sân cầu lông
                </Link>
              </li>
              <li>
                <Link to="/products" className={linkClass}>
                  Sản phẩm cầu lông
                </Link>
              </li>
              <li>
                <Link to="/posts" className={linkClass}>
                  Cộng đồng thảo luận
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Hỗ trợ</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/contact" className={linkClass}>
                  Trung tâm hỗ trợ
                </Link>
              </li>
              <li className="text-sm text-slate-600">Thanh toán an toàn</li>
              <li className="text-sm text-slate-600">Giao hàng & vận chuyển</li>
              <li className="text-sm text-slate-600">Chính sách bảo mật</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Liên hệ hệ thống
            </h3>
            <div className="space-y-2.5 text-sm text-slate-600">
              <p className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-slate-500" />
                TP.HCM và mạng lưới chi nhánh B-Hub đang mở rộng.
              </p>
              <a
                href="tel:0901234567"
                className="flex items-center gap-2 transition-colors hover:text-sky-700"
              >
                <Phone size={16} className="text-slate-500" />
                0901 234 567
              </a>
              <a
                href="mailto:support@bhub.vn"
                className="flex items-center gap-2 transition-colors hover:text-sky-700"
              >
                <Mail size={16} className="text-slate-500" />
                support@bhub.vn
              </a>
            </div>

            <div className="mt-5 flex gap-2">
              <a href="#" className={socialClass} aria-label="Facebook">
                <Facebook size={17} />
              </a>
              <a href="#" className={socialClass} aria-label="Instagram">
                <Instagram size={17} />
              </a>
              <a href="#" className={socialClass} aria-label="Youtube">
                <Youtube size={17} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-2 border-t border-slate-200 pt-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 B-Hub. All rights reserved.</p>
          <p>Đặt sân, mua sắm và kết nối cộng đồng cầu lông.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
