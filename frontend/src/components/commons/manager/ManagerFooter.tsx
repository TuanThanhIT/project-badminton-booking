// =========================
// commons/storeManager/StoreManagerFooter.tsx
// =========================

const ManagerFooter = () => {
  return (
    <footer
      className="
        h-16
        bg-gradient-to-r
        from-white
        via-sky-50
        to-white
        border-t border-sky-100
        px-8
        flex items-center justify-between
        shrink-0
      "
    >
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-slate-700">
          © 2026 B-Hub Store Manager
        </span>

        <span className="text-slate-400">• Hệ thống quản lý cửa hàng</span>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <button className="text-slate-500 hover:text-sky-700 transition font-medium">
          Chính sách
        </button>

        <button className="text-slate-500 hover:text-sky-700 transition font-medium">
          Điều khoản
        </button>

        <button className="text-slate-500 hover:text-sky-700 transition font-medium">
          Hỗ trợ
        </button>
      </div>
    </footer>
  );
};

export default ManagerFooter;
