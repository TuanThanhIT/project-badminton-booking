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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Tên sân
          </label>
          <input
            type="text"
            name="name"
            placeholder="Nhập tên sân"
            value={form.name || ""}
            onChange={handleChange}
            className="
          w-full rounded-lg border border-gray-300
          px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-sky-400
        "
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* location */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Vị trí sân
          </label>
          <input
            type="text"
            name="location"
            placeholder="Ví dụ: Tầng 2 – Khu A"
            value={form.location || ""}
            onChange={handleChange}
            className="
          w-full rounded-lg border border-gray-300
          px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-sky-400
        "
          />
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">{errors.location}</p>
          )}
        </div>

        {/* thumbnail upload */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Ảnh sân (thumbnail)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="
          w-full rounded-lg border border-gray-300
          px-3 py-2 text-sm
          file:mr-3 file:px-3 file:py-1
          file:rounded file:border-0
          file:bg-sky-50 file:text-sky-600
        "
          />
        </div>

        {/* Preview */}
        {file ? (
          <div className="md:col-span-2 flex justify-center">
            <img
              src={URL.createObjectURL(file)}
              className="
            w-36 h-36 object-cover rounded-xl
            border border-gray-300 shadow-sm
          "
              alt="New Preview"
            />
          </div>
        ) : (
          mode === "edit" &&
          "thumbnailUrl" in initialData &&
          initialData.thumbnailUrl && (
            <div className="md:col-span-2 flex justify-center">
              <img
                src={initialData.thumbnailUrl}
                className="
              w-36 h-36 object-cover rounded-xl
              border border-gray-300 shadow-sm
            "
                alt="Old Preview"
              />
            </div>
          )
        )}
      </div>

      {/* ACTION */}
      <div className="flex justify-end gap-3 pt-4 border-t">
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
