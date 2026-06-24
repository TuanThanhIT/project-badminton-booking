import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Edit2,
  Filter,
  FolderTree,
  Layers,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import adminCategoryService from "../../services/admin/categoryService";
import type { AdminCategory } from "../../types/admin";
import CategoryFormModal from "../../components/ui/admin/categories/CategoryFormModal";
import AdminPagination from "../../components/ui/admin/AdminPagination";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";
import { showConfirmDialog } from "../../utils/confirmDialog";

const LIMIT = 10;

type CategoryStats = {
  totalCategories: number;
  totalGroups: number;
  currentPageCount: number;
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: typeof Tag;
  color: string;
}) => (
  <div className={`rounded-xl border p-4 ${color}`}>
    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold opacity-75">{label}</p>
        <p className="mt-2 text-3xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [menuGroups, setMenuGroups] = useState<string[]>([]);
  const [stats, setStats] = useState<CategoryStats>({
    totalCategories: 0,
    totalGroups: 0,
    currentPageCount: 0,
  });

  const [formCat, setFormCat] = useState<AdminCategory | null | undefined>(
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

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCategoryService.getCategoriesService({
        page,
        limit: LIMIT,
        search: appliedSearch || undefined,
        menuGroup: groupFilter || undefined,
      });
      const data = (res.data as any).data;
      setCategories(data.categories || []);
      setTotal(data.pagination?.total || 0);
      setMenuGroups(data.menuGroups || []);
      setStats({
        totalCategories:
          data.stats?.totalCategories || data.pagination?.total || 0,
        totalGroups: data.stats?.totalGroups || 0,
        currentPageCount:
          data.stats?.currentPageCount || data.categories?.length || 0,
      });
    } catch {
      setCategories([]);
      setTotal(0);
      setStats({ totalCategories: 0, totalGroups: 0, currentPageCount: 0 });
      toast.error("Không thể tải danh mục");
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, groupFilter, page]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (category: AdminCategory) => {
    const confirmed = await showConfirmDialog(
      "Xóa danh mục?",
      `Danh mục "${category.cateName}" sẽ bị xóa vĩnh viễn. Các sản phẩm thuộc danh mục này sẽ không còn được phân loại.`,
      "Xóa",
      "Hủy",
      "danger",
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await adminCategoryService.deleteCategoryService(category.id);
      toast.success("Đã xóa danh mục");
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  const statCards = useMemo(
    () => [
      {
        label: "Tổng danh mục",
        value: stats.totalCategories,
        icon: Tag,
        color: "bg-sky-50 border-sky-200 text-sky-700",
      },
      {
        label: "Nhóm danh mục",
        value: stats.totalGroups,
        icon: FolderTree,
        color: "bg-indigo-50 border-indigo-200 text-indigo-700",
      },
      {
        label: "Trang hiện tại",
        value: categories.length,
        icon: Layers,
        color: "bg-emerald-50 border-emerald-200 text-emerald-700",
      },
    ],
    [categories.length, stats],
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8">
        <AdminPageHeader
          title="Quản lý danh mục"
          subtitle="Tổ chức nhóm sản phẩm, đồ uống và nội dung hiển thị trong cửa hàng."
          action={
            <button
              type="button"
              onClick={() => setFormCat(null)}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
            >
              <Plus className="h-4 w-4" />
              Thêm danh mục
            </button>
          }
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_280px]">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Tên danh mục..."
                className="h-10 w-full rounded-lg border border-gray-300 pl-8 pr-2.5 text-[13px] outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Nhóm danh mục
            </label>
            <div className="relative">
              <Filter className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <select
                value={groupFilter}
                onChange={(event) => {
                  setGroupFilter(event.target.value);
                  setPage(1);
                }}
                className="h-10 w-full appearance-none rounded-lg border border-gray-300 bg-white pl-8 pr-2.5 text-[13px] outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
              >
                <option value="">Tất cả nhóm</option>
                {menuGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200">
          {loading ? (
            <div className="flex justify-center py-14">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
            </div>
          ) : categories.length === 0 ? (
            <div className="py-14 text-center text-sm text-gray-400">
              Không có danh mục nào
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3 text-center font-semibold">#</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Tên danh mục
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Nhóm danh mục
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Ngày tạo
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 [&_td]:align-middle">
                {categories.map((category, index) => (
                  <tr
                    key={category.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-center text-gray-400">
                      {(page - 1) * LIMIT + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-start gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-100">
                          <Tag className="h-4 w-4 text-sky-600" />
                        </div>
                        <span className="font-semibold text-gray-800">
                          {category.cateName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                        {category.menuGroup}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">
                      {category.createdAt
                        ? new Date(category.createdAt).toLocaleDateString(
                            "vi-VN",
                          )
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFormCat(category)}
                          className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-600 transition hover:bg-sky-100"
                        >
                          <Edit2 size={12} />
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category)}
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

      {formCat !== undefined && (
        <CategoryFormModal
          category={formCat}
          menuGroups={menuGroups}
          onClose={() => setFormCat(undefined)}
          onSaved={() => {
            setFormCat(undefined);
            fetchCategories();
          }}
        />
      )}
    </div>
  );
};

export default CategoryManagementPage;
