import { Link } from "react-router-dom";
import { ShieldCheck, ClipboardList } from "lucide-react";

const ManagerPublicHeader = () => {
  return (
    <header
      className="
        sticky top-0 z-50

        border-b border-cyan-100
        bg-white/80
        backdrop-blur-xl
      "
    >
      <div
        className="
          max-w-8xl
          mx-auto

          h-[82px]
          px-10

          flex
          items-center
          justify-between
        "
      >
        {/* LEFT */}
        <Link to="/" className="flex items-center gap-4 group transition-all">
          <div
            className="
              relative
              w-12 h-12
              rounded-2xl
              overflow-hidden

              border border-cyan-200
              shadow-lg shadow-cyan-100

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
                text-[24px]
                font-black
                tracking-tight
                text-cyan-950
              "
            >
              B-Hub Manager
            </h1>

            <p className="text-sm text-cyan-700/70 font-medium">
              Hệ thống quản lý vận hành
            </p>
          </div>
        </Link>

        {/* RIGHT */}
        <div className="hidden lg:flex items-center gap-4">
          <div
            className="
              flex items-center gap-2

              px-4 py-2
              rounded-full

              bg-cyan-50
              border border-cyan-100

              text-cyan-800
              text-sm
              font-semibold
            "
          >
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
            Secure Access
          </div>

          <div
            className="
              flex items-center gap-2

              px-4 py-2
              rounded-full

              bg-white
              border border-slate-200

              text-slate-700
              text-sm
              font-semibold
            "
          >
            <ClipboardList className="w-4 h-4 text-cyan-600" />
            Operations Control
          </div>
        </div>
      </div>
    </header>
  );
};

export default ManagerPublicHeader;
