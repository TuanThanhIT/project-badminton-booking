import React, { useRef } from "react";
import { Camera, X, Save } from "lucide-react";

interface EditProfileModalProps {
  form: any;
  setForm: (form: any) => void;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
  isSaving: boolean;
}

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
    if (file) {
      setForm({
        ...form,
        file,
        avatar: URL.createObjectURL(file),
      });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 relative">
        <h3 className="text-xl font-bold mb-5 text-sky-600 text-center">
          Cập nhật hồ sơ
        </h3>

        <form onSubmit={onSave} className="space-y-5">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative group">
              <img
                src={
                  form.avatar ||
                  "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                }
                alt="avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-sky-300 shadow-sm"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-full shadow transition"
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

          {/* Họ và tên */}
          <div>
            <label className="block text-gray-600 text-sm mb-1">
              Họ và tên
            </label>
            <input
              value={form.fullName || ""}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Nhập họ và tên"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          {/* Hàng 2 cột */}
          <div className="grid grid-cols-2 gap-4">
            {/* Ngày sinh */}
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Ngày sinh
              </label>
              <input
                type="date"
                value={form.dob ? form.dob.split("T")[0] : ""}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            {/* Giới tính */}
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Giới tính
              </label>
              <select
                value={form.gender || "male"}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </div>
          </div>

          {/* Hàng 2 cột tiếp theo */}
          <div className="grid grid-cols-2 gap-4">
            {/* Số điện thoại */}
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Số điện thoại
              </label>
              <input
                value={form.phoneNumber || ""}
                onChange={(e) =>
                  setForm({ ...form, phoneNumber: e.target.value })
                }
                placeholder="Nhập số điện thoại"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            {/* Địa chỉ */}
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Địa chỉ
              </label>
              <input
                value={form.address || ""}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Nhập địa chỉ"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`px-4 py-2 text-sm flex items-center gap-2 rounded-lg text-white font-medium transition ${
                isSaving
                  ? "bg-sky-400 cursor-not-allowed"
                  : "bg-sky-500 hover:bg-sky-600"
              }`}
            >
              <Save size={16} />
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>

        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-xl"
        >
          <X size={22} />
        </button>
      </div>
    </div>
  );
};

export default EditProfileModal;
