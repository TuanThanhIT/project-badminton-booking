import React, { useState } from "react";
import userService from "../../../services/admin/usersService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddUserModal({ isOpen, onClose, onSuccess }: Props) {
  if (!isOpen) return null;

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

  const validate = () => {
    const newErr = { username: "", email: "", password: "" };
    let ok = true;

    if (!form.username.trim()) {
      newErr.username = "Không được bỏ trống!";
      ok = false;
    }
    if (!form.email.trim()) {
      newErr.email = "Không được bỏ trống!";
      ok = false;
    }
    if (!form.password.trim()) {
      newErr.password = "Không được bỏ trống!";
      ok = false;
    }

    setErrors(newErr);
    return ok;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await userService.createUserService({
        username: form.username,
        email: form.email,
        password: form.password,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi tạo user");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
        <h2 className="text-lg font-bold mb-4">Thêm User</h2>

        {/* 🔵 MARK: form UI */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="font-medium">Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1"
              placeholder="Nhập username..."
            />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="font-medium">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1"
              placeholder="Nhập email..."
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="font-medium">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1"
              placeholder="Nhập mật khẩu..."
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>
        </div>

        {/* 🔵 MARK: buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded"
          >
            Hủy
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
