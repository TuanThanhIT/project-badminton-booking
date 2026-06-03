import { useState } from "react";
import { UserCheck, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import adminManagerService from "../../../../services/admin/managerService";
import adminUserService from "../../../../services/admin/userService";
import type { AdminBranchOption } from "../../../../types/admin";
import AdminModal, {
  AdminField,
  adminInputClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "../AdminModal";
import { AdminCreateManagerFormSchema } from "../../../../schemas/AdminFormSchemas";

type CreateManagerModalProps = {
  branches: AdminBranchOption[];
  onClose: () => void;
  onSuccess: () => void;
};

const CreateManagerModal = ({ branches, onClose, onSuccess }: CreateManagerModalProps) => {
  const [form, setForm] = useState({
    username: "", email: "", password: "", fullName: "", phoneNumber: "",
  });
  const [branchId, setBranchId] = useState<number | "">("");
  const [loading, setLoading]   = useState(false);
  const [errors,  setErrors]    = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = AdminCreateManagerFormSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [issue.path[0], issue.message])));
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await adminUserService.createManagerService(parsed.data);
      const newManagerId = (res.data as any).data?.id;
      if (branchId && newManagerId) {
        await adminManagerService.assignManagerService(Number(branchId), { managerId: newManagerId });
        toast.success("Tạo tài khoản quản lý và gán chi nhánh thành công");
      } else {
        toast.success("Tạo tài khoản quản lý thành công");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra");
    } finally { setLoading(false); }
  };

  const fields = [
    { label: "Tên đăng nhập *", key: "username",    type: "text",     placeholder: "manager_abc" },
    { label: "Email *",         key: "email",        type: "email",    placeholder: "manager@email.com" },
    { label: "Mật khẩu *",      key: "password",     type: "password", placeholder: "Tối thiểu 6 ký tự" },
    { label: "Họ và tên",       key: "fullName",     type: "text",     placeholder: "Nguyễn Văn A" },
    { label: "Số điện thoại",   key: "phoneNumber",  type: "text",     placeholder: "0912345678" },
  ] as const;

  return (
    <AdminModal
      title="Tạo tài khoản quản lý"
      description="Vai trò: Quản lý"
      icon={<UserCheck className="h-5 w-5 text-sky-600" />}
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map(({ label, key, type, placeholder }) => (
              <AdminField key={key} label={label.replace(" *", "")} error={errors[key]}>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => { setForm({ ...form, [key]: e.target.value }); setErrors({ ...errors, [key]: "" }); }}
                  placeholder={placeholder}
                  className={`w-full ${adminInputClass}`}
                />
              </AdminField>
            ))}
          </div>

          <AdminField label="Gán chi nhánh">
            <p className="mb-1 text-xs text-slate-400">Tùy chọn</p>
            <div className="relative">
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value === "" ? "" : Number(e.target.value))}
                className={`w-full appearance-none ${adminInputClass}`}
              >
                <option value="">Không gán ngay</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.branchName}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </AdminField>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={onClose}
              className={adminSecondaryButtonClass}>
              Hủy
            </button>
            <button type="submit" disabled={loading}
              className={adminPrimaryButtonClass}>
              {loading ? "Đang tạo..." : "Tạo tài khoản"}
            </button>
          </div>
        </form>
    </AdminModal>
  );
};

export default CreateManagerModal;
