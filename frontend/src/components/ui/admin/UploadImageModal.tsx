import UploadProductImages from "./UploadProductImages";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
}

export default function UploadImageModal({
  isOpen,
  onClose,
  productId,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 w-[520px] shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Quản lý hình ảnh sản phẩm
        </h2>

        <UploadProductImages productId={productId} />
      </div>
    </div>
  );
}
