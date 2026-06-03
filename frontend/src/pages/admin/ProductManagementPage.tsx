import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  Layers,
  Package,
  PackageCheck,
  Plus,
  Search,
  Trash2,
  TriangleAlert,
  Warehouse,
} from "lucide-react";
import { toast } from "react-toastify";
import adminProductService from "../../services/admin/productService";
import type {
  AdminCategory,
  AdminProduct,
  AdminProductVariant,
} from "../../types/admin";
import ProductFormModal from "../../components/ui/admin/products/ProductFormModal";
import StockBadge from "../../components/ui/admin/products/StockBadge";
import AdminPagination from "../../components/ui/admin/AdminPagination";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";
import { showConfirmDialog } from "../../utils/confirmDialog";

const DEFAULT_THUMB = "https://via.placeholder.com/80x80?text=SP";
const LIMIT = 10;

const fmtCurrency = (value: number) =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: typeof Package;
  color: string;
}) => (
  <div className={`rounded-xl border p-4 ${color}`}>
    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-semibold opacity-75">{label}</p>
        <p className="mt-2 text-3xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

const variantLabel = (variant: AdminProductVariant) =>
  [variant.size, variant.color].filter(Boolean).join(" / ") || "Mặc định";

const variantStockTotal = (variant: AdminProductVariant) =>
  variant.stocks?.reduce((sum, stock) => sum + Number(stock.stock || 0), 0) || 0;

const ProductManagementPage = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [menuGroupFilter, setMenuGroupFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null);

  const [formProduct, setFormProduct] = useState<AdminProduct | null | undefined>(
    undefined,
  );
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminProductService.getProductsService({
        page,
        limit: LIMIT,
        search: appliedSearch || undefined,
        menuGroup: menuGroupFilter || undefined,
        categoryId: categoryFilter || undefined,
      });
      const data = (res.data as any).data;
      setProducts(data.products || []);
      setTotal(data.pagination?.total || 0);
    } catch {
      setProducts([]);
      setTotal(0);
      toast.error("Không thể tải sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, categoryFilter, menuGroupFilter, page]);

  useEffect(() => {
    adminProductService
      .getCategoriesService()
      .then((res) => setCategories((res.data as any).data || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (product: AdminProduct) => {
    const confirmed = await showConfirmDialog(
      "Xóa sản phẩm?",
      `Sản phẩm "${product.productName}" sẽ bị xóa vĩnh viễn.`,
      "Xóa",
      "Hủy",
      "danger",
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await adminProductService.deleteProductService(product.id);
      toast.success("Đã xóa sản phẩm");
      fetchProducts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setDeleting(false);
    }
  };

  const menuGroups = useMemo(
    () =>
      [...new Set(categories.map((category) => category.menuGroup).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b, "vi"),
      ),
    [categories],
  );

  const filteredCategories = useMemo(
    () =>
      menuGroupFilter
        ? categories.filter((category) => category.menuGroup === menuGroupFilter)
        : categories,
    [categories, menuGroupFilter],
  );

  const totalPages = Math.max(Math.ceil(total / LIMIT), 1);
  const inStockCount = products.filter((product) => product.totalStock > 0).length;
  const outOfStockCount = products.filter((product) => product.totalStock === 0).length;
  const totalStock = products.reduce(
    (sum, product) => sum + Number(product.totalStock || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8">
        <AdminPageHeader
          title="Quản lý Sản phẩm"
          subtitle="Theo dõi danh mục, biến thể và tồn kho sản phẩm trong cửa hàng."
          action={
            <button
              type="button"
              onClick={() => setFormProduct(null)}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
            >
              <Plus className="h-4 w-4" />
              Thêm sản phẩm
            </button>
          }
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Tổng sản phẩm"
            value={total}
            icon={Package}
            color="bg-sky-50 border-sky-200 text-sky-700"
          />
          <StatCard
            label="Tổng tồn kho"
            value={totalStock}
            icon={Warehouse}
            color="bg-indigo-50 border-indigo-200 text-indigo-700"
          />
          <StatCard
            label="Còn hàng"
            value={inStockCount}
            icon={PackageCheck}
            color="bg-green-50 border-green-200 text-green-700"
          />
          <StatCard
            label="Hết hàng"
            value={outOfStockCount}
            icon={TriangleAlert}
            color="bg-red-50 border-red-200 text-red-700"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_220px_260px]">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Tên sản phẩm, thương hiệu..."
                className="h-11 w-full rounded-xl border border-gray-300 pl-9 pr-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Nhóm danh mục
            </label>
            <select
              value={menuGroupFilter}
              onChange={(event) => {
                setMenuGroupFilter(event.target.value);
                setCategoryFilter("");
                setPage(1);
              }}
              className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              <option value="">Tất cả nhóm</option>
              {menuGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Danh mục
            </label>
            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setPage(1);
              }}
              className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              <option value="">Tất cả danh mục</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.cateName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200">
          {loading ? (
            <div className="flex justify-center py-14">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
            </div>
          ) : products.length === 0 ? (
            <div className="py-14 text-center text-sm text-gray-400">
              Không có sản phẩm nào
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                  {[
                    "#",
                    "Sản phẩm",
                    "Thương hiệu",
                    "Danh mục",
                    "Biến thể",
                    "Tồn kho",
                    "Thao tác",
                  ].map((header) => (
                    <th key={header} className="px-4 py-3 text-center font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 [&_td]:align-middle">
                {products.map((product, index) => {
                  const isExpanded = expandedProductId === product.id;
                  return (
                    <Fragment key={product.id}>
                      <tr className="transition-colors hover:bg-gray-50">
                        <td className="px-4 py-3 text-center text-gray-400">
                          {(page - 1) * LIMIT + index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.thumbnailUrl || DEFAULT_THUMB}
                              alt={product.productName}
                              className="h-10 w-10 shrink-0 rounded-lg border border-gray-200 object-cover"
                              onError={(event) => {
                                (event.target as HTMLImageElement).src = DEFAULT_THUMB;
                              }}
                            />
                            <div>
                              <p className="max-w-[220px] truncate font-semibold text-gray-800">
                                {product.productName}
                              </p>
                              <p className="text-xs text-gray-400">
                                {product.createdDate
                                  ? new Date(product.createdDate).toLocaleDateString("vi-VN")
                                  : "-"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">
                          {product.brand}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="rounded border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
                            {product.cateName || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedProductId(isExpanded ? null : product.id)
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                          >
                            <Layers className="h-3.5 w-3.5" />
                            {product.variantCount || 0}
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StockBadge stock={product.totalStock} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setFormProduct(product)}
                              className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-600 transition hover:bg-sky-100"
                            >
                              <Edit2 size={12} />
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(product)}
                              disabled={deleting}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-100"
                            >
                              <Trash2 size={12} />
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded ? (
                        <tr className="bg-slate-50">
                          <td colSpan={7} className="px-6 py-4">
                            {(product.variants || []).length === 0 ? (
                              <div className="rounded-xl border border-dashed border-slate-200 bg-white py-8 text-center text-sm text-slate-400">
                                Sản phẩm chưa có biến thể
                              </div>
                            ) : (
                              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                                <table className="w-full text-sm">
                                  <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                                    <tr>
                                      {[
                                        "SKU",
                                        "Phân loại",
                                        "Giá",
                                        "Giảm",
                                        "Chất liệu",
                                        "Tồn kho",
                                      ].map((header) => (
                                        <th key={header} className="px-4 py-3 text-left font-semibold">
                                          {header}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {(product.variants || []).map((variant) => (
                                      <tr key={variant.id}>
                                        <td className="px-4 py-3 text-slate-600">
                                          {variant.sku || "-"}
                                        </td>
                                        <td className="px-4 py-3">
                                          <p className="font-semibold text-slate-800">
                                            {variantLabel(variant)}
                                          </p>
                                          <p className="text-xs text-slate-400">
                                            {Number(variant.weight || 0)} kg
                                          </p>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-sky-700">
                                          {fmtCurrency(Number(variant.price || 0))}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                          {Number(variant.discount || 0)}%
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                          {variant.material || "-"}
                                        </td>
                                        <td className="px-4 py-3">
                                          <div className="flex flex-wrap gap-2">
                                            {(variant.stocks || []).length === 0 ? (
                                              <span className="text-xs text-slate-400">0</span>
                                            ) : (
                                              (variant.stocks || []).map((stock) => (
                                                <span
                                                  key={stock.branchId}
                                                  className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                                                >
                                                  {stock.branch?.branchName || `CN ${stock.branchId}`}: {stock.stock}
                                                </span>
                                              ))
                                            )}
                                            <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                                              Tổng {variantStockTotal(variant)}
                                            </span>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
          <AdminPagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPage={setPage}
            unit="sản phẩm"
            alwaysShow
          />
        </div>
      </div>

      {formProduct !== undefined && (
        <ProductFormModal
          product={formProduct}
          categories={categories}
          onClose={() => setFormProduct(undefined)}
          onSaved={() => {
            setFormProduct(undefined);
            fetchProducts();
          }}
        />
      )}

    </div>
  );
};

export default ProductManagementPage;
