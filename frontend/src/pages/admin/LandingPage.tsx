// pages/admin/AdminLandingPage.tsx

import { Link } from "react-router-dom";
import {
  ShieldCheck,
  LayoutDashboard,
  LockKeyhole,
  ChevronRight,
} from "lucide-react";

const LandingPage = () => {
  return (
    <section
      className="
        relative
        overflow-hidden

        h-full
        min-h-[calc(100vh-162px)]

        flex
        items-center
      "
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="
            absolute
            top-[-120px]
            right-[-120px]

            w-[260px]
            h-[260px]

            lg:w-[340px]
            lg:h-[340px]

            rounded-full
            bg-sky-200/30
            blur-3xl
          "
        />

        <div
          className="
            absolute
            bottom-[-120px]
            left-[-120px]

            w-[240px]
            h-[240px]

            lg:w-[320px]
            lg:h-[320px]

            rounded-full
            bg-cyan-200/30
            blur-3xl
          "
        />

        <div
          className="
            absolute
            top-[35%]
            left-[45%]

            w-[180px]
            h-[180px]

            rounded-full
            bg-white/70
            blur-3xl
          "
        />
      </div>

      <div
        className="
          max-w-7xl
          mx-auto
          w-full

          px-5
          sm:px-8

          py-8
          lg:py-0
        "
      >
        <div
          className="
            grid
            lg:grid-cols-2

            gap-10
            lg:gap-16

            items-center
          "
        >
          {/* LEFT */}
          <div className="order-2 lg:order-1">
            {/* BADGE */}
            <div
              className="
                inline-flex
                items-center
                gap-2

                px-4 py-2
                rounded-full

                bg-white
                border border-sky-100
                shadow-sm

                text-sky-800
                text-xs
                sm:text-sm
                font-semibold
              "
            >
              <LockKeyhole className="w-4 h-4" />
              Secure Admin Portal
            </div>

            {/* TITLE */}
            <h1
              className="
                mt-6

                text-3xl
                sm:text-4xl
                lg:text-5xl

                leading-tight
                font-extrabold
                tracking-tight
                text-sky-950
              "
            >
              Hệ thống quản trị
              <span className="block text-sky-600">B-Hub Admin</span>
            </h1>

            {/* DESC */}
            <p
              className="
                mt-5

                text-sm
                sm:text-base
                lg:text-lg

                leading-relaxed
                text-slate-600

                max-w-xl
              "
            >
              Khu vực dành cho Admin quản lý người dùng, vận hành hệ thống và
              theo dõi hoạt động nền tảng B-Hub.
            </p>

            {/* FEATURES */}
            <div
              className="
                grid
                sm:grid-cols-2

                gap-4
                mt-8
              "
            >
              {/* CARD 1 */}
              <div
                className="
                  px-5 py-4
                  rounded-2xl

                  bg-white/90
                  border border-sky-100
                  shadow-sm

                  flex items-center gap-3

                  transition-all duration-300
                  hover:-translate-y-1
                  hover:shadow-md
                "
              >
                <LayoutDashboard className="w-5 h-5 text-sky-600" />

                <div>
                  <p className="font-bold text-slate-800">Dashboard</p>

                  <p className="text-sm text-slate-500">
                    Quản lý hệ thống trực quan
                  </p>
                </div>
              </div>

              {/* CARD 2 */}
              <div
                className="
                  px-5 py-4
                  rounded-2xl

                  bg-white/90
                  border border-sky-100
                  shadow-sm

                  flex items-center gap-3

                  transition-all duration-300
                  hover:-translate-y-1
                  hover:shadow-md
                "
              >
                <ShieldCheck className="w-5 h-5 text-sky-600" />

                <div>
                  <p className="font-bold text-slate-800">Security</p>

                  <p className="text-sm text-slate-500">Bảo mật & phân quyền</p>
                </div>
              </div>
            </div>

            {/* BUTTON */}
            <div className="mt-8 lg:mt-10">
              <Link
                to="/admin/login"
                className="
                  inline-flex
                  items-center
                  gap-3

                  px-6 py-3
                  sm:px-7 sm:py-4

                  rounded-2xl

                  bg-gradient-to-r
                  from-sky-500
                  to-cyan-500

                  text-white
                  text-sm
                  sm:text-base
                  font-bold

                  shadow-lg shadow-cyan-200/50

                  hover:scale-[1.01]
                  hover:shadow-xl

                  transition-all duration-300
                "
              >
                Đăng nhập
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative order-1 lg:order-2">
            {/* GLOW */}
            <div
              className="
                absolute
                inset-0

                rounded-full
                bg-cyan-300/15
                blur-3xl
                scale-110
              "
            />

            {/* IMAGE */}
            <div
              className="
                relative
                overflow-hidden

                rounded-[28px]
                lg:rounded-[36px]

                border border-sky-100
                bg-white

                shadow-[0_20px_60px_rgba(14,165,233,0.14)]
              "
            >
              <img
                src="/img/admin.png"
                alt="admin"
                className="
                  w-full

                  h-[320px]
                  sm:h-[420px]
                  lg:h-[560px]

                  object-cover
                "
              />

              {/* OVERLAY */}
              <div
                className="
                  absolute inset-0

                  bg-gradient-to-t
                  from-sky-950/70
                  via-sky-900/20
                  to-transparent
                "
              />

              {/* CONTENT */}
              <div
                className="
                  absolute
                  bottom-0
                  left-0
                  right-0

                  p-5
                  sm:p-8
                "
              >
                <div
                  className="
                    inline-flex
                    items-center
                    gap-2

                    px-4 py-2
                    rounded-full

                    bg-white/15
                    backdrop-blur-md
                    border border-white/20

                    text-white
                    text-xs
                    sm:text-sm
                    font-semibold
                  "
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Workspace
                </div>

                <h2
                  className="
                    mt-4

                    text-2xl
                    sm:text-3xl

                    font-black
                    text-white
                  "
                >
                  Welcome Admin
                </h2>

                <p
                  className="
                    mt-2

                    text-sm
                    sm:text-base

                    text-white/80
                    leading-relaxed
                  "
                >
                  Truy cập hệ thống quản trị để kiểm soát và vận hành nền tảng
                  B-Hub.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingPage;
