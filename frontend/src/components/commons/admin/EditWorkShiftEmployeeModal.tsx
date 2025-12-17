import React, { useEffect, useState } from "react";
import WorkShiftEmployeeForm from "./WorkShiftEmployeeForm";
import type {
  WorkShiftEmployeeFormData,
} from "./WorkShiftEmployeeForm";
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

  if (!isOpen) return null;
  if (!data) return <div className="p-4">Đang tải...</div>;
  const handleSubmit = async (formData: WorkShiftEmployeeFormData) => {
    await workShiftEmployeeService.updateEmployeeInShiftService(
      record.id,     
      formData
    );
    await onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Chỉnh sửa vai trò trong ca</h2>

        <WorkShiftEmployeeForm
          initialData={data}
          onSubmit={handleSubmit}
          onCancel={onClose}
          mode="edit"
        />
      </div>
    </div>
  );
}
