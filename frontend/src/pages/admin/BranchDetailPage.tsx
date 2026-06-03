import { useCallback, useEffect, useMemo, useState, type ElementType } from "react";
import {
  ArrowLeft,
  Boxes,
  Building2,
  CalendarDays,
  Coffee,
  Edit2,
  FileText,
  History,
  Package,
  Power,
  RefreshCw,
  Store,
  Users,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import AdminPagination from "../../components/ui/admin/AdminPagination";
import AdminSpinner from "../../components/ui/admin/AdminSpinner";
import AdminStatusBadge from "../../components/ui/admin/AdminStatusBadge";
import BranchFormModal from "../../components/ui/admin/branches/BranchFormModal";
import adminBranchService from "../../services/admin/branchService";
import type { AdminBranch } from "../../types/admin";
import { showConfirmDialog } from "../../utils/confirmDialog";

type BranchTabKey =
  | "courts"
  | "employees"
  | "bookings"
  | "orders"
  | "inventory"
  | "purchaseReceipts"
  | "stockHistory";

type InventoryKind = "variantStocks" | "beverageStocks";

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
};

type Column = {
  header: string;
  className?: string;
  render: (item: any, index: number) => React.ReactNode;
};

const LIMIT = 10;

const tabs: { key: BranchTabKey; label: string; icon: ElementType }[] = [
  { key: "courts", label: "Sân", icon: Store },
  { key: "employees", label: "Nhân viên", icon: Users },
  { key: "bookings", label: "Đặt sân", icon: CalendarDays },
  { key: "orders", label: "Đơn hàng", icon: Package },
  { key: "inventory", label: "Kho hàng", icon: Boxes },
  { key: "purchaseReceipts", label: "Phiếu nhập", icon: FileText },
  { key: "stockHistory", label: "Lịch sử kho", icon: History },
];

const statusLabels: Record<string, string> = {
  ACTIVE: "Hoạt động",
  INACTIVE: "Ngừng hoạt động",
  MAINTENANCE: "Bảo trì",
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Đã check-in",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
  PAID: "Đã thanh toán",
  PROCESSING: "Đang xử lý",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  IMPORT: "Nhập kho",
  SALE: "Bán hàng",
  RETURN: "Hoàn kho",
  CANCEL_ORDER: "Hủy đơn",
  ADJUSTMENT: "Điều chỉnh",
  PRODUCT_VARIANT: "Sản phẩm",
  BEVERAGE: "Đồ uống",
};

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "-";

const formatDateTime = (value?: string) =>
  value ? new Date(value).toLocaleString("vi-VN") : "-";

const formatMoney = (value: unknown) =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const display = (value: unknown) =>
  value === undefined || value === null || value === "" ? "-" : String(value);

const labelStatus = (value?: string) => (value ? statusLabels[value] || value : "-");

const getStatusColor = (value?: string | boolean) => {
  if (value === true) return "bg-green-100 text-green-700 border-green-200";
  if (value === false) return "bg-red-100 text-red-600 border-red-200";

  const key = String(value || "").toUpperCase();
  if (["ACTIVE", "COMPLETED", "PAID", "DELIVERED", "APPROVED", "IMPORT", "RETURN"].includes(key)) {
    return "bg-green-100 text-green-700 border-green-200";
  }
  if (["PENDING", "CONFIRMED", "CHECKED_IN", "PROCESSING", "SHIPPING", "SALE", "ADJUSTMENT"].includes(key)) {
    return "bg-sky-100 text-sky-700 border-sky-200";
  }
  if (["MAINTENANCE"].includes(key)) {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }
  if (["INACTIVE", "CANCELLED", "REJECTED", "CANCEL_ORDER"].includes(key)) {
    return "bg-red-100 text-red-600 border-red-200";
  }
  return "bg-slate-100 text-slate-600 border-slate-200";
};

const renderStatusBadge = (value?: string | boolean, fallback?: string) => (
  <AdminStatusBadge
    color={getStatusColor(value)}
    label={typeof value === "boolean" ? (value ? "Hoạt động" : "Đã khóa") : fallback || labelStatus(value)}
  />
);

const getPersonName = (user: any) =>
  user?.profile?.fullName || user?.fullName || user?.username || user?.email || "-";

const getVariantInfo = (variant: any) =>
  [variant?.sku, variant?.color, variant?.size].filter(Boolean).join(" / ") || "-";

const getStockItemName = (item: any) =>
  item?.variant?.product?.productName || item?.beverage?.beverageName || "Mặt hàng";

const getRows = (tab: BranchTabKey, data: any, inventoryKind: InventoryKind) => {
  if (!data) return [];
  if (tab === "inventory") return data[inventoryKind] || [];
  if (tab === "stockHistory") return data.stockTransactions || [];
  return data.items || [];
};

const getPagination = (
  tab: BranchTabKey,
  data: any,
  inventoryKind: InventoryKind,
): Pagination => {
  const pagination =
    tab === "inventory" ? data?.pagination?.[inventoryKind] : data?.pagination;
  const page = Number(pagination?.page || 1);
  const limit = Number(pagination?.limit || LIMIT);
  const total = Number(pagination?.total || 0);
  return {
    page,
    limit,
    total,
    totalPages: Number(pagination?.totalPages || Math.max(Math.ceil(total / limit), 1)),
  };
};

const BranchDetailPage = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const numericBranchId = Number(branchId);

  const [branch, setBranch] = useState<AdminBranch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<BranchTabKey>("courts");
  const [inventoryKind, setInventoryKind] = useState<InventoryKind>("variantStocks");
  const [pages, setPages] = useState<Record<BranchTabKey, number>>({
    courts: 1,
    employees: 1,
    bookings: 1,
    orders: 1,
    inventory: 1,
    purchaseReceipts: 1,
    stockHistory: 1,
  });
  const [tabData, setTabData] = useState<Partial<Record<BranchTabKey, any>>>({});
  const [tabLoading, setTabLoading] = useState<Partial<Record<BranchTabKey, boolean>>>({});
  const [tabError, setTabError] = useState<Partial<Record<BranchTabKey, string>>>({});
  const [showForm, setShowForm] = useState(false);
  const [toggling, setToggling] = useState(false);

  const currentPage = pages[activeTab] || 1;
  const manager = branch?.manager || branch?.managers?.[0] || null;
  const managerCount = branch?.managers?.length || (manager ? 1 : 0);
  const imageCount = branch?.images?.length || 0;
  const courtCount = branch?.courts?.length || branch?.courtCount || 0;

  const fetchBranch = useCallback(async () => {
    if (!numericBranchId) return;
    setLoading(true);
    setError("");
    try {
      const res = await adminBranchService.getAdminBranchDetailService(numericBranchId);
      setBranch((res.data as any).data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể tải chi nhánh");
    } finally {
      setLoading(false);
    }
  }, [numericBranchId]);

  const fetchTab = useCallback(
    async (tab: BranchTabKey, page = 1) => {
      if (!numericBranchId) return;
      setTabLoading((current) => ({ ...current, [tab]: true }));
      setTabError((current) => ({ ...current, [tab]: "" }));
      try {
        const params = { page, limit: LIMIT };
        const fetchers: Record<BranchTabKey, () => Promise<any>> = {
          courts: () => adminBranchService.getAdminBranchCourtsService(numericBranchId, params),
          employees: () => adminBranchService.getAdminBranchEmployeesService(numericBranchId, params),
          bookings: () => adminBranchService.getAdminBranchBookingsService(numericBranchId, params),
          orders: () => adminBranchService.getAdminBranchOrdersService(numericBranchId, params),
          inventory: () => adminBranchService.getAdminBranchInventoryService(numericBranchId, params),
          purchaseReceipts: () =>
            adminBranchService.getAdminBranchPurchaseReceiptsService(numericBranchId, params),
          stockHistory: () =>
            adminBranchService.getAdminBranchStockHistoryService(numericBranchId, params),
        };
        const res = await fetchers[tab]();
        setTabData((current) => ({ ...current, [tab]: (res.data as any).data }));
      } catch (err: any) {
        setTabError((current) => ({
          ...current,
          [tab]: err?.response?.data?.message || "Không thể tải dữ liệu",
        }));
      } finally {
        setTabLoading((current) => ({ ...current, [tab]: false }));
      }
    },
    [numericBranchId],
  );

  useEffect(() => {
    fetchBranch();
  }, [fetchBranch]);

  useEffect(() => {
    fetchTab(activeTab, currentPage);
  }, [activeTab, currentPage, fetchTab]);

  const columns = useMemo<Record<BranchTabKey, Column[]>>(
    () => ({
      courts: [
        { header: "#", className: "w-16 text-center", render: (_item, index) => index + 1 },
        { header: "Tên sân", render: (item) => <b>{display(item.courtName)}</b> },
        { header: "Vị trí", render: (item) => display(item.location) },
        { header: "Trạng thái", render: (item) => renderStatusBadge(item.courtStatus) },
        { header: "Ngày tạo", render: (item) => formatDate(item.createdAt) },
      ],
      employees: [
        { header: "#", className: "w-16 text-center", render: (_item, index) => index + 1 },
        {
          header: "Nhân viên",
          render: (item) => (
            <div>
              <p className="font-semibold text-slate-900">{display(item.fullName || item.username)}</p>
              <p className="text-xs text-slate-500">{display(item.email)}</p>
            </div>
          ),
        },
        { header: "Điện thoại", render: (item) => display(item.phoneNumber) },
        { header: "Trạng thái", render: (item) => renderStatusBadge(item.isActive) },
        { header: "Ngày tạo", render: (item) => formatDate(item.createdAt) },
      ],
      bookings: [
        { header: "#", className: "w-16 text-center", render: (_item, index) => index + 1 },
        { header: "Mã đặt sân", render: (item) => `#${item.id}` },
        { header: "Khách hàng", render: (item) => getPersonName(item.user) },
        { header: "Trạng thái", render: (item) => renderStatusBadge(item.bookingStatus) },
        { header: "Tổng tiền", className: "text-right", render: (item) => formatMoney(item.totalAmount) },
        { header: "Ngày tạo", render: (item) => formatDateTime(item.createdAt) },
      ],
      orders: [
        { header: "#", className: "w-16 text-center", render: (_item, index) => index + 1 },
        { header: "Mã đơn", render: (item) => `#${item.id}` },
        {
          header: "Người nhận",
          render: (item) => (
            <div>
              <p className="font-semibold text-slate-900">{display(item.shippingName)}</p>
              <p className="text-xs text-slate-500">{display(item.shippingPhone)}</p>
            </div>
          ),
        },
        { header: "Đơn hàng", render: (item) => renderStatusBadge(item.orderStatus) },
        { header: "Giao hàng", render: (item) => renderStatusBadge(item.shippingStatus) },
        { header: "Tổng tiền", className: "text-right", render: (item) => formatMoney(item.totalAmount) },
        { header: "Ngày tạo", render: (item) => formatDateTime(item.createdAt) },
      ],
      inventory: [
        { header: "#", className: "w-16 text-center", render: (_item, index) => index + 1 },
        {
          header: "Mặt hàng",
          render: (item) => (
            <div>
              <p className="font-semibold text-slate-900">{getStockItemName(item)}</p>
              <p className="text-xs text-slate-500">
                {item.variant ? getVariantInfo(item.variant) : formatMoney(item.beverage?.price)}
              </p>
            </div>
          ),
        },
        { header: "Loại", render: () => renderStatusBadge(undefined, inventoryKind === "variantStocks" ? "Sản phẩm" : "Đồ uống") },
        { header: "Tồn kho", className: "text-right", render: (item) => display(item.stock) },
      ],
      purchaseReceipts: [
        { header: "#", className: "w-16 text-center", render: (_item, index) => index + 1 },
        { header: "Mã phiếu", render: (item) => <b>{display(item.receiptCode)}</b> },
        { header: "Nhà cung cấp", render: (item) => display(item.supplier?.supplierName) },
        { header: "Người tạo", render: (item) => display(item.creator?.username || item.creator?.email) },
        { header: "Trạng thái", render: (item) => renderStatusBadge(item.status) },
        { header: "Tổng tiền", className: "text-right", render: (item) => formatMoney(item.totalAmount) },
        { header: "Ngày tạo", render: (item) => formatDateTime(item.createdAt) },
      ],
      stockHistory: [
        { header: "#", className: "w-16 text-center", render: (_item, index) => index + 1 },
        {
          header: "Mặt hàng",
          render: (item) => (
            <div>
              <p className="font-semibold text-slate-900">{getStockItemName(item)}</p>
              <p className="mt-1">{renderStatusBadge(undefined, labelStatus(item.itemType))}</p>
            </div>
          ),
        },
        { header: "Nghiệp vụ", render: (item) => renderStatusBadge(item.type) },
        {
          header: "Thay đổi",
          className: "text-right",
          render: (item) => (
            <span className={item.quantity >= 0 ? "font-semibold text-emerald-600" : "font-semibold text-rose-600"}>
              {item.quantity > 0 ? "+" : ""}
              {item.quantity}
            </span>
          ),
        },
        { header: "Tồn sau", className: "text-right", render: (item) => display(item.afterStock) },
        { header: "Ghi chú", render: (item) => display(item.note) },
        { header: "Thời gian", render: (item) => formatDateTime(item.createdAt) },
      ],
    }),
    [inventoryKind],
  );

  const handleToggleActive = async () => {
    if (!branch) return;
    if (branch.isActive) {
      const confirmed = await showConfirmDialog(
        "Khóa chi nhánh?",
        `Chi nhánh "${branch.branchName}" sẽ tạm ngừng hoạt động cho đến khi được mở khóa lại.`,
        "Khóa chi nhánh",
        "Hủy",
        "danger",
      );
      if (!confirmed) return;
    }

    setToggling(true);
    try {
      await adminBranchService.toggleBranchActiveService(branch.id);
      toast.success(branch.isActive ? "Đã khóa chi nhánh" : "Đã mở khóa chi nhánh");
      fetchBranch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể cập nhật trạng thái");
    } finally {
      setToggling(false);
    }
  };

  const setPage = (page: number) => {
    setPages((current) => ({ ...current, [activeTab]: page }));
  };

  if (loading) return <AdminSpinner />;

  if (error || !branch) {
    return (
      <div className="rounded-xl border border-rose-100 bg-rose-50 p-8 text-center text-sm font-medium text-rose-600">
        {error || "Không tìm thấy chi nhánh"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate("/admin/branches")}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-sky-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách
      </button>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{branch.branchName}</h1>
                <p className="mt-1 text-sm text-slate-500">{branch.fullAddress}</p>
              </div>
            </div>
            <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
              <p><span className="font-medium text-slate-500">Điện thoại:</span> {branch.phoneNumber}</p>
              <p><span className="font-medium text-slate-500">Quản lý:</span> {manager?.fullName || manager?.username || manager?.email || "Chưa có"}</p>
              <p><span className="font-medium text-slate-500">Ngày tạo:</span> {formatDate(branch.createdAt)}</p>
              <div>
                <AdminStatusBadge
                  color={branch.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-600 border-red-200"}
                  label={branch.isActive ? "Hoạt động" : "Đã khóa"}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 text-sm font-medium text-sky-700 transition hover:bg-sky-100"
            >
              <Edit2 className="h-4 w-4" />
              Sửa
            </button>
            <button
              type="button"
              onClick={handleToggleActive}
              disabled={toggling}
              className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition disabled:opacity-60 ${
                branch.isActive
                  ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                  : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
              }`}
            >
              {toggling ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
              {branch.isActive ? "Khóa" : "Mở khóa"}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem label="Tên chi nhánh" value={branch.branchName} />
              <DetailItem label="Số điện thoại" value={branch.phoneNumber} />
              <DetailItem label="Địa chỉ" value={branch.address} />
              <DetailItem label="Phường/Xã" value={branch.wardName} />
              <DetailItem label="Quận/Huyện" value={branch.districtName} />
              <DetailItem label="Tỉnh/Thành phố" value={branch.provinceName} />
              <DetailItem label="Mã tỉnh GHN" value={branch.provinceId} />
              <DetailItem label="Mã huyện GHN" value={branch.districtId} />
              <DetailItem label="Mã phường GHN" value={branch.wardCode} />
              <DetailItem label="Shop GHN" value={branch.ghnShopId} />
              <DetailItem label="Vĩ độ" value={branch.latitude} />
              <DetailItem label="Kinh độ" value={branch.longitude} />
              <DetailItem label="Số quản lý" value={managerCount} />
              <DetailItem label="Số sân" value={courtCount} />
              <DetailItem label="Hình ảnh" value={imageCount} />
              <DetailItem label="Cập nhật" value={formatDateTime(branch.updatedAt)} />
            </div>

            {branch.description ? (
              <div>
                <p className="mb-2 text-sm font-medium text-slate-600">
                  Mô tả
                </p>
                <div
                  className="max-h-52 overflow-auto rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm leading-relaxed text-slate-700"
                  dangerouslySetInnerHTML={{ __html: branch.description }}
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-600">
                Quản lý phụ trách
              </p>
              {branch.managers?.length ? (
                <div className="space-y-2">
                  {branch.managers.map((item) => (
                    <div key={item.id} className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-2">
                      <p className="text-sm font-semibold text-sky-900">
                        {item.fullName || item.username}
                      </p>
                      <p className="text-xs text-sky-700">{item.email}</p>
                      <p className="text-xs text-sky-700">{item.phoneNumber || "Chưa có số điện thoại"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-sm font-medium text-slate-400">
                  Chưa có quản lý phụ trách
                </div>
              )}
            </div>

            {branch.images?.length ? (
              <div>
                <p className="mb-2 text-sm font-medium text-slate-600">
                  Hình ảnh chi nhánh
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {branch.images.slice(0, 6).map((image) => (
                    <div key={image.id} className="aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      <img src={image.imageUrl} alt={branch.branchName} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex gap-1 overflow-x-auto border-b border-slate-100 p-2">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition ${
                activeTab === key
                  ? "bg-sky-600 text-white"
                  : "text-slate-600 hover:bg-slate-50 hover:text-sky-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <TabPanel
          tab={activeTab}
          columns={columns[activeTab]}
          data={tabData[activeTab]}
          inventoryKind={inventoryKind}
          setInventoryKind={(kind) => {
            setInventoryKind(kind);
            setPages((current) => ({ ...current, inventory: 1 }));
          }}
          loading={!!tabLoading[activeTab]}
          error={tabError[activeTab]}
          onReload={() => fetchTab(activeTab, currentPage)}
          onPage={setPage}
        />
      </section>

      {showForm ? (
        <BranchFormModal
          branch={branch}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchBranch();
          }}
        />
      ) : null}
    </div>
  );
};

const DetailItem = ({ label, value }: { label: string; value: unknown }) => (
  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p className="mt-1 break-words text-sm font-normal leading-5 text-slate-800">{display(value)}</p>
  </div>
);

const TabPanel = ({
  tab,
  columns,
  data,
  inventoryKind,
  setInventoryKind,
  loading,
  error,
  onReload,
  onPage,
}: {
  tab: BranchTabKey;
  columns: Column[];
  data: any;
  inventoryKind: InventoryKind;
  setInventoryKind: (kind: InventoryKind) => void;
  loading: boolean;
  error?: string;
  onReload: () => void;
  onPage: (page: number) => void;
}) => {
  if (loading) return <AdminSpinner />;
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm font-medium text-rose-600">{error}</p>
        <button type="button" onClick={onReload} className="mt-3 text-sm font-medium text-sky-600">
          Tải lại
        </button>
      </div>
    );
  }

  const rows = getRows(tab, data, inventoryKind);
  const pagination = getPagination(tab, data, inventoryKind);
  const startIndex = (pagination.page - 1) * pagination.limit;

  return (
    <div>
      {tab === "inventory" ? (
        <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-3">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
            {[
              { key: "variantStocks", label: "Sản phẩm", icon: Boxes },
              { key: "beverageStocks", label: "Đồ uống", icon: Coffee },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setInventoryKind(item.key as InventoryKind)}
                  className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition ${
                    inventoryKind === item.key
                      ? "bg-sky-600 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              {columns.map((column) => (
                <th key={column.header} className={`px-4 py-3 text-left font-semibold ${column.className || ""}`}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((item: any, index: number) => (
              <tr key={item.id || `${tab}-${index}`} className="transition hover:bg-sky-50/40">
                {columns.map((column) => (
                  <td key={column.header} className={`px-4 py-3 text-slate-600 ${column.className || ""}`}>
                    {column.header === "#" ? startIndex + index + 1 : column.render(item, index)}
                  </td>
                ))}
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm font-semibold text-slate-400">
                  Không có dữ liệu
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <AdminPagination
        page={pagination.page}
        totalPages={pagination.totalPages || 1}
        total={pagination.total}
        onPage={onPage}
        alwaysShow
      />
    </div>
  );
};

export default BranchDetailPage;
