// pages/manager/LandingPage.tsx

import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  ChevronRight,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";

const LandingPage = () => {
  return (
    <section className="h-full overflow-hidden bg-slate-50 text-slate-700">
      <div className="mx-auto grid h-full w-full max-w-7xl items-center px-4 py-4 sm:px-6 lg:px-10">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-sky-700 shadow-sm sm:text-sm">
              <ShieldCheck className="h-4 w-4" />
              Manager Secure System
            </div>

            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Hệ thống quản lý
              <span className="block text-sky-700">B-Hub Manager</span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base lg:text-lg">
              Khu vực dành riêng cho Manager theo dõi vận hành, xử lý hoạt động
              hệ thống và quản lý quy trình làm việc.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-100">
                <ClipboardList className="h-5 w-5 text-sky-600" />
                <div>
                  <p className="font-bold text-slate-800">Monitoring</p>
                  <p className="text-sm text-slate-500">
                    Theo dõi hoạt động
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-100">
                <BriefcaseBusiness className="h-5 w-5 text-sky-600" />
                <div>
                  <p className="font-bold text-slate-800">Management</p>
                  <p className="text-sm text-slate-500">
                    Quản lý vận hành
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 lg:mt-7">
              <Link
                to="/manager/login"
                className="inline-flex items-center gap-3 rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-100 transition-all hover:bg-sky-700 active:scale-[0.98] sm:px-7 sm:py-4 sm:text-base"
              >
                Đăng nhập
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
              <div className="relative">
                <img
                  src="/img/manager.webp"
                  alt="manager"
                  className="h-[min(470px,calc(100vh-190px))] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-sky-950/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-sky-100 backdrop-blur-sm sm:text-sm">
                    <ChevronRight className="h-4 w-4" />
                    Manager Workspace
                  </div>
                  <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">
                    Welcome Manager
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-sky-100 sm:text-base">
                    Đăng nhập để truy cập hệ thống quản lý và vận hành B-Hub.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingPage;
