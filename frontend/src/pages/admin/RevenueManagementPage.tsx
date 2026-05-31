import { useState, useEffect, useCallback, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from "recharts";
import { RefreshCw, Search, X, Building2, BarChart3, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import adminRevenueService from "../../services/admin/revenueService";
import type { AdminRevenueOverview, AdminBranchRevenue, AdminDateRevenue, AdminMonthRevenue } from "../../types/admin";
import RevenueOverviewCards from "../../components/ui/admin/revenue/RevenueOverviewCards";
import RevenueBranchDetailModal from "../../components/ui/admin/revenue/RevenueBranchDetailModal";

const fmtShort = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M₫`
  : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K₫`
  : `${n}₫`;

const fmtFull = (n: number) => n.toLocaleString("vi-VN") + "₫";

const yTickFmt = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}M`
  : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K`
  : String(v);

const todayStr = () => new Date().toISOString().split("T")[0];
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - (n - 1));
  return d.toISOString().split("T")[0];
};
const thisMonthStart = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
};
const thisYearStart = () => new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0];

const PRESETS = [
  { label: "7 ngày",    getRange: () => ({ start: daysAgo(7),  end: todayStr() }) },
  { label: "30 ngày",   getRange: () => ({ start: daysAgo(30), end: todayStr() }) },
  { label: "90 ngày",   getRange: () => ({ start: daysAgo(90), end: todayStr() }) },
  { label: "Tháng này", getRange: () => ({ start: thisMonthStart(), end: todayStr() }) },
  { label: "Năm nay",   getRange: () => ({ start: thisYearStart(),  end: todayStr() }) },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs space-y-1">
      <p className="font-semibold text-gray-700">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {fmtFull(p.value)}</p>
      ))}
    </div>
  );
};

const RevenueManagementPage = () => {
  const init = PRESETS[1].getRange();
  const [startDate,    setStartDate]    = useState(init.start);
  const [endDate,      setEndDate]      = useState(init.end);
  const [applied,      setApplied]      = useState(init);
  const [activePreset, setActivePreset] = useState("30 ngày");

  const [overview,   setOverview]   = useState<AdminRevenueOverview | null>(null);
  const [branchData, setBranchData] = useState<AdminBranchRevenue[]>([]);
  const [dateData,   setDateData]   = useState<AdminDateRevenue[]>([]);
  const [monthData,  setMonthData]  = useState<AdminMonthRevenue[]>([]);
  const [loading,    setLoading]    = useState(false);

  const [activeTab,  setActiveTab]  = useState<"trend" | "branch">("trend");
  const [chartMode,  setChartMode]  = useState<"day" | "month">("day");
  const [branchSearch, setBranchSearch] = useState("");

  const [selectedBranch,      setSelectedBranch]      = useState<AdminBranchRevenue | null>(null);
  const [branchDetailData,    setBranchDetailData]    = useState<AdminDateRevenue[]>([]);
  const [branchDetailLoading, setBranchDetailLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = { startDate: applied.start, endDate: applied.end };
      const [ovRes, brRes, dtRes, moRes] = await Promise.all([
        adminRevenueService.getRevenueOverviewService(params),
        adminRevenueService.getRevenueByBranchService(params),
        adminRevenueService.getRevenueByDateService(params),
        adminRevenueService.getRevenueByMonthService(params),
      ]);
      setOverview((ovRes.data as any).data);
      setBranchData((brRes.data as any).data || []);
      setDateData((dtRes.data as any).data || []);
      setMonthData((moRes.data as any).data || []);
    } catch {
      toast.error("Không thể tải dữ liệu doanh thu");
    } finally {
      setLoading(false);
    }
  }, [applied]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const applyPreset = (p: (typeof PRESETS)[0]) => {
    const range = p.getRange();
    setStartDate(range.start);
    setEndDate(range.end);
    setApplied(range);
    setActivePreset(p.label);
  };

  const openBranchDetail = async (branch: AdminBranchRevenue) => {
    setSelectedBranch(branch);
    setBranchDetailLoading(true);
    setBranchDetailData([]);
    try {
      const res = await adminRevenueService.getRevenueByBranchDetailService(branch.branchId, {
        startDate: applied.start, endDate: applied.end,
      });
      setBranchDetailData((res.data as any).data || []);
    } catch {
      toast.error("Không thể tải chi tiết chi nhánh");
    } finally {
      setBranchDetailLoading(false);
    }
  };

  const filteredBranches = useMemo(
    () => branchData.filter((b) => b.branchName.toLowerCase().includes(branchSearch.toLowerCase())),
    [branchData, branchSearch],
  );

  const maxBranchRevenue = Math.max(...branchData.map((b) => b.totalRevenue), 1);

  const chartData = chartMode === "day"
    ? dateData.map((d) => ({ ...d, label: d.date.slice(5) }))
    : monthData.map((m) => {
        const [y, mo] = m.month.split("-");
        return { ...m, label: `T${parseInt(mo)}/${y.slice(2)}` };
      });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-2xl font-bold text-sky-700 relative inline-block">
              Quản lý Doanh thu
              <span className="absolute left-0 -bottom-3 w-1/2 h-1 bg-sky-400 rounded-sm" />
            </h1>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                {PRESETS.map((p) => (
                  <button key={p.label} onClick={() => applyPreset(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      activePreset === p.label ? "bg-sky-500 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="flex items-end gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Từ ngày</label>
                  <input type="date" value={startDate} max={endDate}
                    onChange={(e) => { setStartDate(e.target.value); setActivePreset(""); }}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Đến ngày</label>
                  <input type="date" value={endDate} min={startDate}
                    onChange={(e) => { setEndDate(e.target.value); setActivePreset(""); }}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
                <button onClick={() => setApplied({ start: startDate, end: endDate })} disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition disabled:opacity-60">
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <RefreshCw className="w-4 h-4" />}
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-6">
            Từ <b>{new Date(applied.start + "T00:00:00").toLocaleDateString("vi-VN")}</b>
            {" "}đến <b>{new Date(applied.end + "T00:00:00").toLocaleDateString("vi-VN")}</b>
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <RevenueOverviewCards data={overview} />

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-100">
                {[
                  { id: "trend",  label: "Xu hướng doanh thu", icon: <BarChart3 className="w-4 h-4" /> },
                  { id: "branch", label: "Theo chi nhánh",     icon: <Building2 className="w-4 h-4" /> },
                ].map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as "trend" | "branch")}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition border-b-2 ${
                      activeTab === tab.id ? "border-sky-500 text-sky-600" : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}>
                    {tab.icon}{tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === "trend" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        {chartMode === "day" ? `${dateData.length} ngày có dữ liệu` : `${monthData.length} tháng có dữ liệu`}
                      </p>
                      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                        {[{ id: "day", label: "Theo ngày" }, { id: "month", label: "Theo tháng" }].map((m) => (
                          <button key={m.id} onClick={() => setChartMode(m.id as "day" | "month")}
                            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition ${
                              chartMode === m.id ? "bg-white shadow text-sky-600" : "text-gray-500 hover:text-gray-700"
                            }`}>
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {chartData.length === 0 ? (
                      <div className="text-center py-16 text-gray-400 text-sm">Không có dữ liệu</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} barSize={chartMode === "month" ? 24 : 10} barGap={2}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={yTickFmt} width={48} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                          <Bar dataKey="bookingRevenue" name="Đặt sân"   fill="#818cf8" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="orderRevenue"   name="Sản phẩm" fill="#34d399" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                )}

                {activeTab === "branch" && (
                  <div className="space-y-4">
                    <div className="relative max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" placeholder="Tìm chi nhánh..." value={branchSearch}
                        onChange={(e) => setBranchSearch(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-sky-400" />
                      {branchSearch && (
                        <button onClick={() => setBranchSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                          <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                        </button>
                      )}
                    </div>

                    {filteredBranches.length === 0 ? (
                      <div className="text-center py-10 text-gray-400 text-sm">
                        {branchSearch ? "Không tìm thấy chi nhánh nào" : "Không có dữ liệu"}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                              <th className="px-5 py-3 text-left font-semibold">Chi nhánh</th>
                              <th className="px-5 py-3 text-left font-semibold">Đặt sân</th>
                              <th className="px-5 py-3 text-left font-semibold">Sản phẩm</th>
                              <th className="px-5 py-3 text-left font-semibold">Tổng doanh thu</th>
                              <th className="px-3 py-3" />
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {filteredBranches.map((b) => (
                              <tr key={b.branchId} className="hover:bg-sky-50 transition-colors cursor-pointer"
                                onClick={() => openBranchDetail(b)}>
                                <td className="px-5 py-4 font-semibold text-gray-800">{b.branchName}</td>
                                <td className="px-5 py-4">
                                  <span className="font-semibold text-indigo-600">{fmtShort(b.bookingRevenue)}</span>
                                  <span className="text-xs text-gray-400 ml-1">({b.bookingCount} lượt)</span>
                                </td>
                                <td className="px-5 py-4">
                                  <span className="font-semibold text-emerald-600">{fmtShort(b.orderRevenue)}</span>
                                  <span className="text-xs text-gray-400 ml-1">({b.orderCount} đơn)</span>
                                </td>
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-3">
                                    <span className="font-bold text-sky-700 min-w-[72px]">{fmtShort(b.totalRevenue)}</span>
                                    <div className="flex-1 bg-gray-100 rounded-full h-2 min-w-[80px]">
                                      <div className="bg-sky-500 h-2 rounded-full transition-all"
                                        style={{ width: `${(b.totalRevenue / maxBranchRevenue) * 100}%` }} />
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-4">
                                  <ChevronRight className="w-4 h-4 text-gray-400" />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {selectedBranch && (
        <RevenueBranchDetailModal
          branch={selectedBranch}
          data={branchDetailData}
          loading={branchDetailLoading}
          onClose={() => setSelectedBranch(null)}
        />
      )}
    </div>
  );
};

export default RevenueManagementPage;
