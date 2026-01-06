import { useEffect, useState } from "react";
import IconButton from "./IconButton";
import { Save, X } from "lucide-react";

export type EditWorkShiftEmployeeFormData = {
  roleInShift: "Staff" | "Cashier";
  checkIn?: string;
  checkOut?: string;
};

type Props = {
  initialData: EditWorkShiftEmployeeFormData;
  onSubmit: (data: EditWorkShiftEmployeeFormData) => Promise<void>;
  onCancel: () => void;
};

export default function EditWorkShiftEmployeeForm({
  initialData,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<EditWorkShiftEmployeeFormData>(initialData);
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
            setForm({
              ...form,
              roleInShift: e.target.value as any,
            })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-400"
        >
          <option value="staff">Nhân viên</option>
          <option value="cashier">Thu ngân</option>
        </select>
      </div>

      {/* ===== CHECK IN ===== */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Thời gian check-in
        </label>
        <input
          type="time"
          step={1}
          value={form.checkIn || ""}
          onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-400"
        />
      </div>

      {/* ===== CHECK OUT ===== */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Thời gian check-out
        </label>
        <input
          type="time"
          step={1}
          value={form.checkOut || ""}
          disabled={!form.checkIn}
          onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
          className={`w-full rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-400 ${
            !form.checkIn
              ? "bg-gray-100 border-gray-200 cursor-not-allowed"
              : "border border-gray-300"
          }`}
        />
        {!form.checkIn && (
          <p className="text-xs text-gray-500 mt-1">
            Cần check-in trước khi check-out
          </p>
        )}
      </div>

      {/* ===== ACTIONS ===== */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <IconButton
          type="button"
          icon={X}
          text="Hủy"
          onClick={onCancel}
          color="bg-white"
          border="border border-gray-300"
          textColor="text-gray-700"
        />

        <IconButton
          type="submit"
          icon={Save}
          text={loading ? "Đang lưu..." : "Lưu"}
          loading={loading}
          color="bg-blue-500"
          hoverColor="hover:bg-blue-600"
        />
      </div>
    </form>
  );
}
