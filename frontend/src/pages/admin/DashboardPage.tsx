// =========================
// pages/admin/AdminDashboardPage.tsx
// =========================

const AdminDashboardPage = () => {
  return (
    <div>
      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: "Tổng doanh thu",
            value: "245.000.000đ",
            growth: "+18% tháng này",
          },
          {
            title: "Đơn hàng",
            value: "1.248",
            growth: "+12% tháng này",
          },
          {
            title: "Lượt đặt sân",
            value: "563",
            growth: "+9% tháng này",
          },
          {
            title: "Khách hàng",
            value: "3.245",
            growth: "+24% tháng này",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-xl transition"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-slate-500 text-sm font-medium">
                  {item.title}
                </p>

                <h3 className="text-4xl font-bold text-slate-800 mt-3">
                  {item.value}
                </h3>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 text-xl">
                📊
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
              <span>▲</span>
              {item.growth}
            </div>
          </div>
        ))}
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="xl:col-span-2 space-y-8">
          {/* CHART */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  Thống kê doanh thu
                </h3>

                <p className="text-slate-500 mt-1">
                  Tổng quan hoạt động hệ thống
                </p>
              </div>

              <button className="px-5 py-2 rounded-xl bg-sky-500 text-white font-medium hover:bg-sky-600 transition">
                Xuất báo cáo
              </button>
            </div>

            <div className="h-80 rounded-3xl bg-gradient-to-br from-sky-50 to-sky-100 flex items-end justify-between px-8 pb-8 gap-4">
              {[40, 55, 75, 60, 95, 80, 110, 90, 130, 100].map(
                (height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t-2xl bg-sky-500 hover:bg-sky-600 transition"
                    style={{ height: `${height * 2}px` }}
                  />
                ),
              )}
            </div>
          </div>

          {/* ORDERS */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  Đơn hàng gần đây
                </h3>

                <p className="text-slate-500 mt-1">
                  Danh sách đơn hàng mới nhất
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-lg">
                      #{item}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">
                        Đơn hàng #ORD-2026-{item}245
                      </p>

                      <p className="text-sm text-slate-500 mt-1">
                        Đơn mua dụng cụ cầu lông
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-lg text-slate-800">
                      2.450.000đ
                    </p>

                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-xs font-semibold mt-2">
                      Hoàn thành
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-8">
          {/* ACTIVITY */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-8">
              Hoạt động gần đây
            </h3>

            <div className="space-y-6">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center shrink-0">
                    📌
                  </div>

                  <div>
                    <p className="font-medium text-slate-800 leading-relaxed">
                      Có lượt đặt sân mới từ khách hàng.
                    </p>

                    <p className="text-sm text-slate-500 mt-1">2 phút trước</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QUICK ACTION */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-8">
              Thao tác nhanh
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {[
                "Thêm sản phẩm",
                "Tạo lịch sân",
                "Gửi thông báo",
                "Xuất thống kê",
              ].map((item) => (
                <button
                  key={item}
                  className="h-28 rounded-2xl bg-slate-100 hover:bg-sky-500 hover:text-white transition-all duration-200 font-semibold text-slate-700"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
