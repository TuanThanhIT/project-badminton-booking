import { useState } from "react";
import { TicketPercent } from "lucide-react";
import { toast } from "react-toastify";
import adminDiscountService from "../../../../services/admin/discountService";
import type { AdminDiscount } from "../../../../types/admin";
import AdminModal, {
  AdminField,
  adminInputClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "../AdminModal";
import { AdminDiscountFormSchema } from "../../../../schemas/AdminFormSchemas";

const DISCOUNT_TYPE_LABEL: Record<string, string> = { AMOUNT: "Số tiền", PERCENT: "Phần trăm" };
const APPLY_TYPE_LABEL: Record<string, string> = { ALL: "Tất cả", ORDER: "Đơn hàng", BOOKING: "Đặt sân" };

type DiscountFormModalProps = {
  discount: AdminDiscount | null;
  onClose: () => void;
  onSaved: () => void;
};

const DiscountFormModal = ({ discount, onClose, onSaved }: DiscountFormModalProps) => {
  const isEdit = !!discount;
  const [form, setForm] = useState({
    code: discount?.code || "",
    type: discount?.type || "AMOUNT",
    applyType: discount?.applyType || "ALL",
    value: discount?.value ?? 0,
    maxDiscount: (discount?.maxDiscount ?? "") as number | "",
    minAmount: discount?.minAmount ?? 0,
    usageLimit: (discount?.usageLimit ?? "") as number | "",
    startDate: discount?.startDate || "",
    endDate: discount?.endDate || "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = AdminDiscountFormSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [issue.path[0], issue.message])));
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const payload = {
        ...parsed.data,
        maxDiscount: parsed.data.maxDiscount !== "" ? Number(parsed.data.maxDiscount) : undefined,
        usageLimit: parsed.data.usageLimit !== "" ? Number(parsed.data.usageLimit) : undefined,
      };
      if (isEdit) {
        await adminDiscountService.updateDiscountService(discount!.id, payload);
        toast.success("Đã cập nhật mã giảm giá");
      } else {
        await adminDiscountService.createDiscountService(payload as any);
        toast.success("Đã tạo mã giảm giá");
      }
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally { setSaving(false); }
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
                onChange={(e) => {
                  setForm({ ...form, code: e.target.value.toUpperCase() });
                  setErrors({ ...errors, code: "" });
                }}
                className={`w-full font-mono uppercase ${adminInputClass}`}
                placeholder="VD: SUMMER20"
              />
            </AdminField>
            <AdminField label="Áp dụng cho" error={errors.applyType}>
              <select
                value={form.applyType}
                onChange={(e) => {
                  setForm({ ...form, applyType: e.target.value });
                  setErrors({ ...errors, applyType: "" });
                }}
                className={`w-full ${adminInputClass}`}
              >
                {Object.entries(APPLY_TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </AdminField>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField label="Loại giảm giá" error={errors.type}>
              <select
                value={form.type}
                title={DISCOUNT_TYPE_LABEL[form.type]}
                onChange={(e) => {
                  setForm({ ...form, type: e.target.value });
                  setErrors({ ...errors, type: "" });
                }}
                className={`w-full ${adminInputClass}`}
              >
                <option value="AMOUNT">Số tiền cố định (₫)</option>
                <option value="PERCENT">Phần trăm (%)</option>
              </select>
            </AdminField>
            <AdminField label={`Giá trị ${form.type === "PERCENT" ? "(%)" : "(VNĐ)"}`} error={errors.value}>
              <input type="number" min={0} max={form.type === "PERCENT" ? 100 : undefined}
                value={form.value}
                onChange={(e) => {
                  setForm({ ...form, value: Number(e.target.value) });
                  setErrors({ ...errors, value: "" });
                }}
                className={`w-full ${adminInputClass}`} />
            </AdminField>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField label="Đơn tối thiểu (VNĐ)" error={errors.minAmount}>
              <input type="number" min={0} value={form.minAmount}
                onChange={(e) => {
                  setForm({ ...form, minAmount: Number(e.target.value) });
                  setErrors({ ...errors, minAmount: "" });
                }}
                className={`w-full ${adminInputClass}`} />
            </AdminField>
            {form.type === "PERCENT" && (
              <AdminField label="Giảm tối đa (VNĐ)" error={errors.maxDiscount}>
                <input type="number" min={0} value={form.maxDiscount}
                  onChange={(e) => {
                    setForm({ ...form, maxDiscount: e.target.value === "" ? "" : Number(e.target.value) });
                    setErrors({ ...errors, maxDiscount: "" });
                  }}
                  className={`w-full ${adminInputClass}`} placeholder="Không giới hạn" />
              </AdminField>
            )}
            <AdminField label="Giới hạn sử dụng" error={errors.usageLimit}>
              <input type="number" min={1} value={form.usageLimit}
                onChange={(e) => {
                  setForm({ ...form, usageLimit: e.target.value === "" ? "" : Number(e.target.value) });
                  setErrors({ ...errors, usageLimit: "" });
                }}
                className={`w-full ${adminInputClass}`} placeholder="Không giới hạn" />
            </AdminField>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField label="Ngày bắt đầu" error={errors.startDate}>
              <input type="date" value={form.startDate}
                onChange={(e) => {
                  setForm({ ...form, startDate: e.target.value });
                  setErrors({ ...errors, startDate: "" });
                }}
                className={`w-full ${adminInputClass}`} />
            </AdminField>
            <AdminField label="Ngày kết thúc" error={errors.endDate}>
              <input type="date" value={form.endDate} min={form.startDate}
                onChange={(e) => {
                  setForm({ ...form, endDate: e.target.value });
                  setErrors({ ...errors, endDate: "" });
                }}
                className={`w-full ${adminInputClass}`} />
            </AdminField>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={onClose} className={adminSecondaryButtonClass}>Hủy</button>
            <button type="submit" disabled={saving} className={adminPrimaryButtonClass}>
              {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
    </AdminModal>
  );
};

export default DiscountFormModal;
