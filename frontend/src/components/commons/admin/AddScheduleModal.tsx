import React from "react";
import ScheduleForm from "./ScheduleForm";
import courtService from "../../../services/admin/courtService";
import type {
  CreateWeeklySlotsForm,
  CreateWeeklySlotsRequest,
} from "../../../types/court";

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

  const initial: CreateWeeklySlotsForm = {
    startDate: "",
  };

  const handleSubmit = async (data: CreateWeeklySlotsForm) => {
    const payload: CreateWeeklySlotsForm = {
      ...data,
    };

    await courtService.createWeeklySlotsService(payload);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Thêm lịch sân</h2>

        <ScheduleForm
          initialData={initial}
          mode="add"
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
