import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../../../redux/hook";
import { requestReturnOrder } from "../../../../redux/slices/user/orderSlice";
import type { RequestReturnOrderRequest } from "../../../../types/order";

interface ReturnOrderModalProps {
  orderId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ReturnOrderModal = ({
  orderId,
  isOpen,
  onClose,
  onSuccess,
}: ReturnOrderModalProps) => {
  const dispatch = useAppDispatch();
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.warning("Vui lòng nhập lý do trả hàng");
      return;
    }

    try {
      setIsLoading(true);
      const data: RequestReturnOrderRequest = { reason: reason.trim() };
      const response = await dispatch(
        requestReturnOrder({ orderId, data }),
      ).unwrap();

      toast.success(response.message || "Yêu cầu trả hàng thành công");
      setReason("");
      onClose();
      onSuccess?.();
    } catch (error) {
      const err = error as any;
      toast.error(
        err?.response?.data?.message || err?.message || "Có lỗi xảy ra",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">
            Yêu cầu trả hàng
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700">
            Lý do trả hàng <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do trả hàng..."
            maxLength={500}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-1 focus:ring-sky-100"
            rows={4}
          />
          <p className="mt-1 text-xs text-slate-400">
            {reason.length}/500 ký tự
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !reason.trim()}
            className="flex-1 rounded-2xl bg-orange-500 py-3 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {isLoading ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnOrderModal;
