import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { X, Save } from "lucide-react";
import IconButton from "./IconButton";

import { FormCreateCourtSchema } from "../../../schemas/FormCreateCourtSchema";
import type { CreateCourtRequest, CourtItem } from "../../../types/court";

interface CourtFormPropsAdd {
  mode: "add";
  initialData: CreateCourtRequest;
  onSubmit: (data: CreateCourtRequest) => Promise<void>;
  onCancel?: () => void;
}

interface CourtFormPropsEdit {
  mode: "edit";
  initialData: CourtItem;
  onSubmit: (data: Partial<CourtItem> & { file?: File }) => Promise<void>;
  onCancel?: () => void;
}

type Props = CourtFormPropsAdd | CourtFormPropsEdit;

export default function CourtForm({
  initialData,
  onSubmit,
  onCancel,
  mode,
}: Props) {
  const [form, setForm] = useState<any>(initialData);
  const [file, setFile] = useState<File | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const parsed = FormCreateCourtSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((err) => {
        fieldErrors[String(err.path[0])] = err.message;
      });

      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      await onSubmit({
        ...form,
        ...(file ? { file } : {}), // gửi file nếu có
      });
    } catch (err) {
      toast.error("Lỗi khi xử lý sân");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* name */}
        <div className="md:col-span-2">
          <label className="font-medium">Tên sân</label>
          <input
            type="text"
            name="name"
            placeholder="Tên sân..."
            value={form.name || ""}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        {/* location */}
        <div className="md:col-span-2">
          <label className="font-medium">Vị trí</label>
          <input
            type="text"
            name="location"
            placeholder="Vị trí sân..."
            value={form.location || ""}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          {errors.location && (
            <p className="text-red-500 text-sm">{errors.location}</p>
          )}
        </div>

        {/* thumbnail upload */}
        <div className="md:col-span-2">
          <label className="font-medium">Ảnh sân (thumbnail)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border rounded p-2"
          />
        </div>
        {file ? (
          <div className="flex justify-center">
            <img
              src={URL.createObjectURL(file)}
              className="w-32 h-32 object-cover rounded-lg mt-4 border border-blue-300"
              alt="New Preview"
            />
          </div>
        ) : (
          // Nếu chưa chọn ảnh mới thì hiển thị ảnh cũ
          mode === "edit" &&
          "thumbnailUrl" in initialData &&
          initialData.thumbnailUrl && (
            <div className="flex justify-center">
              <img
                src={initialData.thumbnailUrl}
                className="w-32 h-32 object-cover rounded-lg mt-4 border border-blue-300"
                alt="Old Preview"
              />
            </div>
          )
        )}
      </div>

      <div className="flex justify-end gap-3 mt-4">
        {onCancel && (
          <IconButton
            type="button"
            icon={X}
            text="Hủy"
            onClick={onCancel}
            color="bg-white"
            border="border border-gray-300"
            textColor="text-gray-700"
          />
        )}

        <IconButton
          type="submit"
          icon={Save}
          text={loading ? "Đang lưu..." : mode === "add" ? "Thêm" : "Lưu"}
          loading={loading}
          color="bg-blue-500"
          hoverColor="hover:bg-blue-700"
        />
      </div>
    </form>
  );
}
