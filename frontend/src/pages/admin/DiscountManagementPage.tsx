import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "react-toastify";
import adminDiscountService from "../../services/admin/discountService";
import type { AdminDiscount } from "../../types/admin";
import DiscountFormModal from "../../components/ui/admin/discounts/DiscountFormModal";
import AdminPagination from "../../components/ui/admin/AdminPagination";

const DISCOUNT_TYPE_LABEL: Record<string, string> = { AMOUNT: "Số tiền", PERCENT: "Phần trăm" };
const APPLY_TYPE_LABEL: Record<string, string> = { ALL: "Tất cả", ORDER: "Đơn hàng", BOOKING: "Đặt sân" };
const fmtCurrency = (n: number) => n.toLocaleString("vi-VN") + "₫";
const LIMIT = 10;

const DiscountManagementPage = () => {
  const [discounts,      setDiscounts]      = useState<AdminDiscount[]>([]);
  const [loading,        setLoading]        = useState(false);
  const [total,          setTotal]          = useState(0);
  const [page,           setPage]           = useState(1);
  const [searchInput,    setSearchInput]    = useState("");
  const [appliedSearch,  setAppliedSearch]  = useState("");
  const [typeFilter,     setTypeFilter]     = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState("");
  const [formDiscount,   setFormDiscount]   = useState<AdminDiscount | null | undefined>(undefined);
  const [togglingId,     setTogglingId]     = useState<number | null>(null);
  const [deletingId,     setDeletingId]     = useState<number | null>(null);

  const fetchDiscounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminDiscountService.getDiscountsService({
        page, limit: LIMIT, search: appliedSearch, type: typeFilter || undefined, isActive: isActiveFilter || undefined,
      });
      const data = (res.data as any).data;
      setDiscounts(data.discounts || []);
      setTotal(data.pagination?.total || 0);
    } catch { toast.error("Không thể tải danh sách khuyến mãi"); }
    finally { setLoading(false); }
  }, [page, appliedSearch, typeFilter, isActiveFilter]);

  useEffect(() => { fetchDiscounts(); }, [fetchDiscounts]);

  const handleToggle = async (discount: AdminDiscount) => {
    setTogglingId(discount.id);
    try {
      await adminDiscountService.toggleDiscountService(discount.id);
      toast.success(discount.isActive ? "Đã tắt mã" : "Đã bật mã");
      fetchDiscounts();
    } catch (err: any) { toast.error(err?.response?.data?.message || "Có lỗi xảy ra"); }
    finally { setTogglingId(null); }
  };

  const handleDelete = async (discountId: number) => {
    if (!window.confirm("Xóa mã giảm giá này?")) return;
    setDeletingId(discountId);
    try {
      await adminDiscountService.deleteDiscountService(discountId);
      toast.success("Đã xóa mã giảm giá");
      fetchDiscounts();
    } catch (err: any) { toast.error(err?.response?.data?.message || "Có lỗi xảy ra"); }
    finally { setDeletingId(null); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-sky-700 relative inline-block">
            Quản lý Khuyến mãi
            <span className="absolute left-0 -bottom-3 w-1/2 h-1 bg-sky-400 rounded-sm" />
          </h1>
          <button onClick={() => setFormDiscount(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition shadow-sm">
            <Plus className="w-4 h-4" /> Tạo mã mới
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Tổng mã", value: total, color: "bg-sky-50 border-sky-200 text-sky-700" },
            { label: "Đang hoạt động", value: discounts.filter((d) => d.isActive).length, color: "bg-green-50 border-green-200 text-green-700" },
            { label: "Đã tắt", value: discounts.filter((d) => !d.isActive).length, color: "bg-gray-50 border-gray-200 text-gray-600" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
              <p className="text-xs font-medium opacity-70">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Tìm mã</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={searchInput} onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === "Enter") { setAppliedSearch(searchInput); setPage(1); } }}
                placeholder="Nhập mã..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 transition uppercase font-mono" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Loại</label>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="py-2 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 bg-white transition">
              <option value="">Tất cả</option>
              {Object.entries(DISCOUNT_TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Trạng thái</label>
            <select value={isActiveFilter} onChange={(e) => { setIsActiveFilter(e.target.value); setPage(1); }}
              className="py-2 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 bg-white transition">
              <option value="">Tất cả</option>
              <option value="true">Đang bật</option>
              <option value="false">Đã tắt</option>
            </select>
          </div>
          <button onClick={() => { setAppliedSearch(searchInput); setPage(1); }}
            className="px-4 py-2 rounded-lg bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition">
            Tìm kiếm
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-14"><div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : discounts.length === 0 ? (
            <div className="text-center py-14 text-gray-400 text-sm">Không có mã khuyến mãi</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    {["#", "Mã", "Loại", "Giá trị", "Áp dụng", "Đã dùng", "Hiệu lực", "Trạng thái", "Thao tác"].map((h) => (
                      <th key={h} className="text-center px-3 py-3 font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 [&_td]:align-top">
                  {discounts.map((d, idx) => (
                    <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3 text-center text-gray-400">{(page - 1) * LIMIT + idx + 1}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="px-2 py-1 rounded-lg bg-sky-50 text-sky-700 font-mono font-bold text-xs border border-sky-200">{d.code}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded border text-xs font-medium ${d.type === "PERCENT" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}>
                          {DISCOUNT_TYPE_LABEL[d.type]}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-semibold text-gray-800">
                        {d.type === "PERCENT" ? `${d.value}%` : fmtCurrency(d.value)}
                        {d.maxDiscount ? <span className="text-xs text-gray-400 block">tối đa {fmtCurrency(d.maxDiscount)}</span> : null}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="px-2 py-0.5 rounded border text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">
                          {APPLY_TYPE_LABEL[d.applyType]}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-gray-600">
                        {d.usageCount} {d.usageLimit ? `/ ${d.usageLimit}` : "/ ∞"}
                      </td>
                      <td className="px-3 py-3 text-center text-xs text-gray-500 whitespace-nowrap">
                        {new Date(d.startDate).toLocaleDateString("vi-VN")} – {new Date(d.endDate).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {d.isActive
                          ? <span className="px-2 py-0.5 rounded border text-xs font-semibold bg-green-50 text-green-700 border-green-200">Hoạt động</span>
                          : <span className="px-2 py-0.5 rounded border text-xs font-semibold bg-gray-100 text-gray-500 border-gray-200">Đã tắt</span>}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleToggle(d)} disabled={togglingId === d.id}
                            className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition disabled:opacity-60 ${
                              d.isActive ? "bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200" : "bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                            }`}>
                            {togglingId === d.id ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              : d.isActive ? <><ToggleRight size={12} /> Tắt</> : <><ToggleLeft size={12} /> Bật</>}
                          </button>
                          <button onClick={() => setFormDiscount(d)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-200 transition">
                            <Edit2 size={11} /> Sửa
                          </button>
                          <button onClick={() => handleDelete(d.id)} disabled={deletingId === d.id}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 transition disabled:opacity-60">
                            {deletingId === d.id ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <><Trash2 size={11} /> Xóa</>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <AdminPagination page={page} totalPages={totalPages} total={total} onPage={setPage} />
        </div>
      </div>

      {formDiscount !== undefined && (
        <DiscountFormModal discount={formDiscount} onClose={() => setFormDiscount(undefined)}
          onSaved={() => { setFormDiscount(undefined); fetchDiscounts(); }} />
      )}
    </div>
  );
};

export default DiscountManagementPage;
