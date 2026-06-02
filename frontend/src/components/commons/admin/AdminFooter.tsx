const AdminFooter = () => {
  return (
    <footer className="flex h-14 shrink-0 items-center justify-between border-t border-slate-200 bg-white px-4 text-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-700">
          © 2026 B-Hub Dashboard
        </span>

        <span className="hidden text-slate-400 sm:inline">• Hệ thống quản trị cầu lông</span>
      </div>

      <div className="hidden items-center gap-5 md:flex">
        <button className="font-medium text-slate-500 transition hover:text-sky-700">
          Chính sách
        </button>

        <button className="font-medium text-slate-500 transition hover:text-sky-700">
          Điều khoản
        </button>

        <button className="font-medium text-slate-500 transition hover:text-sky-700">
          Hỗ trợ
        </button>
      </div>
    </footer>
  );
};

export default AdminFooter;
