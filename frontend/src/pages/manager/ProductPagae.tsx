import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Beef,
  Boxes,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CupSoda,
  Download,
  PackageSearch,
  Save,
  Search,
  Shirt,
} from "lucide-react";
import { toast } from "react-toastify";

import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  getManagerProducts,
  updateManagerProductStock,
} from "../../redux/slices/manager/productSlice";
import {
  getManagerBeverages,
  updateManagerBeverageStock,
} from "../../redux/slices/manager/beverageSlice";
import inventoryReceiptService from "../../services/manager/inventoryReceiptService";
import type { ManagerProduct } from "../../types/product";
import type { ManagerBeverage } from "../../types/beverage";

type ProductTab = "products" | "beverages";
const LOW_STOCK_THRESHOLD = 5;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const getDiscountPrice = (price: number, discount: number) =>
  Math.max(price - (price * discount) / 100, 0);

const getTodayInputValue = () => {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const getStockWarning = (stock: number) => {
  if (stock <= 0) {
    return {
      label: "Het hang",
      className: "border-rose-200 bg-rose-50 text-rose-700",
      iconClassName: "text-rose-500",
    };
  }

  if (stock <= LOW_STOCK_THRESHOLD) {
    return {
      label: "Sap het hang",
      className: "border-amber-200 bg-amber-50 text-amber-700",
      iconClassName: "text-amber-500",
    };
  }

  return null;
};

const ProductCard = ({
  product,
  savingStockKey,
  onSaveStock,
}: {
  product: ManagerProduct;
  savingStockKey: string | null;
  onSaveStock: (variantId: number, stock: number) => Promise<void>;
}) => {
  const [stockValues, setStockValues] = useState<Record<number, string>>({});
  const firstVariant = product.variants[0];
  const lowStockVariants = product.variants.filter(
    (variant) => variant.stock <= LOW_STOCK_THRESHOLD,
  );
  const outOfStockVariants = product.variants.filter(
    (variant) => variant.stock <= 0,
  );
  const productWarning =
    outOfStockVariants.length > 0
      ? getStockWarning(0)
      : lowStockVariants.length > 0
        ? getStockWarning(LOW_STOCK_THRESHOLD)
        : null;
  const minPrice = product.variants.reduce((min, variant) => {
    const price = getDiscountPrice(variant.price, variant.discount);
    return min === 0 ? price : Math.min(min, price);
  }, 0);

  useEffect(() => {
    setStockValues(
      product.variants.reduce<Record<number, string>>((result, variant) => {
        result[variant.id] = String(variant.stock);
        return result;
      }, {}),
    );
  }, [product.variants]);

  return (
    <article
      className={`overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md ${
        productWarning
          ? "border-amber-200 hover:border-amber-300"
          : "border-slate-200 hover:border-sky-200"
      }`}
    >
      <div className="relative h-44 bg-slate-100">
        <img
          src={product.thumbnailUrl}
          alt={product.productName}
          className="h-full w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm">
          {product.category?.cateName || "Sản phẩm"}
        </span>
        {productWarning ? (
          <span
            className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-extrabold shadow-sm ${productWarning.className}`}
          >
            <AlertTriangle
              className={`h-3.5 w-3.5 ${productWarning.iconClassName}`}
            />
            {outOfStockVariants.length > 0
              ? `${outOfStockVariants.length} het`
              : `${lowStockVariants.length} sap het`}
          </span>
        ) : null}
      </div>

      <div className="space-y-4 p-4">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">
            {product.brand}
          </p>
          <h3 className="mt-1 line-clamp-2 min-h-12 text-base font-bold text-slate-900">
            {product.productName}
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="rounded-lg bg-slate-50 p-2">
            <p className="text-xs text-slate-500">Biến thể</p>
            <p className="font-bold text-slate-900">{product.variantCount}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-2">
            <p className="text-xs text-slate-500">Tồn kho</p>
            <p
              className={`font-bold ${
                productWarning ? productWarning.iconClassName : "text-slate-900"
              }`}
            >
              {product.totalStock}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-2">
            <p className="text-xs text-slate-500">Chiết khấu</p>
            <p className="font-bold text-slate-900">
              {firstVariant?.discount || 0}%
            </p>
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs text-slate-500">Giá từ</p>
            <p className="text-lg font-black text-sky-700">
              {formatCurrency(minPrice || firstVariant?.price || 0)}
            </p>
          </div>
          <div className="flex max-w-36 flex-wrap justify-end gap-1">
            {product.variants.slice(0, 3).map((variant) => (
              <span
                key={variant.id}
                className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"
              >
                {variant.size || variant.color || variant.sku || "Variant"}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2 border-t border-slate-100 pt-4">
          <p className="text-xs font-bold uppercase text-slate-500"></p>
          {product.variants.map((variant) => {
            const saveKey = `product-${variant.id}`;
            const value = stockValues[variant.id] ?? String(variant.stock);
            const stockNumber = Number(value);
            const isInvalid =
              value === "" || !Number.isInteger(stockNumber) || stockNumber < 0;
            const isSaving = savingStockKey === saveKey;
            const warning = getStockWarning(variant.stock);

            return (
              <div
                key={variant.id}
                className={`grid grid-cols-[1fr_92px_40px] items-center gap-2 rounded-lg p-2 ${
                  warning ? warning.className : "bg-slate-50"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {warning ? (
                      <AlertTriangle
                        className={`h-3.5 w-3.5 shrink-0 ${warning.iconClassName}`}
                      />
                    ) : null}
                    <p className="truncate text-sm font-bold text-slate-800">
                      {variant.size || variant.color || variant.sku || "Variant"}
                    </p>
                  </div>
                  <p className="truncate text-xs text-slate-500">
                    {variant.sku || "Không có SKU"}
                  </p>
                </div>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={value}
                  onChange={(event) =>
                    setStockValues((current) => ({
                      ...current,
                      [variant.id]: event.target.value,
                    }))
                  }
                  className="h-9 rounded-md border border-slate-200 bg-white px-2 text-right text-sm font-bold text-slate-900 outline-none focus:border-sky-400"
                />
                <button
                  type="button"
                  disabled={
                    isInvalid || isSaving || stockNumber === variant.stock
                  }
                  onClick={() => onSaveStock(variant.id, stockNumber)}
                  className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-600 text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  title="Lưu tồn kho"
                >
                  <Save className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
};

const BeverageCard = ({
  beverage,
  savingStockKey,
  onSaveStock,
}: {
  beverage: ManagerBeverage;
  savingStockKey: string | null;
  onSaveStock: (beverageId: number, stock: number) => Promise<void>;
}) => {
  const [stockValue, setStockValue] = useState(String(beverage.stock));
  const stockNumber = Number(stockValue);
  const saveKey = `beverage-${beverage.id}`;
  const isSaving = savingStockKey === saveKey;
  const stockWarning = getStockWarning(beverage.stock);
  const isInvalid =
    stockValue === "" || !Number.isInteger(stockNumber) || stockNumber < 0;

  useEffect(() => {
    setStockValue(String(beverage.stock));
  }, [beverage.stock]);

  return (
    <article
      className={`overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md ${
        stockWarning
          ? "border-amber-200 hover:border-amber-300"
          : "border-slate-200 hover:border-emerald-200"
      }`}
    >
      <div className="relative h-44 bg-slate-100">
        {beverage.thumbnailUrl ? (
          <img
            src={beverage.thumbnailUrl}
            alt={beverage.beverageName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <CupSoda className="h-14 w-14" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-2.5 py-1 text-xs font-bold text-emerald-700 shadow-sm">
          Đồ uống
        </span>
        {stockWarning ? (
          <span
            className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-extrabold shadow-sm ${stockWarning.className}`}
          >
            <AlertTriangle
              className={`h-3.5 w-3.5 ${stockWarning.iconClassName}`}
            />
            {stockWarning.label}
          </span>
        ) : null}
      </div>

      <div className="space-y-4 p-4">
        <h3 className="line-clamp-2 min-h-12 text-base font-bold text-slate-900">
          {beverage.beverageName}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Giá bán</p>
            <p className="font-black text-emerald-700">
              {formatCurrency(beverage.price)}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Tồn kho</p>
            <p
              className={`font-black ${
                stockWarning ? stockWarning.iconClassName : "text-slate-900"
              }`}
            >
              {beverage.stock}
            </p>
          </div>
        </div>

        {stockWarning ? (
          <div
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold ${stockWarning.className}`}
          >
            <AlertTriangle
              className={`h-4 w-4 shrink-0 ${stockWarning.iconClassName}`}
            />
            Can cap nhat ton kho som de tranh het hang.
          </div>
        ) : null}

        <div className="border-t border-slate-100 pt-4">
          <p className="mb-2 text-xs font-bold uppercase text-slate-500"></p>
          <div className="grid grid-cols-[1fr_40px] gap-2">
            <input
              type="number"
              min={0}
              step={1}
              value={stockValue}
              onChange={(event) => setStockValue(event.target.value)}
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-right text-sm font-bold text-slate-900 outline-none focus:border-emerald-400"
            />
            <button
              type="button"
              disabled={isInvalid || isSaving || stockNumber === beverage.stock}
              onClick={() => onSaveStock(beverage.id, stockNumber)}
              className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              title="Lưu tồn kho"
            >
              <Save className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

const EmptyState = ({ label }: { label: string }) => (
  <div className="rounded-lg border border-dashed border-slate-300 bg-white py-14 text-center">
    <PackageSearch className="mx-auto h-12 w-12 text-slate-300" />
    <p className="mt-3 font-semibold text-slate-700">{label}</p>
    <p className="mt-1 text-sm text-slate-500">
      Thử đổi từ khóa tìm kiếm hoặc kiểm tra tồn kho chi nhánh.
    </p>
  </div>
);

const ProductPagae = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<ProductTab>("products");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [savingStockKey, setSavingStockKey] = useState<string | null>(null);
  const [exportDate, setExportDate] = useState(getTodayInputValue);
  const [isExporting, setIsExporting] = useState(false);
  const limit = 9;

  const managerProduct = useAppSelector((state) => state.managerProduct);
  const managerBeverage = useAppSelector((state) => state.managerBeverage);

  const loading =
    activeTab === "products" ? managerProduct.loading : managerBeverage.loading;
  const pagination =
    activeTab === "products"
      ? managerProduct.pagination
      : managerBeverage.pagination;
  const totalPages = Math.max(
    Math.ceil(pagination.total / pagination.limit),
    1,
  );

  useEffect(() => {
    setPage(1);
  }, [activeTab, search]);

  useEffect(() => {
    const params = {
      page,
      limit,
      search: search.trim() || undefined,
    };

    if (activeTab === "products") {
      dispatch(getManagerProducts(params));
      return;
    }

    dispatch(getManagerBeverages(params));
  }, [activeTab, dispatch, page, search]);

  const handleSaveProductStock = async (variantId: number, stock: number) => {
    const saveKey = `product-${variantId}`;
    setSavingStockKey(saveKey);

    try {
      await dispatch(updateManagerProductStock({ variantId, stock })).unwrap();
      toast.success("Đã cập nhật tồn kho sản phẩm");
    } catch (error: any) {
      toast.error(error?.message || "Cập nhật tồn kho thất bại");
    } finally {
      setSavingStockKey(null);
    }
  };

  const handleSaveBeverageStock = async (beverageId: number, stock: number) => {
    const saveKey = `beverage-${beverageId}`;
    setSavingStockKey(saveKey);

    try {
      await dispatch(
        updateManagerBeverageStock({ beverageId, stock }),
      ).unwrap();
      toast.success("Đã cập nhật tồn kho đồ uống");
    } catch (error: any) {
      toast.error(error?.message || "Cập nhật tồn kho thất bại");
    } finally {
      setSavingStockKey(null);
    }
  };

  const handleExportInventoryReceipts = async () => {
    if (!exportDate) {
      toast.error("Chọn ngày cần export");
      return;
    }

    setIsExporting(true);
    try {
      const response =
        await inventoryReceiptService.exportInventoryReceiptsService(exportDate);
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `inventory-receipts-${exportDate}.xls`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Đã export hóa đơn nhập kho");
    } catch (error: any) {
      toast.error(error?.message || "Export hóa đơn thất bại");
    } finally {
      setIsExporting(false);
    }
  };

  const stats = useMemo(() => {
    const productStock = managerProduct.products.reduce(
      (sum, product) => sum + product.totalStock,
      0,
    );
    const beverageStock = managerBeverage.beverages.reduce(
      (sum, beverage) => sum + beverage.stock,
      0,
    );
    const lowProductVariantCount = managerProduct.products.reduce(
      (sum, product) =>
        sum +
        product.variants.filter(
          (variant) => variant.stock <= LOW_STOCK_THRESHOLD,
        ).length,
      0,
    );
    const lowBeverageCount = managerBeverage.beverages.filter(
      (beverage) => beverage.stock <= LOW_STOCK_THRESHOLD,
    ).length;

    return {
      productCount: managerProduct.pagination.total,
      beverageCount: managerBeverage.pagination.total,
      productStock,
      beverageStock,
      lowProductVariantCount,
      lowBeverageCount,
      lowStockCount: lowProductVariantCount + lowBeverageCount,
    };
  }, [
    managerBeverage.beverages,
    managerBeverage.pagination.total,
    managerProduct.products,
    managerProduct.pagination.total,
  ]);

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Quản lý sản phẩm
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi sản phẩm chung và tồn kho riêng tại chi nhánh của bạn.
          </p>
        </div>

        {activeTab === "products" ? (
          <div className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 shadow-sm">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={exportDate}
              onChange={(event) => setExportDate(event.target.value)}
              className="h-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
            />
            <button
              type="button"
              onClick={handleExportInventoryReceipts}
              disabled={isExporting}
              className="inline-flex h-8 items-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Đang export" : "Export Excel"}
            </button>
          </div>
        ) : null}

        <label className="flex h-11 w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 shadow-sm lg:w-96">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-full flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            placeholder={
              activeTab === "products"
                ? "Tìm quần áo, vợt, phụ kiện..."
                : "Tìm đồ uống..."
            }
          />
        </label>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-5">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Shirt className="h-5 w-5 text-sky-600" />
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Sản phẩm
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.productCount}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Boxes className="h-5 w-5 text-sky-600" />
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Tồn sản phẩm
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.productStock}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <CupSoda className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Đồ uống
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.beverageCount}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Beef className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Tồn đồ uống
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.beverageStock}
              </p>
            </div>
          </div>
        </div>
        <div
          className={`rounded-lg border bg-white p-4 shadow-sm ${
            stats.lowStockCount > 0 ? "border-amber-200" : "border-slate-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Sap het hang
              </p>
              <p
                className={`text-2xl font-bold ${
                  stats.lowStockCount > 0 ? "text-amber-600" : "text-slate-900"
                }`}
              >
                {stats.lowStockCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {stats.lowStockCount > 0 ? (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
          <p>
            Co {stats.lowStockCount} mat hang dang o muc ton kho thap. Nen cap
            nhat som de tranh het hang khi khach dat mua.
          </p>
        </div>
      ) : null}

      <div className="mb-6 inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className={`h-10 rounded-md px-4 text-sm font-bold transition ${
            activeTab === "products"
              ? "bg-sky-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Sản phẩm
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("beverages")}
          className={`h-10 rounded-md px-4 text-sm font-bold transition ${
            activeTab === "beverages"
              ? "bg-emerald-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Đồ uống
        </button>
      </div>

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white py-14 text-center text-sm font-semibold text-slate-500">
          Đang tải dữ liệu...
        </div>
      ) : activeTab === "products" ? (
        managerProduct.products.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {managerProduct.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                savingStockKey={savingStockKey}
                onSaveStock={handleSaveProductStock}
              />
            ))}
          </div>
        ) : (
          <EmptyState label="Chưa có sản phẩm phù hợp" />
        )
      ) : managerBeverage.beverages.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {managerBeverage.beverages.map((beverage) => (
            <BeverageCard
              key={beverage.id}
              beverage={beverage}
              savingStockKey={savingStockKey}
              onSaveStock={handleSaveBeverageStock}
            />
          ))}
        </div>
      ) : (
        <EmptyState label="Chưa có đồ uống phù hợp" />
      )}

      <div className="mt-6 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-sm text-slate-500">
          Trang <span className="font-bold text-slate-800">{page}</span> /{" "}
          <span className="font-bold text-slate-800">{totalPages}</span>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(current - 1, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() =>
              setPage((current) => Math.min(current + 1, totalPages))
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPagae;
