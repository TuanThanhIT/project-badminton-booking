import { useEffect, useState } from "react";
import WorkShiftEmployeeForm from "./WorkShiftEmployeeForm";
import type { WorkShiftEmployeeFormData } from "./WorkShiftEmployeeForm";
import workShiftEmployeeService from "../../../services/admin/workShiftEmployeeService";
import type { EmployeeItem } from "../../../types/user";
import employeeService from "../../../services/admin/usersService";
import { X, User } from "lucide-react";

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
    if (!isOpen) return;
    employeeService.getEmployeesService().then((res) => {
      setEmployees(res.data.data);
    });
  }, [isOpen]);

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
    setEmployeeId(null);
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
            Phân công nhân viên
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-200">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* ===== BODY ===== */}
        <div className="p-6 space-y-5">
          {/* Chọn nhân viên */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhân viên
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                className="
                  w-full rounded-lg border border-gray-300
                  pl-9 pr-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-400
                "
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
            </div>
          </div>

          {/* Form vai trò */}
          <WorkShiftEmployeeForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={onClose}
            mode="add"
          />
        </div>
      </div>
    </div>
  );
}
