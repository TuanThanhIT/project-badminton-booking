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
      toast.error("Vui lòng chọn ảnh mới");
      return;
    }

    try {
      await productService.updateProductImageService(imageId, file);
      toast.success("Cập nhật hình ảnh thành công");
      onSuccess();
      onClose();
    } catch {
      toast.error("Cập nhật hình ảnh thất bại");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[420px] shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Cập nhật hình ảnh
        </h2>

        <img
          src={preview}
          alt=""
          className="w-40 h-40 mx-auto rounded-lg border object-cover"
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleChoose}
          className="mt-4 block w-full text-sm"
        />

        <button
          onClick={handleUpdate}
          className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
        >
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}
