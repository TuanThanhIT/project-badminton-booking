import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { X, Save } from "lucide-react";
import IconButton from "./IconButton";

import type {
  CreateVariantInput,
  ProductVariant,
} from "../../../types/varient";
import { FormCreateVariantSchema } from "../../../schemas/FormCreateVariantSchema";

interface VariantFormPropsAdd {
  mode: "add";
  initialData: CreateVariantInput;
  onSubmit: (data: CreateVariantInput) => Promise<void>;
  onCancel?: () => void;
}

interface VariantFormPropsEdit {
  mode: "edit";
  initialData: ProductVariant;
  onSubmit: (data: ProductVariant) => Promise<void>;
  onCancel?: () => void;
}

type Props = VariantFormPropsAdd | VariantFormPropsEdit;

export default function VariantForm({
  initialData,
  onSubmit,
  onCancel,
  mode,
}: Props) {
  const [form, setForm] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: ["price", "stock", "discount"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const parsed = FormCreateVariantSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((err) => {
        fieldErrors[String(err.path[0])] = err.message;
      });

      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      if (mode === "add") {
        await onSubmit(form as CreateVariantInput);
      } else {
        await onSubmit(form as ProductVariant);
      }
    } catch (err) {
      toast.error("Lỗi khi xử lý variant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SKU */}
        <div className="md:col-span-2">
          <label className="font-medium">SKU</label>
          <input
            type="text"
            name="sku"
            placeholder="SKU..."
            value={form.sku}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          {errors.sku && <p className="text-red-500 text-sm">{errors.sku}</p>}
        </div>

        {/* price */}
        <div>
          <label className="font-medium">Giá</label>
          <input
            type="number"
            name="price"
            placeholder="Giá..."
            value={form.price}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          {errors.price && (
            <p className="text-red-500 text-sm">{errors.price}</p>
          )}
        </div>

        {/* stock */}
        <div>
          <label className="font-medium">Tồn kho</label>
          <input
            type="number"
            name="stock"
            placeholder="Số lượng..."
            value={form.stock}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          {errors.stock && (
            <p className="text-red-500 text-sm">{errors.stock}</p>
          )}
        </div>

        {/* discount */}
        <div>
          <label className="font-medium">Giảm giá (%)</label>
          <input
            type="number"
            name="discount"
            placeholder="Giảm giá..."
            value={form.discount}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          {errors.discount && (
            <p className="text-red-500 text-sm">{errors.discount}</p>
          )}
        </div>

        {/* color */}
        <div>
          <label className="font-medium">Màu sắc</label>
          <input
            type="text"
            name="color"
            placeholder="Màu sắc..."
            value={form.color || ""}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        {/* size */}
        <div>
          <label className="font-medium">Kích thước</label>
          <input
            type="text"
            name="size"
            placeholder="Kích thước..."
            value={form.size || ""}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        {/* material */}
        <div>
          <label className="font-medium">Chất liệu</label>
          <input
            type="text"
            name="material"
            placeholder="Chất liệu..."
            value={form.material || ""}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        {onCancel && (
          <IconButton
            type="button"
            icon={X}
            text="Hủy"
            onClick={onCancel}
            color="bg-white"
            border="border border-gray-300"
            textColor="text-gray-700"
          />
        )}

        <IconButton
          type="submit"
          icon={Save}
          text={loading ? "Đang lưu..." : mode === "add" ? "Thêm" : "Lưu"}
          loading={loading}
          color="bg-blue-500"
          hoverColor="hover:bg-blue-700"
        />
      </div>
    </form>
  );
}
