import React, { useRef } from "react";
import { Camera, Save, Sparkles, X } from "lucide-react";

interface EditProfileModalProps {
  form: any;
  setForm: (form: any) => void;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
  isSaving: boolean;
}

const inputClass =
  "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-sky-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-100";

const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  form,
  setForm,
  onSave,
  onClose,
  isSaving,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm({
      ...form,
      file,
      avatar: URL.createObjectURL(file),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
              <Sparkles size={21} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Cập nhật hồ sơ
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Chỉnh sửa thông tin cá nhân và ảnh đại diện.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSave} className="space-y-5 p-5">
          <div className="flex flex-col items-center">
            <div className="group relative">
              <img
                src={
                  form.avatar ||
                  "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                }
                alt="avatar"
                className="h-24 w-24 rounded-3xl border border-slate-200 object-cover shadow-sm"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sky-700 shadow-lg transition hover:border-sky-300 hover:bg-sky-50"
              >
                <Camera size={18} />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div>
            <label className={labelClass}>Họ và tên</label>
            <input
              value={form.fullName || ""}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Nhập họ và tên"
              className={inputClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Ngày sinh</label>
              <input
                type="date"
                value={form.dob ? form.dob.split("T")[0] : ""}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Giới tính</label>
              <select
                value={form.gender || "male"}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className={inputClass}
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Số điện thoại</label>
              <input
                value={form.phoneNumber || ""}
                onChange={(e) =>
                  setForm({ ...form, phoneNumber: e.target.value })
                }
                placeholder="Nhập số điện thoại"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Địa chỉ</label>
              <input
                value={form.address || ""}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Nhập địa chỉ"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
