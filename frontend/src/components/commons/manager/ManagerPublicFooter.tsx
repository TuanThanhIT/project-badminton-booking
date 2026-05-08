import { ShieldCheck, BriefcaseBusiness, ClipboardList } from "lucide-react";

const ManagerPublicFooter = () => {
  return (
    <footer
      className="
        border-t border-cyan-100

        bg-white/80
        backdrop-blur-xl
      "
    >
      <div
        className="
          max-w-8xl
          mx-auto

          px-10
          py-5

          flex
          flex-col
          lg:flex-row

          items-center
          justify-between

          gap-5
        "
      >
        {/* LEFT */}
        <div>
          <h3 className="text-lg font-black text-cyan-950">
            B-Hub Manager System
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            Hệ thống quản lý dành cho Manager vận hành và theo dõi hoạt động.
          </p>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
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
            <ShieldCheck className="w-4 h-4" />
            Security
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
            <BriefcaseBusiness className="w-4 h-4 text-cyan-600" />
            Management
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
            Monitoring
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ManagerPublicFooter;
