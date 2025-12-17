import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { X, Save } from "lucide-react";
import IconButton from "./IconButton";
import type { CreateCourtPriceRequest } from "../../../types/court";

interface Props {
  initialData: CreateCourtPriceRequest;
  onSubmit: (data: CreateCourtPriceRequest) => Promise<void>;
  onCancel?: () => void;
}

const DAYS_OF_WEEK = [
  { label: "Thứ hai", value: "Monday" },
  { label: "Thứ ba", value: "Tuesday" },
  { label: "Thứ tư", value: "Wednesday" },
  { label: "Thứ năm", value: "Thursday" },
  { label: "Thứ sáu", value: "Friday" },
  { label: "Thứ bảy", value: "Saturday" },
  { label: "Chủ nhật", value: "Sunday" },
];

const PERIOD_TYPES = [
  { label: "Ban ngày", value: "Daytime" },
  { label: "Ban đêm", value: "Evening" },
  { label: "Cuối tuần", value: "Weekend" },
];

const HOURS = Array.from(
  { length: 16 },
  (_, i) => `${(i + 7).toString().padStart(2, "0")}:00`
);

export default function CourtPriceForm({
  initialData,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<CreateCourtPriceRequest>(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.dayOfWeek || !form.startTime || !form.endTime) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (form.startTime >= form.endTime) {
      toast.error("Giờ kết thúc phải lớn hơn giờ bắt đầu");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(form);
      toast.success("Tạo giá sân thành công");
    } catch {
      toast.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Thứ */}
        <div>
          <label className="block mb-1 font-medium">Thứ trong tuần</label>
          <select
            name="dayOfWeek"
            value={form.dayOfWeek}
            onChange={handleChange}
            className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-green-400"
          >
            {DAYS_OF_WEEK.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Loại khung */}
        <div>
          <label className="block mb-1 font-medium">Loại khung giờ</label>
          <select
            name="periodType"
            value={form.periodType}
            onChange={handleChange}
            className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-green-400"
          >
            {PERIOD_TYPES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Giờ */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Giờ bắt đầu</label>
          <select
            name="startTime"
            value={form.startTime}
            onChange={handleChange}
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="">-- Chọn giờ --</option>
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Giờ kết thúc</label>
          <select
            name="endTime"
            value={form.endTime}
            onChange={handleChange}
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="">-- Chọn giờ --</option>
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Giá */}
      <div>
        <label className="block mb-1 font-medium">Giá (VNĐ)</label>
        <input
          type="number"
          min={0}
          name="price"
          value={form.price}
          onChange={handleChange}
          className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-green-400"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
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
          text={loading ? "Đang lưu..." : "Thêm giá"}
          loading={loading}
          color="bg-green-500"
          hoverColor="hover:bg-green-600"
        />
      </div>
    </form>
  );
}
