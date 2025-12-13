import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductForm from "../../components/commons/admin/ProductForm";
import categoryService from "../../services/Admin/categoryService";
import productService from "../../services/Admin/productService";
import { FormCreateProductSchema } from "../../schemas/FormCreateProductSchema";
import type { SimpleCategory } from "../../types/category";
import type { ProductFormData } from "../../types/formData";
import { toast } from "react-toastify";
import { ZodError } from "zod";

const AddProductPage = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<SimpleCategory[]>([]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    productName: "",
    brand: "",
    description: "",
    thumbnail: null,
    categoryId: "",
  });

  // Load categories
  useEffect(() => {
    categoryService
      .getSimpleCategoriesService()
      .then((res) => {
        setCategories(res.data.data);
      })
      .catch((err) => console.error(err));
  }, []);

  // Handle text/select change
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
      preview: file ? URL.createObjectURL(file) : null,
    }));
  };

  // Validate form
  const validateForm = () => {
    try {
      FormCreateProductSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};

        error.issues.forEach((issue) => {
          const fieldName = issue.path[0];
          if (typeof fieldName === "string") {
            fieldErrors[fieldName] = issue.message;
          }
        });

        setErrors(fieldErrors);
        return false;
      }

      console.error("Unknown validation error:", error);
      return false;
    }
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Thông tin không hợp lệ!");
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

      //alert("Tạo sản phẩm thành công!");
      toast.success("Tạo sản phẩm thành công!");
      navigate("/admin/products");
    } catch (error: any) {
      //alert(error.response?.data?.message || "Tạo sản phẩm thất bại!");
      toast.error(error.response?.data?.message || "Tạo sản phẩm thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // Cancel
  const handleCancel = () => {
    navigate("/admin/products");
  };

  return (
    <ProductForm
      title="Add New Product"
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

export default AddProductPage;
