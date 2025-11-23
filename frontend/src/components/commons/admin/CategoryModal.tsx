import React, { useState } from "react";
import {
  FormCreateCategorySchema,
  type FormCreateCategory,
} from "../../../schemas/FormCreateCategorySchema";
import type { HandleCreateCategory } from "../../../types/category";
import { toast } from "react-toastify";
import categoryService from "../../../services/admin/categoryService";

const AddCategoryModal: React.FC<HandleCreateCategory> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [form, setForm] = useState<FormCreateCategory>({
    cateName: "",
    menuGroup: "",
  });
  const [errors, setErrors] = useState({ cateName: "", menuGroup: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
    } catch (error) {
      toast.error("Không thể thêm danh mục");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Thêm danh mục</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="font-medium text-gray-700">Tên danh mục</label>
            <input
              type="text"
              name="cateName"
              value={form.cateName}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1"
            />
            {errors.cateName && (
              <p className="text-red-500 text-sm mt-1">{errors.cateName}</p>
            )}
          </div>

          <div>
            <label className="font-medium text-gray-700">Nhóm menu</label>
            <input
              type="text"
              name="menuGroup"
              value={form.menuGroup}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1"
            />
            {errors.menuGroup && (
              <p className="text-red-500 text-sm mt-1">{errors.menuGroup}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg"
            >
              {loading ? "Đang thêm..." : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
