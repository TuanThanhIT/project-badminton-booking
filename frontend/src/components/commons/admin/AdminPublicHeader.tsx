// components/commons/admin/AdminPublicHeader.tsx

import { Link } from "react-router-dom";
import { ShieldCheck, LayoutDashboard } from "lucide-react";

const AdminPublicHeader = () => {
  return (
    <header
      className="
        sticky top-0 z-50

        border-b border-sky-100/70
        bg-white/70
        backdrop-blur-2xl
      "
    >
      <div
        className="
          max-w-8xl
          mx-auto

          h-[82px]

          px-5
          sm:px-8
          lg:px-10

          flex
          items-center
          justify-between
        "
      >
        {/* LEFT */}
        <Link
          to="/"
          className="
            flex
            items-center
            gap-4

            group
            transition-all
          "
        >
          <div
            className="
              relative

              w-11 h-11
              sm:w-12 sm:h-12

              rounded-2xl
              overflow-hidden

              border border-sky-100

              shadow-[0_10px_30px_rgba(14,165,233,0.10)]

              group-hover:scale-105
              transition-all duration-300
            "
          >
            <img
              src="/img/logo_badminton.jpg"
              alt="logo"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h1
              className="
                text-[20px]
                sm:text-[24px]

                font-black
                tracking-tight

                text-sky-950
              "
            >
              B-Hub Admin
            </h1>

            <p
              className="
                text-xs
                sm:text-sm

                text-slate-500
                font-medium
                tracking-wide
              "
            >
              Secure platform management
            </p>
          </div>
        </Link>

        {/* RIGHT */}
        <div className="hidden lg:flex items-center gap-3">
          <div
            className="
              flex
              items-center
              gap-2

              px-4 py-2
              rounded-full

              bg-sky-50/80
              border border-sky-100

              text-sky-700
              text-sm
              font-semibold

              shadow-sm
            "
          >
            <ShieldCheck className="w-4 h-4 text-sky-500" />
            Secure Access
          </div>

          <div
            className="
              flex
              items-center
              gap-2

              px-4 py-2
              rounded-full

              bg-white/80
              border border-slate-200

              text-slate-600
              text-sm
              font-semibold

              shadow-sm
            "
          >
            <LayoutDashboard className="w-4 h-4 text-sky-500" />
            System Dashboard
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminPublicHeader;
