import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BeverageForm from "../../components/commons/admin/BeverageForm";
import beverageService from "../../services/admin/beverageService";
import { toast } from "react-toastify";

export default function EditBeveragePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: "",
    price: "",
    stock: "",
    file: null,
    preview: null,
  });

  useEffect(() => {
    beverageService.getBeverageByIdService(Number(id)).then((res) => {
      const b = res.data.beverage;
      setFormData({
        name: b.name,
        price: b.price,
        stock: b.stock,
        file: null,
        preview: b.thumbnailUrl,
      });
    });
  }, [id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      await beverageService.updateBeverageService(Number(id), formData);
      toast.success("Cập nhật thành công!");
      navigate("/admin/beverages");
    } catch {
      toast.error("Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BeverageForm
      title="Edit Beverage"
      formData={formData}
      errors={{}}
      loading={loading}
      onChange={(e) =>
        setFormData((p: any) => ({ ...p, [e.target.name]: e.target.value }))
      }
      onFileChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFormData((p: any) => ({
          ...p,
          file,
          preview: URL.createObjectURL(file),
        }));
      }}
      onSubmit={handleSubmit}
      onCancel={() => navigate("/admin/beverages")}
    />
  );
}
