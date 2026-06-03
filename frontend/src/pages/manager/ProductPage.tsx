import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CupSoda,
  PackagePlus,
  PackageSearch,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { getManagerProducts } from "../../redux/slices/manager/productSlice";
import { getManagerBeverages } from "../../redux/slices/manager/beverageSlice";
import managerProductService from "../../services/manager/productService";
import {
  ManagerPageHeader,
  managerInputClass,
} from "../../components/commons/manager/ManagerPage";
import type {
  ManagerProduct,
  ManagerProductCategory,
  ManagerProductVariant,
} from "../../types/product";
import type { ManagerBeverage } from "../../types/beverage";
import TablePagination from "../../components/ui/TablePagination";

type ProductTab = "products" | "beverages";
type StockStatus = "ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

const LIMIT = 10;
const LOW_STOCK_THRESHOLD = 5;
const CATEGORY_ORDER = [
  "Áo cầu lông",
  "Vợt cầu lông",
  "Giày cầu lông",
  "Cầu lông",
  "Phụ kiện",
  "Túi vợt",
];

const stockOptions: { value: StockStatus; label: string }[] = [
  { value: "ALL", label: "Tất cả tồn kho" },
  { value: "IN_STOCK", label: "Còn hàng" },
  { value: "LOW_STOCK", label: "Sắp hết" },
  { value: "OUT_OF_STOCK", label: "Hết hàng" },
];

const filterSelectClass =
  `w-full ${managerInputClass}`;

const filterLabelClass = "mb-1 block text-xs font-medium text-slate-600";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const getDiscountPrice = (price: number, discount: number) =>
  Math.max(price - (price * discount) / 100, 0);

const getStockMeta = (stock: number) => {
  if (stock <= 0) {
    return {
      label: "Hết hàng",
      badge: "border-red-200 bg-red-50 text-red-600",
      text: "text-red-600",
    };
  }

  if (stock <= LOW_STOCK_THRESHOLD) {
    return {
      label: "Sắp hết",
      badge: "border-amber-200 bg-amber-50 text-amber-600",
      text: "text-amber-600",
    };
  }

  return {
    label: "Còn hàng",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-600",
    text: "text-emerald-600",
  };
};

const getVariantName = (variant: ManagerProductVariant) =>
  [variant.size, variant.color, variant.material].filter(Boolean).join(" - ") ||
  variant.sku ||
  `Variant #${variant.id}`;

const getPriceRange = (variants: ManagerProductVariant[]) => {
  const prices = variants.map((variant) =>
    getDiscountPrice(Number(variant.price || 0), Number(variant.discount || 0)),
  );
  if (!prices.length) return formatCurrency(0);

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return min === max
    ? formatCurrency(min)
    : `${formatCurrency(min)} - ${formatCurrency(max)}`;
};

const EmptyState = ({ label }: { label: string }) => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
    <PackageSearch className="mx-auto h-12 w-12 text-slate-300" />
    <p className="mt-3 font-semibold text-slate-700">{label}</p>
    <p className="mt-1 text-sm text-slate-500">
      Thử đổi danh mục, bộ lọc hoặc từ khóa tìm kiếm.
    </p>
  </div>
);

const ErrorState = ({ label }: { label: string }) => (
  <div className="rounded-2xl border border-red-200 bg-red-50 py-10 text-center">
    <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />
    <p className="mt-3 font-bold text-red-700">{label}</p>
  </div>
);

const ProductPagae = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProductTab>("products");
  const [search, setSearch] = useState("");
  const [menuGroup, setMenuGroup] = useState("ALL");
  const [categoryId, setCategoryId] = useState<number | "ALL">("ALL");
  const [brand, setBrand] = useState("ALL");
  const [stockStatus, setStockStatus] = useState<StockStatus>("ALL");
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<ManagerProductCategory[]>([]);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const managerProduct = useAppSelector((state) => state.managerProduct);
  const managerBeverage = useAppSelector((state) => state.managerBeverage);

  const loading =
    activeTab === "products" ? managerProduct.loading : managerBeverage.loading;
  const error =
    activeTab === "products"
      ? managerProduct.error || categoryError
      : managerBeverage.error;
  const pagination =
    activeTab === "products"
      ? managerProduct.pagination
      : managerBeverage.pagination;
  const totalPages = Math.max(
    Math.ceil(pagination.total / pagination.limit),
    1,
  );

  const menuGroups = useMemo(
    () =>
      [
        ...new Set(
          categories.map((category) => category.menuGroup).filter(Boolean),
        ),
      ]
        .map(String)
        .sort((a, b) => a.localeCompare(b, "vi")),
    [categories],
  );

  const sortedCategories = useMemo(() => {
    const filtered =
      menuGroup === "ALL"
        ? categories
        : categories.filter((category) => category.menuGroup === menuGroup);
    const getOrder = (category: ManagerProductCategory) => {
      const index = CATEGORY_ORDER.findIndex(
        (name) => name.toLowerCase() === category.cateName.toLowerCase(),
      );
      return index === -1 ? CATEGORY_ORDER.length : index;
    };

    return [...filtered].sort((a, b) => {
      const orderDiff = getOrder(a) - getOrder(b);
      return orderDiff || a.cateName.localeCompare(b.cateName, "vi");
    });
  }, [categories, menuGroup]);

  const stats = useMemo(() => {
    const productStock = managerProduct.products.reduce(
      (sum, product) => sum + product.totalStock,
      0,
    );
    const beverageStock = managerBeverage.beverages.reduce(
      (sum, beverage) => sum + beverage.stock,
      0,
    );

    return {
      primaryLabel: activeTab === "products" ? "Tổng sản phẩm" : "Tổng đồ uống",
      primaryValue:
        activeTab === "products"
          ? managerProduct.pagination.total
          : managerBeverage.pagination.total,
      stockValue: activeTab === "products" ? productStock : beverageStock,
    };
  }, [
    activeTab,
    managerBeverage.beverages,
    managerBeverage.pagination.total,
    managerProduct.pagination.total,
    managerProduct.products,
  ]);

  useEffect(() => {
    managerProductService
      .getProductCategoriesService()
      .then((res) => {
        setCategories(res.data.data || []);
        setCategoryError(null);
      })
      .catch(() => {
        setCategories([]);
        setCategoryError("Không thể tải danh mục sản phẩm");
      });
  }, []);

  useEffect(() => {
    setPage(1);
  }, [activeTab, search, menuGroup, categoryId, brand, stockStatus]);

  useEffect(() => {
    if (categoryId === "ALL") return;

    const selectedCategory = categories.find(
      (category) => category.id === categoryId,
    );

    if (
      selectedCategory &&
      menuGroup !== "ALL" &&
      selectedCategory.menuGroup !== menuGroup
    ) {
      setCategoryId("ALL");
    }
  }, [categories, categoryId, menuGroup]);

  useEffect(() => {
    if (activeTab === "products") {
      dispatch(
        getManagerProducts({
          page,
          limit: LIMIT,
          keyword: search.trim() || undefined,
          categoryId: categoryId === "ALL" ? undefined : categoryId,
          brand: brand === "ALL" ? undefined : brand,
          stockStatus: stockStatus === "ALL" ? undefined : stockStatus,
        }),
      );
      return;
    }

    dispatch(
      getManagerBeverages({
        page,
        limit: LIMIT,
        keyword: search.trim() || undefined,
        stockStatus: stockStatus === "ALL" ? undefined : stockStatus,
      }),
    );
  }, [activeTab, brand, categoryId, dispatch, page, search, stockStatus]);

  const goToCreateProductReceipt = (variantId: number) => {
    navigate(
      `/manager/inventory?tab=create&itemType=PRODUCT_VARIANT&variantId=${variantId}`,
    );
  };

  const goToCreateBeverageReceipt = (beverageId: number) => {
    navigate(
      `/manager/inventory?tab=create&itemType=BEVERAGE&beverageId=${beverageId}`,
    );
  };

  return (
    <div className="space-y-7">
      <ManagerPageHeader
        eyebrow="Manager products"
        title="Quản lý sản phẩm và đồ uống"
        description="Xem nhanh hàng hóa, tồn kho tại branch và chuyển sang Kho hàng để tạo phiếu nhập."
        metrics={[
          { label: stats.primaryLabel, value: stats.primaryValue },
          { label: "Tồn kho", value: stats.stockValue },
        ]}
        actions={
          <div className="inline-flex rounded-2xl border border-white/10 bg-white/10 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("products")}
              className={`h-10 rounded-xl px-4 text-sm font-bold transition ${
                activeTab === "products"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Sản phẩm
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("beverages")}
              className={`h-10 rounded-xl px-4 text-sm font-bold transition ${
                activeTab === "beverages"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Đồ uống
            </button>
          </div>
        }
      />

      <div className="hidden flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sky-700">Quản lý sản phẩm</h1>
          <div className="mt-3 h-1 w-24 rounded-full bg-sky-500" />
        </div>
        <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`h-10 rounded-xl px-4 text-sm font-bold transition ${
              activeTab === "products"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-white"
            }`}
          >
            Sản phẩm
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("beverages")}
            className={`h-10 rounded-xl px-4 text-sm font-bold transition ${
              activeTab === "beverages"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-white"
            }`}
          >
            Đồ uống
          </button>
        </div>
      </div>

      <div className="hidden mt-7 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
          <p className="text-sm font-semibold text-sky-600">
            {stats.primaryLabel}
          </p>
          <p className="mt-2 text-3xl font-bold text-sky-700">
            {stats.primaryValue}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-600">
            Tổng tồn kho tại chi nhánh
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {stats.stockValue}
          </p>
        </div>
      </div>

      <div>
        <div
          className={
            activeTab === "beverages"
              ? "grid gap-4 md:grid-cols-[1fr_260px]"
              : ""
          }
        >
          <label className="block">
            <span className={filterLabelClass}>Tìm kiếm</span>
            <div
              className="
    group flex h-11 flex-1 items-center gap-3 rounded-xl
    border border-slate-200 bg-white px-3
    transition-all duration-200
    focus-within:border-sky-400
    focus-within:ring-2
    focus-within:ring-sky-100
  "
            >
              <Search className="h-4 w-4 text-slate-400 transition-colors duration-200 group-focus-within:text-sky-500" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="
      h-full flex-1 bg-transparent text-sm text-slate-700 outline-none
      placeholder:text-slate-400
    "
                placeholder={
                  activeTab === "products"
                    ? "Tên sản phẩm hoặc SKU..."
                    : "Tên đồ uống..."
                }
              />
            </div>
          </label>

          {activeTab === "beverages" ? (
            <label className="block">
              <span className={filterLabelClass}>Tồn kho</span>
              <select
                value={stockStatus}
                onChange={(event) =>
                  setStockStatus(event.target.value as StockStatus)
                }
                className={filterSelectClass}
              >
                {stockOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        {activeTab === "products" ? (
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="block">
                <span className={filterLabelClass}>Nhóm danh mục</span>
                <select
                  value={menuGroup}
                  onChange={(event) => {
                    setMenuGroup(event.target.value);
                    setCategoryId("ALL");
                  }}
                  className={filterSelectClass}
                >
                  <option value="ALL">Tất cả nhóm</option>
                  {menuGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={filterLabelClass}>Danh mục</span>
                <select
                  value={categoryId}
                  onChange={(event) =>
                    setCategoryId(
                      event.target.value === "ALL"
                        ? "ALL"
                        : Number(event.target.value),
                    )
                  }
                  className={filterSelectClass}
                >
                  <option value="ALL">Tất cả danh mục</option>
                  {sortedCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.cateName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={filterLabelClass}>Thương hiệu</span>
                <select
                  value={brand}
                  onChange={(event) => setBrand(event.target.value)}
                  className={filterSelectClass}
                >
                  <option value="ALL">Tất cả thương hiệu</option>
                  {managerProduct.brands.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={filterLabelClass}>Tồn kho</span>
                <select
                  value={stockStatus}
                  onChange={(event) =>
                    setStockStatus(event.target.value as StockStatus)
                  }
                  className={filterSelectClass}
                >
                  {stockOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="hidden">
              <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
                Nhóm danh mục
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMenuGroup("ALL");
                    setCategoryId("ALL");
                  }}
                  className={`h-10 shrink-0 rounded-xl border px-4 text-sm font-bold ${
                    menuGroup === "ALL"
                      ? "border-sky-500 bg-sky-50 text-sky-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Tất cả nhóm
                </button>
                {menuGroups.map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => {
                      setMenuGroup(group);
                      setCategoryId("ALL");
                    }}
                    className={`h-10 shrink-0 rounded-xl border px-4 text-sm font-bold ${
                      menuGroup === group
                        ? "border-sky-500 bg-sky-50 text-sky-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden">
              <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
                Danh mục
              </p>
              <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => setCategoryId("ALL")}
                  className={`h-10 shrink-0 rounded-xl border px-4 text-sm font-bold ${
                    categoryId === "ALL"
                      ? "border-sky-500 bg-sky-50 text-sky-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Tất cả
                </button>
                {sortedCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setCategoryId(category.id)}
                    className={`h-10 shrink-0 rounded-xl border px-4 text-sm font-bold ${
                      categoryId === category.id
                        ? "border-sky-500 bg-sky-50 text-sky-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {category.cateName}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden">
              <select
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
                className={filterSelectClass}
              >
                <option value="ALL">Tất cả thương hiệu</option>
                {managerProduct.brands.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                value={stockStatus}
                onChange={(event) =>
                  setStockStatus(event.target.value as StockStatus)
                }
                className={filterSelectClass}
              >
                {stockOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : error ? (
          <div className="p-5">
            <ErrorState label={error} />
          </div>
        ) : activeTab === "products" ? (
          managerProduct.products.length ? (
            <ProductTable
              products={managerProduct.products}
              page={page}
              onCreateReceipt={goToCreateProductReceipt}
            />
          ) : (
            <div className="p-5">
              <EmptyState label="Không có sản phẩm phù hợp" />
            </div>
          )
        ) : managerBeverage.beverages.length ? (
          <BeverageTable
            beverages={managerBeverage.beverages}
            page={page}
            onCreateReceipt={goToCreateBeverageReceipt}
          />
        ) : (
          <div className="p-5">
            <EmptyState label="Không có đồ uống phù hợp" />
          </div>
        )}
      </div>

      <TablePagination
        page={page}
        totalPages={totalPages}
        total={pagination.total}
        unit={activeTab === "products" ? "sản phẩm" : "đồ uống"}
        onPage={setPage}
      />
    </div>
  );
};

const ProductTable = ({
  products,
  page,
  onCreateReceipt,
}: {
  products: ManagerProduct[];
  page: number;
  onCreateReceipt: (variantId: number) => void;
}) => (
  <table className="w-full min-w-[980px] text-sm">
    <thead>
      <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
        <th className="px-4 py-3 font-semibold">#</th>
        <th className="px-4 py-3 font-semibold">Sản phẩm</th>
        <th className="px-4 py-3 font-semibold">Danh mục</th>
        <th className="px-4 py-3 font-semibold">Giá</th>
        <th className="px-4 py-3 font-semibold">Tồn kho</th>
        <th className="px-4 py-3 font-semibold">Biến thể</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 [&_td]:align-top">
      {products.map((product, index) => {
        const stock = getStockMeta(product.totalStock);

        return (
          <tr key={product.id} className="align-top">
            <td className="px-4 py-3 text-slate-400">
              {(page - 1) * LIMIT + index + 1}
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-3">
                <img
                  src={product.thumbnailUrl}
                  alt={product.productName}
                  className="h-14 w-14 rounded-xl border border-slate-200 object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900">
                    {product.productName}
                  </p>
                  <p className="text-xs font-semibold text-slate-500">
                    {product.brand}
                  </p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3">
              <span className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700">
                {product.category?.cateName || "Sản phẩm"}
              </span>
            </td>
            <td className="px-4 py-3 font-bold text-sky-700">
              {getPriceRange(product.variants)}
            </td>
            <td className="px-4 py-3">
              <p className={`font-bold ${stock.text}`}>{product.totalStock}</p>
              <span
                className={`mt-1 inline-flex rounded-md border px-2 py-0.5 text-xs font-bold ${stock.badge}`}
              >
                {stock.label}
              </span>
            </td>
            <td className="px-4 py-3">
              <div className="space-y-2">
                {product.variants.map((variant) => {
                  const variantStock = getStockMeta(variant.stock);

                  return (
                    <div
                      key={variant.id}
                      className="grid grid-cols-[minmax(0,1fr)_90px_58px_36px] items-center gap-2 rounded-xl bg-slate-50 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-800">
                          {getVariantName(variant)}
                        </p>
                        <p className="truncate text-[11px] text-slate-500">
                          {variant.sku || "Chưa có SKU"}
                        </p>
                      </div>
                      <p className="text-right text-xs font-bold text-slate-700">
                        {formatCurrency(
                          getDiscountPrice(variant.price, variant.discount),
                        )}
                      </p>
                      <p
                        className={`text-right text-xs font-bold ${variantStock.text}`}
                      >
                        {variant.stock}
                      </p>
                      <button
                        type="button"
                        onClick={() => onCreateReceipt(variant.id)}
                        title="Tạo phiếu nhập"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-sky-600 hover:bg-sky-50"
                      >
                        <PackagePlus className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

const BeverageTable = ({
  beverages,
  page,
  onCreateReceipt,
}: {
  beverages: ManagerBeverage[];
  page: number;
  onCreateReceipt: (beverageId: number) => void;
}) => (
  <table className="w-full min-w-[860px] text-sm">
    <thead>
      <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
        <th className="px-4 py-3 font-semibold">#</th>
        <th className="px-4 py-3 font-semibold">Đồ uống</th>
        <th className="px-4 py-3 font-semibold">Giá</th>
        <th className="px-4 py-3 font-semibold">Tồn kho</th>
        <th className="px-4 py-3 font-semibold">Ngày tạo</th>
        <th className="px-4 py-3 font-semibold">Thao tác</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 [&_td]:align-top">
      {beverages.map((beverage, index) => {
        const stock = getStockMeta(beverage.stock);

        return (
          <tr key={beverage.id}>
            <td className="px-4 py-3 text-slate-400">
              {(page - 1) * LIMIT + index + 1}
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                {beverage.thumbnailUrl ? (
                  <img
                    src={beverage.thumbnailUrl}
                    alt={beverage.beverageName}
                    className="h-12 w-12 rounded-xl border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-300">
                    <CupSoda className="h-6 w-6" />
                  </div>
                )}
                <p className="font-bold text-slate-900">
                  {beverage.beverageName}
                </p>
              </div>
            </td>
            <td className="px-4 py-3 font-bold text-sky-700">
              {formatCurrency(beverage.price)}
            </td>
            <td className="px-4 py-3">
              <span
                className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-bold ${stock.badge}`}
              >
                {stock.label}
              </span>
            </td>
            <td className="px-4 py-3 text-slate-600">
              {new Date(beverage.createdAt).toLocaleDateString("vi-VN")}
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onCreateReceipt(beverage.id)}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-3 text-xs font-bold text-sky-700 hover:bg-sky-100"
                >
                  <PackagePlus className="h-4 w-4" />
                  Nhập
                </button>
              </div>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

export default ProductPagae;
