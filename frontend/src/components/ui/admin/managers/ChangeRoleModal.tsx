import { useState } from "react";
import { X, ArrowLeftRight, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import adminManagerService from "../../../../services/admin/managerService";
import type { AdminManager } from "../../../../types/admin";

type ChangeRoleModalProps = {
  manager: AdminManager;
  onClose: () => void;
  onSuccess: () => void;
};

const ChangeRoleModal = ({ manager, onClose, onSuccess }: ChangeRoleModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleDowngrade = async () => {
    setLoading(true);
    try {
      await adminManagerService.changeUserRoleService(manager.id, { newRole: "USER" });
      toast.success("Đã đổi về role USER");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-orange-500" />
            <h2 className="text-sm font-bold text-gray-800">Thay đổi Role</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-200 flex items-center justify-center transition">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-orange-800">Thu hồi quyền Manager</p>
              <p className="text-xs text-orange-600 mt-0.5">
                Tài khoản <strong>@{manager.username}</strong> sẽ bị hạ xuống role USER.
                {manager.managedBranches.length > 0 && " Tất cả quyền quản lý chi nhánh sẽ bị thu hồi."}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
              Hủy
            </button>
            <button onClick={handleDowngrade} disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 disabled:opacity-60 transition">
              {loading ? "Đang xử lý..." : "Xác nhận thu hồi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeRoleModal;
