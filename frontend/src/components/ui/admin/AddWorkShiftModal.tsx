import React, { useState } from "react";
import { toast } from "react-toastify";
import { Save, X, CalendarDays, Banknote } from "lucide-react";

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
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Tạo ca làm việc thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* ===== OVERLAY ===== */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* ===== MODAL ===== */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        {/* ===== HEADER (CHUẨN) ===== */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">
            Tạo ca làm việc
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-200">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* ===== BODY ===== */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Ngày làm việc */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày làm việc
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                className="
                w-full rounded-lg border border-gray-300
                pl-9 pr-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-400
              "
              />
            </div>
          </div>

          {/* Lương mỗi ca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lương mỗi ca (VNĐ)
            </label>
            <div className="relative">
              <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={shiftWage}
                onChange={(e) => setShiftWage(Number(e.target.value))}
                placeholder="Ví dụ: 150000"
                className="
                w-full rounded-lg border border-gray-300
                pl-9 pr-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-400
              "
              />
            </div>
          </div>

          {/* Thông tin ca */}
          <div className="bg-gray-50 border rounded-lg p-3 text-sm text-gray-600">
            <p className="font-medium mb-1 text-gray-700">
              Hệ thống tự động tạo 3 ca:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>07:00 – 12:00</li>
              <li>12:00 – 17:00</li>
              <li>17:00 – 22:00</li>
            </ul>
          </div>

          {/* ===== ACTIONS ===== */}
          <div className="flex justify-end gap-3 pt-4 border-t">
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
              hoverColor="hover:bg-blue-600"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
