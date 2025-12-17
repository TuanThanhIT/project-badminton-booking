import { useEffect, useState } from "react";
import courtService from "../../../services/admin/courtService";
import CourtForm from "./CourtForm";
import { X } from "lucide-react";

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
    <div className="fixed inset-0 z-100 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-xl w-full">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">
            Chỉnh sửa thông tin sân
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

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
