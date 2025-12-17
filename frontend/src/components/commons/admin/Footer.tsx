import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-300 text-gray-600">
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h3 className="text-base font-semibold text-sky-600 mb-3">
            B-Hub Management
          </h3>
          <p className="text-sm leading-relaxed text-gray-500">
            Hệ thống quản lý đặt sân & bán dụng cụ cầu lông.
          </p>
          <p className="text-sm mt-2 text-gray-500">
            456 Nguyễn Văn Bảo, Gò Vấp, TP.HCM
          </p>
          <p className="text-sm text-gray-500">Hotline: 0901 234 567</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Dịch vụ</h4>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-sky-600 cursor-pointer transition">
              Quản lý đặt sân
            </li>
            <li className="hover:text-sky-600 cursor-pointer transition">
              Quản lý sản phẩm
            </li>
            <li className="hover:text-sky-600 cursor-pointer transition">
              Quản lý đơn hàng
            </li>
            <li className="hover:text-sky-600 cursor-pointer transition">
              Quản lý khuyến mãi
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Hỗ trợ</h4>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-sky-600 cursor-pointer transition">
              Trung tâm trợ giúp
            </li>
            <li className="hover:text-sky-600 cursor-pointer transition">
              Điều khoản sử dụng
            </li>
            <li className="hover:text-sky-600 cursor-pointer transition">
              Chính sách bảo mật
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Kết nối</h4>
          <div className="flex items-center gap-4">
            <Facebook className="w-5 h-5 text-gray-600 hover:text-sky-600 cursor-pointer transition" />
            <Twitter className="w-5 h-5 text-gray-600 hover:text-sky-600 cursor-pointer transition" />
            <Instagram className="w-5 h-5 text-gray-600 hover:text-sky-600 cursor-pointer transition" />
            <Youtube className="w-5 h-5 text-gray-600 hover:text-sky-600 cursor-pointer transition" />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 py-3 text-center text-xs text-gray-500">
        © 2025 B-Hub Admin System. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
