import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import adminBeverageService from "../../services/admin/beverageService";
import type { AdminBeverage } from "../../types/admin";
import BeverageFormModal from "../../components/ui/admin/beverages/BeverageFormModal";
import AdminPagination from "../../components/ui/admin/AdminPagination";
import AdminConfirmModal from "../../components/ui/admin/AdminConfirmModal";

const DEFAULT_THUMB = "https://via.placeholder.com/80x80?text=DU";
const fmtCurrency = (n: number) => n.toLocaleString("vi-VN") + "₫";
const LIMIT = 10;

const BeverageManagementPage = () => {
  const [beverages, setBeverages] = useState<AdminBeverage[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);

  const [searchInput,   setSearchInput]   = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [formBeverage,   setFormBeverage]   = useState<AdminBeverage | null | undefined>(undefined);
  const [deleteBeverage, setDeleteBeverage] = useState<AdminBeverage | null>(null);
  const [deleting,       setDeleting]       = useState(false);

  const fetchBeverages = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await adminBeverageService.getBeveragesService({ page, limit: LIMIT, search: appliedSearch });
      const data = (res.data as any).data;
      setBeverages(data.beverages || []);
      setTotal(data.pagination?.total || 0);
    } catch { toast.error("Không thể tải danh sách đồ uống"); }
    finally { setLoading(false); }
  }, [page, appliedSearch]);

  useEffect(() => { fetchBeverages(); }, [fetchBeverages]);

  const handleConfirmDelete = async () => {
    if (!deleteBeverage) return;
    setDeleting(true);
    try {
      await adminBeverageService.deleteBeverageService(deleteBeverage.id);
      toast.success("Đã xóa đồ uống");
      setDeleteBeverage(null);
      fetchBeverages();
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra");
    } finally { setDeleting(false); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-sky-700 relative inline-block">
            Quản lý Đồ uống
            <span className="absolute left-0 -bottom-3 w-1/2 h-1 bg-sky-400 rounded-sm" />
          </h1>
          <button onClick={() => setFormBeverage(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition shadow-sm">
            <Plus className="w-4 h-4" /> Thêm đồ uống
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Tổng loại đồ uống", value: total, color: "bg-sky-50 border-sky-200 text-sky-700" },
            { label: "Tổng tồn kho (tất cả chi nhánh)", value: beverages.reduce((s, b) => s + (b.totalStock || 0), 0), color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
              <p className="text-xs font-medium opacity-70">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { setAppliedSearch(searchInput); setPage(1); } }}
                placeholder="Tên đồ uống..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 transition" />
            </div>
          </div>
          <button onClick={() => { setAppliedSearch(searchInput); setPage(1); }}
            className="px-4 py-2 rounded-lg bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition">
            Tìm kiếm
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-14">
              <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : beverages.length === 0 ? (
            <div className="text-center py-14 text-gray-400 text-sm">Không có đồ uống nào</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  {["#", "Đồ uống", "Giá", "Tồn kho (tổng)", "Ngày tạo", "Thao tác"].map((h) => (
                    <th key={h} className="text-center px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 [&_td]:align-middle">
                {beverages.map((b, idx) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-center text-gray-400">{(page - 1) * LIMIT + idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={b.thumbnailUrl || DEFAULT_THUMB} alt={b.beverageName}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_THUMB; }} />
                        <span className="font-semibold text-gray-800">{b.beverageName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-sky-700">{fmtCurrency(b.price)}</td>
                    <td className="px-4 py-3 text-center">
                      {b.totalStock === 0 ? (
                        <span className="px-2 py-0.5 rounded border text-xs font-semibold bg-red-50 text-red-600 border-red-200">Hết hàng</span>
                      ) : b.totalStock < 10 ? (
                        <span className="px-2 py-0.5 rounded border text-xs font-semibold bg-yellow-50 text-yellow-700 border-yellow-200">{b.totalStock}</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded border text-xs font-semibold bg-green-50 text-green-700 border-green-200">{b.totalStock}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500 text-xs">
                      {new Date(b.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setFormBeverage(b)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-200 transition">
                          <Edit2 size={12} /> Sửa
                        </button>
                        <button onClick={() => setDeleteBeverage(b)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 transition">
                          <Trash2 size={12} /> Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <AdminPagination page={page} totalPages={totalPages} total={total} onPage={setPage} />
        </div>
      </div>

      {formBeverage !== undefined && (
        <BeverageFormModal beverage={formBeverage} onClose={() => setFormBeverage(undefined)}
          onSaved={() => { setFormBeverage(undefined); fetchBeverages(); }} />
      )}

      <AdminConfirmModal
        open={!!deleteBeverage}
        title="Xóa đồ uống?"
        message={deleteBeverage ? `Đồ uống "${deleteBeverage.beverageName}" sẽ bị xóa vĩnh viễn.` : ""}
        confirmLabel="Xóa"
        confirmClass="bg-red-500 hover:bg-red-600"
        icon={<Trash2 className="w-6 h-6 text-red-500" />}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteBeverage(null)}
      />
    </div>
  );
};

export default BeverageManagementPage;
