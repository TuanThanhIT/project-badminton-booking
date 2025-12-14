// components/commons/admin/UploadImageModal.tsx   // ⭐ NEW
import React from "react";
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
      <div className="bg-white p-6 rounded-xl w-[500px] shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <UploadProductImages productId={productId} />
      </div>
    </div>
  );
}
