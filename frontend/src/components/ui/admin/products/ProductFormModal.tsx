import { useState } from "react";
import { Package } from "lucide-react";
import { toast } from "react-toastify";
import adminProductService from "../../../../services/admin/productService";
import type { AdminProduct, AdminCategory } from "../../../../types/admin";
import AdminImagePicker from "../AdminImagePicker";
import AdminModal, {
  AdminField,
  adminInputClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  adminTextAreaClass,
} from "../AdminModal";
import { AdminProductFormSchema } from "../../../../schemas/AdminFormSchemas";

type ProductFormModalProps = {
  product: AdminProduct | null;
  categories: AdminCategory[];
  onClose: () => void;
  onSaved: () => void;
};

const ProductFormModal = ({ product, categories, onClose, onSaved }: ProductFormModalProps) => {
  const isEdit = !!product;
  const [form, setForm] = useState({
    productName: product?.productName || "",
    brand: product?.brand || "",
    description: product?.description || "",
    thumbnailUrl: product?.thumbnailUrl || "",
    categoryId: product?.categoryId || (categories[0]?.id || 0),
  });
  const [saving, setSaving] = useState(false);
  const [previewDesc, setPreviewDesc] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = AdminProductFormSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [issue.path[0], issue.message])));
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      if (isEdit) {
        await adminProductService.updateProductService(product!.id, parsed.data);
        toast.success("Đã cập nhật sản phẩm");
      } else {
        await adminProductService.createProductService(parsed.data as any);
        toast.success("Đã tạo sản phẩm");
      }
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally { setSaving(false); }
  };

  return (
    <AdminModal
      title={isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
      description="Cập nhật thông tin sản phẩm hiển thị trong cửa hàng."
      icon={<Package className="h-5 w-5 text-sky-600" />}
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <AdminField label="Ảnh đại diện" error={errors.thumbnailUrl}>
            <AdminImagePicker
              value={form.thumbnailUrl}
              onChange={(url) => {
                setForm({ ...form, thumbnailUrl: url });
                setErrors({ ...errors, thumbnailUrl: "" });
              }}
              label="Ảnh đại diện"
              height="h-36"
            />
          </AdminField>
          <AdminField label="Tên sản phẩm" error={errors.productName}>
            <input
              value={form.productName}
              onChange={(e) => {
                setForm({ ...form, productName: e.target.value });
                setErrors({ ...errors, productName: "" });
              }}
              className={`w-full ${adminInputClass}`}
              placeholder="Tên sản phẩm..."
            />
          </AdminField>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField label="Thương hiệu" error={errors.brand}>
              <input
                value={form.brand}
                onChange={(e) => {
                  setForm({ ...form, brand: e.target.value });
                  setErrors({ ...errors, brand: "" });
                }}
                className={`w-full ${adminInputClass}`}
                placeholder="Brand..."
              />
            </AdminField>
            <AdminField label="Danh mục" error={errors.categoryId}>
              <select
                value={form.categoryId}
                onChange={(e) => {
                  setForm({ ...form, categoryId: Number(e.target.value) });
                  setErrors({ ...errors, categoryId: "" });
                }}
                className={`w-full ${adminInputClass}`}
              >
                {categories.map((c) => <option key={c.id} value={c.id}>{c.cateName}</option>)}
              </select>
            </AdminField>
          </div>
          <AdminField label="Mô tả" error={errors.description}>
            <div className="flex items-center justify-between mb-1">
              {form.description && (
                <button type="button" onClick={() => setPreviewDesc(!previewDesc)}
                  className="text-xs text-sky-600 hover:text-sky-700 font-medium transition">
                  {previewDesc ? "Chỉnh sửa" : "Xem trước"}
                </button>
              )}
            </div>
            {previewDesc ? (
              <div
                className="w-full min-h-[80px] max-h-[220px] overflow-y-auto px-3 py-2 rounded-lg border border-sky-200 bg-sky-50/30 text-sm prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: form.description }}
              />
            ) : (
              <textarea
                value={form.description}
                onChange={(e) => {
                  setForm({ ...form, description: e.target.value });
                  setErrors({ ...errors, description: "" });
                }}
                rows={4}
                className={`w-full resize-none ${adminTextAreaClass}`}
                placeholder="Mô tả sản phẩm..."
              />
            )}
          </AdminField>
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

export default ProductFormModal;
