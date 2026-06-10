import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Boxes,
  CupSoda,
  Edit2,
  PackageCheck,
  Plus,
  Search,
  Trash2,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import adminBeverageService from "../../services/admin/beverageService";
import type { AdminBeverage } from "../../types/admin";
import BeverageFormModal from "../../components/ui/admin/beverages/BeverageFormModal";
import AdminPagination from "../../components/ui/admin/AdminPagination";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";
import { showConfirmDialog } from "../../utils/confirmDialog";

const DEFAULT_THUMB = "https://via.placeholder.com/80x80?text=DU";
const LIMIT = 10;

type StockFilter = "ALL" | "IN_STOCK" | "OUT_OF_STOCK";

const stockFilterOptions: { value: StockFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả tồn kho" },
  { value: "IN_STOCK", label: "Còn hàng" },
  { value: "OUT_OF_STOCK", label: "Hết hàng" },
];

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

const BeverageManagementPage = () => {
  const [beverages, setBeverages] = useState<AdminBeverage[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("ALL");

  const [formBeverage, setFormBeverage] = useState<
    AdminBeverage | null | undefined
  >(undefined);
  const [deleting, setDeleting] = useState(false);

  const fetchBeverages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminBeverageService.getBeveragesService({
        page,
        limit: LIMIT,
        search: appliedSearch || undefined,
      });
      const data = (res.data as any).data;
      setBeverages(data.beverages || []);
      setTotal(data.pagination?.total || 0);
    } catch {
      setBeverages([]);
      setTotal(0);
      toast.error("Không thể tải đồ uống");
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, page]);

  useEffect(() => {
    fetchBeverages();
  }, [fetchBeverages]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const handleDelete = async (beverage: AdminBeverage) => {
    const confirmed = await showConfirmDialog(
      "Xóa đồ uống?",
      `Đồ uống "${beverage.beverageName}" sẽ bị xóa vĩnh viễn.`,
      "Xóa",
      "Hủy",
      "danger",
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await adminBeverageService.deleteBeverageService(beverage.id);
      toast.success("Đã xóa đồ uống");
      fetchBeverages();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.max(Math.ceil(total / LIMIT), 1);
  const totalStock = beverages.reduce(
    (sum, beverage) => sum + Number(beverage.totalStock || 0),
    0,
  );
  const inStockCount = beverages.filter(
    (beverage) => Number(beverage.totalStock || 0) > 0,
  ).length;
  const outOfStockCount = beverages.filter(
    (beverage) => Number(beverage.totalStock || 0) === 0,
  ).length;
  const filteredBeverages = useMemo(
    () =>
      beverages.filter((beverage) => {
        if (stockFilter === "IN_STOCK") {
          return Number(beverage.totalStock || 0) > 0;
        }
        if (stockFilter === "OUT_OF_STOCK") {
          return Number(beverage.totalStock || 0) === 0;
        }
        return true;
      }),
    [beverages, stockFilter],
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8">
        <AdminPageHeader
          title="Quản lý đồ uống"
          subtitle="Theo dõi đồ uống bán tại quầy, giá bán và tồn kho theo chi nhánh."
          action={
            <button
              type="button"
              onClick={() => setFormBeverage(null)}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
            >
              <Plus className="h-4 w-4" />
              Thêm đồ uống
            </button>
          }
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Tổng loại đồ uống"
            value={total}
            icon={CupSoda}
            color="bg-sky-50 border-sky-200 text-sky-700"
          />
          <StatCard
            label="Tổng tồn kho"
            value={totalStock}
            icon={Boxes}
            color="bg-emerald-50 border-emerald-200 text-emerald-700"
          />
          <StatCard
            label="Còn hàng"
            value={inStockCount}
            icon={PackageCheck}
            color="bg-indigo-50 border-indigo-200 text-indigo-700"
          />
          <StatCard
            label="Hết hàng"
            value={outOfStockCount}
            icon={TriangleAlert}
            color="bg-red-50 border-red-200 text-red-700"
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
                placeholder="Tên đồ uống..."
                className="h-11 w-full rounded-xl border border-gray-300 pl-9 pr-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Bộ lọc tồn kho
            </label>
            <select
              value={stockFilter}
              onChange={(event) =>
                setStockFilter(event.target.value as StockFilter)
              }
              className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              {stockFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
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
          ) : filteredBeverages.length === 0 ? (
            <div className="py-14 text-center text-sm text-gray-400">
              Không có đồ uống nào
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                  {[
                    "#",
                    "Đồ uống",
                    "Giá",
                    "Tồn kho (tổng)",
                    "Ngày tạo",
                    "Thao tác",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-center font-semibold"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 [&_td]:align-middle">
                {filteredBeverages.map((beverage, index) => (
                  <tr
                    key={beverage.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-center text-gray-400">
                      {(page - 1) * LIMIT + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={beverage.thumbnailUrl || DEFAULT_THUMB}
                          alt={beverage.beverageName}
                          className="h-10 w-10 shrink-0 rounded-lg border border-gray-200 object-cover"
                          onError={(event) => {
                            (event.target as HTMLImageElement).src =
                              DEFAULT_THUMB;
                          }}
                        />
                        <span className="font-semibold text-gray-800">
                          {beverage.beverageName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-sky-700">
                      {fmtCurrency(beverage.price)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {beverage.totalStock === 0 ? (
                        <span className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                          Hết hàng
                        </span>
                      ) : beverage.totalStock < 10 ? (
                        <span className="rounded border border-yellow-200 bg-yellow-50 px-2 py-0.5 text-xs font-semibold text-yellow-700">
                          {beverage.totalStock}
                        </span>
                      ) : (
                        <span className="rounded border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                          {beverage.totalStock}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">
                      {new Date(beverage.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFormBeverage(beverage)}
                          className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-600 transition hover:bg-sky-100"
                        >
                          <Edit2 size={12} />
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(beverage)}
                          disabled={deleting}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-100"
                        >
                          <Trash2 size={12} />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <AdminPagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPage={setPage}
          />
        </div>
      </div>

      {formBeverage !== undefined && (
        <BeverageFormModal
          beverage={formBeverage}
          onClose={() => setFormBeverage(undefined)}
          onSaved={() => {
            setFormBeverage(undefined);
            fetchBeverages();
          }}
        />
      )}
    </div>
  );
};

export default BeverageManagementPage;
