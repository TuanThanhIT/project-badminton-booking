import { useEffect, useState } from "react";
import { TicketPercent } from "lucide-react";
import { toast } from "react-toastify";
import adminDiscountService from "../../../../services/admin/discountService";
import adminBranchService from "../../../../services/admin/branchService";
import type { AdminDiscount } from "../../../../types/admin";
import AdminModal, {
  AdminField,
  adminInputClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "../AdminModal";
import { AdminDiscountFormSchema } from "../../../../schemas/AdminFormSchemas";
import type { DiscountSegmentDraft } from "../../../../constants/marketingSegment";

const DISCOUNT_TYPE_LABEL: Record<string, string> = {
  AMOUNT: "Số tiền",
  PERCENT: "Phần trăm",
};

const APPLY_TYPE_LABEL: Record<string, string> = {
  ALL: "Tất cả",
  ORDER: "Đơn hàng",
  BOOKING: "Đặt sân",
};

const START_HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => hour);
const END_HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => index + 1);
const formatHourLabel = (hour: number) =>
  `${String(hour).padStart(2, "0")}:00`;
const normalizeDateInput = (value?: string | null) => value?.slice(0, 10) || "";

type DiscountFormModalProps = {
  discount: AdminDiscount | null;
  draft?: DiscountSegmentDraft | null;
  onClose: () => void;
  onSaved: () => void;
};

type DiscountFormState = {
  code: string;
  type: string;
  applyType: string;
  value: number;
  maxDiscount: number | "";
  minAmount: number;
  usageLimit: number | "";
  startDate: string;
  endDate: string;
};

type DiscountScopeState = {
  branchId: number | "";
  startHour: number | "";
  endHour: number | "";
};

const DiscountFormModal = ({
  discount,
  draft,
  onClose,
  onSaved,
}: DiscountFormModalProps) => {
  const isEdit = !!discount;
  const [form, setForm] = useState<DiscountFormState>({
    code: discount?.code || draft?.code || "",
    type: discount?.type || draft?.type || "AMOUNT",
    applyType: discount?.applyType || draft?.applyType || "ALL",
    value: Number(discount?.value ?? draft?.value ?? 0),
    maxDiscount: (discount?.maxDiscount ?? draft?.maxDiscount ?? "") as
      | number
      | "",
    minAmount: Number(discount?.minAmount ?? draft?.minAmount ?? 0),
    usageLimit: (discount?.usageLimit ?? draft?.usageLimit ?? "") as
      | number
      | "",
    startDate: normalizeDateInput(discount?.startDate || draft?.startDate),
    endDate: normalizeDateInput(discount?.endDate || draft?.endDate),
  });
  const [scope, setScope] = useState<DiscountScopeState>({
    branchId: (discount?.branchId ?? draft?.branchId ?? "") as number | "",
    startHour: (discount?.startHour ?? draft?.startHour ?? "") as number | "",
    endHour: (discount?.endHour ?? draft?.endHour ?? "") as number | "",
  });
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const scopeApplies = form.applyType !== "ORDER";
  const availableEndHours =
    scope.startHour === ""
      ? END_HOUR_OPTIONS
      : END_HOUR_OPTIONS.filter((hour) => hour > Number(scope.startHour));
  const hasTimeScope = scope.startHour !== "" && scope.endHour !== "";

  useEffect(() => {
    let active = true;
    adminBranchService
      .getAdminBranchOptionsService()
      .then((res) => {
        const data = (res.data as { data?: unknown })?.data;
        const list = Array.isArray(data)
          ? (data as { id: number; name?: string; branchName?: string }[])
          : [];
        if (!active) return;

        setBranches(
          list.map((branch) => ({
            id: branch.id,
            name: branch.name || branch.branchName || `Chi nhánh #${branch.id}`,
          })),
        );
      })
      .catch(() => {
        if (active) setBranches([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleApplyTypeChange = (value: string) => {
    setForm({ ...form, applyType: value });
    setErrors({ ...errors, applyType: "", endHour: "" });
  };

  const handleStartHourChange = (value: string) => {
    const nextStartHour = value === "" ? "" : Number(value);
    setScope((prev) => ({
      ...prev,
      startHour: nextStartHour,
      endHour:
        nextStartHour !== "" &&
        prev.endHour !== "" &&
        Number(prev.endHour) <= nextStartHour
          ? ""
          : prev.endHour,
    }));
    setErrors({ ...errors, endHour: "" });
  };

  const handleEndHourChange = (value: string) => {
    setScope({
      ...scope,
      endHour: value === "" ? "" : Number(value),
    });
    setErrors({ ...errors, endHour: "" });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const parsed = AdminDiscountFormSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(
        Object.fromEntries(
          parsed.error.issues.map((issue) => [
            String(issue.path[0]),
            issue.message,
          ]),
        ),
      );
      return;
    }

    const startHour = scope.startHour === "" ? null : Number(scope.startHour);
    const endHour = scope.endHour === "" ? null : Number(scope.endHour);

    if (
      scopeApplies &&
      startHour != null &&
      endHour != null &&
      endHour <= startHour
    ) {
      setErrors({ endHour: "Giờ kết thúc phải lớn hơn giờ bắt đầu" });
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      const payload = {
        ...parsed.data,
        maxDiscount:
          parsed.data.maxDiscount !== ""
            ? Number(parsed.data.maxDiscount)
            : undefined,
        usageLimit:
          parsed.data.usageLimit !== ""
            ? Number(parsed.data.usageLimit)
            : undefined,
        branchId:
          scopeApplies && scope.branchId !== "" ? Number(scope.branchId) : null,
        startHour: scopeApplies ? startHour : null,
        endHour: scopeApplies ? endHour : null,
      };

      if (isEdit) {
        await adminDiscountService.updateDiscountService(discount.id, payload);
        toast.success("Đã cập nhật mã giảm giá");
      } else {
        await adminDiscountService.createDiscountService(payload);
        toast.success("Đã tạo mã giảm giá");
      }

      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminModal
      title={isEdit ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá"}
      description="Thiết lập mã ưu đãi cho đơn hàng và đặt sân."
      icon={<TicketPercent className="h-5 w-5 text-sky-600" />}
      onClose={onClose}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="Mã giảm giá" error={errors.code}>
            <input
              value={form.code}
              onChange={(event) => {
                setForm({ ...form, code: event.target.value.toUpperCase() });
                setErrors({ ...errors, code: "" });
              }}
              className={`w-full font-mono uppercase ${adminInputClass}`}
              placeholder="VD: SUMMER20"
            />
          </AdminField>

          <AdminField label="Áp dụng cho" error={errors.applyType}>
            <select
              value={form.applyType}
              onChange={(event) => handleApplyTypeChange(event.target.value)}
              className={`w-full ${adminInputClass}`}
            >
              {Object.entries(APPLY_TYPE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </AdminField>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="Loại giảm giá" error={errors.type}>
            <select
              value={form.type}
              title={DISCOUNT_TYPE_LABEL[form.type]}
              onChange={(event) => {
                setForm({ ...form, type: event.target.value });
                setErrors({ ...errors, type: "" });
              }}
              className={`w-full ${adminInputClass}`}
            >
              <option value="AMOUNT">Số tiền cố định (đ)</option>
              <option value="PERCENT">Phần trăm (%)</option>
            </select>
          </AdminField>

          <AdminField
            label={`Giá trị ${form.type === "PERCENT" ? "(%)" : "(VNĐ)"}`}
            error={errors.value}
          >
            <input
              type="number"
              min={0}
              max={form.type === "PERCENT" ? 100 : undefined}
              value={form.value}
              onChange={(event) => {
                setForm({ ...form, value: Number(event.target.value) });
                setErrors({ ...errors, value: "" });
              }}
              className={`w-full ${adminInputClass}`}
            />
          </AdminField>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="Đơn tối thiểu (VNĐ)" error={errors.minAmount}>
            <input
              type="number"
              min={0}
              value={form.minAmount}
              onChange={(event) => {
                setForm({ ...form, minAmount: Number(event.target.value) });
                setErrors({ ...errors, minAmount: "" });
              }}
              className={`w-full ${adminInputClass}`}
            />
          </AdminField>

          {form.type === "PERCENT" ? (
            <AdminField label="Giảm tối đa (VNĐ)" error={errors.maxDiscount}>
              <input
                type="number"
                min={0}
                value={form.maxDiscount}
                onChange={(event) => {
                  setForm({
                    ...form,
                    maxDiscount:
                      event.target.value === ""
                        ? ""
                        : Number(event.target.value),
                  });
                  setErrors({ ...errors, maxDiscount: "" });
                }}
                className={`w-full ${adminInputClass}`}
                placeholder="Không giới hạn"
              />
            </AdminField>
          ) : null}

          <AdminField label="Giới hạn sử dụng" error={errors.usageLimit}>
            <input
              type="number"
              min={1}
              value={form.usageLimit}
              onChange={(event) => {
                setForm({
                  ...form,
                  usageLimit:
                    event.target.value === "" ? "" : Number(event.target.value),
                });
                setErrors({ ...errors, usageLimit: "" });
              }}
              className={`w-full ${adminInputClass}`}
              placeholder="Không giới hạn"
            />
          </AdminField>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="Ngày bắt đầu" error={errors.startDate}>
            <input
              type="date"
              value={form.startDate}
              onChange={(event) => {
                setForm({ ...form, startDate: event.target.value });
                setErrors({ ...errors, startDate: "" });
              }}
              className={`w-full ${adminInputClass}`}
            />
          </AdminField>

          <AdminField label="Ngày kết thúc" error={errors.endDate}>
            <input
              type="date"
              value={form.endDate}
              min={form.startDate}
              onChange={(event) => {
                setForm({ ...form, endDate: event.target.value });
                setErrors({ ...errors, endDate: "" });
              }}
              className={`w-full ${adminInputClass}`}
            />
          </AdminField>
        </div>

        {scopeApplies ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Phạm vi đặt sân (tùy chọn)
              </p>
              {hasTimeScope ? (
                <span className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                  {formatHourLabel(Number(scope.startHour))} -{" "}
                  {formatHourLabel(Number(scope.endHour))}
                </span>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)_minmax(0,0.9fr)]">
              <AdminField label="Chi nhánh">
                <select
                  value={scope.branchId}
                  onChange={(event) =>
                    setScope({
                      ...scope,
                      branchId:
                        event.target.value === ""
                          ? ""
                          : Number(event.target.value),
                    })
                  }
                  className={`w-full ${adminInputClass}`}
                >
                  <option value="">Mọi chi nhánh</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </AdminField>

              <AdminField label="Giờ bắt đầu">
                <select
                  value={scope.startHour}
                  onChange={(event) =>
                    handleStartHourChange(event.target.value)
                  }
                  className={`w-full ${adminInputClass}`}
                >
                  <option value="">Mọi giờ</option>
                  {START_HOUR_OPTIONS.map((hour) => (
                    <option key={hour} value={hour}>
                      {formatHourLabel(hour)}
                    </option>
                  ))}
                </select>
              </AdminField>

              <AdminField label="Giờ kết thúc" error={errors.endHour}>
                <select
                  value={scope.endHour}
                  onChange={(event) => handleEndHourChange(event.target.value)}
                  className={`w-full ${adminInputClass}`}
                >
                  <option value="">Mọi giờ</option>
                  {availableEndHours.map((hour) => (
                    <option key={hour} value={hour}>
                      {formatHourLabel(hour)}
                    </option>
                  ))}
                </select>
              </AdminField>
            </div>

            <p className="mt-2 text-[11px] leading-5 text-slate-400">
              Để trống = áp dụng cho mọi chi nhánh / mọi khung giờ. Dùng để
              tạo mã kích cầu cho khung giờ thấp điểm của một chi nhánh.
            </p>
          </div>
        ) : null}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={onClose}
            className={adminSecondaryButtonClass}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className={adminPrimaryButtonClass}
          >
            {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
};

export default DiscountFormModal;
