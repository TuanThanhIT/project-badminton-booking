import { useState } from "react";
import { X, UserCheck, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import adminManagerService from "../../../../services/admin/managerService";
import adminUserService from "../../../../services/admin/userService";
import type { AdminBranchOption } from "../../../../types/admin";

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

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.username.trim())    errs.username = "Không được để trống";
    if (!form.email.trim())       errs.email    = "Không được để trống";
    if (form.password.length < 6) errs.password = "Tối thiểu 6 ký tự";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await adminUserService.createManagerService(form);
      const newManagerId = (res.data as any).data?.id;
      if (branchId && newManagerId) {
        await adminManagerService.assignManagerService(Number(branchId), { managerId: newManagerId });
        toast.success("Tạo Manager và gán chi nhánh thành công");
      } else {
        toast.success("Tạo tài khoản Manager thành công");
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-sky-50 to-white rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center">
              <UserCheck className="w-4.5 h-4.5 text-sky-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800">Tạo tài khoản Manager</h2>
              <p className="text-xs text-gray-400">Role: MANAGER</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-200 flex items-center justify-center transition">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          {fields.map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={(e) => { setForm({ ...form, [key]: e.target.value }); setErrors({ ...errors, [key]: "" }); }}
                placeholder={placeholder}
                className={`w-full rounded-xl border px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400 transition ${errors[key] ? "border-red-400 bg-red-50" : "border-gray-300"}`}
              />
              {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
            </div>
          ))}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Gán chi nhánh <span className="font-normal text-gray-400">(tùy chọn)</span>
            </label>
            <div className="relative">
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400 bg-white appearance-none"
              >
                <option value="">-- Không gán ngay --</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.branchName}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
              Hủy
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-bold hover:bg-sky-700 disabled:opacity-60 transition shadow-sm">
              {loading ? "Đang tạo..." : "Tạo tài khoản"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateManagerModal;
