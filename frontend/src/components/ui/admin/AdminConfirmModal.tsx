import type { ReactNode } from "react";
import {
  AdminModalOverlay,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "./AdminModal";

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
    <AdminModalOverlay>
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        </div>
        <p className="mt-3 text-sm text-slate-600">{message}</p>
        <div className="mt-5 flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            onClick={onCancel}
            disabled={loading}
            className={adminSecondaryButtonClass}
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`${adminPrimaryButtonClass} ${confirmClass}`}
          >
            {loading ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      </div>
    </AdminModalOverlay>
  );
};

export default AdminConfirmModal;
