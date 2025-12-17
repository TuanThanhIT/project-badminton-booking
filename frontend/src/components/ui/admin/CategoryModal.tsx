import React, { useState } from "react";
import { X, Folder, Layers } from "lucide-react";
import {
  FormCreateCategorySchema,
  type FormCreateCategory,
} from "../../../schemas/FormCreateCategorySchema";
import type { HandleCreateCategory } from "../../../types/category";
import categoryService from "../../../services/admin/categoryService";
import { toast } from "react-toastify";

const AddCategoryModal: React.FC<HandleCreateCategory> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [form, setForm] = useState<FormCreateCategory>({
    cateName: "",
    menuGroup: "",
  });

  const [errors, setErrors] = useState({
    cateName: "",
    menuGroup: "",
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  /* ===== HANDLE CHANGE ===== */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ===== SUBMIT ===== */
  const handleSubmit = async () => {
    const parse = FormCreateCategorySchema.safeParse(form);
    if (!parse.success) {
      const fieldErrors: any = {};
      parse.error.issues.forEach((i) => {
        fieldErrors[i.path[0]] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({ cateName: "", menuGroup: "" });
    setLoading(true);

    try {
      await categoryService.createCategoryService(form);
      toast.success("Thêm danh mục thành công");
      onSuccess();
      onClose();
      setForm({ cateName: "", menuGroup: "" });
    } catch {
      toast.error("Không thể thêm danh mục");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* ===== OVERLAY ===== */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* ===== MODAL ===== */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Thêm danh mục</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-200">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* ===== BODY ===== */}
        <div className="p-6 space-y-4">
          {/* Tên danh mục */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên danh mục
            </label>
            <div className="relative">
              <Folder className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                name="cateName"
                value={form.cateName}
                onChange={handleChange}
                placeholder="Nhập tên danh mục"
                className="
                  w-full rounded-lg border border-gray-300
                  pl-9 pr-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-sky-400
                "
              />
            </div>
            {errors.cateName && (
              <p className="text-red-500 text-sm mt-1">{errors.cateName}</p>
            )}
          </div>

          {/* Nhóm menu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhóm menu
            </label>
            <div className="relative">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                name="menuGroup"
                value={form.menuGroup}
                onChange={handleChange}
                placeholder="Nhập nhóm menu"
                className="
                  w-full rounded-lg border border-gray-300
                  pl-9 pr-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-sky-400
                "
              />
            </div>
            {errors.menuGroup && (
              <p className="text-red-500 text-sm mt-1">{errors.menuGroup}</p>
            )}
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="
              px-4 py-2 rounded-lg text-white
              bg-sky-600 hover:bg-sky-700
              disabled:opacity-60
            "
          >
            {loading ? "Đang thêm..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCategoryModal;
