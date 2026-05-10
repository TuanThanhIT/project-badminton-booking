// =========================
// pages/storeManager/StoreManagerDashboardPage.tsx
// =========================

const DashboardPage = () => {
  return (
    <div className="space-y-8">
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          {
            title: "Doanh thu hôm nay",
            value: "12.500.000đ",
          },
          {
            title: "Đơn hàng",
            value: "245",
          },
          {
            title: "Lượt đặt sân",
            value: "68",
          },
          {
            title: "Sản phẩm tồn kho",
            value: "1.248",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="
              bg-white
              rounded-3xl
              p-6
              border border-sky-100
              shadow-sm
            "
          >
            <p className="text-slate-500 text-sm font-medium">{item.title}</p>

            <h3 className="text-4xl font-black text-slate-800 mt-4">
              {item.value}
            </h3>
          </div>
        ))}
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-sky-100 p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">
            Hoạt động cửa hàng
          </h3>

          <div className="h-96 rounded-3xl bg-gradient-to-br from-sky-50 to-slate-100 flex items-center justify-center text-slate-400">
            Biểu đồ doanh thu cửa hàng
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white rounded-3xl border border-sky-100 p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">
            Hoạt động gần đây
          </h3>

          <div className="space-y-5">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100"
              >
                <p className="font-semibold text-slate-700">
                  Đơn hàng mới vừa được tạo
                </p>

                <p className="text-sm text-slate-500 mt-1">5 phút trước</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
