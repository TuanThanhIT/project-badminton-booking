import React from "react";
import { Save, X, Package2 } from "lucide-react";
import type { SimpleCategory } from "../../../types/category";
import type { ProductFormData } from "../../../types/formData";
import IconButton from "./IconButton";
interface Props {
  title: string;
  formData: ProductFormData;
  errors: Record<string, string>;
  categories: SimpleCategory[];
  loading: boolean;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
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
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold flex items-center gap-2 text-gray-800">
            <Package2 className="text-blue-500" />{" "}
            <h1 className="text-blue-500">{title}</h1>
          </h1>
        </div>

        {/* FORM */}
        <form
          className="space-y-8 bg-white p-8 rounded-2xl  "
          onSubmit={onSubmit}
        >
          {/* PRODUCT NAME + BRAND */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Product Name
              </label>
              <input
                name="productName"
                placeholder="Nhập tên sản phẩm"
                value={formData.productName}
                onChange={onChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-700
                   focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              />
              {errors.productName && (
                <p className="text-red-500 text-sm">{errors.productName}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Brand</label>
              <input
                name="brand"
                placeholder="Nhập thương hiệu"
                value={formData.brand}
                onChange={onChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-700
                   focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              />
              {errors.brand && (
                <p className="text-red-500 text-sm">{errors.brand}</p>
              )}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Nhập mô tả sản phẩm có ít nhất 10 ký tự"
              rows={4}
              value={formData.description}
              onChange={onChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-700
                 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
          </div>

          {/* THUMBNAIL + CATEGORY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2 ">
              <label className="text-sm font-medium text-gray-700">
                Thumbnail
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white
                   focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              />
              {formData.thumbnail && (
                <p className="text-green-600 text-sm mt-1">
                  {formData.thumbnail.name}
                </p>
              )}
              {formData.preview && (
                <div className="flex justify-center">
                  <img
                    src={formData.preview}
                    className="w-32 h-32 object-cover rounded-lg mt-4 border border-blue-300"
                    alt="Preview"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Danh mục
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={onChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-700 bg-white
                   focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              >
                <option value="">Chọn mục sản phẩm</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.cateName}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-red-500 text-sm">{errors.categoryId}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <IconButton
              type="button"
              icon={X}
              text="Hủy"
              color="bg-white"
              textColor="text-gray-700"
              hoverColor="hover:bg-gray-100"
              border="border border-gray-300"
              onClick={onCancel}
            />

            <IconButton
              type="submit"
              icon={Save}
              text="Lưu"
              loading={loading}
              loadingText="Đang lưu..."
              color="bg-blue-500"
              hoverColor="hover:bg-blue-700"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
