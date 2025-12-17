import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { X, Save } from "lucide-react";
import IconButton from "./IconButton";

import { FormScheduleSchema } from "../../../schemas/FormScheduleSchema";
import type {
  CreateWeeklySlotsRequest,
  CreateWeeklySlotsForm,
} from "../../../types/court";

interface ScheduleFormPropsAdd {
  mode: "add";
  initialData: CreateWeeklySlotsForm;
  onSubmit: (data: CreateWeeklySlotsForm) => Promise<void>;
  onCancel?: () => void;
}

interface ScheduleFormPropsEdit {
  mode: "edit";
  initialData: CreateWeeklySlotsRequest;
  onSubmit: (data: Partial<CreateWeeklySlotsRequest>) => Promise<void>;
  onCancel?: () => void;
}

type Props = ScheduleFormPropsAdd | ScheduleFormPropsEdit;

export default function ScheduleForm({
  initialData,
  onSubmit,
  onCancel,
  mode,
}: Props) {
  const [form, setForm] = useState<any>(initialData);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const parsed = FormScheduleSchema.safeParse(form);
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
      await onSubmit(parsed.data); // ✅ DÒNG QUAN TRỌNG NHẤT
      toast.success(
        mode === "add" ? "Thêm lịch thành công" : "Cập nhật thành công"
      );
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="font-medium">Ngày bắt đầu</label>
          <input
            type="date"
            name="startDate"
            value={form.startDate || ""}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          {errors.startDate && (
            <p className="text-red-500 text-sm">{errors.startDate}</p>
          )}
        </div>
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
