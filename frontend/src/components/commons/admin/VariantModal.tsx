import React, { useState } from "react";
import { toast } from "react-toastify";
import type {
  ProductVariant,
  CreateVariantInput,
} from "../../../types/varient";
import { createVariantService } from "../../../services/admin/productService";
import { FormCreateVariantSchema } from "../../../schemas/FormCreateVariantSchema";

interface VariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  onSuccess: (newVariant: ProductVariant) => void;
}

const VariantModal: React.FC<VariantModalProps> = ({
  isOpen,
  onClose,
  productId,
  onSuccess,
}) => {
  const [form, setForm] = useState<CreateVariantInput>({
    sku: "",
    price: 0,
    stock: 0,
    discount: 0,
    productId,
    color: "",
    size: "",
    material: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      setForm({
        sku: "",
        price: 0,
        stock: 0,
        discount: 0,
        productId,
        color: "",
        size: "",
        material: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: ["price", "stock", "discount"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Validate BEFORE sending
    const parsed = FormCreateVariantSchema.safeParse(form);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((err) => {
        const key = String(err.path[0]);
        fieldErrors[key] = err.message;
      });

      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await createVariantService(form);
      toast.success("Thêm variant thành công");
      onSuccess(res.data);
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Thêm variant thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Thêm Variant</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* GRID 2 CỘT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SKU */}
            <div className="col-span-1 md:col-span-2">
              <label className="font-medium">SKU</label>
              <input
                type="text"
                name="sku"
                placeholder="Nhập mã SKU..."
                value={form.sku}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
              {errors.sku && (
                <p className="text-red-500 text-sm">{errors.sku}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="font-medium">Giá</label>
              <input
                type="number"
                name="price"
                placeholder="Giá sản phẩm..."
                value={form.price}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
              {errors.price && (
                <p className="text-red-500 text-sm">{errors.price}</p>
              )}
            </div>

            {/* Stock */}
            <div>
              <label className="font-medium">Số lượng</label>
              <input
                type="number"
                name="stock"
                placeholder="Tồn kho..."
                value={form.stock}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
              {errors.stock && (
                <p className="text-red-500 text-sm">{errors.stock}</p>
              )}
            </div>

            {/* Discount */}
            <div>
              <label className="font-medium">Giảm giá (%)</label>
              <input
                type="number"
                name="discount"
                placeholder="Phần trăm giảm giá..."
                value={form.discount}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
              {errors.discount && (
                <p className="text-red-500 text-sm">{errors.discount}</p>
              )}
            </div>

            {/* Color */}
            <div>
              <label className="font-medium">Màu sắc</label>
              <input
                type="text"
                name="color"
                placeholder="Màu sản phẩm..."
                value={form.color || ""}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
              {errors.color && (
                <p className="text-red-500 text-sm">{errors.color}</p>
              )}
            </div>

            {/* Size */}
            <div>
              <label className="font-medium">Kích thước</label>
              <input
                type="text"
                name="size"
                placeholder="Size sản phẩm..."
                value={form.size || ""}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
              {errors.size && (
                <p className="text-red-500 text-sm">{errors.size}</p>
              )}
            </div>

            {/* Material */}
            <div>
              <label className="font-medium">Chất liệu</label>
              <input
                type="text"
                name="material"
                placeholder="Chất liệu sản phẩm..."
                value={form.material || ""}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
              {errors.material && (
                <p className="text-red-500 text-sm">{errors.material}</p>
              )}
            </div>
          </div>

          {/* BUTTON */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              {loading ? "Đang thêm..." : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VariantModal;
