import React from "react";
import { Save, X, CupSoda } from "lucide-react";
import IconButton from "./IconButton";

interface Props {
  title: string;
  formData: any;
  errors: Record<string, string>;
  loading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const BeverageForm: React.FC<Props> = ({
  title,
  formData,
  errors,
  loading,
  onChange,
  onFileChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <CupSoda className="text-blue-500" /> {title}
        </h1>

        <form onSubmit={onSubmit} className="space-y-6">
          <input
            name="name"
            placeholder="Tên đồ uống"
            value={formData.name}
            onChange={onChange}
            className="w-full border rounded-xl px-4 py-2"
          />
          {errors.name && <p className="text-red-500">{errors.name}</p>}

          <input
            name="price"
            type="number"
            placeholder="Giá"
            value={formData.price}
            onChange={onChange}
            className="w-full border rounded-xl px-4 py-2"
          />

          <input
            name="stock"
            type="number"
            placeholder="Số lượng tồn"
            value={formData.stock}
            onChange={onChange}
            className="w-full border rounded-xl px-4 py-2"
          />

          <input type="file" accept="image/*" onChange={onFileChange} />

          {formData.preview && (
            <img
              src={formData.preview}
              className="w-32 h-32 object-cover rounded border"
            />
          )}

          <div className="flex justify-end gap-3">
            <IconButton
              type="button"
              icon={X}
              text="Hủy"
              color="bg-white"
              textColor="text-gray-700"
              hoverColor="hover:bg-gray-100"
              border="border border-gray-300"
              onClick={onCancel}
            />
            <IconButton
              type="submit"
              icon={Save}
              text="Lưu"
              loading={loading}
              color="bg-blue-500"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default BeverageForm;
