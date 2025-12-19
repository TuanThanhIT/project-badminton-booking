import type { SimpleCategory } from "../../../types/category";
import type { ProductFormData } from "../../../types/formData";
import { Loader2, AlertCircle, Image as ImageIcon } from "lucide-react";

interface Props {
  title?: string;
  formData: ProductFormData;
  errors: Record<string, string>;
  categories: SimpleCategory[];
  loading: boolean;
  onChange: (e: any) => void;
  onFileChange: (e: any) => void;
  onSubmit: (e: any) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<Props> = ({
  title,
  formData,
  errors,
  categories,
  loading,
  onChange,
  onFileChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-xl shadow px-6 py-5 space-y-4"
    >
      {title && (
        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
          {title}
        </h2>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tên sản phẩm */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Tên sản phẩm <span className="text-red-500">*</span>
          </label>
          <input
            name="productName"
            value={formData.productName}
            onChange={onChange}
            className={`w-full rounded-md border px-3 py-2 text-sm
              focus:outline-none focus:ring-2
              ${
                errors.productName
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
            placeholder="Nhập tên sản phẩm"
          />
          {errors.productName && (
            <p className="flex items-center gap-1 text-red-500 text-xs mt-1">
              <AlertCircle size={13} />
              {errors.productName}
            </p>
          )}
        </div>

        {/* Thương hiệu */}
        <div>
          <label className="block text-sm font-medium mb-1">Thương hiệu</label>
          <input
            name="brand"
            value={formData.brand}
            onChange={onChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200"
            placeholder="VD: Yonex"
          />
        </div>

        {/* Danh mục */}
        <div>
          <label className="block text-sm font-medium mb-1">Danh mục</label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={onChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200"
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.cateName}
              </option>
            ))}
          </select>
        </div>

        {/* Mô tả */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Mô tả</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onChange}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 resize-none"
            placeholder="Mô tả ngắn gọn..."
          />
        </div>

        {/* Ảnh */}
        <div className="md:col-span-2 flex items-center gap-4">
          <label className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-md cursor-pointer hover:bg-gray-50 text-sm">
            <ImageIcon size={16} />
            Chọn ảnh
            <input type="file" hidden onChange={onFileChange} />
          </label>

          {formData.preview && (
            <img
              src={formData.preview}
              className="w-20 h-20 object-cover rounded-md border"
            />
          )}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-2 pt-3 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded-md border hover:bg-gray-100"
        >
          Huỷ
        </button>

        <button
          disabled={loading}
          className="px-5 py-2 text-sm rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
