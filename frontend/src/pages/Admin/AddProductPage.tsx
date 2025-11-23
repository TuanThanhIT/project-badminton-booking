import React, { useState, useEffect } from "react";
import { Save, X, Package2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FormCreateProductSchema } from "../../schemas/FormCreateProductSchema";

import categoryService from "../../services/admin/categoryService";
import productService from "../../services/admin/productService";
const AddProductPage: React.FC = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<
    { id: number; cateName: string }[]
  >([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    productName: "",
    brand: "",
    description: "",
    thumbnail: null as File | null,
    categoryId: "",
  });

  // Load categories
  useEffect(() => {
    categoryService
      .getSimpleCategoriesService()
      .then((res) => {
        setCategories(res.data.data);
      })
      .catch((err) => {
        console.error("Error loading categories:", err);
      });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, thumbnail: file });
    if (errors.thumbnail) {
      setErrors({ ...errors, thumbnail: "" });
    }
  };

  const validateForm = () => {
    try {
      FormCreateProductSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Record<string, string> = {};

      if (error.errors) {
        error.errors.forEach((err: any) => {
          const fieldName = err.path[0];
          if (fieldName && typeof fieldName === "string") {
            fieldErrors[fieldName] = err.message;
          }
        });
      }

      setErrors(fieldErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      alert("Vui lòng kiểm tra lại thông tin!");
      return;
    }
    setLoading(true);

    try {
      let res;
      if (!formData.thumbnail) {
        res = await productService.createProductService({
          productName: formData.productName,
          brand: formData.brand,
          description: formData.description,
          categoryId: Number(formData.categoryId),
        });
      } else {
        const fd = new FormData();
        fd.append("productName", formData.productName);
        fd.append("brand", formData.brand);
        fd.append("description", formData.description);
        fd.append("categoryId", formData.categoryId);
        fd.append("thumbnail", formData.thumbnail);

        res = await productService.createProductWithFileService(fd);
      }

      alert("Product created successfully!");
      navigate("/admin/products");
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Failed to create product!";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/products");
  };

  return (
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package2 className="text-blue-500" /> Add New Product
          </h1>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X size={16} /> Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              <Save size={16} /> {loading ? "Saving..." : "Save Product"}
            </button>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Product Name
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                  errors.productName
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200"
                }`}
                placeholder="Enter product name"
              />
              {errors.productName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.productName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                  errors.brand
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200"
                }`}
                placeholder="Enter brand"
              />
              {errors.brand && (
                <p className="text-red-500 text-xs mt-1">{errors.brand}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 resize-none ${
                errors.description
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
              placeholder="Enter description (min 10 characters)"
            ></textarea>
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Thumbnail
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              {formData.thumbnail && (
                <p className="text-green-600 text-xs mt-1">
                  ✓ Selected: {formData.thumbnail.name}
                </p>
              )}
              {errors.thumbnail && (
                <p className="text-red-500 text-xs mt-1">{errors.thumbnail}</p>
              )}
            </div>

            {/* CATEGORY SELECT */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Category
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                  errors.categoryId
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200"
                }`}
              >
                <option value="">Select Category</option>
                {categories.map((cate) => (
                  <option key={cate.id} value={cate.id}>
                    {cate.cateName}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;
