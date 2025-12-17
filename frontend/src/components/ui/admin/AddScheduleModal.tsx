import ScheduleForm from "./ScheduleForm";
import courtService from "../../../services/admin/courtService";
import type { CreateWeeklySlotsForm } from "../../../types/court";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddScheduleModal({
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  if (!isOpen) return null;

  const initial = { startDate: "" };

  const handleSubmit = async (data: CreateWeeklySlotsForm) => {
    await courtService.createWeeklySlotsService(data);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Thêm lịch sân</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-200">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6">
          <ScheduleForm
            initialData={initial}
            mode="add"
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
