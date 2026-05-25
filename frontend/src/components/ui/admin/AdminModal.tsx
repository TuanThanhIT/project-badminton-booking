import type { ReactNode } from "react";
import { X } from "lucide-react";

type AdminModalProps = {
  title: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
};

const AdminModal = ({
  title,
  icon,
  onClose,
  children,
  maxWidth = "max-w-lg",
}: AdminModalProps) => (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
    <div className={`bg-white rounded-2xl shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto border border-gray-200`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-base font-bold text-gray-800">{title}</h2>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg hover:bg-gray-200 flex items-center justify-center transition"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default AdminModal;
