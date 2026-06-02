import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  Building2,
  ChevronRight,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import adminRevenueService from "../../services/admin/revenueService";
import type {
  AdminRevenueOverview,
  AdminBranchRevenue,
  AdminDateRevenue,
  AdminMonthRevenue,
  AdminProductRevenue,
} from "../../types/admin";
import RevenueOverviewCards from "../../components/ui/admin/revenue/RevenueOverviewCards";
import RevenueTopLeaderboards from "../../components/ui/admin/revenue/RevenueTopLeaderboards";
import RevenueBranchDetailModal from "../../components/ui/admin/revenue/RevenueBranchDetailModal";

const LIMIT = 10;

const fmtCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const compactCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);

const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - (days - 1));
  return date.toISOString().slice(0, 10);
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
  const [productData, setProductData] = useState<AdminProductRevenue[]>([]);
  const [loading,    setLoading]    = useState(false);

  const [activeTab,  setActiveTab]  = useState<"trend" | "branch" | "product">("trend");
  const [chartMode,  setChartMode]  = useState<"day" | "month">("day");
  const [branchSearch, setBranchSearch] = useState("");

  const [selectedBranch,      setSelectedBranch]      = useState<AdminBranchRevenue | null>(null);
  const [branchDetailData,    setBranchDetailData]    = useState<AdminDateRevenue[]>([]);
  const [branchDetailLoading, setBranchDetailLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = { startDate: applied.start, endDate: applied.end };
      const [ovRes, brRes, dtRes, moRes, prRes] = await Promise.all([
        adminRevenueService.getRevenueOverviewService(params),
        adminRevenueService.getRevenueByBranchService(params),
        adminRevenueService.getRevenueByDateService(params),
        adminRevenueService.getRevenueByMonthService(params),
        adminRevenueService.getRevenueProductsService({ ...params, limit: 20 }),
      ]);
      setOverview((ovRes.data as any).data);
      setBranchData((brRes.data as any).data || []);
      setDateData((dtRes.data as any).data || []);
      setMonthData((moRes.data as any).data || []);
      setProductData((prRes.data as any).data || []);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

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
  const productMaxRevenue = Math.max(...productData.map((p) => p.totalRevenue), 1);

  const chartData = chartMode === "day"
    ? dateData.map((d) => ({ ...d, label: d.date.slice(5) }))
    : monthData.map((m) => {
        const [y, mo] = m.month.split("-");
        return { ...m, label: `T${parseInt(mo)}/${y.slice(2)}` };
      });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Báo cáo Doanh thu Admin"
        subtitle="Xem doanh thu, giá vốn, lợi nhuận gộp, chi nhánh và mặt hàng toàn hệ thống."
        action={
          <button
            type="button"
            onClick={fetchReport}
            disabled={loading}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:bg-slate-300"
          >
            {loading ? (
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Cập nhật
          </button>
        }
      />
      <div className="hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Báo cáo doanh thu Admin
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Xem doanh thu, giá vốn, lợi nhuận gộp, branch và mặt hàng toàn hệ thống.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <RevenueOverviewCards data={overview} />

            <RevenueTopLeaderboards
              branches={branchData}
              products={productData}
              maxBranchRevenue={maxBranchRevenue}
              maxProductRevenue={productMaxRevenue}
              onBranchClick={openBranchDetail}
            />

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-100">
                {[
                  { id: "trend",  label: "Xu hướng doanh thu", icon: <BarChart3 className="w-4 h-4" /> },
                  { id: "branch", label: "Theo chi nhánh",     icon: <Building2 className="w-4 h-4" /> },
                  { id: "product", label: "Chi tiết sản phẩm", icon: <Search className="w-4 h-4" /> },
                ].map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as "trend" | "branch" | "product")}
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
                          <Bar dataKey="onlineBookingRevenue" name="Sân online" fill="#6366f1" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="offlineBookingRevenue" name="Sân tại quầy" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="onlineProductRevenue" name="SP online" fill="#10b981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="offlineProductRevenue" name="SP tại quầy" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="beverageRevenue" name="Đồ uống" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                )}

                {activeTab === "branch" && (
                  <div className="space-y-4">
                    <div className="relative max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Tìm chi nhánh..."
                        value={branchSearch}
                        onChange={(e) => setBranchSearch(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-9 text-sm outline-none focus:ring-2 focus:ring-sky-400"
                      />
                      {branchSearch && (
                        <button
                          type="button"
                          onClick={() => setBranchSearch("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                        </button>
                      )}
                    </div>

                    {filteredBranches.length === 0 ? (
                      <div className="py-10 text-center text-sm text-gray-400">
                        {branchSearch ? "Không tìm thấy chi nhánh nào" : "Không có dữ liệu"}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                              <th className="px-5 py-3 text-left font-semibold">Chi nhánh</th>
                              <th className="px-5 py-3 text-left font-semibold">Sân online</th>
                              <th className="px-5 py-3 text-left font-semibold">Sân tại quầy</th>
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
                                  <span className="font-semibold text-indigo-600">{fmtShort(b.onlineBookingRevenue)}</span>
                                  <span className="text-xs text-gray-400 ml-1">({b.onlineBookingCount} lượt)</span>
                                </td>
                                <td className="px-5 py-4">
                                  <span className="font-semibold text-violet-600">{fmtShort(b.offlineBookingRevenue)}</span>
                                  <span className="text-xs text-gray-400 ml-1">({b.offlineBookingCount} hóa đơn)</span>
                                </td>
                                <td className="px-5 py-4">
                                  <div className="space-y-1">
                                    <div>
                                      <span className="font-semibold text-emerald-600">{fmtShort(b.onlineProductRevenue)}</span>
                                      <span className="text-xs text-gray-400 ml-1">online</span>
                                    </div>
                                    <div>
                                      <span className="font-semibold text-teal-600">{fmtShort(b.offlineProductRevenue)}</span>
                                      <span className="text-xs text-gray-400 ml-1">tại quầy</span>
                                    </div>
                                  </div>
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

                {activeTab === "product" && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Chi tiết sản phẩm</p>
                      <p className="mt-1 text-xs text-gray-400">
                        Tách doanh thu online và tại quầy. Xem bảng xếp hạng ở phần Top sản phẩm phía trên.
                      </p>
                    </div>

                    {productData.length === 0 ? (
                      <div className="text-center py-10 text-gray-400 text-sm">Không có dữ liệu sản phẩm</div>
                    ) : (
                      <div className="rounded-xl border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                              <th className="px-5 py-3 text-left font-semibold">Sản phẩm</th>
                              <th className="px-5 py-3 text-left font-semibold">Online</th>
                              <th className="px-5 py-3 text-left font-semibold">Tại quầy</th>
                              <th className="px-5 py-3 text-left font-semibold">Số lượng</th>
                              <th className="px-5 py-3 text-left font-semibold">Tổng</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {productData.map((p) => (
                              <tr key={p.productVariantId} className="hover:bg-sky-50 transition-colors">
                                <td className="px-5 py-4">
                                  <p className="font-semibold text-gray-800">{p.productName}</p>
                                  {p.variantInfo && <p className="text-xs text-gray-400 mt-0.5">{p.variantInfo}</p>}
                                </td>
                                <td className="px-5 py-4">
                                  <span className="font-semibold text-emerald-600">{fmtShort(p.onlineRevenue)}</span>
                                  <span className="text-xs text-gray-400 ml-1">({p.onlineQuantity})</span>
                                </td>
                                <td className="px-5 py-4">
                                  <span className="font-semibold text-teal-600">{fmtShort(p.offlineRevenue)}</span>
                                  <span className="text-xs text-gray-400 ml-1">({p.offlineQuantity})</span>
                                </td>
                                <td className="px-5 py-4 font-semibold text-gray-700">{p.totalQuantity}</td>
                                <td className="px-5 py-4 font-bold text-sky-700">{fmtShort(p.totalRevenue)}</td>
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
