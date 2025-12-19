import { Modal } from "antd";
import { useEffect, useState } from "react";
import ProductForm from "./ProductForm";
import categoryService from "../../../services/admin/categoryService";
import productService from "../../../services/admin/productService";
import { FormCreateProductSchema } from "../../../schemas/FormCreateProductSchema";
import type { SimpleCategory } from "../../../types/category";
import type { ProductFormData } from "../../../types/formData";
import { toast } from "react-toastify";
import { ZodError } from "zod";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddProductModal = ({ open, onClose, onSuccess }: Props) => {
  const [categories, setCategories] = useState<SimpleCategory[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    productName: "",
    brand: "",
    description: "",
    thumbnail: null,
    preview: null,
    categoryId: "",
  });

  useEffect(() => {
    categoryService
      .getSimpleCategoriesService()
      .then((res) => setCategories(res.data.data));
  }, []);

  const handleChange = (e: any) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    setFormData((p) => ({
      ...p,
      thumbnail: file || null,
      preview: file ? URL.createObjectURL(file) : null,
    }));
  };

  const validate = () => {
    try {
      FormCreateProductSchema.parse(formData);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        const fe: any = {};
        err.issues.forEach((i) => (fe[i.path[0]] = i.message));
        setErrors(fe);
      }
      return false;
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("productName", formData.productName);
      fd.append("brand", formData.brand);
      fd.append("description", formData.description);
      fd.append("categoryId", formData.categoryId);
      if (formData.thumbnail) fd.append("thumbnail", formData.thumbnail);

      await productService.createProductWithFileService(fd);
      toast.success("Tạo sản phẩm thành công!");
      onSuccess();
      onClose();
    } catch {
      toast.error("Tạo sản phẩm thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      destroyOnClose
      maskClosable={false}
    >
      <ProductForm
        title="➕ Thêm sản phẩm mới"
        formData={formData}
        errors={errors}
        categories={categories}
        loading={loading}
        onChange={handleChange}
        onFileChange={handleFileChange}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default AddProductModal;
