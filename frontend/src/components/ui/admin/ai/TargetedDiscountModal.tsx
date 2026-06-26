import { useMemo, useState } from "react";
import { BellRing, ChevronDown, ChevronUp, Users } from "lucide-react";
import { toast } from "react-toastify";
import AdminModal, {
  AdminField,
  adminInputClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "../AdminModal";
import adminDiscountService from "../../../../services/admin/discountService";
import type { DiscountSegmentDraft } from "../../../../constants/marketingSegment";
import type { AdminCustomerInsight } from "../../../../types/aiRecommendation";

type TargetedDiscountModalProps = {
  draft: DiscountSegmentDraft;
  segment: "LOYAL" | "WINBACK";
  rows: AdminCustomerInsight[];
  onClose: () => void;
  onCreated: (code: string, assigned: number) => void;
};

type FormState = {
  code: string;
  type: "PERCENT" | "AMOUNT";
  value: number;
  maxDiscount: number | "";
  minAmount: number;
  startDate: string;
  endDate: string;
};

const randomSuffix = () => String(Math.floor(100 + Math.random() * 900));

const TargetedDiscountModal = ({
  draft,
  segment,
  rows,
  onClose,
  onCreated,
}: TargetedDiscountModalProps) => {
  const [form, setForm] = useState<FormState>({
    code: `${draft.code}${randomSuffix()}`,
    type: draft.type,
    value: draft.value,
    maxDiscount: draft.maxDiscount ?? "",
    minAmount: draft.minAmount,
    startDate: draft.startDate,
    endDate: draft.endDate,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const userIds = useMemo(() => rows.map((r) => r.userId), [rows]);

  const update = (patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    const code = form.code.trim();
    if (code.length < 3 || code.length > 30) {
      next.code = "Mã từ 3–30 ký tự";
    }
    if (!form.value || form.value <= 0) {
      next.value = "Giá trị phải lớn hơn 0";
    } else if (form.type === "PERCENT" && form.value > 100) {
      next.value = "Phần trăm không quá 100";
    }
    if (form.minAmount < 0) next.minAmount = "Không hợp lệ";
    if (form.maxDiscount !== "" && Number(form.maxDiscount) < 0) {
      next.maxDiscount = "Không hợp lệ";
    }
    if (!form.startDate) next.startDate = "Chọn ngày bắt đầu";
    if (!form.endDate) next.endDate = "Chọn ngày kết thúc";
    if (form.startDate && form.endDate && form.endDate <= form.startDate) {
      next.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userIds.length) {
      toast.error("Nhóm chưa có khách để gửi mã");
      return;
    }
    if (!validate()) return;

    setSaving(true);
    try {
      const res = await adminDiscountService.createTargetedDiscountService({
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        maxDiscount:
          form.type === "PERCENT" && form.maxDiscount !== ""
            ? Number(form.maxDiscount)
            : undefined,
        minAmount: Number(form.minAmount),
        startDate: form.startDate,
        endDate: form.endDate,
        segment,
        userIds,
      });
      const assigned = res?.data?.data?.assignedCount ?? userIds.length;
      onCreated(form.code.trim().toUpperCase(), assigned);
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không tạo được mã riêng, vui lòng thử lại";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminModal
      title="Tạo mã riêng cho nhóm khách"
      description="Form đã điền sẵn theo nhóm khách. Admin kiểm tra mức giảm, thời hạn rồi gửi mã."
      icon={<BellRing className="h-5 w-5 text-rose-500" />}
      onClose={onClose}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50/60 px-4 py-3 text-xs text-rose-900">
          <Users className="h-4 w-4 shrink-0" />
          <span>
            Mã này chỉ áp dụng cho <strong>{userIds.length} khách</strong> trong
            nhóm (mỗi khách 1 lượt) và gửi thông báo trực tiếp vào tài khoản.
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="Mã giảm giá" error={errors.code}>
            <input
              value={form.code}
              onChange={(e) => {
                update({ code: e.target.value.toUpperCase() });
                setErrors({ ...errors, code: "" });
              }}
              className={`w-full font-mono uppercase ${adminInputClass}`}
            />
          </AdminField>

          <AdminField label="Loại giảm giá">
            <select
              value={form.type}
              onChange={(e) =>
                update({ type: e.target.value as FormState["type"] })
              }
              className={`w-full ${adminInputClass}`}
            >
              <option value="PERCENT">Phần trăm (%)</option>
              <option value="AMOUNT">Số tiền cố định (đ)</option>
            </select>
          </AdminField>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <AdminField
            label={`Giá trị ${form.type === "PERCENT" ? "(%)" : "(VNĐ)"}`}
            error={errors.value}
          >
            <input
              type="number"
              min={0}
              max={form.type === "PERCENT" ? 100 : undefined}
              value={form.value}
              onChange={(e) => {
                update({ value: Number(e.target.value) });
                setErrors({ ...errors, value: "" });
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
                onChange={(e) => {
                  update({
                    maxDiscount:
                      e.target.value === "" ? "" : Number(e.target.value),
                  });
                  setErrors({ ...errors, maxDiscount: "" });
                }}
                className={`w-full ${adminInputClass}`}
                placeholder="Không giới hạn"
              />
            </AdminField>
          ) : null}

          <AdminField label="Đơn tối thiểu (VNĐ)" error={errors.minAmount}>
            <input
              type="number"
              min={0}
              value={form.minAmount}
              onChange={(e) => {
                update({ minAmount: Number(e.target.value) });
                setErrors({ ...errors, minAmount: "" });
              }}
              className={`w-full ${adminInputClass}`}
            />
          </AdminField>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="Ngày bắt đầu" error={errors.startDate}>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => {
                update({ startDate: e.target.value });
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
              onChange={(e) => {
                update({ endDate: e.target.value });
                setErrors({ ...errors, endDate: "" });
              }}
              className={`w-full ${adminInputClass}`}
            />
          </AdminField>
        </div>

        {rows.length > 0 ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex w-full items-center justify-between text-xs font-semibold text-slate-700"
            >
              <span>Danh sách {rows.length} khách sẽ nhận mã</span>
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {expanded ? (
              <div className="mt-2 max-h-44 space-y-1.5 overflow-y-auto">
                {rows.map((row) => (
                  <div
                    key={row.userId}
                    className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-1.5 text-xs"
                  >
                    <span className="truncate font-medium text-slate-700">
                      {row.fullName || `User #${row.userId}`}
                    </span>
                    <span className="truncate text-slate-400">{row.email}</span>
                  </div>
                ))}
              </div>
            ) : null}
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
            {saving ? "Đang tạo & gửi..." : "Tạo mã & gửi thông báo"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
};

export default TargetedDiscountModal;
