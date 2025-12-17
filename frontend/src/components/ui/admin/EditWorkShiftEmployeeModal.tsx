import { useEffect, useState } from "react";
import { X } from "lucide-react";
import WorkShiftEmployeeForm from "./WorkShiftEmployeeForm";
import type { WorkShiftEmployeeFormData } from "./WorkShiftEmployeeForm";
import type { WorkShiftEmployee } from "../../../types/workShiftEmployee";
import workShiftEmployeeService from "../../../services/admin/workShiftEmployeeService";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  record: WorkShiftEmployee;
  onSuccess: () => Promise<void>;
};

export default function EditWorkShiftEmployeeModal({
  isOpen,
  onClose,
  record,
  onSuccess,
}: Props) {
  const [data, setData] = useState<WorkShiftEmployeeFormData | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setData({
      roleInShift: record.roleInShift,
    });
  }, [isOpen, record]);

  if (!isOpen || !data) return null;

  const handleSubmit = async (formData: WorkShiftEmployeeFormData) => {
    await workShiftEmployeeService.updateEmployeeInShiftService(
      record.id,
      formData
    );
    await onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* ===== OVERLAY ===== */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* ===== MODAL ===== */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">
            Chỉnh sửa vai trò
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-200">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* ===== BODY ===== */}
        <div className="p-6 space-y-5">
          <WorkShiftEmployeeForm
            initialData={data}
            onSubmit={handleSubmit}
            onCancel={onClose}
            mode="edit"
          />
        </div>
      </div>
    </div>
  );
}
