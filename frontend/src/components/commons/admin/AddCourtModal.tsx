import React from "react";
import CourtForm from "./CourtForm";
import courtService from "../../../services/admin/courtService";
import type { CreateCourtRequest } from "../../../types/court";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCourtModal({ isOpen, onClose, onSuccess }: Props) {
  if (!isOpen) return null;

  const initial: CreateCourtRequest = {
    name: "",
    location: "",
    file: undefined,
  };

  const handleSubmit = async (data: CreateCourtRequest) => {
    await courtService.createCourtService(data);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-4">Thêm Sân</h2>

        <CourtForm
          initialData={initial}
          mode="add"
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
