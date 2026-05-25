import { useState } from "react";
import { X, TicketPercent } from "lucide-react";
import { toast } from "react-toastify";
import adminDiscountService from "../../../../services/admin/discountService";
import type { AdminDiscount } from "../../../../types/admin";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.value || !form.startDate || !form.endDate) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc"); return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        value: Number(form.value),
        maxDiscount: form.maxDiscount !== "" ? Number(form.maxDiscount) : undefined,
        minAmount: Number(form.minAmount) || 0,
        usageLimit: form.usageLimit !== "" ? Number(form.usageLimit) : undefined,
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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <TicketPercent className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-bold text-gray-800">{isEdit ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá"}</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-200 flex items-center justify-center transition">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mã giảm giá *</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 font-mono uppercase" placeholder="VD: SUMMER20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Áp dụng cho</label>
              <select value={form.applyType} onChange={(e) => setForm({ ...form, applyType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 bg-white">
                {Object.entries(APPLY_TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Loại giảm giá</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 bg-white">
                <option value="AMOUNT">Số tiền cố định (₫)</option>
                <option value="PERCENT">Phần trăm (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Giá trị * {form.type === "PERCENT" ? "(%)" : "(₫)"}</label>
              <input type="number" min={0} max={form.type === "PERCENT" ? 100 : undefined}
                value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Đơn tối thiểu (₫)</label>
              <input type="number" min={0} value={form.minAmount} onChange={(e) => setForm({ ...form, minAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400" />
            </div>
            {form.type === "PERCENT" && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Giảm tối đa (₫)</label>
                <input type="number" min={0} value={form.maxDiscount}
                  onChange={(e) => setForm({ ...form, maxDiscount: e.target.value === "" ? "" : Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400" placeholder="Không giới hạn" />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Giới hạn sử dụng</label>
              <input type="number" min={1} value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value === "" ? "" : Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400" placeholder="Không giới hạn" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ngày bắt đầu *</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ngày kết thúc *</label>
              <input type="date" value={form.endDate} min={form.startDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition">Hủy</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition disabled:opacity-60">
              {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiscountFormModal;
