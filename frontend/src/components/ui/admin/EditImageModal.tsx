import React, { useState } from "react";
import productService from "../../../services/admin/productService";
import { toast } from "react-toastify";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  imageId: number;
  currentUrl: string;
  onSuccess: () => void;
}

export default function EditImageModal({
  isOpen,
  onClose,
  imageId,
  currentUrl,
  onSuccess,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(currentUrl);

  if (!isOpen) return null;

  const handleChoose = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpdate = async () => {
    if (!file) {
      toast.error("Hãy chọn ảnh mới!");
      return;
    }

    try {
      await productService.updateProductImageService(imageId, file);

      toast.success("Cập nhật ảnh thành công!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Cập nhật thất bại!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[420px] relative shadow">
        <button
          className="absolute right-3 top-3 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-3">Cập nhật ảnh</h2>

        <img
          src={preview}
          alt=""
          className="w-40 h-40 rounded border mx-auto object-cover"
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleChoose}
          className="mt-3"
        />

        <button
          onClick={handleUpdate}
          className="mt-4 bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
        >
          Cập nhật
        </button>
      </div>
    </div>
  );
}
