import type { ReactNode } from "react";

type AdminConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass: string;
  icon?: ReactNode;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const AdminConfirmModal = ({
  open,
  title,
  message,
  confirmLabel,
  confirmClass,
  icon,
  loading,
  onConfirm,
  onCancel,
}: AdminConfirmModalProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="text-base font-bold text-gray-800">{title}</h3>
        </div>
        <p className="text-sm text-gray-600">{message}</p>
        <div className="flex gap-2 justify-end pt-1">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition disabled:opacity-50 ${confirmClass}`}
          >
            {loading ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminConfirmModal;
