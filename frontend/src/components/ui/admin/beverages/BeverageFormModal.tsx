import { useState } from "react";
import { X, Coffee } from "lucide-react";
import { toast } from "react-toastify";
import adminBeverageService from "../../../../services/admin/beverageService";
import type { AdminBeverage } from "../../../../types/admin";
import AdminImagePicker from "../AdminImagePicker";

type BeverageFormModalProps = {
  beverage: AdminBeverage | null;
  onClose: () => void;
  onSaved: () => void;
};

const BeverageFormModal = ({ beverage, onClose, onSaved }: BeverageFormModalProps) => {
  const isEdit = !!beverage;
  const [name,     setName]     = useState(beverage?.beverageName || "");
  const [thumb,    setThumb]    = useState(beverage?.thumbnailUrl || "");
  const [priceStr, setPriceStr] = useState(String(beverage?.price ?? 0));
  const [saving,   setSaving]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Vui lòng nhập tên đồ uống"); return; }
    const price = parseFloat(priceStr) || 0;
    if (price < 0) { toast.error("Giá không hợp lệ"); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await adminBeverageService.updateBeverageService(beverage!.id, {
          beverageName: name, thumbnailUrl: thumb || undefined, price,
        });
        toast.success("Đã cập nhật đồ uống");
      } else {
        await adminBeverageService.createBeverageService({
          beverageName: name, thumbnailUrl: thumb || undefined, price,
        });
        toast.success("Đã tạo đồ uống");
      }
      onSaved();
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-bold text-gray-800">
              {isEdit ? "Chỉnh sửa đồ uống" : "Thêm đồ uống mới"}
            </h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-200 flex items-center justify-center transition">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <AdminImagePicker value={thumb} onChange={setThumb} label="Ảnh sản phẩm" height="h-32" />

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tên đồ uống *</label>
            <input
              value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="Tên đồ uống..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Giá (₫) *</label>
            <input
              type="text" inputMode="numeric" value={priceStr}
              onChange={(e) => { const v = e.target.value; if (v === "" || /^\d+$/.test(v)) setPriceStr(v); }}
              onBlur={() => { if (!priceStr) setPriceStr("0"); }}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="0"
            />
          </div>

          <p className="text-xs text-sky-600 bg-sky-50 border border-sky-100 rounded-lg px-3 py-2">
            Tồn kho từng chi nhánh do Manager quản lý.
          </p>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition">
              Hủy
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2 rounded-lg bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition disabled:opacity-60">
              {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BeverageFormModal;
