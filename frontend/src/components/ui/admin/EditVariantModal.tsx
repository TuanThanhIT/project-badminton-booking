import React, { useEffect, useState } from "react";
import productService from "../../../services/Admin/productService";
import VariantForm from "./VariantForm";

type EditVariantModalProps = {
  isOpen: boolean;
  onClose: () => void;
  variantId: number;
  onSuccess: () => Promise<void>;
};

export default function EditVariantModal({
  isOpen,
  onClose,
  variantId,
  onSuccess,
}: EditVariantModalProps) {
  const [variant, setVariant] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetch = async () => {
      const res = await productService.getVariantByIdService(variantId);
      setVariant(res.data.data);
    };
    fetch();
  }, [isOpen, variantId]);

  if (!isOpen) return null;
  if (!variant) return <div className="p-4">Đang tải...</div>;

  const handleSubmit = async (data: any) => {
    await productService.updateVariantService(variantId, data);
    await onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow max-w-xl w-full">
        <h2 className="text-xl font-bold mb-4">Chỉnh sửa biến thể</h2>

        <VariantForm
          initialData={variant}
          onSubmit={handleSubmit}
          onCancel={onClose}
          mode="edit"
        />

        {/* <button
          className="mt-4 px-4 py-2 bg-gray-300 rounded"
          onClick={onClose}
        >
          Đóng
        </button> */}
      </div>
    </div>
  );
}
