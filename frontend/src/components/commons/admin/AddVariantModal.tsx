import React from "react";
import VariantForm from "./VariantForm";
import productService from "../../../services/admin/productService";
import type {
  CreateVariantInput,
  ProductVariant,
} from "../../../types/varient";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  onSuccess: (v: ProductVariant) => void;
}

export default function AddVariantModal({
  isOpen,
  onClose,
  productId,
  onSuccess,
}: Props) {
  if (!isOpen) return null;

  const initialData: CreateVariantInput = {
    sku: "",
    price: 0,
    stock: 0,
    discount: 0,
    productId,
    color: "",
    size: "",
    material: "",
  };

  const handleSubmit = async (data: CreateVariantInput) => {
    const res = await productService.createVariantService(data);
    onSuccess(res.data.data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-4">Thêm Biến Thể</h2>

        <VariantForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={onClose}
          mode="add"
        />
      </div>
    </div>
  );
}
