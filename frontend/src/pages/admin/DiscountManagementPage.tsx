import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  Edit2,
  Loader2,
  Percent,
  Plus,
  Search,
  Tags,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import adminDiscountService, {
  type DiscountRecipient,
} from "../../services/admin/discountService";
import type { AdminDiscount } from "../../types/admin";
import DiscountFormModal from "../../components/ui/admin/discounts/DiscountFormModal";
import {
  DISCOUNT_PREFILL_STORAGE_KEY,
  type DiscountSegmentDraft,
} from "../../constants/marketingSegment";
import AdminPagination from "../../components/ui/admin/AdminPagination";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";
import { showConfirmDialog } from "../../utils/confirmDialog";

const DISCOUNT_TYPE_LABEL: Record<string, string> = {
  AMOUNT: "Số tiền",
  PERCENT: "Phần trăm",
};
const APPLY_TYPE_LABEL: Record<string, string> = {
  ALL: "Tất cả",
  ORDER: "Đơn hàng",
  BOOKING: "Đặt sân",
};
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

const DiscountManagementPage = () => {
  const [discounts, setDiscounts] = useState<AdminDiscount[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState("");
  const [formDiscount, setFormDiscount] = useState<
    AdminDiscount | null | undefined
  >(undefined);
  const [formDraft, setFormDraft] = useState<DiscountSegmentDraft | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [recipientsFor, setRecipientsFor] = useState<AdminDiscount | null>(null);
  const [recipients, setRecipients] = useState<DiscountRecipient[]>([]);
  const [recipientsLoading, setRecipientsLoading] = useState(false);

  const fetchDiscounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminDiscountService.getDiscountsService({
        page,
        limit: LIMIT,
        search: appliedSearch || undefined,
        type: typeFilter || undefined,
        isActive: isActiveFilter || undefined,
      });
      const data = (res.data as any).data;
      setDiscounts(data.discounts || []);
      setTotal(data.pagination?.total || 0);
    } catch {
      setDiscounts([]);
      setTotal(0);
      toast.error("Không thể tải mã khuyến mãi");
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, isActiveFilter, page, typeFilter]);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  useEffect(() => {
    if (searchParams.get("create") !== "segment") return;
    const raw = sessionStorage.getItem(DISCOUNT_PREFILL_STORAGE_KEY);
    if (!raw) return;
    try {
      const draft = JSON.parse(raw) as DiscountSegmentDraft;
      sessionStorage.removeItem(DISCOUNT_PREFILL_STORAGE_KEY);
      setFormDraft(draft);
      setFormDiscount(null);
      toast.info(
        draft.segmentLabel
          ? `Điền sẵn mã cho nhóm: ${draft.segmentLabel}`
          : "Điền sẵn mã theo chính sách AI Insights",
      );
    } catch {
      sessionStorage.removeItem(DISCOUNT_PREFILL_STORAGE_KEY);
    }
    searchParams.delete("create");
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const handleToggle = async (discount: AdminDiscount) => {
    if (discount.isActive) {
      const confirmed = await showConfirmDialog(
        "Tắt mã giảm giá?",
        `Mã "${discount.code}" sẽ không còn được áp dụng cho đơn hàng hoặc đặt sân.`,
        "Tắt mã",
        "Hủy",
        "danger",
      );
      if (!confirmed) return;
    }

    setTogglingId(discount.id);
    try {
      await adminDiscountService.toggleDiscountService(discount.id);
      toast.success(discount.isActive ? "Đã tắt mã" : "Đã bật mã");
      fetchDiscounts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (discountId: number) => {
    const discount = discounts.find((item) => item.id === discountId);
    const confirmed = await showConfirmDialog(
      "Xóa mã giảm giá?",
      discount
        ? `Mã "${discount.code}" sẽ bị xóa vĩnh viễn.`
        : "Mã giảm giá này sẽ bị xóa vĩnh viễn.",
      "Xóa",
      "Hủy",
      "danger",
    );
    if (!confirmed) return;

    setDeletingId(discountId);
    try {
      await adminDiscountService.deleteDiscountService(discountId);
      toast.success("Đã xóa mã giảm giá");
      fetchDiscounts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setDeletingId(null);
    }
  };

  const openRecipients = async (discount: AdminDiscount) => {
    setRecipientsFor(discount);
    setRecipients([]);
    setRecipientsLoading(true);
    try {
      const res = await adminDiscountService.getDiscountRecipientsService(
        discount.id,
      );
      setRecipients(res.data.data.recipients || []);
    } catch {
      toast.error("Không tải được danh sách khách nhận mã");
    } finally {
      setRecipientsLoading(false);
    }
  };

  const recipientsUsed = recipients.filter((r) => r.isUsed).length;

  const totalPages = Math.max(Math.ceil(total / LIMIT), 1);
  const activeCount = discounts.filter((discount) => discount.isActive).length;
  const inactiveCount = discounts.filter(
    (discount) => !discount.isActive,
  ).length;
  const percentCount = discounts.filter(
    (discount) => discount.type === "PERCENT",
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8">
        <AdminPageHeader
          title="Quản lý khuyến mãi"
          subtitle="Kiểm soát mã giảm giá, phạm vi áp dụng và trạng thái hoạt động."
          action={
            <button
              type="button"
              onClick={() => setFormDiscount(null)}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
            >
              <Plus className="h-4 w-4" />
              Tạo mã mới
            </button>
          }
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Tổng mã"
            value={total}
            icon={Tags}
            color="bg-sky-50 border-sky-200 text-sky-700"
          />
          <StatCard
            label="Đang hoạt động"
            value={activeCount}
            icon={CheckCircle2}
            color="bg-emerald-50 border-emerald-200 text-emerald-700"
          />
          <StatCard
            label="Đã tắt"
            value={inactiveCount}
            icon={XCircle}
            color="bg-slate-50 border-slate-200 text-slate-700"
          />
          <StatCard
            label="Mã phần trăm"
            value={percentCount}
            icon={Percent}
            color="bg-violet-50 border-violet-200 text-violet-700"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Tìm mã
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value.toUpperCase())
                }
                placeholder="Nhập mã..."
                className="h-10 w-full rounded-lg border border-gray-300 pl-8 pr-2.5 text-[13px] outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Loại
            </label>
            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-lg border border-gray-300 bg-white px-2.5 text-[13px] text-slate-700 outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
            >
              <option value="">Tất cả loại</option>
              {Object.entries(DISCOUNT_TYPE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Trạng thái
            </label>
            <select
              value={isActiveFilter}
              onChange={(event) => {
                setIsActiveFilter(event.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-lg border border-gray-300 bg-white px-2.5 text-[13px] text-slate-700 outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đang bật</option>
              <option value="false">Đã tắt</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200">
          {loading ? (
            <div className="flex justify-center py-14">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
            </div>
          ) : discounts.length === 0 ? (
            <div className="py-14 text-center text-sm text-gray-400">
              Không có mã khuyến mãi
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    {[
                      "#",
                      "Mã",
                      "Loại",
                      "Giá trị",
                      "Áp dụng",
                      "Đã dùng",
                      "Hiệu lực",
                      "Trạng thái",
                      "Thao tác",
                    ].map((header) => (
                      <th
                        key={header}
                        className="whitespace-nowrap px-3 py-3 text-center font-semibold"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 [&_td]:align-top">
                  {discounts.map((discount, index) => (
                    <tr
                      key={discount.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="px-3 py-3 text-center text-gray-400">
                        {(page - 1) * LIMIT + index + 1}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="rounded-lg border border-sky-200 bg-sky-50 px-2 py-1 font-mono text-xs font-bold text-sky-700">
                          {discount.code}
                        </span>
                        <div className="mt-1 flex flex-wrap justify-center gap-1">
                          {discount.visibility === "PRIVATE" ? (
                            <button
                              type="button"
                              onClick={() => openRecipients(discount)}
                              title="Xem khách đã nhận mã & ai đã dùng"
                              className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600 transition hover:bg-rose-100"
                            >
                              <Users className="h-3 w-3" />
                              Mã riêng
                            </button>
                          ) : null}
                          {discount.branch?.name ? (
                            <span className="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                              {discount.branch.name}
                            </span>
                          ) : null}
                          {discount.startHour != null &&
                          discount.endHour != null ? (
                            <span className="rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
                              {discount.startHour}h-{discount.endHour}h
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`rounded border px-2 py-0.5 text-xs font-medium ${
                            discount.type === "PERCENT"
                              ? "border-violet-200 bg-violet-50 text-violet-700"
                              : "border-orange-200 bg-orange-50 text-orange-700"
                          }`}
                        >
                          {DISCOUNT_TYPE_LABEL[discount.type]}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-semibold text-gray-800">
                        {discount.type === "PERCENT"
                          ? `${discount.value}%`
                          : fmtCurrency(discount.value)}
                        {discount.maxDiscount ? (
                          <span className="block text-xs text-gray-400">
                            tối đa {fmtCurrency(discount.maxDiscount)}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {APPLY_TYPE_LABEL[discount.applyType]}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-gray-600">
                        {discount.usageCount}{" "}
                        {discount.usageLimit
                          ? `/ ${discount.usageLimit}`
                          : "/ ∞"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-center text-xs text-gray-500">
                        {new Date(discount.startDate).toLocaleDateString(
                          "vi-VN",
                        )}{" "}
                        -{" "}
                        {new Date(discount.endDate).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {discount.isActive ? (
                          <span className="rounded border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                            Hoạt động
                          </span>
                        ) : (
                          <span className="rounded border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                            Đã tắt
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggle(discount)}
                            disabled={togglingId === discount.id}
                            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
                              discount.isActive
                                ? "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                                : "border-green-200 bg-green-50 text-green-600 hover:bg-green-100"
                            }`}
                          >
                            {togglingId === discount.id ? (
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : discount.isActive ? (
                              <>
                                <ToggleRight size={12} />
                                Tắt
                              </>
                            ) : (
                              <>
                                <ToggleLeft size={12} />
                                Bật
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormDiscount(discount)}
                            className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2 py-1.5 text-xs font-medium text-sky-600 transition hover:bg-sky-100"
                          >
                            <Edit2 size={11} />
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(discount.id)}
                            disabled={deletingId === discount.id}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-100 disabled:opacity-60"
                          >
                            {deletingId === discount.id ? (
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <>
                                <Trash2 size={11} />
                                Xóa
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <AdminPagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPage={setPage}
            unit="mã khuyến mãi"
            alwaysShow
          />
        </div>
      </div>

      {recipientsFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <Users className="h-5 w-5 text-rose-500" />
                  Khách nhận mã{" "}
                  <span className="font-mono text-rose-600">
                    {recipientsFor.code}
                  </span>
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Mã riêng · mỗi khách 1 lượt ·{" "}
                  {recipientsLoading
                    ? "đang tải..."
                    : `${recipientsUsed}/${recipients.length} đã dùng`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRecipientsFor(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {recipientsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
                </div>
              ) : recipients.length === 0 ? (
                <p className="py-12 text-center text-sm text-slate-400">
                  Mã này chưa gán cho khách nào.
                </p>
              ) : (
                <div className="space-y-2">
                  {recipients.map((r) => (
                    <div
                      key={r.userId}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {r.fullName || `User #${r.userId}`}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {r.email}
                        </p>
                      </div>
                      {r.isUsed ? (
                        <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                          Đã dùng
                          {r.usedAt
                            ? ` · ${new Date(r.usedAt).toLocaleDateString("vi-VN")}`
                            : ""}
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                          Chưa dùng
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {formDiscount !== undefined && (
        <DiscountFormModal
          discount={formDiscount}
          draft={formDraft}
          onClose={() => {
            setFormDiscount(undefined);
            setFormDraft(null);
          }}
          onSaved={() => {
            setFormDiscount(undefined);
            setFormDraft(null);
            fetchDiscounts();
          }}
        />
      )}
    </div>
  );
};

export default DiscountManagementPage;
