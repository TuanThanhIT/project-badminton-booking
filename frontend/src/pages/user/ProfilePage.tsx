import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  Camera,
  FileText,
  Loader2,
  Save,
  User,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import type { PostWithAuthor } from "../../types/post";
import PostCard from "../../components/ui/user/postList/PostCard";
import ProfileHeroBanner from "../../components/ui/user/profile/ProfileHeroBanner";
import { getCourtsByIds } from "../../redux/slices/user/courtSlice";
import {
  getMyPosts,
  getMyProfile,
  updateMyProfile,
  uploadMyAvatar,
} from "../../redux/slices/user/profileSlice";
import { syncAuthUserProfile } from "../../redux/slices/user/authSlice";
import { deletePost, updatePost } from "../../redux/slices/user/postSlice";
import EditPostModal from "../../components/ui/user/postList/EditPostModal";
import PostDetailModal from "../../components/ui/user/postList/PostDetailModal";
import { getAllBranches } from "../../redux/slices/user/branchSlice";
import {
  PLAYER_LEVEL_LABEL,
  PLAYER_LEVELS,
} from "../../constants/profileConstant";

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
  const loading = useAppSelector(
    (state) =>
      Boolean(state.ui.loadingMap["profile/getMyProfile"]) ||
      Boolean(state.ui.loadingMap["profile/getMyPosts"]),
  );
  const saving = useAppSelector((state) =>
    Boolean(state.ui.loadingMap["profile/updateMyProfile"]),
  );
  const uploadingAvatar = useAppSelector((state) =>
    Boolean(state.ui.loadingMap["profile/uploadMyAvatar"]),
  );
  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [detailPost, setDetailPost] = useState<PostWithAuthor | null>(null);
  const [tab, setTab] = useState<ProfileTab>("profile");
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    gender: "male",
    dob: "",
    avatar: "",
    level: "",
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
      await Promise.all([
        dispatch(getMyProfile()).unwrap(),
        dispatch(getMyPosts({ userId: currentUser.id })).unwrap(),
      ]);
    } catch {
      // middleware xử lý toast lỗi
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
      level: profile.profile?.level || "",
    });
  }, [profile]);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [form.avatar]);

  useEffect(() => {
    dispatch(getAllBranches());
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

  const handleAvatarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
      const updated = await dispatch(uploadMyAvatar(file)).unwrap();
      dispatch(syncAuthUserProfile(updated));
      toast.success("Đã cập nhật ảnh đại diện");
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message;
      toast.error(msg || "Không thể tải ảnh lên");
    }
  };

  const handleSaveProfile = async () => {
    try {
      const updated = await dispatch(
        updateMyProfile({
          data: {
            fullName: form.fullName.trim(),
            phoneNumber: form.phoneNumber.trim(),
            address: form.address.trim(),
            gender: form.gender as "male" | "female" | "other",
            dob: form.dob || null,
            avatar: form.avatar.trim() || null,
            level: form.level || null,
          },
        }),
      ).unwrap();
      dispatch(syncAuthUserProfile(updated));
      toast.success("Cập nhật hồ sơ thành công");
    } catch {
      // middleware xử lý toast lỗi
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
          {
            branchName: string;
            address?: string;
            ward?: string;
            district?: string;
            province?: string;
          }
        >
      >((acc, branch) => {
        acc[branch.id] = {
          branchName: branch.branchName,
          address: branch.address,
          ward: branch.wardName,
          district: branch.districtName,
          province: branch.provinceName,
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
          levelLabel={form.level ? PLAYER_LEVEL_LABEL[form.level] : undefined}
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
          <aside className="w-full lg:w-56 shrink-0">
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
                    tab === "posts"
                      ? "bg-white/20"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {posts.length}
                </span>
              </button>
            </nav>
          </aside>

          {/* Cột phải: nội dung */}
          <main className="flex-1 min-w-0 w-full space-y-6">
            {tab === "profile" && (
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/80">
                  <h2 className="text-sm font-semibold text-gray-800">
                    Thông tin tài khoản
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Cập nhật thông tin cá nhân. Ảnh đại diện thay đổi qua nút camera trên ảnh bìa.
                  </p>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <label className={labelClass}>Tên hiển thị</label>
                      <input
                        className={inputClass}
                        placeholder="Nhập tên hiển thị"
                        value={form.fullName}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, fullName: e.target.value }))
                        }
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Số điện thoại</label>
                      <input
                        className={inputClass}
                        placeholder="Nhập số điện thoại"
                        value={form.phoneNumber}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, phoneNumber: e.target.value }))
                        }
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className={labelClass}>Địa chỉ</label>
                      <input
                        className={inputClass}
                        placeholder="Nhập địa chỉ"
                        value={form.address}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, address: e.target.value }))
                        }
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Giới tính</label>
                      <select
                        className={inputClass}
                        value={form.gender}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, gender: e.target.value }))
                        }
                      >
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Ngày sinh</label>
                      <input
                        type="date"
                        className={inputClass}
                        value={form.dob}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, dob: e.target.value }))
                        }
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className={labelClass}>Trình độ cầu lông</label>
                      <select
                        className={inputClass}
                        value={form.level}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, level: e.target.value }))
                        }
                      >
                        <option value="">-- Chưa chọn --</option>
                        {PLAYER_LEVELS.map((val) => (
                          <option key={val} value={val}>
                            {PLAYER_LEVEL_LABEL[val]}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1.5 text-xs text-gray-400">
                        Hiển thị công khai để mọi người dễ kết nối giao lưu.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-5 mt-1 border-t border-gray-100">
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
                  <h2 className="text-lg font-bold text-gray-900">
                    Bài đăng của tôi
                  </h2>
                  <span className="text-sm text-gray-500 tabular-nums">
                    {posts.length} bài
                  </span>
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
                      onOpenDetail={() => setDetailPost(post)}
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

      <PostDetailModal
        post={detailPost}
        onClose={() => setDetailPost(null)}
        branchInfoById={branchInfoById}
        courtNameById={courtNameById}
      />
    </div>
  );
};

export default ProfilePage;
