import { useEffect, useState } from "react";
import { Edit2, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import adminInventoryService from "../../services/admin/inventoryService";
import type { Supplier, SupplierStatus } from "../../types/inventory";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";
import TablePagination from "../../components/ui/TablePagination";

const LIMIT = 10;

const emptyForm = {
  supplierName: "",
  phoneNumber: "",
  email: "",
  address: "",
  status: "ACTIVE" as SupplierStatus,
};

const SupplierManagementPage = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await adminInventoryService.supplierService.list({
        page,
        limit: LIMIT,
        search: search || undefined,
      });
      setSuppliers(res.data.data.suppliers || []);
      setTotal(res.data.data.pagination?.total || 0);
    } catch {
      setSuppliers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [page]);

  const totalPages = Math.ceil(total / LIMIT);

  const openEdit = (supplier: Supplier) => {
    setEditing(supplier);
    setForm({
      supplierName: supplier.supplierName || "",
      phoneNumber: supplier.phoneNumber || "",
      email: supplier.email || "",
      address: supplier.address || "",
      status: supplier.status || "ACTIVE",
    });
  };

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.supplierName.trim()) {
      toast.error("Nhập tên nhà cung cấp");
      return;
    }

    setLoading(true);
    try {
      if (editing) {
        await adminInventoryService.supplierService.update(editing.id, form);
        toast.success("Đã cập nhật nhà cung cấp");
      } else {
        await adminInventoryService.supplierService.create(form);
        toast.success("Đã tạo nhà cung cấp");
      }
      resetForm();
      fetchSuppliers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lưu nhà cung cấp thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (supplier: Supplier) => {
    if (!window.confirm(`Xóa nhà cung cấp ${supplier.supplierName}?`)) return;
    setLoading(true);
    try {
      await adminInventoryService.supplierService.remove(supplier.id);
      toast.success("Đã xóa nhà cung cấp");
      fetchSuppliers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Xóa thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8">
        <AdminPageHeader
          title="Quản lý Nhà cung cấp"
          subtitle="Quản lý nhà cung cấp dùng cho phiếu nhập sản phẩm và đồ uống."
        />

        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="hidden">
            <h1 className="text-2xl font-bold text-sky-700">
              Quản lý nhà cung cấp
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Nhà cung cấp dùng cho phiếu nhập sản phẩm và đồ uống.
            </p>
          </div>
          <div className="flex gap-2">
            <label className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="outline-none"
                placeholder="Tìm nhà cung cấp"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setPage(1);
                if (page === 1) fetchSuppliers();
              }}
              className="h-10 rounded-lg bg-sky-600 px-4 text-sm font-bold text-white"
            >
              Tìm
            </button>
          </div>
        </div>

        <section className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-5">
          <input
            value={form.supplierName}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                supplierName: event.target.value,
              }))
            }
            className="h-10 rounded-lg border border-gray-200 px-3 text-sm"
            placeholder="Tên nhà cung cấp"
          />
          <input
            value={form.phoneNumber}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                phoneNumber: event.target.value,
              }))
            }
            className="h-10 rounded-lg border border-gray-200 px-3 text-sm"
            placeholder="Số điện thoại"
          />
          <input
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            className="h-10 rounded-lg border border-gray-200 px-3 text-sm"
            placeholder="Email"
          />
          <input
            value={form.address}
            onChange={(event) =>
              setForm((current) => ({ ...current, address: event.target.value }))
            }
            className="h-10 rounded-lg border border-gray-200 px-3 text-sm"
            placeholder="Địa chỉ"
          />
          <button
            type="button"
            disabled={loading}
            onClick={handleSave}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-sky-600 px-3 text-sm font-bold text-white disabled:bg-gray-300"
          >
            {editing ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editing ? "Cập nhật" : "Thêm"}
          </button>
        </section>

        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Nhà cung cấp</th>
                <th className="px-4 py-3 text-left">Liên hệ</th>
                <th className="px-4 py-3 text-left">Địa chỉ</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td className="px-4 py-3 font-bold text-gray-800">
                    {supplier.supplierName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {supplier.phoneNumber || "-"}
                    <br />
                    {supplier.email || "-"}
                  </td>
                  <td className="px-4 py-3">{supplier.address || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      {supplier.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(supplier)}
                        className="rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(supplier)}
                        className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600"
                      >
                        <Trash2 className="inline h-3.5 w-3.5" /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!suppliers.length ? (
                <EmptyTableRow colSpan={5} label="Không có nhà cung cấp" />
              ) : null}
            </tbody>
          </table>
          <TablePagination page={page} totalPages={totalPages} total={total} onPage={setPage} unit="nhà cung cấp" />
        </div>
      </div>
    </div>
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
