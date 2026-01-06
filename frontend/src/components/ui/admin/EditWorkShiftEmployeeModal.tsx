import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { WorkShiftEmployee } from "../../../types/workShiftEmployee";
import workShiftEmployeeService from "../../../services/admin/workShiftEmployeeService";
import type { EditWorkShiftEmployeeFormData } from "./EditWorkShiftEmployeeForm";
import EditWorkShiftEmployeeForm from "./EditWorkShiftEmployeeForm";

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
  const [initialData, setInitialData] =
    useState<EditWorkShiftEmployeeFormData | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setInitialData({
      roleInShift: record.roleInShift,
      checkIn: record.checkIn ? record.checkIn.split(" ")[1] : "",
      checkOut: record.checkOut ? record.checkOut.split(" ")[1] : "",
    });
  }, [isOpen, record]);

  if (!isOpen || !initialData) return null;

  const handleSubmit = async (formData: EditWorkShiftEmployeeFormData) => {
    await workShiftEmployeeService.updateEmployeeInShiftService(record.id, {
      roleInShift: formData.roleInShift,
      checkIn: formData.checkIn || undefined,
      checkOut: formData.checkOut || undefined,
    });

    await onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* MODAL */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">
            Chỉnh sửa phân ca
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-200">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6">
          <EditWorkShiftEmployeeForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
