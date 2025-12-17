import BarChartBox from "./Charts/BarChartBox";

/* ================= HEADER ================= */

export const SectionHeader = ({ title, start, end, onStart, onEnd }: any) => (
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

/* ================= TIME RANGE ================= */

export const ApiTimeRange = ({ startDate, endDate }: any) => {
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

/* ================= SUMMARY ================= */

export const SummaryGrid = ({ data }: any) => (
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

/* ================= STATS ================= */

export const OverviewStatsGrid = ({ overview }: any) => (
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
      <p className="text-lg font-semibold">{total}</p>
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

/* ================= MAIN OVERVIEW BLOCK ================= */

export const RevenueOverviewBlock = ({ overview, chartData }: any) => {
  if (!overview) return null;

  return (
    <div className="space-y-6">
      <SummaryGrid data={overview.revenue} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <BarChartBox data={chartData} />
        </div>

        <OverviewStatsGrid overview={overview} />
      </div>
    </div>
  );
};
