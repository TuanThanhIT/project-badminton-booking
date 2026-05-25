import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import adminUserService from "../../../../services/admin/userService";
import type { AdminManager } from "../../../../types/admin";

type DeleteManagerModalProps = {
  manager: AdminManager;
  onClose: () => void;
  onSuccess: () => void;
};

const DeleteManagerModal = ({ manager, onClose, onSuccess }: DeleteManagerModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await adminUserService.deleteUserService(manager.id);
      toast.success("Đã xóa tài khoản Manager");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200">
        <div className="p-6 space-y-5">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">Xóa tài khoản Manager?</h2>
              <p className="text-sm text-gray-500 mt-1">
                Tài khoản <strong className="text-gray-700">@{manager.username}</strong> sẽ bị xóa vĩnh viễn.
                {manager.managedBranches.length > 0 && (
                  <span className="text-red-600"> Các quyền quản lý chi nhánh sẽ bị thu hồi trước.</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
              Hủy
            </button>
            <button onClick={handleDelete} disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-60 transition">
              {loading ? "Đang xóa..." : "Xóa vĩnh viễn"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteManagerModal;
