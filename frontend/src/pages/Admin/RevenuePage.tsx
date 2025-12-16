import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import {
  clearRevenueError,
  getRevenueBeverage,
  getRevenueDate,
  getRevenueOverview,
  getRevenueProduct,
  getRevenueTransaction,
} from "../../store/slices/admin/revenueSlice";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import PieChartBox from "../../components/ui/admin/Charts/PieChartBox";
import BarChartBox from "../../components/ui/admin/Charts/BarChartBox";
import Pagination from "../../components/ui/admin/Pagination";

const LIMIT = 10;

export default function RevenuePage() {
  const dispatch = useAppDispatch();
  const {
    revenueOverview,
    revenueDate,
    revenueTransaction,
    revenueProduct,
    revenueBeverage,
    loading,
    error,
  } = useAppSelector((state) => state.revenueAdmin);

  /* ================= STATE ================= */
  const [dateDaily, setDateDaily] = useState("");

  const [overviewStart, setOverviewStart] = useState("");
  const [overviewEnd, setOverviewEnd] = useState("");

  const [transactionStart, setTransactionStart] = useState("");
  const [transactionEnd, setTransactionEnd] = useState("");
  const [pageTransaction, setPageTransaction] = useState(1);

  const [productStart, setProductStart] = useState("");
  const [productEnd, setProductEnd] = useState("");
  const [pageProduct, setPageProduct] = useState(1);

  const [beverageStart, setBeverageStart] = useState("");
  const [beverageEnd, setBeverageEnd] = useState("");
  const [pageBeverage, setPageBeverage] = useState(1);

  /* ================= FETCH ================= */
  useEffect(() => {
    dispatch(
      getRevenueOverview({
        data: { startDate: overviewStart, endDate: overviewEnd },
      })
    );
  }, [overviewStart, overviewEnd]);

  useEffect(() => {
    dispatch(
      getRevenueDate({
        data: dateDaily ? { date: dateDaily } : {},
      })
    );
  }, [dateDaily]);

  useEffect(() => {
    dispatch(
      getRevenueTransaction({
        data: {
          startDate: transactionStart,
          endDate: transactionEnd,
          page: pageTransaction,
          limit: LIMIT,
        },
      })
    );
  }, [transactionStart, transactionEnd, pageTransaction]);

  useEffect(() => {
    dispatch(
      getRevenueProduct({
        data: {
          startDate: productStart,
          endDate: productEnd,
          page: pageProduct,
          limit: LIMIT,
        },
      })
    );
  }, [productStart, productEnd, pageProduct]);

  useEffect(() => {
    dispatch(
      getRevenueBeverage({
        data: {
          startDate: beverageStart,
          endDate: beverageEnd,
          page: pageBeverage,
          limit: LIMIT,
        },
      })
    );
  }, [beverageStart, beverageEnd, pageBeverage]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearRevenueError());
    }
  }, [error]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-sky-600 mb-3" />
        <p className="font-medium text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  /* ================= CHART DATA ================= */
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

  return (
    <div className="p-6 space-y-10 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl border border-gray-200 p-10 space-y-6">
        <h1 className="inline-flex items-center gap-2 text-2xl font-bold text-sky-700 mb-8 relative">
          Quản lý doanh thu
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

          {revenueOverview && (
            <div className="space-y-6">
              <SummaryGrid data={revenueOverview.revenue} />

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                  <BarChartBox data={overviewChartData} />
                </div>

                <OverviewStatsGrid overview={revenueOverview} />
              </div>
            </div>
          )}
        </section>

        {/* ================= THEO NGÀY ================= */}
        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold text-green-700">
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

            <input
              type="date"
              value={dateDaily}
              onChange={(e) => setDateDaily(e.target.value)}
              className="border border-gray-500 px-3 py-2 rounded-lg text-sm"
            />
          </div>

          {revenueDate && (
            <>
              <PieChartBox data={dailyPieData} />
              <p className="text-right font-semibold text-green-700 text-sm">
                Tổng: {revenueDate.revenue.total.toLocaleString()} ₫
              </p>
            </>
          )}
        </section>

        {/* ================= GIAO DỊCH ================= */}
        <DataBlock
          title="Lịch sử giao dịch"
          start={transactionStart}
          end={transactionEnd}
          onStart={setTransactionStart}
          onEnd={setTransactionEnd}
          apiData={revenueTransaction}
          page={pageTransaction}
          setPage={setPageTransaction}
          headers={["Mã", "Loại", "Số tiền", "Thanh toán", "Thời gian"]}
          rows={
            revenueTransaction?.rows.map((i: any) => [
              `#${i.id}`,
              i.type,
              `${i.amount.toLocaleString()} ₫`,
              i.paymentMethod,
              new Date(i.paidAt).toLocaleString("vi-VN"),
            ]) || []
          }
        />

        {/* ================= SẢN PHẨM ================= */}
        <DataBlock
          title="Doanh thu sản phẩm"
          start={productStart}
          end={productEnd}
          onStart={setProductStart}
          onEnd={setProductEnd}
          apiData={revenueProduct}
          page={pageProduct}
          setPage={setPageProduct}
          headers={["Sản phẩm", "Danh mục", "Đã bán", "Doanh thu"]}
          rows={
            revenueProduct?.data.map((i: any) => [
              i.productName,
              i.categoryName,
              i.totalSold,
              `${i.revenue.toLocaleString()} ₫`,
            ]) || []
          }
        />

        {/* ================= ĐỒ UỐNG ================= */}
        <DataBlock
          title="Doanh thu đồ uống"
          start={beverageStart}
          end={beverageEnd}
          onStart={setBeverageStart}
          onEnd={setBeverageEnd}
          apiData={revenueBeverage}
          page={pageBeverage}
          setPage={setPageBeverage}
          headers={["Tên đồ uống", "Đã bán", "Doanh thu"]}
          rows={
            revenueBeverage?.data.map((i: any) => [
              i.name,
              i.totalSold,
              `${i.revenue.toLocaleString()} ₫`,
            ]) || []
          }
        />
      </div>
    </div>
  );
}

/* ================= COMPONENT PHỤ ================= */

const SectionHeader = ({ title, start, end, onStart, onEnd }: any) => (
  <div className="flex items-end justify-between">
    <h2 className="text-xl font-semibold text-sky-700">{title}</h2>
    <div className="flex gap-2">
      <input
        type="date"
        value={start}
        onChange={(e) => onStart(e.target.value)}
        className="border border-gray-500 px-3 py-2 rounded-lg text-sm"
      />
      <input
        type="date"
        value={end}
        onChange={(e) => onEnd(e.target.value)}
        className="border border-gray-500 px-3 py-2 rounded-lg text-sm"
      />
    </div>
  </div>
);

const ApiTimeRange = ({ startDate, endDate }: any) => {
  if (!startDate || !endDate) return null;
  return (
    <p className="text-xs text-gray-500">
      Giai đoạn:&nbsp;
      <span className="font-medium text-gray-700">
        {new Date(startDate).toLocaleDateString("vi-VN")}
      </span>
      &nbsp;–&nbsp;
      <span className="font-medium text-gray-700">
        {new Date(endDate).toLocaleDateString("vi-VN")}
      </span>
    </p>
  );
};

const SummaryGrid = ({ data }: any) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    <SummaryItem title="Tổng doanh thu" value={data.total} highlight />
    <SummaryItem title="Đơn hàng online" value={data.onlineOrder} />
    <SummaryItem title="Đặt sân online" value={data.onlineBooking} />
    <SummaryItem title="Trực tiếp" value={data.offline} />
  </div>
);

const SummaryItem = ({ title, value, highlight }: any) => (
  <div
    className={`rounded-xl p-4 border ${
      highlight ? "bg-sky-50 border-sky-200" : "bg-white border-gray-500"
    }`}
  >
    <p className="text-xs text-gray-500">{title}</p>
    <p className="text-lg font-semibold mt-1">{value.toLocaleString()} ₫</p>
  </div>
);

/* ===== OVERVIEW STATS ===== */

const OverviewStatsGrid = ({ overview }: any) => (
  <div className="grid grid-cols-1 gap-4">
    <SimpleStatCard
      title="Đơn hàng"
      total={overview.orders.total}
      extra={[
        { label: "Hoàn thành", value: overview.orders.completed },
        { label: "Huỷ", value: overview.orders.cancelled },
      ]}
    />

    <SimpleStatCard
      title="Đặt sân online"
      total={overview.bookings.total}
      extra={[
        { label: "Hoàn thành", value: overview.bookings.completed },
        { label: "Huỷ", value: overview.bookings.cancelled },
      ]}
    />

    <SimpleStatCard
      title="Đặt sân trực tiếp"
      total={overview.offlineBookings.total}
      extra={[{ label: "Đã thanh toán", value: overview.offlineBookings.paid }]}
    />
  </div>
);

const SimpleStatCard = ({ title, total, extra }: any) => (
  <div className="border border-gray-500 rounded-xl px-4 py-3 bg-white">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-gray-700">{title}</p>
      <p className="text-lg font-semibold text-gray-900">{total}</p>
    </div>

    {extra?.length > 0 && (
      <div className="flex gap-4 mt-2 text-xs text-gray-500">
        {extra.map((i: any) => (
          <span key={i.label}>
            {i.label}:{" "}
            <span className="font-medium text-gray-700">{i.value}</span>
          </span>
        ))}
      </div>
    )}
  </div>
);

/* ===== TABLE / PAGINATION / CHART ===== */

const DataBlock = ({
  title,
  start,
  end,
  onStart,
  onEnd,
  apiData,
  headers,
  rows,
  page,
  setPage,
}: any) => (
  <section className="space-y-3">
    <SectionHeader
      title={title}
      start={start}
      end={end}
      onStart={onStart}
      onEnd={onEnd}
    />
    <ApiTimeRange startDate={apiData?.startDate} endDate={apiData?.endDate} />
    {apiData && (
      <>
        <TableSimple headers={headers} rows={rows} />
        <Pagination
          page={page}
          total={apiData.total}
          onPrev={() => setPage(page - 1)}
          onNext={() => setPage(page + 1)}
        />
      </>
    )}
  </section>
);

const TableSimple = ({ headers, rows }: any) => (
  <div className="border border-gray-500 rounded-xl bg-white overflow-hidden">
    <table className="w-full text-[13px]">
      <thead className="bg-slate-50 border-b border-gray-400">
        <tr>
          {headers.map((h: string) => (
            <th
              key={h}
              className="px-3 py-2 text-left font-semibold text-slate-600 uppercase"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row: any[], idx: number) => (
          <tr
            key={idx}
            className="border-b border-gray-400 last:border-0 hover:bg-slate-50"
          >
            {row.map((cell, i) => (
              <td key={i} className="px-3 py-2 text-gray-700">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
