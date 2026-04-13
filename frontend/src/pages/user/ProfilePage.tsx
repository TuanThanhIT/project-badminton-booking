import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  CalendarDays,
  Camera,
  FileText,
  Loader2,
  MapPin,
  Phone,
  Save,
  User,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import type { PostWithAuthor } from "../../types/post";
import PostCard from "./postList/PostCard";
import ProfileHeroBanner from "./components/ProfileHeroBanner";
import { getAllBranch } from "../../redux/slices/user/branchSlice";
import { getCourtsByIds } from "../../redux/slices/user/courtSlice";
import {
  getMyPosts,
  getMyProfile,
  updateMyProfile,
  uploadMyAvatar,
} from "../../redux/slices/user/profileSlice";
import { syncAuthUserProfile } from "../../redux/slices/user/authSlice";
import { deletePost, updatePost } from "../../redux/slices/user/postSlice";
import EditPostModal from "./postList/components/EditPostModal";

type EditTarget = {
  id: number;
  type: PostWithAuthor["type"];
  title: string;
  content?: string | null;
  formData?: any;
} | null;

type ProfileTab = "profile" | "posts";

const inputClass =
  "w-full mt-1.5 px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-shadow";

const labelClass = "text-xs font-medium text-gray-500 uppercase tracking-wide";

const tabBtnClass = (active: boolean) =>
  `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ` +
  (active
    ? "bg-sky-600 text-white shadow-sm"
    : "text-gray-600 hover:bg-gray-100");

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const branches = useAppSelector((state) => state.branch.branches);
  const courts = useAppSelector((state) => state.court.courts);
  const profile = useAppSelector((state) => state.profile.myProfile);
  const posts = useAppSelector((state) => state.profile.myPosts);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [tab, setTab] = useState<ProfileTab>("profile");
  const [showAvatarUrlField, setShowAvatarUrlField] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    gender: "male",
    dob: "",
    avatar: "",
  });

  const displayName = form.fullName.trim() || profile?.username || "Bạn";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const engagementStats = useMemo(
    () =>
      posts.reduce(
        (acc, p) => ({
          likes: acc.likes + (p.likesCount ?? 0),
          comments: acc.comments + (p.commentsCount ?? 0),
        }),
        { likes: 0, comments: 0 },
      ),
    [posts],
  );

  const fetchProfileAndPosts = async () => {
    if (!currentUser?.id) return;
    try {
      setLoading(true);
      await Promise.all([
        dispatch(getMyProfile()).unwrap(),
        dispatch(getMyPosts({ userId: currentUser.id })).unwrap(),
      ]);
    } catch {
      // middleware xử lý toast lỗi
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!profile) return;
    setForm({
      fullName: profile.profile?.fullName || "",
      phoneNumber: profile.profile?.phoneNumber || "",
      address: profile.profile?.address || "",
      gender: profile.profile?.gender || "male",
      dob: profile.profile?.dob
        ? new Date(profile.profile.dob).toISOString().slice(0, 10)
        : "",
      avatar: profile.profile?.avatar || "",
    });
  }, [profile]);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [form.avatar]);

  useEffect(() => {
    dispatch(getAllBranch());
    fetchProfileAndPosts();
  }, [currentUser?.id, dispatch]);

  useEffect(() => {
    const ids = posts
      .map((post) => {
        const formData = post.formData as
          | { location?: { courtId?: number } }
          | null
          | undefined;
        return formData?.location?.courtId;
      })
      .filter((courtId): courtId is number => Boolean(courtId && courtId > 0));
    if (ids.length > 0) dispatch(getCourtsByIds({ ids }));
  }, [dispatch, posts]);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh tối đa 5MB.");
      return;
    }
    try {
      setUploadingAvatar(true);
      const updated = await dispatch(uploadMyAvatar(file)).unwrap();
      dispatch(syncAuthUserProfile(updated));
      toast.success("Đã cập nhật ảnh đại diện");
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message;
      toast.error(msg || "Không thể tải ảnh lên");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const updated = await dispatch(
        updateMyProfile({
          data: {
            fullName: form.fullName.trim(),
            phoneNumber: form.phoneNumber.trim(),
            address: form.address.trim(),
            gender: form.gender as "male" | "female" | "other",
            dob: form.dob || null,
            avatar: form.avatar.trim() || null,
          },
        }),
      ).unwrap();
      dispatch(syncAuthUserProfile(updated));
      toast.success("Cập nhật hồ sơ thành công");
      setShowAvatarUrlField(false);
    } catch {
      // middleware xử lý toast lỗi
    } finally {
      setSaving(false);
    }
  };

  const handleSavePost = async (postId: number, payload: any) => {
    try {
      await dispatch(
        updatePost({
          postId,
          data: payload,
        }),
      ).unwrap();
      toast.success("Đã cập nhật bài đăng");
      setEditTarget(null);
      if (currentUser?.id) {
        await dispatch(getMyPosts({ userId: currentUser.id }));
      }
    } catch (error: any) {
      toast.error(error?.message || "Không thể cập nhật bài đăng");
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa bài đăng này?")) return;
    try {
      await dispatch(deletePost({ postId })).unwrap();
      toast.success("Đã xóa bài đăng");
      if (currentUser?.id) {
        await dispatch(getMyPosts({ userId: currentUser.id }));
      }
    } catch (error: any) {
      toast.error(error?.message || "Không thể xóa bài đăng");
    }
  };

  const branchInfoById = useMemo(
    () =>
      branches.reduce<
        Record<
          number,
          { branchName: string; address?: string; district?: string; city?: string }
        >
      >((acc, branch) => {
        acc[branch.id] = {
          branchName: branch.branchName,
          address: branch.address,
          district: branch.district,
          city: branch.city,
        };
        return acc;
      }, {}),
    [branches],
  );

  const courtNameById = useMemo(
    () =>
      courts.reduce<Record<number, string>>((acc, court) => {
        acc[court.id] = court.courtName;
        return acc;
      }, {}),
    [courts],
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-gray-500">
        <Loader2 className="w-9 h-9 text-sky-500 animate-spin" aria-hidden />
        <p className="text-sm">Đang tải hồ sơ…</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/90 via-white to-slate-50 pb-16">
      <input
        ref={avatarFileRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-hidden
        onChange={handleAvatarFileChange}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-12">
        <ProfileHeroBanner
          displayName={displayName}
          username={profile.username}
          postCount={profile.postCount}
          stats={engagementStats}
          avatarUrl={form.avatar}
          avatarLetter={avatarLetter}
          avatarLoadError={avatarLoadError}
          onAvatarImgError={() => setAvatarLoadError(true)}
          avatarBusy={uploadingAvatar}
          avatarOverlay={
            <button
              type="button"
              disabled={uploadingAvatar}
              onClick={() => avatarFileRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-white border border-gray-200 shadow-md text-sky-600 hover:bg-sky-50 transition-colors disabled:opacity-50"
              title="Chọn ảnh từ máy"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
          }
        />

        <div className="mt-8 flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
          {/* Cột trái: tab dọc */}
          <aside className="w-full lg:w-56 shrink-0 lg:sticky lg:top-24">
            <nav
              className="flex flex-row lg:flex-col gap-2 p-2 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-x-auto lg:overflow-visible"
              aria-label="Khu vực hồ sơ"
            >
              <button
                type="button"
                className={tabBtnClass(tab === "profile")}
                onClick={() => setTab("profile")}
              >
                <User className="w-5 h-5 shrink-0" strokeWidth={2} />
                <span>Hồ sơ</span>
              </button>
              <button
                type="button"
                className={tabBtnClass(tab === "posts")}
                onClick={() => setTab("posts")}
              >
                <FileText className="w-5 h-5 shrink-0" strokeWidth={2} />
                <span className="flex-1">Bài đăng</span>
                <span
                  className={`text-xs tabular-nums px-2 py-0.5 rounded-lg ${
                    tab === "posts" ? "bg-white/20" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {posts.length}
                </span>
              </button>
            </nav>
            <p className="mt-3 text-xs text-gray-500 hidden lg:block px-1 leading-relaxed">
              Chọn tab để chỉnh thông tin hoặc xem bài đăng. Ảnh đại diện: bấm icon máy ảnh để chọn file
              (tối đa 5MB).
            </p>
          </aside>

          {/* Cột phải: nội dung */}
          <main className="flex-1 min-w-0 w-full space-y-6">
            {tab === "profile" && (
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/80">
                  <h2 className="text-sm font-semibold text-gray-800">Thông tin tài khoản</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Cập nhật họ tên, liên hệ. Ảnh đại diện tải lên bằng nút máy ảnh trên banner; hoặc dán URL
                    bên dưới.
                  </p>
                </div>

                <div className="p-5 sm:p-6 space-y-5">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={uploadingAvatar}
                      onClick={() => avatarFileRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-sky-50 text-sky-800 border border-sky-100 hover:bg-sky-100 disabled:opacity-50"
                    >
                      <Camera className="w-4 h-4" />
                      Chọn ảnh đại diện
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAvatarUrlField((v) => !v)}
                      className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      {showAvatarUrlField ? "Ẩn link ảnh" : "Dán link ảnh"}
                    </button>
                  </div>

                  {showAvatarUrlField && (
                    <div className="rounded-xl bg-sky-50/60 border border-sky-100 p-4 space-y-2">
                      <label className={labelClass}>Link ảnh đại diện</label>
                      <input
                        className={inputClass}
                        placeholder="https://..."
                        value={form.avatar}
                        onChange={(e) => setForm((p) => ({ ...p, avatar: e.target.value }))}
                      />
                      <p className="text-xs text-gray-500">
                        Dùng khi bạn đã có URL (Cloudinary, CDN). Sau đó bấm &quot;Lưu hồ sơ&quot; để ghi nhận.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className={`flex items-center gap-1.5 ${labelClass}`}>
                        <User className="w-3.5 h-3.5" strokeWidth={2} />
                        Tên hiển thị
                      </label>
                      <input
                        className={inputClass}
                        value={form.fullName}
                        onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className={`flex items-center gap-1.5 ${labelClass}`}>
                        <Phone className="w-3.5 h-3.5" strokeWidth={2} />
                        Số điện thoại
                      </label>
                      <input
                        className={inputClass}
                        value={form.phoneNumber}
                        onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={`flex items-center gap-1.5 ${labelClass}`}>
                        <MapPin className="w-3.5 h-3.5" strokeWidth={2} />
                        Địa chỉ
                      </label>
                      <input
                        className={inputClass}
                        value={form.address}
                        onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Giới tính</label>
                      <select
                        className={inputClass}
                        value={form.gender}
                        onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                      >
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                    <div>
                      <label className={`flex items-center gap-1.5 ${labelClass}`}>
                        <CalendarDays className="w-3.5 h-3.5" strokeWidth={2} />
                        Ngày sinh
                      </label>
                      <input
                        type="date"
                        className={inputClass}
                        value={form.dob}
                        onChange={(e) => setForm((p) => ({ ...p, dob: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleSaveProfile}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold shadow-sm hover:bg-sky-700 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {saving ? "Đang lưu…" : "Lưu hồ sơ"}
                    </button>
                  </div>
                </div>
              </section>
            )}

            {tab === "posts" && (
              <section className="space-y-4">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-lg font-bold text-gray-900">Bài đăng của tôi</h2>
                  <span className="text-sm text-gray-500 tabular-nums">{posts.length} bài</span>
                </div>

                <div className="space-y-5">
                  {posts.length === 0 && (
                    <div className="text-center py-14 px-4 rounded-2xl border border-dashed border-gray-200 bg-white/60 text-gray-500 text-sm">
                      Bạn chưa có bài đăng nào. Hãy tạo bài mới từ mục đăng bài.
                    </div>
                  )}
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      branchInfoById={branchInfoById}
                      courtNameById={courtNameById}
                      ownerMenuActions={{
                        onEdit: () =>
                          setEditTarget({
                            id: post.id,
                            type: post.type,
                            title: post.title,
                            content: post.content,
                            formData: post.formData,
                          }),
                        onDelete: () => handleDeletePost(post.id),
                      }}
                    />
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      <EditPostModal
        editTarget={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleSavePost}
      />
    </div>
  );
};

export default ProfilePage;
