import React, { useState } from "react";
import productService from "../../../services/admin/productService";
import { toast } from "react-toastify";

interface Props {
  productId: number;
}

const UploadProductImages: React.FC<Props> = ({ productId }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleChooseFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    setSelectedFiles(files);

    // Tạo preview
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(previews);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Hãy chọn ít nhất 1 ảnh!");
      return;
    }

    try {
      await productService.uploadProductImagesService(productId, selectedFiles);
      toast.success("Upload ảnh thành công!");

      // Clear sau khi upload
      setSelectedFiles([]);
      setPreviewUrls([]);
    } catch (error) {
      toast.error("Upload thất bại!");
      console.error(error);
    }
  };

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-semibold mb-3">Thêm ảnh sản phẩm</h2>

      <input
        type="file"
        multiple
        accept="image/*"
        className="mb-3"
        onChange={handleChooseFiles}
      />

      {/* Preview ảnh */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {previewUrls.map((url, index) => (
          <img
            key={index}
            src={url}
            alt=""
            className="w-28 h-28 object-cover rounded border"
          />
        ))}
      </div>

      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Upload ảnh
      </button>
    </div>
  );
};

export default UploadProductImages;
