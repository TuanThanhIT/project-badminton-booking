import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Edit2, Trash2, Tag } from "lucide-react";
import { toast } from "react-toastify";
import adminCategoryService from "../../services/admin/categoryService";
import type { AdminCategory } from "../../types/admin";
import CategoryFormModal from "../../components/ui/admin/categories/CategoryFormModal";
import AdminPagination from "../../components/ui/admin/AdminPagination";
import AdminConfirmModal from "../../components/ui/admin/AdminConfirmModal";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";

const LIMIT = 10;

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);

  const [searchInput,   setSearchInput]   = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [formCat,   setFormCat]   = useState<AdminCategory | null | undefined>(undefined);
  const [deleteCat, setDeleteCat] = useState<AdminCategory | null>(null);
  const [deleting,  setDeleting]  = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCategoryService.getCategoriesService({ page, limit: LIMIT, search: appliedSearch });
      const data = (res.data as any).data;
      setCategories(data.categories || []);
      setTotal(data.pagination?.total || 0);
    } catch {
      setCategories([]);
      setTotal(0);
    }
    finally { setLoading(false); }
  }, [page, appliedSearch]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleConfirmDelete = async () => {
    if (!deleteCat) return;
    setDeleting(true);
    try {
      await adminCategoryService.deleteCategoryService(deleteCat.id);
      toast.success("Đã xóa danh mục");
      setDeleteCat(null);
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally { setDeleting(false); }
  };

  const totalPages = Math.ceil(total / LIMIT);
  const menuGroups = [...new Set(categories.map((c) => c.menuGroup))];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
        <AdminPageHeader
          title="Quản lý Danh mục"
          subtitle="Tổ chức nhóm sản phẩm, đồ uống và nội dung hiển thị trong cửa hàng."
          action={
            <button onClick={() => setFormCat(null)}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700">
              <Plus className="w-4 h-4" /> Thêm danh mục
            </button>
          }
        />
        <div className="hidden">
          <h1 className="text-2xl font-bold text-sky-700 relative inline-block">
            Quản lý Danh mục
            <span className="absolute left-0 -bottom-3 w-1/2 h-1 bg-sky-400 rounded-sm" />
          </h1>
          <button onClick={() => setFormCat(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition shadow-sm">
            <Plus className="w-4 h-4" /> Thêm danh mục
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Tổng danh mục", value: total, color: "bg-sky-50 border-sky-200 text-sky-700" },
            { label: "Nhóm menu", value: menuGroups.length, color: "bg-indigo-50 border-indigo-200 text-indigo-700" },
            { label: "Trang hiện tại", value: categories.length, color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
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
                placeholder="Tên danh mục..."
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
          ) : categories.length === 0 ? (
            <div className="text-center py-14 text-gray-400 text-sm">Không có danh mục nào</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  {["#", "Tên danh mục", "Nhóm menu", "Ngày tạo", "Thao tác"].map((h) => (
                    <th key={h} className="text-center px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 [&_td]:align-top">
                {categories.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-center text-gray-400">{(page - 1) * LIMIT + idx + 1}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
                          <Tag className="w-3.5 h-3.5 text-sky-600" />
                        </div>
                        <span className="font-semibold text-gray-800">{c.cateName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2.5 py-1 rounded-lg border text-xs font-medium bg-indigo-50 text-indigo-700 border-indigo-200">
                        {c.menuGroup}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString("vi-VN") : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setFormCat(c)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-200 transition">
                          <Edit2 size={12} /> Sửa
                        </button>
                        <button onClick={() => setDeleteCat(c)}
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

      {formCat !== undefined && (
        <CategoryFormModal category={formCat} onClose={() => setFormCat(undefined)}
          onSaved={() => { setFormCat(undefined); fetchCategories(); }} />
      )}

      <AdminConfirmModal
        open={!!deleteCat}
        title="Xóa danh mục?"
        message={deleteCat ? `Danh mục "${deleteCat.cateName}" sẽ bị xóa vĩnh viễn. Các sản phẩm thuộc danh mục này sẽ không còn được phân loại.` : ""}
        confirmLabel="Xóa"
        confirmClass="bg-red-500 hover:bg-red-600"
        icon={<Trash2 className="w-6 h-6 text-red-500" />}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteCat(null)}
      />
    </div>
  );
};

export default CategoryManagementPage;
