import React, { useState } from "react";
import { toast } from "react-toastify";
import { Save, X } from "lucide-react";

import IconButton from "./IconButton";
import workShiftService from "../../../services/admin/workShiftService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddWorkShiftModal({
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [workDate, setWorkDate] = useState("");
  const [shiftWage, setShiftWage] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workDate || shiftWage <= 0) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      await workShiftService.createWorkShiftService({
        workDate,
        shiftWage,
      });
      toast.success("Tạo ca làm việc thành công!");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Tạo ca thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Tạo ca làm việc</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="font-medium">Ngày làm việc</label>
            <input
              type="date"
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="font-medium">Lương / ca</label>
            <input
              type="number"
              value={shiftWage}
              onChange={(e) => setShiftWage(Number(e.target.value))}
              className="w-full border rounded p-2"
              placeholder="VD: 150000"
            />
          </div>

          <p className="text-sm text-gray-500 italic">
            Hệ thống sẽ tự tạo 3 ca:
            <br />• 07:00 – 12:00
            <br />• 12:00 – 17:00
            <br />• 17:00 – 22:00
          </p>

          <div className="flex justify-end gap-3">
            <IconButton
              type="button"
              icon={X}
              text="Hủy"
              onClick={onClose}
              color="bg-white"
              border="border border-gray-300"
              textColor="text-gray-700"
            />
            <IconButton
              type="submit"
              icon={Save}
              text={loading ? "Đang tạo..." : "Tạo ca"}
              loading={loading}
              color="bg-blue-500"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
