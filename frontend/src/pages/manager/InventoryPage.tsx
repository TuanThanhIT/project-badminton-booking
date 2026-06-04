import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  ClipboardCheck,
  History,
  PackagePlus,
  Plus,
  RefreshCcw,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import managerInventoryService from "../../services/manager/inventoryService";
import managerProductService from "../../services/manager/productService";
import managerBeverageService from "../../services/manager/beverageService";
import {
  ManagerPageHeader,
  managerInputClass,
  managerSecondaryButtonClass,
} from "../../components/commons/manager/ManagerPage";
import type {
  BeverageStock,
  PurchaseReceipt,
  StockItemType,
  StockTransaction,
  Supplier,
  VariantStock,
} from "../../types/inventory";
import type { ManagerProduct } from "../../types/product";
import type { ManagerBeverage } from "../../types/beverage";
import TablePagination from "../../components/ui/user/pagination/TablePagination";

const LIMIT = 10;

type InventoryTab = "receipts" | "create" | "variant" | "beverage" | "history";

type ReceiptDetailForm = {
  itemType: StockItemType;
  itemId: string;
  quantity: number;
  importPrice: number;
};

const createEmptyDetail = (): ReceiptDetailForm => ({
  itemType: "PRODUCT_VARIANT",
  itemId: "",
  quantity: 1,
  importPrice: 0,
});

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const statusClass: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  CANCELLED: "bg-slate-100 text-slate-600 border-slate-200",
};

const InventoryPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<InventoryTab>("receipts");
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [receipts, setReceipts] = useState<PurchaseReceipt[]>([]);
  const [variantStocks, setVariantStocks] = useState<VariantStock[]>([]);
  const [beverageStocks, setBeverageStocks] = useState<BeverageStock[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [products, setProducts] = useState<ManagerProduct[]>([]);
  const [beverages, setBeverages] = useState<ManagerBeverage[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [supplierId, setSupplierId] = useState("");
  const [note, setNote] = useState("");
  const [details, setDetails] = useState<ReceiptDetailForm[]>([
    createEmptyDetail(),
  ]);

  const variantOptions = useMemo(
    () =>
      products.flatMap((product) =>
        product.variants.map((variant) => ({
          id: variant.id,
          label: `${product.productName} - ${variant.size || variant.color || variant.sku || variant.id}`,
        })),
      ),
    [products],
  );

  const totalImportAmount = useMemo(
    () =>
      details.reduce(
        (sum, item) =>
          sum + Number(item.quantity || 0) * Number(item.importPrice || 0),
        0,
      ),
    [details],
  );

  const loadBaseData = async () => {
    const [supplierRes, productRes, beverageRes] = await Promise.all([
      managerInventoryService.supplierService.list({ limit: 100 }),
      managerProductService.getProductsService({ page: 1, limit: 100 }),
      managerBeverageService.getBeveragesService({ page: 1, limit: 100 }),
    ]);
    setSuppliers(supplierRes.data.data.suppliers || []);
    setProducts(productRes.data.data.products || []);
    setBeverages(beverageRes.data.data.beverages || []);
  };

  const fetchTabData = async () => {
    setLoading(true);
    try {
      if (tab === "receipts") {
        const res = await managerInventoryService.purchaseReceiptService.list({
          page,
          limit: LIMIT,
        });
        setReceipts(res.data.data.purchaseReceipts || []);
        setTotal(res.data.data.pagination?.total || 0);
      }
      if (tab === "variant") {
        const res = await managerInventoryService.stockService.variantStocks({
          page,
          limit: LIMIT,
        });
        setVariantStocks(res.data.data.variantStocks || []);
        setTotal(res.data.data.pagination?.total || 0);
      }
      if (tab === "beverage") {
        const res = await managerInventoryService.stockService.beverageStocks({
          page,
          limit: LIMIT,
        });
        setBeverageStocks(res.data.data.beverageStocks || []);
        setTotal(res.data.data.pagination?.total || 0);
      }
      if (tab === "history") {
        const res = await managerInventoryService.stockService.transactions({
          page,
          limit: LIMIT,
        });
        setTransactions(res.data.data.stockTransactions || []);
        setTotal(res.data.data.pagination?.total || 0);
      }
    } catch {
      setReceipts([]);
      setVariantStocks([]);
      setBeverageStocks([]);
      setTransactions([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBaseData().catch(() => {
      setSuppliers([]);
      setProducts([]);
      setBeverages([]);
    });
  }, []);

  useEffect(() => {
    if (tab !== "create") fetchTabData();
  }, [tab, page]);

  useEffect(() => {
    const requestedTab = searchParams.get("tab") as InventoryTab | null;
    const validTabs: InventoryTab[] = [
      "receipts",
      "create",
      "variant",
      "beverage",
      "history",
    ];

    if (!requestedTab || !validTabs.includes(requestedTab)) return;

    setTab(requestedTab);
    setPage(1);

    if (requestedTab !== "create") return;

    const itemType = searchParams.get("itemType") as StockItemType | null;
    const variantId = Number(searchParams.get("variantId") || 0);
    const beverageId = Number(searchParams.get("beverageId") || 0);
    const itemId =
      itemType === "PRODUCT_VARIANT"
        ? variantId
        : itemType === "BEVERAGE"
          ? beverageId
          : 0;

    if (
      !itemType ||
      !["PRODUCT_VARIANT", "BEVERAGE"].includes(itemType) ||
      !itemId
    ) {
      return;
    }

    setDetails((current) => {
      const existed = current.some(
        (item) => item.itemType === itemType && Number(item.itemId) === itemId,
      );

      if (existed) return current;

      const nextDetail: ReceiptDetailForm = {
        itemType,
        itemId: String(itemId),
        quantity: 1,
        importPrice: 0,
      };
      const firstEmpty =
        current.length === 1 &&
        !current[0].itemId &&
        current[0].quantity === 1 &&
        Number(current[0].importPrice) === 0;

      return firstEmpty ? [nextDetail] : [...current, nextDetail];
    });

    navigate("/manager/inventory?tab=create", { replace: true });
  }, [navigate, searchParams]);

  const updateDetail = (
    index: number,
    patch: Partial<(typeof details)[number]>,
  ) => {
    setDetails((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };

  const handleCreateReceipt = async () => {
    if (!supplierId) {
      toast.error("Chọn nhà cung cấp");
      return;
    }

    const payloadDetails = details.map((item) => ({
      itemType: item.itemType,
      variantId:
        item.itemType === "PRODUCT_VARIANT" ? Number(item.itemId) : null,
      beverageId: item.itemType === "BEVERAGE" ? Number(item.itemId) : null,
      quantity: Number(item.quantity),
      importPrice: Number(item.importPrice),
    }));

    if (
      payloadDetails.some(
        (item) =>
          (!item.variantId && !item.beverageId) ||
          !Number.isInteger(item.quantity) ||
          item.quantity <= 0 ||
          item.importPrice < 0,
      )
    ) {
      toast.error("Kiểm tra lại mặt hàng, số lượng và giá nhập");
      return;
    }

    setLoading(true);
    try {
      await managerInventoryService.purchaseReceiptService.create({
        supplierId: Number(supplierId),
        note: note || undefined,
        details: payloadDetails,
      });
      toast.success("Đã tạo phiếu nhập chờ duyệt");
      setSupplierId("");
      setNote("");
      setDetails([createEmptyDetail()]);
      setTab("receipts");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Tạo phiếu nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    setLoading(true);
    try {
      await managerInventoryService.purchaseReceiptService.cancel(id);
      toast.success("Đã hủy phiếu nhập");
      fetchTabData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Hủy phiếu nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: "receipts", label: "Phiếu nhập", icon: ClipboardCheck },
    { key: "create", label: "Tạo phiếu", icon: PackagePlus },
    { key: "variant", label: "Kho sản phẩm", icon: Boxes },
    { key: "beverage", label: "Kho đồ uống", icon: Boxes },
    { key: "history", label: "Lịch sử kho", icon: History },
  ] as const;
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      <ManagerPageHeader
        eyebrow="Manager inventory"
        title="Kho hàng"
        description="Tạo phiếu nhập, xem tồn kho và theo dõi lịch sử thay đổi tại branch đang quản lý."
        metrics={[
          { label: "Phiếu nhập", value: receipts.length },
          {
            label: "Tồn kho",
            value:
              variantStocks.reduce(
                (sum, item) => sum + Number(item.stock || 0),
                0,
              ) +
              beverageStocks.reduce(
                (sum, item) => sum + Number(item.stock || 0),
                0,
              ),
          },
        ]}
        actions={
          <button
            type="button"
            onClick={fetchTabData}
            className={`${managerSecondaryButtonClass} border-white/10 bg-white/10 text-white hover:bg-white/20`}
          >
            <RefreshCcw className="h-4 w-4" />
            Làm mới
          </button>
        }
      />

      <div className="hidden flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Kho hàng</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tạo phiếu nhập, xem tồn kho và lịch sử thay đổi tại chi nhánh.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchTabData}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700"
        >
          <RefreshCcw className="h-4 w-4" />
          Làm mới
        </button>
      </div>

      <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-2">
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setTab(item.key);
                setPage(1);
              }}
              className={`inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-bold transition ${
                tab === item.key
                  ? "bg-sky-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "create" ? (
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-1 block text-xs font-medium text-slate-600">
                Nhà cung cấp
              </span>
              <select
                value={supplierId}
                onChange={(event) => setSupplierId(event.target.value)}
                className={`w-full ${managerInputClass}`}
              >
                <option value="">Chọn nhà cung cấp</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.supplierName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-1 block text-xs font-medium text-slate-600">
                Ghi chú
              </span>
              <input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className={`w-full ${managerInputClass}`}
                placeholder="Ghi chú phiếu nhập"
              />
            </label>
          </div>

          <div className="space-y-3">
            <div className="hidden grid-cols-[160px_1fr_120px_140px_40px] gap-3 px-3 text-xs font-bold uppercase text-slate-500 md:grid">
              <span>Loại hàng</span>
              <span>Mặt hàng</span>
              <span>Số lượng nhập</span>
              <span>Giá nhập / đơn vị</span>
              <span />
            </div>
            {details.map((detail, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-[160px_1fr_120px_140px_40px]"
              >
                <select
                  value={detail.itemType}
                  onChange={(event) =>
                    updateDetail(index, {
                      itemType: event.target.value as StockItemType,
                      itemId: "",
                    })
                  }
                  className={managerInputClass}
                >
                  <option value="PRODUCT_VARIANT">Sản phẩm</option>
                  <option value="BEVERAGE">Đồ uống</option>
                </select>
                <select
                  value={detail.itemId}
                  onChange={(event) =>
                    updateDetail(index, { itemId: event.target.value })
                  }
                  className={managerInputClass}
                >
                  <option value="">Chọn mặt hàng</option>
                  {(detail.itemType === "PRODUCT_VARIANT"
                    ? variantOptions
                    : beverages.map((item) => ({
                        id: item.id,
                        label: item.beverageName,
                      }))
                  ).map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  value={detail.quantity}
                  onChange={(event) =>
                    updateDetail(index, {
                      quantity: Number(event.target.value),
                    })
                  }
                  className={managerInputClass}
                  placeholder="Số lượng nhập"
                  aria-label="Số lượng nhập"
                  title="Số lượng nhập"
                />
                <input
                  type="number"
                  min={0}
                  value={detail.importPrice}
                  onChange={(event) =>
                    updateDetail(index, {
                      importPrice: Number(event.target.value),
                    })
                  }
                  className={managerInputClass}
                  placeholder="Giá nhập / đơn vị"
                  aria-label="Giá nhập trên mỗi đơn vị"
                  title="Giá nhập / đơn vị"
                />
                <button
                  type="button"
                  onClick={() =>
                    setDetails((current) =>
                      current.length === 1
                        ? current
                        : current.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-right">
              <p className="text-xs font-bold uppercase text-slate-500">
                Tổng tiền nhập
              </p>
              <p className="text-xl font-bold text-sky-700">
                {formatCurrency(totalImportAmount)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-between gap-3">
            <button
              type="button"
              onClick={() =>
                setDetails((current) => [...current, createEmptyDetail()])
              }
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700"
            >
              <Plus className="h-4 w-4" />
              Thêm dòng
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleCreateReceipt}
              className="h-10 rounded-lg bg-sky-600 px-4 text-sm font-bold text-white disabled:bg-slate-300"
            >
              Tạo phiếu nhập
            </button>
          </div>
        </section>
      ) : null}

      {tab === "receipts" ? (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Mã phiếu</th>
                <th className="px-4 py-3 font-semibold">Nhà cung cấp</th>
                <th className="px-4 py-3 text-right font-semibold">
                  Tổng tiền
                </th>
                <th className="px-4 py-3 text-center font-semibold">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-center font-semibold">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 [&_td]:align-top">
              {receipts.map((receipt, index) => (
                <tr key={receipt.id}>
                  <td className="px-4 py-3 text-slate-400">
                    {(page - 1) * LIMIT + index + 1}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-800">
                    {receipt.receiptCode}
                  </td>
                  <td className="px-4 py-3">
                    {receipt.supplier?.supplierName}
                  </td>
                  <td className="px-4 py-3 text-right font-bold">
                    {formatCurrency(receipt.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass[receipt.status]}`}
                    >
                      {receipt.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {receipt.status === "PENDING" ? (
                      <button
                        type="button"
                        onClick={() => handleCancel(receipt.id)}
                        className="rounded-md bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600"
                      >
                        Hủy
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {!receipts.length ? (
                <EmptyTableRow colSpan={6} label="Không có phiếu nhập" />
              ) : null}
            </tbody>
          </table>
          <TablePagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPage={setPage}
            unit="phiếu nhập"
          />
        </section>
      ) : null}

      {tab === "variant" ? (
        <>
          <StockTable
            page={page}
            rows={variantStocks.map((item) => ({
              id: item.id,
              name: item.variant?.product?.productName || "Sản phẩm",
              extra:
                item.variant?.size ||
                item.variant?.color ||
                item.variant?.sku ||
                "",
              branch: item.branch?.branchName || "",
              stock: item.stock,
            }))}
          />
          <TablePagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPage={setPage}
          />
        </>
      ) : null}

      {tab === "beverage" ? (
        <>
          <StockTable
            page={page}
            rows={beverageStocks.map((item) => ({
              id: item.id,
              name: item.beverage?.beverageName || "Đồ uống",
              extra: formatCurrency(Number(item.beverage?.price || 0)),
              branch: item.branch?.branchName || "",
              stock: item.stock,
            }))}
          />
          <TablePagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPage={setPage}
          />
        </>
      ) : null}

      {tab === "history" ? (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Thời gian</th>
                <th className="px-4 py-3 font-semibold">Loại</th>
                <th className="px-4 py-3 text-right font-semibold">Thay đổi</th>
                <th className="px-4 py-3 text-right font-semibold">Sau tồn</th>
                <th className="px-4 py-3 font-semibold">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 [&_td]:align-top">
              {transactions.map((item, index) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-slate-400">
                    {(page - 1) * LIMIT + index + 1}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(item.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-4 py-3 font-bold">{item.type}</td>
                  <td
                    className={`px-4 py-3 text-right font-bold ${
                      item.quantity > 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {item.quantity > 0 ? "+" : ""}
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right">{item.afterStock}</td>
                  <td className="px-4 py-3">{item.note}</td>
                </tr>
              ))}
              {!transactions.length ? (
                <EmptyTableRow colSpan={6} label="Không có lịch sử kho" />
              ) : null}
            </tbody>
          </table>
          <TablePagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPage={setPage}
          />
        </section>
      ) : null}
    </div>
  );
};

const StockTable = ({
  page,
  rows,
}: {
  page: number;
  rows: {
    id: number;
    name: string;
    extra: string;
    branch: string;
    stock: number;
  }[];
}) => (
  <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <th className="px-4 py-3 font-semibold">#</th>
          <th className="px-4 py-3 font-semibold">Mặt hàng</th>
          <th className="px-4 py-3 font-semibold">Thông tin</th>
          <th className="px-4 py-3 font-semibold">Chi nhánh</th>
          <th className="px-4 py-3 text-right font-semibold">Tồn kho</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 [&_td]:align-top">
        {rows.map((row, index) => (
          <tr key={row.id}>
            <td className="px-4 py-3 text-slate-400">
              {(page - 1) * LIMIT + index + 1}
            </td>
            <td className="px-4 py-3 font-bold text-slate-800">{row.name}</td>
            <td className="px-4 py-3 text-slate-500">{row.extra}</td>
            <td className="px-4 py-3">{row.branch}</td>
            <td className="px-4 py-3 text-right text-lg font-bold text-sky-700">
              {row.stock}
            </td>
          </tr>
        ))}
        {!rows.length ? (
          <EmptyTableRow colSpan={5} label="Không có dữ liệu tồn kho" />
        ) : null}
      </tbody>
    </table>
  </section>
);

const EmptyTableRow = ({
  colSpan,
  label,
}: {
  colSpan: number;
  label: string;
}) => (
  <tr>
    <td
      colSpan={colSpan}
      className="px-4 py-10 text-center text-sm font-semibold text-slate-400"
    >
      {label}
    </td>
  </tr>
);

export default InventoryPage;
