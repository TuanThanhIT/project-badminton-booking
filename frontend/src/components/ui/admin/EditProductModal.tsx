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
  productId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditProductModal = ({ open, productId, onClose, onSuccess }: Props) => {
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

  /* ---------- LOAD CATEGORIES ---------- */
  useEffect(() => {
    categoryService
      .getSimpleCategoriesService()
      .then((res) => setCategories(res.data.data))
      .catch(() => toast.error("Không tải được danh mục"));
  }, []);

  /* ---------- LOAD PRODUCT DETAIL ---------- */
  useEffect(() => {
    if (!productId) return;

    productService
      .getProductDetailService(productId)
      .then((res) => {
        const p = res.data.data;
        setFormData({
          productName: p.productName,
          brand: p.brand,
          description: p.description,
          thumbnail: null,
          preview: p.thumbnailUrl,
          categoryId: String(p.categoryId),
        });
      })
      .catch(() => {
        toast.error("Không tải được thông tin sản phẩm");
        onClose();
      });
  }, [productId, onClose]);

  /* ---------- HANDLERS ---------- */
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      thumbnail: file,
      preview: file ? URL.createObjectURL(file) : prev.preview,
    }));
  };

  /* ---------- VALIDATE ---------- */
  const validateForm = () => {
    try {
      FormCreateProductSchema.parse(formData);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        const fe: Record<string, string> = {};
        err.issues.forEach((i) => {
          if (typeof i.path[0] === "string") {
            fe[i.path[0]] = i.message;
          }
        });
        setErrors(fe);
      }
      return false;
    }
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Thông tin không hợp lệ!");
      return;
    }

    setLoading(true);
    try {
      if (!formData.thumbnail) {
        await productService.updateProductService(productId!, {
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

        await productService.updateProductWithFileService(productId!, fd);
      }

      toast.success("Cập nhật sản phẩm thành công!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- RENDER ---------- */
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={900}
      centered
      maskClosable={false}
    >
      <ProductForm
        title="✏️ Chỉnh sửa sản phẩm"
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

export default EditProductModal;
