import { useState } from "react";
import { X, Tag } from "lucide-react";
import { toast } from "react-toastify";
import adminCategoryService from "../../../../services/admin/categoryService";
import type { AdminCategory } from "../../../../types/admin";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cateName.trim()) { toast.error("Vui lòng nhập tên danh mục"); return; }
    if (!form.menuGroup.trim()) { toast.error("Vui lòng nhập nhóm menu"); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await adminCategoryService.updateCategoryService(category!.id, form);
        toast.success("Đã cập nhật danh mục");
      } else {
        await adminCategoryService.createCategoryService(form);
        toast.success("Đã tạo danh mục");
      }
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-bold text-gray-800">
              {isEdit ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
            </h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-200 flex items-center justify-center transition">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tên danh mục *</label>
            <input
              value={form.cateName} onChange={(e) => setForm({ ...form, cateName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="VD: Vợt cầu lông..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nhóm menu *</label>
            <select
              value={form.menuGroup} onChange={(e) => setForm({ ...form, menuGroup: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 bg-white"
            >
              {MENU_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
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

export default CategoryFormModal;
