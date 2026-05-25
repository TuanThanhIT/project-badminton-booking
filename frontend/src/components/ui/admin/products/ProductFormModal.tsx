import { useState } from "react";
import { X, Package } from "lucide-react";
import { toast } from "react-toastify";
import adminProductService from "../../../../services/admin/productService";
import type { AdminProduct, AdminCategory } from "../../../../types/admin";
import AdminImagePicker from "../AdminImagePicker";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productName.trim() || !form.brand.trim() || !form.description.trim() || !form.thumbnailUrl.trim() || !form.categoryId) {
      toast.error("Vui lòng điền đầy đủ thông tin và chọn ảnh"); return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await adminProductService.updateProductService(product!.id, form);
        toast.success("Đã cập nhật sản phẩm");
      } else {
        await adminProductService.createProductService(form as any);
        toast.success("Đã tạo sản phẩm");
      }
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-bold text-gray-800">{isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-200 flex items-center justify-center transition">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <AdminImagePicker value={form.thumbnailUrl} onChange={(url) => setForm({ ...form, thumbnailUrl: url })} label="Ảnh đại diện *" height="h-36" />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tên sản phẩm *</label>
            <input value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400" placeholder="Tên sản phẩm..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Thương hiệu *</label>
              <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400" placeholder="Brand..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Danh mục *</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 bg-white">
                {categories.map((c) => <option key={c.id} value={c.id}>{c.cateName}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">Mô tả *</label>
              {form.description && (
                <button type="button" onClick={() => setPreviewDesc(!previewDesc)}
                  className="text-xs text-sky-600 hover:text-sky-700 font-medium transition">
                  {previewDesc ? "✏️ Chỉnh sửa" : "👁 Xem trước"}
                </button>
              )}
            </div>
            {previewDesc ? (
              <div
                className="w-full min-h-[80px] max-h-[220px] overflow-y-auto px-3 py-2 rounded-lg border border-sky-200 bg-sky-50/30 text-sm prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: form.description }}
              />
            ) : (
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 resize-none font-mono" placeholder="Mô tả sản phẩm..." />
            )}
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

export default ProductFormModal;
