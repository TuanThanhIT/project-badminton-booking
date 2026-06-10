import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Ban,
  Building2,
  CheckCircle2,
  Edit2,
  Plus,
  Search,
  Trash2,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import adminInventoryService from "../../services/admin/inventoryService";
import type { Supplier, SupplierStatus } from "../../types/inventory";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";
import AdminPagination from "../../components/ui/admin/AdminPagination";
import AdminModal, {
  AdminField,
  adminInputClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "../../components/ui/admin/AdminModal";
import { showConfirmDialog } from "../../utils/confirmDialog";

const LIMIT = 10;

const emptyForm = {
  supplierName: "",
  phoneNumber: "",
  email: "",
  address: "",
  status: "ACTIVE" as SupplierStatus,
};

type SupplierStatusFilter = "ALL" | SupplierStatus;

const statusOptions: { value: SupplierStatusFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "INACTIVE", label: "Ngừng hoạt động" },
];

const statusMeta: Record<SupplierStatus, { label: string; className: string }> =
  {
    ACTIVE: {
      label: "Đang hoạt động",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    INACTIVE: {
      label: "Ngừng hoạt động",
      className: "border-slate-200 bg-slate-100 text-slate-600",
    },
  };

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
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

const SupplierManagementPage = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SupplierStatusFilter>("ALL");
  const [formSupplier, setFormSupplier] = useState<Supplier | null | undefined>(
    undefined,
  );
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminInventoryService.supplierService.list({
        page,
        limit: LIMIT,
        search: appliedSearch || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      });
      setSuppliers(res.data.data.suppliers || []);
      setTotal(res.data.data.pagination?.total || 0);
    } catch {
      setSuppliers([]);
      setTotal(0);
      toast.error("Không thể tải nhà cung cấp");
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, page, statusFilter]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const handleSave = async (form: typeof emptyForm) => {
    if (!form.supplierName.trim()) {
      toast.error("Nhập tên nhà cung cấp");
      return;
    }

    setSaving(true);
    try {
      if (formSupplier) {
        await adminInventoryService.supplierService.update(
          formSupplier.id,
          form,
        );
        toast.success("Đã cập nhật nhà cung cấp");
      } else {
        await adminInventoryService.supplierService.create(form);
        toast.success("Đã tạo nhà cung cấp");
      }
      setFormSupplier(undefined);
      fetchSuppliers();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Lưu nhà cung cấp thất bại",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (supplier: Supplier) => {
    const confirmed = await showConfirmDialog(
      "Xóa nhà cung cấp?",
      `Nhà cung cấp "${supplier.supplierName}" sẽ bị xóa vĩnh viễn.`,
      "Xóa",
      "Hủy",
      "danger",
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await adminInventoryService.supplierService.remove(supplier.id);
      toast.success("Đã xóa nhà cung cấp");
      fetchSuppliers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Xóa thất bại");
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.max(Math.ceil(total / LIMIT), 1);
  const activeCount = suppliers.filter(
    (supplier) => supplier.status !== "INACTIVE",
  ).length;
  const inactiveCount = suppliers.filter(
    (supplier) => supplier.status === "INACTIVE",
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8">
        <AdminPageHeader
          title="Quản lý nhà cung cấp"
          subtitle="Quản lý nhà cung cấp dùng cho phiếu nhập sản phẩm và đồ uống."
          action={
            <button
              type="button"
              onClick={() => setFormSupplier(null)}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
            >
              <Plus className="h-4 w-4" />
              Thêm nhà cung cấp
            </button>
          }
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            label="Tổng nhà cung cấp"
            value={total}
            icon={Truck}
            color="bg-sky-50 border-sky-200 text-sky-700"
          />
          <StatCard
            label="Đang hoạt động"
            value={activeCount}
            icon={CheckCircle2}
            color="bg-emerald-50 border-emerald-200 text-emerald-700"
          />
          <StatCard
            label="Ngừng hoạt động"
            value={inactiveCount}
            icon={Ban}
            color="bg-slate-50 border-slate-200 text-slate-700"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="h-11 w-full rounded-xl border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                placeholder="Tên, số điện thoại, email nhà cung cấp..."
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as SupplierStatusFilter);
                setPage(1);
              }}
              className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200">
          {loading ? (
            <div className="flex justify-center py-14">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 text-center font-semibold">#</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Nhà cung cấp
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Liên hệ</th>
                  <th className="px-4 py-3 text-left font-semibold">Địa chỉ</th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((supplier, index) => {
                  const meta =
                    statusMeta[supplier.status || "ACTIVE"] ||
                    statusMeta.ACTIVE;

                  return (
                    <tr
                      key={supplier.id}
                      className="transition hover:bg-sky-50/40"
                    >
                      <td className="px-4 py-3 text-center text-slate-400">
                        {(page - 1) * LIMIT + index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-100 bg-sky-50 text-sky-600">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <span className="font-semibold text-slate-800">
                            {supplier.supplierName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {supplier.phoneNumber || "-"}
                        <br />
                        {supplier.email || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {supplier.address || "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`rounded border px-2 py-0.5 text-xs font-semibold ${meta.className}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setFormSupplier(supplier)}
                            className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-600 transition hover:bg-sky-100"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(supplier)}
                            disabled={deleting}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!suppliers.length ? (
                  <EmptyTableRow colSpan={6} label="Không có nhà cung cấp" />
                ) : null}
              </tbody>
            </table>
          )}
          <AdminPagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPage={setPage}
            unit="nhà cung cấp"
            alwaysShow
          />
        </div>
      </div>

      {formSupplier !== undefined ? (
        <SupplierFormModal
          supplier={formSupplier}
          saving={saving}
          onClose={() => setFormSupplier(undefined)}
          onSave={handleSave}
        />
      ) : null}
    </div>
  );
};

const SupplierFormModal = ({
  supplier,
  saving,
  onClose,
  onSave,
}: {
  supplier: Supplier | null;
  saving: boolean;
  onClose: () => void;
  onSave: (form: typeof emptyForm) => void;
}) => {
  const [form, setForm] = useState({
    supplierName: supplier?.supplierName || "",
    phoneNumber: supplier?.phoneNumber || "",
    email: supplier?.email || "",
    address: supplier?.address || "",
    status: supplier?.status || ("ACTIVE" as SupplierStatus),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSave(form);
  };

  return (
    <AdminModal
      title={supplier ? "Chỉnh sửa nhà cung cấp" : "Thêm nhà cung cấp"}
      description={
        supplier
          ? "Cập nhật thông tin liên hệ và trạng thái nhà cung cấp."
          : "Nhập thông tin nhà cung cấp dùng cho phiếu nhập hàng."
      }
      icon={<Truck className="h-5 w-5 text-sky-600" />}
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <AdminField label="Tên nhà cung cấp">
          <input
            value={form.supplierName}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                supplierName: event.target.value,
              }))
            }
            className={`w-full ${adminInputClass}`}
            placeholder="Nhập tên nhà cung cấp"
          />
        </AdminField>

        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="Số điện thoại">
            <input
              value={form.phoneNumber}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  phoneNumber: event.target.value,
                }))
              }
              className={`w-full ${adminInputClass}`}
              placeholder="Nhập số điện thoại"
            />
          </AdminField>

          <AdminField label="Email">
            <input
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              className={`w-full ${adminInputClass}`}
              placeholder="Nhập email"
            />
          </AdminField>
        </div>

        <AdminField label="Địa chỉ">
          <input
            value={form.address}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                address: event.target.value,
              }))
            }
            className={`w-full ${adminInputClass}`}
            placeholder="Nhập địa chỉ"
          />
        </AdminField>

        <AdminField label="Trạng thái">
          <select
            value={form.status}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                status: event.target.value as SupplierStatus,
              }))
            }
            className={`w-full ${adminInputClass}`}
          >
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Ngừng hoạt động</option>
          </select>
        </AdminField>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className={adminSecondaryButtonClass}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className={adminPrimaryButtonClass}
          >
            {saving ? "Đang lưu..." : supplier ? "Cập nhật" : "Thêm mới"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
};

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
      className="px-4 py-10 text-center text-sm font-semibold text-gray-400"
    >
      {label}
    </td>
  </tr>
);

export default SupplierManagementPage;
