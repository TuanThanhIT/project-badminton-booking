import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import {
  clearRevenueError,
  getRevenueDate,
  getRevenueOverview,
} from "../../store/slices/admin/revenueSlice";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import PieChartBox from "../../components/ui/admin/Charts/PieChartBox";
import {
  ApiTimeRange,
  RevenueOverviewBlock,
  SectionHeader,
} from "../../components/ui/admin/RevenueOverview";
import {
  clearDashboardError,
  getDashboardBookingToday,
  getDashboardLowStock,
  getDashboardRetailOrder,
  getDashboardRevenue,
  getDashboardTopBeverages,
  getDashboardTopProducts,
  getDashboardWorkShift,
} from "../../store/slices/admin/dashboardSlice";
import LineChartBox from "../../components/ui/admin/Charts/LineChartBox";

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const revenueOverview = useAppSelector(
    (state) => state.revenueAdmin.revenueOverview
  );
  const revenueDate = useAppSelector((state) => state.revenueAdmin.revenueDate);
  const loadingRevenue = useAppSelector((state) => state.revenueAdmin.loading);
  const errorRevenue = useAppSelector((state) => state.revenueAdmin.error);

  const [dateDaily, setDateDaily] = useState<string | undefined>(undefined);
  const [overviewStart, setOverviewStart] = useState("");
  const [overviewEnd, setOverviewEnd] = useState("");

  const dashboardRevenue = useAppSelector(
    (state) => state.dashboardAdmin.dashboardRevenue
  );
  const bookingToday = useAppSelector(
    (state) => state.dashboardAdmin.dashboardBookingToday
  );
  const retailOrder = useAppSelector(
    (state) => state.dashboardAdmin.dashboardRetailOrder
  );
  const lowStock = useAppSelector(
    (state) => state.dashboardAdmin.dashboardLowStock
  );
  const topBeverages = useAppSelector(
    (state) => state.dashboardAdmin.dashboardTopBeverages
  );
  const topProducts = useAppSelector(
    (state) => state.dashboardAdmin.dashboardTopProducts
  );
  const workShift = useAppSelector(
    (state) => state.dashboardAdmin.dashboardWorkShift
  );
  const dashboardError = useAppSelector((state) => state.dashboardAdmin.error);
  const dashboardLoading = useAppSelector(
    (state) => state.dashboardAdmin.loading
  );

  useEffect(() => {
    dispatch(
      getRevenueOverview({
        data: { startDate: overviewStart, endDate: overviewEnd },
      })
    );
  }, [overviewStart, overviewEnd, dispatch]);

  useEffect(() => {
    dispatch(
      getRevenueDate({
        data: dateDaily ? { date: dateDaily } : {},
      })
    );
  }, [dateDaily, dispatch]);

  useEffect(() => {
    dispatch(getDashboardRevenue());
    dispatch(getDashboardLowStock());
    dispatch(getDashboardRetailOrder());
    dispatch(getDashboardBookingToday());
    dispatch(getDashboardTopProducts());
    dispatch(getDashboardTopBeverages());
    dispatch(getDashboardWorkShift());
  }, [dispatch]);

  useEffect(() => {
    const error = errorRevenue || dashboardError;
    if (error) {
      toast.error(error);
      if (errorRevenue) dispatch(clearRevenueError());
      if (dashboardError) dispatch(clearDashboardError());
    }
  }, [errorRevenue, dashboardError, dispatch]);

  if (loadingRevenue || dashboardLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-sky-600 mb-3" />
        <p className="font-medium text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  const overviewChartData = revenueOverview
    ? [
        { name: "Đơn hàng online", value: revenueOverview.revenue.onlineOrder },
        {
          name: "Đặt sân online",
          value: revenueOverview.revenue.onlineBooking,
        },
        { name: "Trực tiếp", value: revenueOverview.revenue.offline },
      ]
    : [];

  const dailyPieData = revenueDate
    ? [
        { name: "Đơn hàng online", value: revenueDate.revenue.onlineOrder },
        { name: "Đặt sân online", value: revenueDate.revenue.onlineBooking },
        { name: "Trực tiếp", value: revenueDate.revenue.offline },
      ]
    : [];

  const lineChartData =
    dashboardRevenue && dashboardRevenue.length > 0
      ? dashboardRevenue.map((i: any) => ({
          name: new Date(i.date).toLocaleDateString("vi-VN"),
          value: i.total,
        }))
      : [];

  return (
    <div className="p-6 space-y-10 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl border border-gray-200 p-10 space-y-6">
        <h1 className="inline-flex items-center gap-2 text-2xl font-bold text-sky-700 mb-8 relative">
          Dashboard
          <span className="absolute left-0 -bottom-3 w-1/2 h-1 bg-sky-400 rounded-sm"></span>
        </h1>

        {/* ================= TỔNG QUAN ================= */}
        <section className="space-y-4">
          <SectionHeader
            title="Tổng quan doanh thu"
            start={overviewStart}
            end={overviewEnd}
            onStart={setOverviewStart}
            onEnd={setOverviewEnd}
          />

          <ApiTimeRange
            startDate={revenueOverview?.startDate}
            endDate={revenueOverview?.endDate}
          />

          <RevenueOverviewBlock
            overview={revenueOverview}
            chartData={overviewChartData}
          />
        </section>

        {/* ================= THEO NGÀY ================= */}
        <section className="space-y-3">
          <div>
            <h2 className="text-xl font-semibold text-sky-700">
              Doanh thu theo ngày
            </h2>
            {revenueDate?.date && (
              <p className="text-xs text-gray-500 mt-1">
                Dữ liệu ngày:&nbsp;
                <span className="font-medium text-gray-700">
                  {new Date(revenueDate.date).toLocaleDateString("vi-VN")}
                </span>
              </p>
            )}
          </div>

          {revenueDate && (
            <div className="space-y-3">
              {/* ===== Tổng doanh thu ===== */}
              <p className="text-right font-semibold text-green-700">
                Tổng: {revenueDate.revenue.total.toLocaleString()} ₫
              </p>

              {/* ===== Biểu đồ Pie ===== */}
              <PieChartBox data={dailyPieData} />
            </div>
          )}

          {/* ===== Biểu đồ Line ===== */}
          {dashboardRevenue && dashboardRevenue.length > 0 && (
            <LineChartBox data={lineChartData} />
          )}
        </section>

        {/* ================= TÌNH HÌNH HÔM NAY ================= */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-sky-700">
            Tình hình hôm nay
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ===== BOOKING TODAY ===== */}
            {bookingToday && (
              <div className="bg-gradient-to-br from-sky-100 to-sky-50 border border-sky-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-sky-700">
                    Đặt sân hôm nay
                  </p>
                  <span className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded-full">
                    Booking
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Online</span>
                    <span className="font-bold text-sky-600 text-lg">
                      {bookingToday.online}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Trực tiếp</span>
                    <span className="font-bold text-green-600 text-lg">
                      {bookingToday.offline}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-sky-200 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Tổng lượt
                  </span>
                  <span className="text-2xl font-extrabold text-purple-700">
                    {bookingToday.total}
                  </span>
                </div>
              </div>
            )}

            {/* ===== RETAIL ORDER ===== */}
            {retailOrder && (
              <div className="bg-gradient-to-br from-indigo-100 to-indigo-50 border border-indigo-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-indigo-700">
                    Bán lẻ hôm nay
                  </p>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                    Retail
                  </span>
                </div>

                <div className="flex gap-4 text-sm">
                  {/* Online */}
                  <div className="flex-1 bg-white border border-indigo-100 rounded-xl p-3 shadow-sm text-center">
                    <p className="text-gray-600">Online</p>
                    <p className="font-bold text-indigo-700 text-lg mt-1">
                      {retailOrder.onlineItems}
                    </p>
                  </div>

                  {/* Offline */}
                  <div className="flex-1 bg-white border border-green-100 rounded-xl p-3 shadow-sm text-center">
                    <p className="text-gray-600">Trực tiếp</p>
                    <p className="font-bold text-green-600 text-lg mt-1">
                      {retailOrder.offlineItems}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ===== LOW STOCK ===== */}
            {lowStock && (
              <div className="bg-gradient-to-br from-red-100 to-red-50 border border-red-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-red-700">
                    Sắp hết hàng
                  </p>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    Cảnh báo tồn kho
                  </span>
                </div>

                {/* ===== SCROLLABLE LIST ===== */}
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                  {/* ===== PRODUCT ===== */}
                  {lowStock.products?.map((p: any) => (
                    <div
                      key={`p-${p.id}`}
                      className="flex items-center justify-between bg-white rounded-xl px-3 py-2 shadow-sm border border-red-100"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800 line-clamp-1">
                          {p.product.productName}
                        </span>
                        <span className="text-xs text-gray-500">
                          Màu: {p.color} · Size: {p.size} · SP
                        </span>
                      </div>

                      <span
                        className={`text-sm font-bold px-3 py-1 rounded-full ${
                          p.stock <= 3
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {p.stock}
                      </span>
                    </div>
                  ))}

                  {/* ===== BEVERAGE ===== */}
                  {lowStock.beverages?.map((b: any) => (
                    <div
                      key={`b-${b.id}`}
                      className="flex items-center justify-between bg-white rounded-xl px-3 py-2 shadow-sm border border-red-100"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800 line-clamp-1">
                          {b.name}
                        </span>
                        <span className="text-xs text-gray-500">Đồ uống</span>
                      </div>

                      <span
                        className={`text-sm font-bold px-3 py-1 rounded-full ${
                          b.stock <= 5
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {b.stock}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ================= TOP PRODUCTS & BEVERAGES ================= */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-sky-700">
            Sản phẩm & đồ uống bán chạy
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ===== TOP PRODUCTS ===== */}
            {topProducts && topProducts.data?.length > 0 && (
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 border border-yellow-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-yellow-700">
                    Top Products
                  </p>
                  <span className="text-xs bg-yellow-200 text-yellow-700 px-2 py-1 rounded-full">
                    Sản phẩm
                  </span>
                </div>

                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                  {topProducts.data.map((p: any) => (
                    <div
                      key={`prod-${p.varientId}`}
                      className="flex items-center justify-between bg-white rounded-xl px-3 py-2 shadow-sm border border-yellow-100"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800 line-clamp-1">
                          {p.productName}
                        </span>
                        <span className="text-xs text-gray-500">
                          Màu: {p.color} · Size: {p.size}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-semibold text-gray-600">
                          Bán: {p.totalSold}
                        </span>
                        <span className="text-sm font-bold text-yellow-700">
                          {p.revenue.toLocaleString()} ₫
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== TOP BEVERAGES ===== */}
            {topBeverages && topBeverages.data?.length > 0 && (
              <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-emerald-700">
                    Top Beverages
                  </p>
                  <span className="text-xs bg-emerald-200 text-emerald-700 px-2 py-1 rounded-full">
                    Đồ uống
                  </span>
                </div>

                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                  {topBeverages.data.map((b: any) => (
                    <div
                      key={`bev-${b.beverageId}`}
                      className="flex items-center justify-between bg-white rounded-xl px-3 py-2 shadow-sm border border-emerald-100"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800 line-clamp-1">
                          {b.name}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-semibold text-gray-600">
                          Bán: {b.totalSold}
                        </span>
                        <span className="text-sm font-bold text-emerald-700">
                          {b.revenue.toLocaleString()} ₫
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ================= WORK SHIFT ================= */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-sky-700">
            Theo dõi ca làm hôm nay
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {workShift && workShift.length > 0 ? (
              workShift.map((shift: any) => (
                <div
                  key={shift.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Header ca làm */}
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-lg font-semibold text-gray-800">
                      {shift.name}
                    </p>
                    <span className="text-sm text-gray-500">
                      {shift.startTime} - {shift.endTime}
                    </span>
                  </div>

                  {/* Danh sách nhân viên */}
                  {shift.employees.length > 0 ? (
                    <ul className="space-y-2">
                      {shift.employees.map((emp: any) => (
                        <li
                          key={emp.id}
                          className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2 shadow-sm hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-sky-300 flex items-center justify-center text-white font-semibold text-lg">
                              {emp.fullName
                                ? emp.fullName.charAt(0).toUpperCase()
                                : emp.username.charAt(0).toUpperCase()}
                            </div>
                            {/* Thông tin nhân viên */}
                            <div className="flex flex-col">
                              <span className="text-gray-800 font-medium">
                                {emp.fullName}
                              </span>
                              <span className="text-gray-500 text-xs">
                                {emp.roleInShift}
                              </span>
                              <span className="text-gray-400 text-xs">
                                {emp.username}
                              </span>
                            </div>
                          </div>

                          {/* Check-in / Check-out */}
                          <div className="flex flex-col items-end text-xs gap-1">
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500">🟢 In:</span>
                              <span className="font-medium text-green-700">
                                {emp.checkIn
                                  ? new Date(emp.checkIn).toLocaleTimeString()
                                  : "–"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500">🔴 Out:</span>
                              <span className="font-medium text-red-700">
                                {emp.checkOut
                                  ? new Date(emp.checkOut).toLocaleTimeString()
                                  : "–"}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm mt-2 text-center">
                      Chưa có nhân viên check-in
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm col-span-3">
                Chưa có ca làm hôm nay
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
export default DashboardPage;
