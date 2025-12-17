import React, { useState } from "react";
import WorkShiftEmployeeForm from "./WorkShiftEmployeeForm";
import type { WorkShiftEmployeeFormData } from "./WorkShiftEmployeeForm";
import workShiftEmployeeService from "../../../services/admin/workShiftEmployeeService";
import type { EmployeeItem } from "../../../types/user";
import employeeService from "../../../services/admin/usersService";
import { useEffect } from "react";
type Props = {
  isOpen: boolean;
  onClose: () => void;
  workShiftId: number;
  onSuccess: () => Promise<void>;
};

export default function AddWorkShiftEmployeeModal({
  isOpen,
  onClose,
  workShiftId,
  onSuccess,
}: Props) {
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  useEffect(() => {
    const fetch = async () => {
      const res = await employeeService.getEmployeesService();
      setEmployees(res.data.data);
    };
    fetch();
  }, []);
  if (!isOpen) return null;

  const initialData: WorkShiftEmployeeFormData = {
    roleInShift: "Staff",
  };

  const handleSubmit = async (data: WorkShiftEmployeeFormData) => {
    if (!employeeId) return;

    await workShiftEmployeeService.assignEmployeeService({
      workShiftId,
      employeeId,
      roleInShift: data.roleInShift,
    });

    await onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Thêm nhân viên vào ca làm</h2>

        <select
          className="w-full border rounded px-3 py-2 mb-4"
          value={employeeId ?? ""}
          onChange={(e) => setEmployeeId(Number(e.target.value))}
        >
          <option value="">-- Chọn nhân viên --</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.Profile?.fullName ?? e.username}
            </option>
          ))}
        </select>

        <WorkShiftEmployeeForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={onClose}
          mode="add"
        />
      </div>
    </div>
  );
}
