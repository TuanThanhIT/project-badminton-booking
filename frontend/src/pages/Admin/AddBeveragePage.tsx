import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BeverageForm from "../../components/commons/admin/BeverageForm";
import beverageService from "../../services/admin/beverageService";
import { toast } from "react-toastify";
import type { BeverageFormData } from "../../types/beverage";

export default function AddBeveragePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState<BeverageFormData>({
    name: "",
    price: "",
    stock: "",
    file: null,
    preview: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      file,
      preview: URL.createObjectURL(file),
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      await beverageService.createBeverageService({
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock),
        file: formData.file ?? undefined,
      });

      toast.success("Thêm đồ uống thành công!");
      navigate("/admin/beverages");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Thêm thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BeverageForm
      title="Add Beverage"
      formData={formData}
      errors={errors}
      loading={loading}
      onChange={handleChange}
      onFileChange={handleFileChange}
      onSubmit={handleSubmit}
      onCancel={() => navigate("/admin/beverages")}
    />
  );
}
