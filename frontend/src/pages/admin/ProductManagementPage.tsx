import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import adminProductService from "../../services/admin/productService";
import type { AdminProduct, AdminCategory } from "../../types/admin";
import ProductFormModal from "../../components/ui/admin/products/ProductFormModal";
import StockBadge from "../../components/ui/admin/products/StockBadge";
import AdminPagination from "../../components/ui/admin/AdminPagination";
import AdminConfirmModal from "../../components/ui/admin/AdminConfirmModal";

const DEFAULT_THUMB = "https://via.placeholder.com/80x80?text=SP";
const LIMIT = 10;

const ProductManagementPage = () => {
  const [products,   setProducts]   = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);

  const [searchInput,    setSearchInput]    = useState("");
  const [appliedSearch,  setAppliedSearch]  = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [formProduct,   setFormProduct]   = useState<AdminProduct | null | undefined>(undefined);
  const [deleteProduct, setDeleteProduct] = useState<AdminProduct | null>(null);
  const [deleting,      setDeleting]      = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminProductService.getProductsService({
        page, limit: LIMIT, search: appliedSearch, categoryId: categoryFilter || undefined,
      });
      const data = (res.data as any).data;
      setProducts(data.products || []);
      setTotal(data.pagination?.total || 0);
    } catch { toast.error("Không thể tải danh sách sản phẩm"); }
    finally { setLoading(false); }
  }, [page, appliedSearch, categoryFilter]);

  useEffect(() => {
    adminProductService.getCategoriesService().then((res) => {
      setCategories((res.data as any).data || []);
    }).catch(() => {});
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleConfirmDelete = async () => {
    if (!deleteProduct) return;
    setDeleting(true);
    try {
      await adminProductService.deleteProductService(deleteProduct.id);
      toast.success("Đã xóa sản phẩm");
      setDeleteProduct(null);
      fetchProducts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally { setDeleting(false); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-sky-700 relative inline-block">
            Quản lý Sản phẩm
            <span className="absolute left-0 -bottom-3 w-1/2 h-1 bg-sky-400 rounded-sm" />
          </h1>
          <button onClick={() => setFormProduct(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition shadow-sm">
            <Plus className="w-4 h-4" /> Thêm sản phẩm
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Tổng sản phẩm", value: total, color: "bg-sky-50 border-sky-200 text-sky-700" },
            { label: "Có hàng", value: products.filter((p) => p.totalStock > 0).length, color: "bg-green-50 border-green-200 text-green-700" },
            { label: "Hết hàng", value: products.filter((p) => p.totalStock === 0).length, color: "bg-red-50 border-red-200 text-red-700" },
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
                placeholder="Tên sản phẩm, thương hiệu..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 transition" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Danh mục</label>
            <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="py-2 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 bg-white transition">
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.cateName}</option>)}
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
          ) : products.length === 0 ? (
            <div className="text-center py-14 text-gray-400 text-sm">Không có sản phẩm nào</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  {["#", "Sản phẩm", "Thương hiệu", "Danh mục", "Biến thể", "Tồn kho", "Thao tác"].map((h) => (
                    <th key={h} className="text-center px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 [&_td]:align-top">
                {products.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-center text-gray-400">{(page - 1) * LIMIT + idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.thumbnailUrl || DEFAULT_THUMB} alt={p.productName}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_THUMB; }} />
                        <div>
                          <p className="font-semibold text-gray-800 truncate max-w-[160px]">{p.productName}</p>
                          <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString("vi-VN")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{p.brand}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded border text-xs font-medium bg-sky-50 text-sky-700 border-sky-200">
                        {p.cateName || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{p.variantCount}</td>
                    <td className="px-4 py-3 text-center"><StockBadge stock={p.totalStock} /></td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setFormProduct(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-200 transition">
                          <Edit2 size={12} /> Sửa
                        </button>
                        <button onClick={() => setDeleteProduct(p)}
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

      {formProduct !== undefined && (
        <ProductFormModal product={formProduct} categories={categories}
          onClose={() => setFormProduct(undefined)}
          onSaved={() => { setFormProduct(undefined); fetchProducts(); }} />
      )}

      <AdminConfirmModal
        open={!!deleteProduct}
        title="Xóa sản phẩm?"
        message={deleteProduct ? `Sản phẩm "${deleteProduct.productName}" sẽ bị xóa vĩnh viễn.` : ""}
        confirmLabel="Xóa"
        confirmClass="bg-red-500 hover:bg-red-600"
        icon={<Trash2 className="w-6 h-6 text-red-500" />}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteProduct(null)}
      />
    </div>
  );
};

export default ProductManagementPage;
