import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductForm from "../../components/ui/admin/ProductForm";
import categoryService from "../../services/Admin/categoryService";
import productService from "../../services/Admin/productService";
import { FormCreateProductSchema } from "../../schemas/FormCreateProductSchema";
import type { SimpleCategory } from "../../types/category";
import type { ProductFormData } from "../../types/formData";
import { toast } from "react-toastify";
import { ZodError } from "zod";

const EditProductPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Lấy ID từ URL

  const [categories, setCategories] = useState<SimpleCategory[]>([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    productName: "",
    brand: "",
    description: "",
    thumbnail: null,
    preview: null,
    categoryId: "",
  });

  // -------------------------
  // 1. Load categories
  // -------------------------
  useEffect(() => {
    categoryService
      .getSimpleCategoriesService()
      .then((res) => {
        setCategories(res.data.data);
      })
      .catch((err) => console.error(err));
  }, []);

  // -------------------------
  // 2. Load product detail
  // -------------------------
  useEffect(() => {
    if (!id) return;

    productService
      .getProductDetailService(Number(id))
      .then((res) => {
        const p = res.data.data;

        setFormData({
          productName: p.productName,
          brand: p.brand,
          description: p.description,
          thumbnail: null,
          preview: p.thumbnailUrl || null,
          categoryId: String(p.categoryId),
        });
      })
      .catch(() => {
        toast.error("Không load được thông tin sản phẩm!");
        navigate("/admin/products");
      });
  }, [id, navigate]);

  // -------------------------
  // 3. Handle Changes
  // -------------------------
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      thumbnail: file,
      preview: file ? URL.createObjectURL(file) : prev.preview,
    }));
  };

  // -------------------------
  // 4. Validate Form
  // -------------------------
  const validateForm = () => {
    try {
      FormCreateProductSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          const field = issue.path[0];
          if (typeof field === "string") fieldErrors[field] = issue.message;
        });
        setErrors(fieldErrors);
        return false;
      }
      return false;
    }
  };

  // -------------------------
  // 5. Submit Update
  // -------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Thông tin không hợp lệ!");
      return;
    }

    setLoading(true);

    try {
      let res;

      if (!formData.thumbnail) {
        // Update không đổi ảnh
        res = await productService.updateProductService(Number(id), {
          productName: formData.productName,
          brand: formData.brand,
          description: formData.description,
          categoryId: Number(formData.categoryId),
        });
      } else {
        // Update có đổi ảnh -> multipart
        const fd = new FormData();
        fd.append("productName", formData.productName);
        fd.append("brand", formData.brand);
        fd.append("description", formData.description);
        fd.append("categoryId", formData.categoryId);
        fd.append("thumbnail", formData.thumbnail);

        res = await productService.updateProductWithFileService(Number(id), fd);
      }

      toast.success("Cập nhật sản phẩm thành công!");
      navigate("/admin/products");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // 6. Cancel
  // -------------------------
  const handleCancel = () => navigate("/admin/products");

  return (
    <ProductForm
      title="Edit Product"
      formData={formData}
      errors={errors}
      categories={categories}
      loading={loading}
      onChange={handleChange}
      onFileChange={handleFileChange}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};

export default EditProductPage;
