import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../../../redux/hook";
import { requestCancelBooking } from "../../../../redux/slices/user/bookingSlice";
import { formatBookingCode } from "../../../../utils/booking";
import type { BookingItem } from "../../../../types/booking";

interface CancelBookingModalProps {
  booking: BookingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CancelBookingModal = ({
  booking,
  isOpen,
  onClose,
  onSuccess,
}: CancelBookingModalProps) => {
  const dispatch = useAppDispatch();
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.warning("Vui lòng nhập lý do hủy lịch sân");
      return;
    }

    if (!booking) return;

    try {
      setIsLoading(true);
      const response = await dispatch(
        requestCancelBooking({
          bookingId: booking.bookingId,
          data: { reason: reason.trim() },
          mode: booking.bookingStatus === "PENDING" ? "DIRECT" : "REQUEST",
        }),
      ).unwrap();

      const mode = response?.data?.mode;
      if (mode === "CANCELLED") {
        toast.success("Hủy lịch sân thành công");
      } else if (mode === "REQUESTED") {
        toast.success(
          "Đã gửi yêu cầu hủy lịch sân, vui lòng chờ nhân viên xác nhận",
        );
      } else {
        toast.success(response.message || "Yêu cầu hủy lịch sân thành công");
      }

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

  if (!isOpen || !booking) return null;
  const isPending = booking.bookingStatus === "PENDING";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">
            Yêu cầu hủy lịch sân
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

        <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Mã lịch sân
          </p>
          <p className="mt-1 font-mono text-lg font-semibold text-sky-700">
            {formatBookingCode(booking.bookingId, booking.createdAt)}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {isPending
              ? "Lịch đang chờ xác nhận nên sẽ được hủy trực tiếp."
              : "Lịch đã xác nhận nên yêu cầu hủy sẽ chờ nhân viên xử lý."}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700">
            Lý do hủy lịch sân <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do hủy lịch sân..."
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
            className="flex-1 rounded-2xl bg-red-500 py-3 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
          >
            {isLoading ? "Đang gửi..." : isPending ? "Hủy lịch" : "Gửi yêu cầu"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal;
