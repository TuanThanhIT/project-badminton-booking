import React, { useState, useEffect } from "react";
import IconButton from "./IconButton";
import { Save, X } from "lucide-react";

export type WorkShiftEmployeeFormData = {
  roleInShift: "Staff" | "Cashier";
};

type Props = {
  initialData: WorkShiftEmployeeFormData;
  onSubmit: (data: WorkShiftEmployeeFormData) => Promise<void> | void;
  onCancel: () => void;
  mode: "add" | "edit";
};

export default function WorkShiftEmployeeForm({
  initialData,
  onSubmit,
  onCancel,
  mode,
}: Props) {
  const [form, setForm] = useState(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="font-medium">Vai trò</label>
        <select
          value={form.roleInShift}
          onChange={(e) =>
            setForm({ ...form, roleInShift: e.target.value as any })
          }
          className="w-full border p-2 rounded"
        >
          <option value="Staff">Staff</option>
          <option value="Cashier">Cashier</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <IconButton
          icon={X}
          text="Hủy"
          onClick={onCancel}
          color="bg-white"
          border="border"
        />
        <IconButton
          icon={Save}
          text={loading ? "Đang lưu..." : mode === "add" ? "Thêm" : "Lưu"}
          type="submit"
          color="bg-blue-500"
          loading={loading}
        />
      </div>
    </form>
  );
}
