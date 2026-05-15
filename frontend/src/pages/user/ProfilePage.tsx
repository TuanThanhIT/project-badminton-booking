import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  Camera,
  FileText,
  Loader2,
  Save,
  User,
  Phone,
  MapPin,
  CalendarDays,
  VenusAndMars,
  Trophy,
  Sparkles,
  Wallet,
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
} from "../../utils/constants/profileConstant";
import WalletPanel from "../../components/ui/user/wallet/WalletPanel";

type EditTarget = {
  id: number;
  type: PostWithAuthor["type"];
  title: string;
  content?: string | null;
  formData?: any;
} | null;

type ProfileTab = "profile" | "posts" | "wallet";

const inputClass =
  "w-full mt-1.5 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-sky-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-100";

const labelClass = "text-sm font-medium text-slate-700";

const tabBtnClass = (active: boolean) =>
  `group flex min-w-fit items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium transition-all lg:w-full lg:justify-start ${
    active
      ? "border-sky-400 bg-sky-100 text-sky-900 shadow-sm"
      : "border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
  }`;

const fieldIconClass =
  "pointer-events-none absolute left-4 top-[43px] text-slate-400";

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

  const fetchProfileAndPosts = useCallback(async () => {
    if (!currentUser?.id) return;

    try {
      await Promise.all([
        dispatch(getMyProfile()).unwrap(),
        dispatch(getMyPosts({ userId: currentUser.id })).unwrap(),
      ]);
    } catch {
      // middleware xử lý toast lỗi
    }
  }, [currentUser?.id, dispatch]);

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
  }, [dispatch, fetchProfileAndPosts]);

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
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 bg-[#f8fafc] text-slate-600">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-sky-600 shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
        </div>

        <p className="text-sm font-medium">Đang tải hồ sơ…</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-16">
      <input
        ref={avatarFileRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-hidden
        onChange={handleAvatarFileChange}
      />

      <div className="mx-auto max-w-[1180px] px-3 pt-6 sm:px-4 sm:pt-8 lg:px-6">
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
              className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-300 bg-white text-sky-700 shadow-lg transition-all hover:border-sky-300 hover:bg-sky-50 disabled:opacity-50"
              title="Chọn ảnh từ máy"
            >
              {uploadingAvatar ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
          }
        />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
          {/* SIDEBAR */}
          <aside className="min-w-0">
            <div className="sticky top-6 rounded-[2rem] border border-slate-200 bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
              <div className="mb-3 hidden px-3 pt-2 lg:block">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Quản lý tài khoản
                </p>
              </div>

              <nav
                className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible"
                aria-label="Khu vực hồ sơ"
              >
                <button
                  type="button"
                  className={tabBtnClass(tab === "profile")}
                  onClick={() => setTab("profile")}
                >
                  <User className="h-5 w-5 shrink-0" strokeWidth={2} />
                  <span>Hồ sơ</span>
                </button>

                <button
                  type="button"
                  className={tabBtnClass(tab === "posts")}
                  onClick={() => setTab("posts")}
                >
                  <FileText className="h-5 w-5 shrink-0" strokeWidth={2} />
                  <span className="flex-1">Bài đăng</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                      tab === "posts"
                        ? "bg-sky-200 text-sky-900"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {posts.length}
                  </span>
                </button>

                <button
                  type="button"
                  className={tabBtnClass(tab === "wallet")}
                  onClick={() => setTab("wallet")}
                >
                  <Wallet className="h-5 w-5 shrink-0" strokeWidth={2} />
                  <span>Ví thanh toán</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* CONTENT */}
          <main className="min-w-0 space-y-6">
            {tab === "profile" && (
              <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
                <div className="border-b border-slate-200 bg-white p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
                      <Sparkles size={21} />
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        Thông tin tài khoản
                      </h2>

                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        Cập nhật thông tin cá nhân. Ảnh đại diện thay đổi qua
                        nút camera trên ảnh bìa.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-100/60 p-3 sm:p-5">
                  <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                      <div className="relative">
                        <label className={labelClass}>Tên hiển thị</label>
                        <User size={17} className={fieldIconClass} />
                        <input
                          className={`${inputClass} pl-11`}
                          placeholder="Nhập tên hiển thị"
                          value={form.fullName}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              fullName: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="relative">
                        <label className={labelClass}>Số điện thoại</label>
                        <Phone size={17} className={fieldIconClass} />
                        <input
                          className={`${inputClass} pl-11`}
                          placeholder="Nhập số điện thoại"
                          value={form.phoneNumber}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              phoneNumber: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="relative sm:col-span-2">
                        <label className={labelClass}>Địa chỉ</label>
                        <MapPin size={17} className={fieldIconClass} />
                        <input
                          className={`${inputClass} pl-11`}
                          placeholder="Nhập địa chỉ"
                          value={form.address}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              address: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="relative">
                        <label className={labelClass}>Giới tính</label>
                        <VenusAndMars size={17} className={fieldIconClass} />
                        <select
                          className={`${inputClass} pl-11`}
                          value={form.gender}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              gender: e.target.value,
                            }))
                          }
                        >
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                          <option value="other">Khác</option>
                        </select>
                      </div>

                      <div className="relative">
                        <label className={labelClass}>Ngày sinh</label>
                        <CalendarDays size={17} className={fieldIconClass} />
                        <input
                          type="date"
                          className={`${inputClass} pl-11`}
                          value={form.dob}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, dob: e.target.value }))
                          }
                        />
                      </div>

                      <div className="relative sm:col-span-2">
                        <label className={labelClass}>Trình độ cầu lông</label>
                        <Trophy size={17} className={fieldIconClass} />
                        <select
                          className={`${inputClass} pl-11`}
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

                        <p className="mt-2 text-xs leading-relaxed text-slate-500">
                          Hiển thị công khai để mọi người dễ kết nối giao lưu.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end border-t border-slate-200 pt-5">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={handleSaveProfile}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-100 transition-all hover:bg-sky-600 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}

                        {saving ? "Đang lưu…" : "Lưu hồ sơ"}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {tab === "posts" && (
              <section className="space-y-5">
                <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
                  <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
                        <FileText size={21} />
                      </div>

                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                          Bài đăng của tôi
                        </h2>
                        <p className="mt-1 text-sm text-slate-600">
                          Quản lý, chỉnh sửa hoặc xem chi tiết bài đã đăng.
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-800">
                      {posts.length} bài
                    </span>
                  </div>
                </div>

                {posts.length === 0 ? (
                  <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600 shadow-sm">
                    Bạn chưa có bài đăng nào. Hãy tạo bài mới từ mục đăng bài.
                  </div>
                ) : (
                  <div className="space-y-5">
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
                )}
              </section>
            )}

            {tab === "wallet" && <WalletPanel />}
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
