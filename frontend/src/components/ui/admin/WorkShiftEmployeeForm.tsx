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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ===== ROLE ===== */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Vai trò trong ca
        </label>
        <select
          value={form.roleInShift}
          onChange={(e) =>
            setForm({ ...form, roleInShift: e.target.value as any })
          }
          className="
            w-full rounded-lg border border-gray-300 
            px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-sky-400
          "
        >
          <option value="Staff">Nhân viên</option>
          <option value="Cashier">Thu ngân</option>
        </select>
      </div>

      {/* ===== ACTIONS ===== */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {/* HỦY */}
        <IconButton
          type="button"
          icon={X}
          text="Hủy"
          onClick={onCancel}
          color="bg-white"
          border="border border-gray-300"
          textColor="text-gray-700"
        />

        {/* THÊM / LƯU */}
        <IconButton
          icon={Save}
          text={loading ? "Đang lưu..." : mode === "add" ? "Thêm" : "Lưu"}
          type="submit"
          color="bg-blue-500"
          hoverColor="hover:bg-blue-600"
          loading={loading}
        />
      </div>
    </form>
  );
}
