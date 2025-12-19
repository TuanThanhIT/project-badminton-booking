import { useEffect, useState } from "react";
import productService from "../../../services/admin/productService";
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

    const fetchVariant = async () => {
      const res = await productService.getVariantByIdService(variantId);
      setVariant(res.data.data);
    };

    fetchVariant();
  }, [isOpen, variantId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Chỉnh sửa biến thể
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {!variant ? (
          <p className="text-sm text-gray-500">Đang tải dữ liệu...</p>
        ) : (
          <VariantForm
            initialData={variant}
            onSubmit={async (data) => {
              await productService.updateVariantService(variantId, data);
              await onSuccess();
              onClose();
            }}
            onCancel={onClose}
            mode="edit"
          />
        )}
      </div>
    </div>
  );
}
