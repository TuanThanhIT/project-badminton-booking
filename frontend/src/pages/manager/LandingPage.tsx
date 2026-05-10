// pages/manager/LandingPage.tsx

import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ClipboardList,
  BriefcaseBusiness,
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
            bg-cyan-200/40
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
            bg-sky-200/40
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
            <div
              className="
                inline-flex
                items-center
                gap-2

                px-4 py-2
                rounded-full

                bg-white
                border border-cyan-100
                shadow-sm

                text-cyan-800
                text-xs
                sm:text-sm
                font-semibold
              "
            >
              <ShieldCheck className="w-4 h-4" />
              Manager Secure System
            </div>

            <h1
              className="
                mt-6

                text-3xl
                sm:text-4xl
                lg:text-5xl

                leading-tight
                font-black
                tracking-tight
                text-cyan-950
              "
            >
              Hệ thống quản lý
              <span className="block text-cyan-600">B-Hub Manager</span>
            </h1>

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
              Khu vực dành riêng cho Manager theo dõi vận hành, xử lý hoạt động
              hệ thống và quản lý quy trình làm việc.
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
              <div
                className="
                  px-5 py-4
                  rounded-2xl

                  bg-white/90
                  border border-cyan-100
                  shadow-sm

                  flex items-center gap-3
                "
              >
                <ClipboardList className="w-5 h-5 text-cyan-600" />

                <div>
                  <p className="font-bold text-slate-800">Monitoring</p>

                  <p className="text-sm text-slate-500">Theo dõi hoạt động</p>
                </div>
              </div>

              <div
                className="
                  px-5 py-4
                  rounded-2xl

                  bg-white/90
                  border border-cyan-100
                  shadow-sm

                  flex items-center gap-3
                "
              >
                <BriefcaseBusiness className="w-5 h-5 text-cyan-600" />

                <div>
                  <p className="font-bold text-slate-800">Management</p>

                  <p className="text-sm text-slate-500">Quản lý vận hành</p>
                </div>
              </div>
            </div>

            {/* BUTTON */}
            <div className="mt-8 lg:mt-10">
              <Link
                to="/manager/login"
                className="
                  inline-flex
                  items-center
                  gap-3

                  px-6 py-3
                  sm:px-7 sm:py-4

                  rounded-2xl

                  bg-gradient-to-r
                  from-cyan-500
                  to-sky-600

                  text-white
                  text-sm
                  sm:text-base
                  font-bold

                  shadow-lg shadow-cyan-200/60

                  hover:scale-[1.02]
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
            <div
              className="
                absolute
                inset-0

                rounded-full
                bg-cyan-300/20
                blur-3xl
                scale-110
              "
            />

            <div
              className="
                relative
                overflow-hidden

                rounded-[28px]
                lg:rounded-[36px]

                border border-cyan-100
                bg-white

                shadow-[0_30px_80px_rgba(6,182,212,0.18)]
              "
            >
              <img
                src="/img/manager.webp"
                alt="manager"
                className="
                  w-full

                  h-[320px]
                  sm:h-[420px]
                  lg:h-[560px]

                  object-cover
                "
              />

              <div
                className="
                  absolute inset-0

                  bg-gradient-to-t
                  from-cyan-950/80
                  via-cyan-900/20
                  to-transparent
                "
              />

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
                  <ChevronRight className="w-4 h-4" />
                  Manager Workspace
                </div>

                <h3
                  className="
                    mt-4

                    text-2xl
                    sm:text-3xl

                    font-black
                    text-white
                  "
                >
                  Welcome Manager
                </h3>

                <p
                  className="
                    mt-2

                    text-sm
                    sm:text-base

                    text-white/80
                    leading-relaxed
                  "
                >
                  Đăng nhập để truy cập hệ thống quản lý và vận hành B-Hub.
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
