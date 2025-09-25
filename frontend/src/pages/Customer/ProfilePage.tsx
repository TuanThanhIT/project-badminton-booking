import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import userService from "../../services/userService";
import type { ProfileRequest, ProfileResponse } from "../../types/user";
import EditProfileModal from "../../components/ui/EditProfileModal";
import type { ApiErrorType } from "../../types/error";

const ProfilePage = () => {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<ProfileRequest>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userService.getProfileService();
        setProfile(res.data);
        setForm(res.data);
      } catch (error: any) {
        const apiError = error as ApiErrorType;
        toast.error(apiError.userMessage);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await userService.updateProfileService(form);
      setIsOpen(false);
      toast.success("Cập nhật thông tin thành công");
      setProfile(res.data);
    } catch (error: any) {
      const apiError = error as ApiErrorType;
      toast.error(apiError.userMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      {/* Loading overlay */}
      <ToastContainer />
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        {/* Avatar + Tên */}
        <div className="flex flex-col items-center">
          <img
            src={profile.avatar}
            alt="Avatar"
            className="w-32 h-32 rounded-full object-cover shadow-md border-4 border-sky-200"
          />
          <h2 className="mt-4 text-2xl font-bold text-sky-700">
            {profile.fullName}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Tham gia từ{" "}
            {new Date(profile.createdDate).toLocaleDateString("vi-VN")}
          </p>
        </div>

        {/* Thông tin chi tiết */}
        <div className="mt-8 space-y-4">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Ngày sinh</span>
            <span className="font-medium">
              {new Date(profile.dob).toLocaleDateString("vi-VN")}
            </span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Giới tính</span>
            <span className="font-medium">
              {profile.gender === "male" ? "Nam" : "Nữ"}
            </span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Số điện thoại</span>
            <span className="font-medium">{profile.phoneNumber}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Địa chỉ</span>
            <span className="font-medium text-right max-w-[60%]">
              {profile.address}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Cập nhật lần cuối</span>
            <span className="font-medium">
              {new Date(profile.updatedDate).toLocaleDateString("vi-VN")}
            </span>
          </div>
        </div>

        {/* Nút chỉnh sửa */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setIsOpen(true)}
            className="px-6 py-2 rounded-full bg-sky-500 text-white font-medium shadow hover:bg-sky-600 transition cursor-pointer"
          >
            Chỉnh sửa hồ sơ
          </button>
        </div>

        {/* Modal */}
        {isOpen && (
          <EditProfileModal
            form={form}
            setForm={setForm}
            onSave={handleSave}
            onClose={() => setIsOpen(false)}
            isSaving={isSaving}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
