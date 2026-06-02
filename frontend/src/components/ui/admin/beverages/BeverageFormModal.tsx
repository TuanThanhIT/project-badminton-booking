import { useState } from "react";
import { Coffee } from "lucide-react";
import { toast } from "react-toastify";
import adminBeverageService from "../../../../services/admin/beverageService";
import type { AdminBeverage } from "../../../../types/admin";
import AdminImagePicker from "../AdminImagePicker";
import AdminModal, {
  AdminField,
  adminInputClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "../AdminModal";
import { AdminBeverageFormSchema } from "../../../../schemas/AdminFormSchemas";

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(priceStr) || 0;
    const parsed = AdminBeverageFormSchema.safeParse({
      beverageName: name,
      thumbnailUrl: thumb,
      price,
    });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [issue.path[0], issue.message])));
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      if (isEdit) {
        await adminBeverageService.updateBeverageService(beverage!.id, parsed.data);
        toast.success("Đã cập nhật đồ uống");
      } else {
        await adminBeverageService.createBeverageService(parsed.data);
        toast.success("Đã tạo đồ uống");
      }
      onSaved();
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra");
    } finally { setSaving(false); }
  };

  return (
    <AdminModal
      title={isEdit ? "Chỉnh sửa đồ uống" : "Thêm đồ uống mới"}
      description="Quản lý sản phẩm đồ uống bán tại quầy."
      icon={<Coffee className="h-5 w-5 text-sky-600" />}
      onClose={onClose}
      maxWidth="max-w-md"
    >
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <AdminField label="Ảnh sản phẩm" error={errors.thumbnailUrl}>
            <AdminImagePicker
              value={thumb}
              onChange={(url) => {
                setThumb(url);
                setErrors({ ...errors, thumbnailUrl: "" });
              }}
              label="Ảnh sản phẩm"
              height="h-32"
            />
          </AdminField>

          <AdminField label="Tên đồ uống" error={errors.beverageName}>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors({ ...errors, beverageName: "" });
              }}
              className={`w-full ${adminInputClass}`}
              placeholder="Tên đồ uống..."
            />
          </AdminField>

          <AdminField label="Giá (VNĐ)" error={errors.price}>
            <input
              type="text" inputMode="numeric" value={priceStr}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || /^\d+$/.test(v)) setPriceStr(v);
                setErrors({ ...errors, price: "" });
              }}
              onBlur={() => { if (!priceStr) setPriceStr("0"); }}
              className={`w-full ${adminInputClass}`}
              placeholder="0"
            />
          </AdminField>

          <p className="text-xs text-sky-600 bg-sky-50 border border-sky-100 rounded-lg px-3 py-2">
            Tồn kho từng chi nhánh do Manager quản lý.
          </p>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={onClose}
              className={adminSecondaryButtonClass}>
              Hủy
            </button>
            <button type="submit" disabled={saving}
              className={adminPrimaryButtonClass}>
              {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
    </AdminModal>
  );
};

export default BeverageFormModal;
