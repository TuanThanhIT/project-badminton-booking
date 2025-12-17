import { useEffect, useState } from "react";
import beverageService from "../../../services/admin/beverageService";
import { toast } from "react-toastify";
import type { BeverageFormData } from "../../../types/beverage";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  beverageId?: number | null; // null = thêm mới
}

export default function BeverageModal({
  isOpen,
  onClose,
  onSuccess,
  beverageId,
}: Props) {
  const isEdit = Boolean(beverageId);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BeverageFormData>({
    name: "",
    price: "",
    stock: "",
    file: null,
    preview: null,
  });

  /* ================= RESET FORM ================= */
  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      stock: "",
      file: null,
      preview: null,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  /* ================= LOAD DATA WHEN EDIT ================= */
  useEffect(() => {
    if (!beverageId) {
      resetForm();
      return;
    }

    beverageService.getBeverageByIdService(beverageId).then((res) => {
      const b = res.data.beverage;
      setFormData({
        name: b.name,
        price: String(b.price),
        stock: String(b.stock),
        file: null,
        preview: b.thumbnailUrl,
      });
    });
  }, [beverageId]);

  if (!isOpen) return null;

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock),
        file: formData.file ?? undefined,
      };

      if (isEdit) {
        await beverageService.updateBeverageService(beverageId!, payload);
        toast.success("Cập nhật đồ uống thành công!");
      } else {
        await beverageService.createBeverageService(payload);
        toast.success("Thêm đồ uống thành công!");
      }

      onSuccess();
      handleClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Thao tác thất bại");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* ===== OVERLAY ===== */}
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      {/* ===== MODAL ===== */}
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
        {/* ===== HEADER (CHUẨN) ===== */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEdit ? "Chỉnh sửa đồ uống" : "Thêm đồ uống"}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-gray-200"
          >
            ✕
          </button>
        </div>

        {/* ===== BODY ===== */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tên */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tên đồ uống
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((p) => ({ ...p, name: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Giá */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Giá bán (VNĐ)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData((p) => ({ ...p, price: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Tồn kho */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Số lượng tồn kho
            </label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) =>
                setFormData((p) => ({ ...p, stock: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Ảnh */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Hình ảnh đồ uống
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                setFormData((p) => ({
                  ...p,
                  file,
                  preview: URL.createObjectURL(file),
                }));
              }}
              className="block w-full text-sm text-gray-600"
            />

            {formData.preview && (
              <div className="mt-3 flex justify-center">
                <img
                  src={formData.preview}
                  alt="preview"
                  className="w-28 h-28 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* ===== ACTIONS ===== */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-60"
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
