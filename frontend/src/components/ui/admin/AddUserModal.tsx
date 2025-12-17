import { useState } from "react";
import { X, User, Mail, Lock } from "lucide-react";
import userService from "../../../services/admin/usersService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddUserModal({ isOpen, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
  });

  if (!isOpen) return null;

  const validate = () => {
    const newErr = { username: "", email: "", password: "" };
    let ok = true;

    if (!form.username.trim()) {
      newErr.username = "Không được bỏ trống";
      ok = false;
    }
    if (!form.email.trim()) {
      newErr.email = "Không được bỏ trống";
      ok = false;
    }
    if (!form.password.trim()) {
      newErr.password = "Không được bỏ trống";
      ok = false;
    }

    setErrors(newErr);
    return ok;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await userService.createUserService(form);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || "Tạo tài khoản thất bại");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* ===== OVERLAY ===== */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* ===== MODAL ===== */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">
            Thêm tài khoản người dùng
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-200">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* ===== BODY ===== */}
        <div className="p-6 space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên đăng nhập
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Nhập tên đăng nhập"
                className="
                  w-full rounded-lg border border-gray-300
                  pl-9 pr-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-400
                "
              />
            </div>
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          {/* Email (giữ nguyên tiếng Anh) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className="
                  w-full rounded-lg border border-gray-300
                  pl-9 pr-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-400
                "
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                className="
                  w-full rounded-lg border border-gray-300
                  pl-9 pr-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-400
                "
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
