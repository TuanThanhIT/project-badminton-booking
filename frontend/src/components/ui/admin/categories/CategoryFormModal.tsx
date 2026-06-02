import { useState } from "react";
import { Tag } from "lucide-react";
import { toast } from "react-toastify";
import adminCategoryService from "../../../../services/admin/categoryService";
import type { AdminCategory } from "../../../../types/admin";
import {
  AdminField,
  adminInputClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "../AdminModal";
import { AdminCategoryFormSchema } from "../../../../schemas/AdminFormSchemas";
import AdminModal from "../AdminModal";

const MENU_GROUPS = ["Cầu lông", "Vợt", "Giày", "Quần áo", "Phụ kiện", "Khác"];

type CategoryFormModalProps = {
  category: AdminCategory | null;
  onClose: () => void;
  onSaved: () => void;
};

const CategoryFormModal = ({ category, onClose, onSaved }: CategoryFormModalProps) => {
  const isEdit = !!category;
  const [form, setForm] = useState({
    cateName: category?.cateName || "",
    menuGroup: category?.menuGroup || MENU_GROUPS[0],
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = AdminCategoryFormSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [issue.path[0], issue.message])));
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      if (isEdit) {
        await adminCategoryService.updateCategoryService(category!.id, parsed.data);
        toast.success("Đã cập nhật danh mục");
      } else {
        await adminCategoryService.createCategoryService(parsed.data);
        toast.success("Đã tạo danh mục");
      }
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally { setSaving(false); }
  };

  return (
    <AdminModal
      title={isEdit ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
      description="Quản lý nhóm hiển thị sản phẩm trong cửa hàng."
      icon={<Tag className="h-5 w-5 text-sky-600" />}
      onClose={onClose}
      maxWidth="max-w-md"
    >
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <AdminField label="Tên danh mục" error={errors.cateName}>
            <input
              value={form.cateName}
              onChange={(e) => {
                setForm({ ...form, cateName: e.target.value });
                setErrors({ ...errors, cateName: "" });
              }}
              className={`w-full ${adminInputClass}`}
              placeholder="VD: Vợt cầu lông..."
            />
          </AdminField>
          <AdminField label="Nhóm menu" error={errors.menuGroup}>
            <select
              value={form.menuGroup}
              onChange={(e) => {
                setForm({ ...form, menuGroup: e.target.value });
                setErrors({ ...errors, menuGroup: "" });
              }}
              className={`w-full ${adminInputClass}`}
            >
              {MENU_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </AdminField>
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

export default CategoryFormModal;
