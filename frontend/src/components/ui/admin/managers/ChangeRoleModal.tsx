import { useState } from "react";
import { ArrowLeftRight, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import adminManagerService from "../../../../services/admin/managerService";
import type { AdminManager } from "../../../../types/admin";
import AdminModal, {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "../AdminModal";

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
    <AdminModal
      title="Thay đổi Role"
      description="Thu hồi quyền quản lý của tài khoản này."
      icon={<ArrowLeftRight className="h-5 w-5 text-orange-500" />}
      onClose={onClose}
      maxWidth="max-w-sm"
    >
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
              className={adminSecondaryButtonClass}>
              Hủy
            </button>
            <button onClick={handleDowngrade} disabled={loading}
              className={`${adminPrimaryButtonClass} bg-orange-500 hover:bg-orange-600`}>
              {loading ? "Đang xử lý..." : "Xác nhận thu hồi"}
            </button>
          </div>
        </div>
    </AdminModal>
  );
};

export default ChangeRoleModal;
