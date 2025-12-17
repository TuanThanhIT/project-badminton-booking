import React, { useEffect, useState } from "react";
import courtService from "../../../services/admin/courtService";
import CourtForm from "./CourtForm";

type EditCourtModalProps = {
  isOpen: boolean;
  onClose: () => void;
  courtId: number;
  onSuccess: () => Promise<void>;
};

export default function EditCourtModal({
  isOpen,
  onClose,
  courtId,
  onSuccess,
}: EditCourtModalProps) {
  const [court, setCourt] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetch = async () => {
      const res = await courtService.getCourtByIdService(courtId);
      setCourt(res.data.court);
    };
    fetch();
  }, [isOpen, courtId]);

  if (!isOpen) return null;
  if (!court) return <div className="p-4">Đang tải...</div>;

  const handleSubmit = async (data: any) => {
    await courtService.updateCourtService(courtId, data);

    await onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow max-w-xl w-full">
        <h2 className="text-xl font-bold mb-4">Chỉnh sửa thông tin sân</h2>

        <CourtForm
          initialData={court}
          onSubmit={handleSubmit}
          onCancel={onClose}
          mode="edit"
        />
      </div>
    </div>
  );
}
