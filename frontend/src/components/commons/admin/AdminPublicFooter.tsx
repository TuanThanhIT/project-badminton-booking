// components/commons/admin/AdminPublicFooter.tsx

import { ShieldCheck, LockKeyhole, LayoutDashboard } from "lucide-react";

const AdminPublicFooter = () => {
  return (
    <footer
      className="
        border-t border-sky-100/70

        bg-white/70
        backdrop-blur-2xl
      "
    >
      <div
        className="
          max-w-8xl
          mx-auto

          px-5
          sm:px-8
          lg:px-10

          py-4

          flex
          flex-col
          lg:flex-row

          items-center
          justify-between

          gap-4
        "
      >
        {/* LEFT */}
        <div className="text-center lg:text-left">
          <h3
            className="
              text-base
              sm:text-lg

              font-black
              tracking-tight

              text-sky-950
            "
          >
            B-Hub Admin System
          </h3>

          <p
            className="
              mt-1

              text-xs
              sm:text-sm

              text-slate-500
              leading-relaxed
            "
          >
            Nền tảng quản trị và vận hành hệ thống với bảo mật tập trung.
          </p>
        </div>

        {/* RIGHT */}
        <div
          className="
            flex
            items-center
            justify-center

            flex-wrap
            gap-2
            sm:gap-3
          "
        >
          <div
            className="
              flex items-center gap-2

              px-3 py-2
              sm:px-4

              rounded-full

              bg-sky-50/80
              border border-sky-100

              text-sky-700
              text-xs
              sm:text-sm

              font-semibold

              shadow-sm
            "
          >
            <ShieldCheck className="w-4 h-4 text-sky-500" />
            Security
          </div>

          <div
            className="
              flex items-center gap-2

              px-3 py-2
              sm:px-4

              rounded-full

              bg-white/80
              border border-slate-200

              text-slate-600
              text-xs
              sm:text-sm

              font-semibold

              shadow-sm
            "
          >
            <LockKeyhole className="w-4 h-4 text-sky-500" />
            Authentication
          </div>

          <div
            className="
              flex items-center gap-2

              px-3 py-2
              sm:px-4

              rounded-full

              bg-white/80
              border border-slate-200

              text-slate-600
              text-xs
              sm:text-sm

              font-semibold

              shadow-sm
            "
          >
            <LayoutDashboard className="w-4 h-4 text-sky-500" />
            Management
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AdminPublicFooter;
