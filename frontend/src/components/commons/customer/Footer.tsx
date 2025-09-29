import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t mt-10">
      <div className="grid grid-cols-4 gap-8 px-12 py-10 text-gray-700">
        {/* Địa chỉ */}
        <div>
          <h3 className="font-bold text-sky-600 mb-3 text-lg">Địa chỉ</h3>
          <p>Đặt sân & Cửa hàng Cầu lông</p>
          <p>456 Nguyễn Văn Bảo, Quận Gò Vấp, TP.HCM</p>
          <p>Điện thoại: +84 987 654 321</p>
          <p>Email: support@badmintonvn.com</p>
          <p>Giờ mở cửa: 6:00 - 23:00 (T2 - CN)</p>
        </div>

        {/* Dịch vụ */}
        <div>
          <h3 className="font-bold text-sky-600 mb-3 text-lg">Dịch vụ</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-sky-600 cursor-pointer">
              Đặt sân cầu lông
            </li>
            <li className="hover:text-sky-600 cursor-pointer">
              Dụng cụ cầu lông
            </li>
            <li className="hover:text-sky-600 cursor-pointer">
              Chính sách thanh toán
            </li>
            <li className="hover:text-sky-600 cursor-pointer">
              Giao hàng & Vận chuyển
            </li>
            <li className="hover:text-sky-600 cursor-pointer">
              Đổi trả & Hoàn tiền
            </li>
          </ul>
        </div>

        {/* Khách hàng */}
        <div>
          <h3 className="font-bold text-sky-600 mb-3 text-lg">Hỗ trợ</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-sky-600 cursor-pointer">
              Hướng dẫn đặt sân
            </li>
            <li className="hover:text-sky-600 cursor-pointer">
              Hỗ trợ trực tuyến
            </li>
            <li className="hover:text-sky-600 cursor-pointer">
              Điều khoản & Điều kiện
            </li>
            <li className="hover:text-sky-600 cursor-pointer">
              Chính sách bảo mật
            </li>
            <li className="hover:text-sky-600 cursor-pointer">
              Câu hỏi thường gặp
            </li>
          </ul>
        </div>

        {/* Về chúng tôi */}
        <div>
          <h3 className="font-bold text-sky-600 mb-3 text-lg">Về chúng tôi</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-sky-600 cursor-pointer">Giới thiệu</li>
            <li className="hover:text-sky-600 cursor-pointer">
              Tin tức & Blog
            </li>
            <li className="hover:text-sky-600 cursor-pointer">Tuyển dụng</li>
            <li className="hover:text-sky-600 cursor-pointer">
              Hợp tác kinh doanh
            </li>
            <li className="hover:text-sky-600 cursor-pointer">Liên hệ</li>
          </ul>
        </div>
      </div>

      {/* Bản quyền */}
      <div className="border-t py-4 text-center text-sm text-gray-500">
        <p>© 2025 B-Hub. Tất cả quyền được bảo lưu.</p>
        <div className="flex justify-center gap-4 mt-2">
          <Facebook className="w-5 h-5 text-blue-600 hover:text-blue-800 cursor-pointer" />
          <Twitter className="w-5 h-5 text-sky-500 hover:text-sky-700 cursor-pointer" />
          <Instagram className="w-5 h-5 text-pink-500 hover:text-pink-700 cursor-pointer" />
          <Youtube className="w-5 h-5 text-red-500 hover:text-red-700 cursor-pointer" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
