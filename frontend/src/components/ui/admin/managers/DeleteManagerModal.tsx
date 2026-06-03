import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import adminUserService from "../../../../services/admin/userService";
import type { AdminManager } from "../../../../types/admin";
import { showConfirmDialog } from "../../../../utils/confirmDialog";
import AdminModal, {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "../AdminModal";

type DeleteManagerModalProps = {
  manager: AdminManager;
  onClose: () => void;
  onSuccess: () => void;
};

const DeleteManagerModal = ({ manager, onClose, onSuccess }: DeleteManagerModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = await showConfirmDialog(
      "Xóa tài khoản quản lý?",
      `Tài khoản @${manager.username} sẽ bị xóa vĩnh viễn.${
        manager.managedBranches.length > 0
          ? " Các quyền quản lý chi nhánh sẽ bị thu hồi trước."
          : ""
      }`,
      "Xóa vĩnh viễn",
      "Hủy",
      "danger",
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      await adminUserService.deleteUserService(manager.id);
      toast.success("Đã xóa tài khoản quản lý");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra");
    } finally { setLoading(false); }
  };

  return (
    <AdminModal
      title="Xóa tài khoản quản lý?"
      description="Thao tác này không thể hoàn tác."
      icon={<Trash2 className="h-5 w-5 text-red-500" />}
      onClose={onClose}
      maxWidth="max-w-sm"
    >
        <div className="p-6 space-y-5">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">Xóa tài khoản quản lý?</h2>
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
              className={adminSecondaryButtonClass}>
              Hủy
            </button>
            <button onClick={handleDelete} disabled={loading}
              className={`${adminPrimaryButtonClass} bg-red-500 hover:bg-red-600`}>
              {loading ? "Đang xóa..." : "Xóa vĩnh viễn"}
            </button>
          </div>
        </div>
    </AdminModal>
  );
};

export default DeleteManagerModal;
