// =========================
// commons/admin/AdminHeader.tsx
// =========================

import { Bell, Search, Mail } from "lucide-react";
import { useAppSelector } from "../../../redux/hook";

interface Props {
  collapsed: boolean;
}

const AdminHeader = ({ collapsed }: Props) => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <header
      className="
        h-24
        bg-gradient-to-r
        from-white
        via-sky-50
        to-white
        border-b border-sky-100
        px-6 lg:px-8
        flex items-center justify-between
        shadow-sm
        shrink-0
      "
    >
      {/* LEFT */}
      <div className="space-y-1.5">
        <h2
          className="
      text-[30px]
      font-bold
      tracking-[-0.5px]
      text-slate-800
      leading-tight
    "
        >
          Trang quản trị
        </h2>

        <p
          className="
      text-sm
      text-slate-400
      leading-relaxed
    "
        >
          Quản lý hệ thống cầu lông B-Hub
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* SEARCH */}
        <div className="relative hidden xl:block">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="
              w-96 h-14
              rounded-2xl
              bg-white
              border border-sky-100
              pl-12 pr-5
              outline-none
              shadow-sm
              focus:border-sky-400
              focus:ring-4
              focus:ring-sky-100
              transition-all
            "
          />
        </div>

        {/* MAIL */}
        <button
          className="
            relative
            w-14 h-14
            rounded-2xl
            bg-white
            border border-sky-100
            hover:bg-sky-50
            hover:border-sky-300
            transition
            flex items-center justify-center
            shadow-sm
          "
        >
          <Mail className="w-5 h-5 text-sky-700" />

          <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-red-500"></span>
        </button>

        {/* NOTIFICATION */}
        <button
          className="
            relative
            w-14 h-14
            rounded-2xl
            bg-white
            border border-sky-100
            hover:bg-sky-50
            hover:border-sky-300
            transition
            flex items-center justify-center
            shadow-sm
          "
        >
          <Bell className="w-5 h-5 text-sky-700" />

          <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-red-500"></span>
        </button>

        {/* PROFILE */}
        <div
          className="
            hidden lg:flex
            items-center gap-3
            bg-white
            border border-sky-100
            hover:border-sky-300
            px-4 py-2
            rounded-2xl
            shadow-sm
            transition
            cursor-pointer
          "
        >
          <div
            className="
              w-12 h-12
              rounded-2xl
              bg-gradient-to-br
              from-sky-500
              to-sky-700
              flex items-center justify-center
              text-white
              font-bold
              shadow-md
            "
          >
            {user?.username?.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="text-sm font-bold text-slate-800">{user?.username}</p>

            <p className="text-xs text-slate-500">Quản trị viên</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
