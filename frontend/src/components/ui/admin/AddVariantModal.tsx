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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Thêm biến thể sản phẩm
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

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
