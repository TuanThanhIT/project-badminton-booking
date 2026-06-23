import { Link } from "react-router-dom";
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
  GraduationCap,
  Search,
  SlidersHorizontal,
  AlertTriangle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import type { PostReactionType, PostType, PostWithAuthor } from "../../types/post";
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
import { ROLE_NAME } from "../../utils/constants/role";
import { POST_TYPE_LABEL, POST_TYPES } from "../../utils/constants/postConstant";
import { showConfirmDialog } from "../../utils/confirmDialog";
import {
  ACCOUNT_STATUS_BADGE_CLASS,
  ACCOUNT_STATUS_LABEL,
} from "../../utils/moderationLabels";

type EditTarget = {
  id: number;
  type: PostWithAuthor["type"];
  title: string;
  content?: string | null;
  formData?: any;
} | null;

type ProfileTab = "profile" | "posts" | "wallet";

const inputClass =
  "w-full mt-1.5 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-sky-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-100";

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
  const [postSearch, setPostSearch] = useState("");
  const [selectedPostType, setSelectedPostType] = useState<PostType | "">("");
  const [hideReposts, setHideReposts] = useState(false);
  const [postSortBy, setPostSortBy] = useState<"latest" | "likes" | "comments">(
    "latest",
  );
  const [currentPostPage, setCurrentPostPage] = useState(1);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    gender: "male",
    dob: "",
    avatar: "",
    level: "",
    coachExperienceYears: 0,
    coachCertificate: "",
    coachIntroduction: "",
  });

  const displayName = form.fullName.trim() || profile?.username || "Bạn";
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const isCoach =
    currentUser?.role === ROLE_NAME.COACH ||
    profile?.role === ROLE_NAME.COACH;
  const accountStatus = profile?.accountStatus || "ACTIVE";
  const violationCount = profile?.violationCount || 0;
  const showAccountWarning = accountStatus !== "ACTIVE";

  const engagementStats = useMemo(
    () =>
      posts.reduce(
        (acc, p) => ({
          likes: acc.likes + (p.likesCount ?? 0),
          comments: acc.comments + (p.commentsCount ?? 0),
          shares: acc.shares + (p.sharesCount ?? 0),
          reactions: Object.entries(p.reactionSummary ?? {}).reduce(
            (reactionAcc, [type, count]) => {
              const key = type as PostReactionType;
              reactionAcc[key] = (reactionAcc[key] ?? 0) + Number(count ?? 0);
              return reactionAcc;
            },
            acc.reactions,
          ),
        }),
        {
          likes: 0,
          comments: 0,
          shares: 0,
          reactions: {} as Partial<Record<PostReactionType, number>>,
        },
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
      coachExperienceYears: profile.coachProfile?.experienceYears ?? 0,
      coachCertificate: profile.coachProfile?.certificate || "",
      coachIntroduction: profile.coachProfile?.introduction || "",
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
            ...(isCoach
              ? {
                  coachProfile: {
                    experienceYears: Number(form.coachExperienceYears) || 0,
                    certificate: form.coachCertificate.trim() || null,
                    introduction: form.coachIntroduction.trim() || null,
                  },
                }
              : {}),
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
    const confirmed = await showConfirmDialog(
      "Xóa bài đăng này?",
      "Bài đăng sẽ bị xóa khỏi hồ sơ của bạn và không thể khôi phục từ giao diện.",
      "Xóa bài",
      "Hủy",
      "danger",
    );
    if (!confirmed) return;

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

  const filteredPosts = useMemo(() => {
    const keyword = postSearch.trim().toLowerCase();

    return posts.filter((post) => {
      if (selectedPostType && post.type !== selectedPostType) return false;
      if (hideReposts && post.repostOfPostId) return false;
      if (!keyword) return true;

      const authorName =
        post.author?.profile?.fullName ||
        post.author?.username ||
        profile?.username ||
        "";
      const haystack = [
        post.title,
        post.content,
        POST_TYPE_LABEL[post.type],
        authorName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [hideReposts, postSearch, posts, profile?.username, selectedPostType]);

  const sortedPosts = useMemo(() => {
    const list = [...filteredPosts];
    if (postSortBy === "likes") {
      return list.sort((a, b) => (b.likesCount ?? 0) - (a.likesCount ?? 0));
    }
    if (postSortBy === "comments") {
      return list.sort((a, b) => (b.commentsCount ?? 0) - (a.commentsCount ?? 0));
    }
    return list.sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
    );
  }, [filteredPosts, postSortBy]);

  const postsPageSize = 10;
  const totalPostPages = Math.max(1, Math.ceil(sortedPosts.length / postsPageSize));
  const visiblePosts = useMemo(() => {
    const safePage = Math.min(currentPostPage, totalPostPages);
    const start = (safePage - 1) * postsPageSize;
    return sortedPosts.slice(start, start + postsPageSize);
  }, [currentPostPage, sortedPosts, totalPostPages]);

  useEffect(() => {
    setCurrentPostPage(1);
  }, [hideReposts, postSearch, selectedPostType, postSortBy]);

  useEffect(() => {
    if (currentPostPage > totalPostPages) setCurrentPostPage(totalPostPages);
  }, [currentPostPage, totalPostPages]);

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
          levelLabel={
            !isCoach && form.level ? PLAYER_LEVEL_LABEL[form.level] : undefined
          }
          isCoach={isCoach}
          coachExperienceYears={form.coachExperienceYears}
          avatarOverlay={
            <button
              type="button"
              disabled={uploadingAvatar}
              onClick={() => avatarFileRef.current?.click()}
              className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-sky-700 transition-colors hover:border-sky-300 hover:bg-sky-50 disabled:opacity-50"
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

        {accountStatus === "ACTIVE" && violationCount > 0 ? (
          <div className="mt-5 rounded-3xl border border-sky-200 bg-sky-50 p-4 text-sky-900 shadow-sm">
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/70">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">
                  Bạn đã có {violationCount} lần vi phạm quy định cộng đồng.
                </p>
                <p className="mt-1 text-sm">
                  Vui lòng đăng bài đúng nội quy để tránh bị cảnh báo hoặc khóa
                  tài khoản.
                </p>
                <Link
                  to="/about#community-guidelines"
                  className="mt-2 inline-flex text-sm font-semibold text-sky-700 hover:text-sky-800"
                >
                  Xem quy định cộng đồng
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        {showAccountWarning ? (
          <div
            className={`mt-5 rounded-3xl border p-4 shadow-sm ${
              accountStatus === "WARNING"
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-red-200 bg-red-50 text-red-900"
            }`}
          >
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/70">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">
                    {accountStatus === "WARNING"
                      ? "Tài khoản của bạn đã có cảnh báo do vi phạm quy định cộng đồng."
                      : accountStatus === "SUSPENDED"
                        ? "Tài khoản của bạn đang bị tạm khóa do vi phạm quy định cộng đồng."
                        : "Tài khoản của bạn đã bị khóa do vi phạm quy định cộng đồng."}
                  </p>
                  <span
                    className={`rounded border px-2 py-0.5 text-xs font-semibold ${
                      ACCOUNT_STATUS_BADGE_CLASS[accountStatus]
                    }`}
                  >
                    {ACCOUNT_STATUS_LABEL[accountStatus]}
                  </span>
                </div>
                <div className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                  <p>Số lần vi phạm: {profile.violationCount || 0}</p>
                  {profile.lastViolationAt ? (
                    <p>
                      Vi phạm gần nhất:{" "}
                      {new Date(profile.lastViolationAt).toLocaleString("vi-VN")}
                    </p>
                  ) : null}
                  {profile.suspendedUntil ? (
                    <p>
                      Tạm khóa đến:{" "}
                      {new Date(profile.suspendedUntil).toLocaleString("vi-VN")}
                    </p>
                  ) : null}
                  {profile.suspensionReason ? (
                    <p className="sm:col-span-2">
                      Lý do: {profile.suspensionReason}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Trạng thái cộng đồng
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Theo dõi số lần vi phạm và tình trạng tài khoản của bạn.
              </p>
            </div>
            <span
              className={`rounded border px-2.5 py-1 text-xs font-semibold ${
                ACCOUNT_STATUS_BADGE_CLASS[accountStatus]
              }`}
            >
              {ACCOUNT_STATUS_LABEL[accountStatus]}
            </span>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                Trạng thái tài khoản
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {ACCOUNT_STATUS_LABEL[accountStatus]}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                Số lần vi phạm
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {violationCount}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                Lần vi phạm gần nhất
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {profile.lastViolationAt
                  ? new Date(profile.lastViolationAt).toLocaleString("vi-VN")
                  : "Chưa có"}
              </p>
            </div>
            {profile.suspensionReason ? (
              <div className="sm:col-span-2">
                <p className="text-xs font-medium uppercase text-slate-400">
                  Lý do khóa
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {profile.suspensionReason}
                </p>
              </div>
            ) : null}
            {profile.suspendedUntil ? (
              <div>
                <p className="text-xs font-medium uppercase text-slate-400">
                  Thời gian mở khóa
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {new Date(profile.suspendedUntil).toLocaleString("vi-VN")}
                </p>
              </div>
            ) : null}
          </div>

          <Link
            to="/about#community-guidelines"
            className="mt-4 inline-flex text-sm font-semibold text-sky-700 hover:text-sky-800"
          >
            Xem quy định cộng đồng
          </Link>
        </section>

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
                  className={`${tabBtnClass(tab === "posts")} w-full`}
                  onClick={() => setTab("posts")}
                >
                  <FileText className="h-5 w-5 shrink-0" strokeWidth={2} />
                  <span>Bài đăng</span>

                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-xs tabular-nums ${
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

                {isCoach ? (
                  <Link
                    to="/coach/students"
                    className={tabBtnClass(false)}
                  >
                    <GraduationCap className="h-5 w-5 shrink-0" strokeWidth={2} />
                    <span>Lớp học</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/my-classes"
                      className={tabBtnClass(false)}
                    >
                      <GraduationCap className="h-5 w-5 shrink-0" strokeWidth={2} />
                      <span>Lớp học</span>
                    </Link>
                    {currentUser?.role === ROLE_NAME.USER && (
                      <Link
                        to="/become-coach"
                        className={tabBtnClass(false)}
                      >
                        <Trophy className="h-5 w-5 shrink-0" strokeWidth={2} />
                        <span>Đăng ký dạy cầu lông</span>
                      </Link>
                    )}
                  </>
                )}
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

                      {!isCoach && (
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
                      )}

                      {isCoach && (
                        <div className="sm:col-span-2 rounded-3xl border border-amber-200 bg-amber-50/60 p-4 sm:p-5">
                          <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
                              <GraduationCap size={20} />
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-slate-900">Hồ sơ dạy cầu lông</h3>
                              <p className="text-xs text-slate-500">
                                Các thông tin này sẽ hiển thị công khai trên trang cá nhân của bạn.
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <label className={labelClass}>Số năm kinh nghiệm</label>
                              <input
                                type="number"
                                min={0}
                                className={inputClass}
                                value={form.coachExperienceYears}
                                onChange={(e) =>
                                  setForm((p) => ({
                                    ...p,
                                    coachExperienceYears: Number(e.target.value),
                                  }))
                                }
                              />
                            </div>

                            <div>
                              <label className={labelClass}>Chứng chỉ / thành tích</label>
                              <input
                                className={inputClass}
                                placeholder="VD: Chứng chỉ dạy cầu lông cấp CLB, giải phong trào..."
                                value={form.coachCertificate}
                                onChange={(e) =>
                                  setForm((p) => ({
                                    ...p,
                                    coachCertificate: e.target.value,
                                  }))
                                }
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className={labelClass}>Giới thiệu</label>
                              <textarea
                                className={`${inputClass} min-h-[120px] resize-none leading-relaxed`}
                                placeholder="Phong cách dạy, đối tượng học viên phù hợp, mục tiêu huấn luyện..."
                                value={form.coachIntroduction}
                                onChange={(e) =>
                                  setForm((p) => ({
                                    ...p,
                                    coachIntroduction: e.target.value,
                                  }))
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}
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
              <section className="overflow-visible rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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

                    <span className="w-fit rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
                      {filteredPosts.length}/{posts.length} bài
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_auto]">
                    <div className="relative rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
                      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={postSearch}
                        onChange={(event) => setPostSearch(event.target.value)}
                        placeholder="Tìm bài theo tiêu đề, nội dung, loại bài..."
                        className="w-full bg-transparent py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                      />
                    </div>

                    <select
                      value={postSortBy}
                      onChange={(event) =>
                        setPostSortBy(
                          event.target.value as "latest" | "likes" | "comments",
                        )
                      }
                      className="min-h-[48px] rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 outline-none transition-colors focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                    >
                      <option value="latest">Mới nhất</option>
                      <option value="likes">Nhiều lượt thích</option>
                      <option value="comments">Nhiều bình luận</option>
                    </select>

                    <label className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600">
                      <input
                        type="checkbox"
                        checked={hideReposts}
                        onChange={(event) => setHideReposts(event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      Ẩn bài chia sẻ
                    </label>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                      <SlidersHorizontal className="h-4 w-4" />
                      Lọc loại bài
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPostType("")}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          selectedPostType === ""
                            ? "border-sky-500 bg-sky-50 text-sky-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50"
                        }`}
                      >
                        Tất cả
                      </button>
                      {POST_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSelectedPostType(type)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                            selectedPostType === type
                              ? "border-sky-500 bg-sky-50 text-sky-700"
                              : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50"
                          }`}
                        >
                          {POST_TYPE_LABEL[type]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-5 bg-slate-50/70 p-4 sm:p-5">
                {posts.length === 0 && (
                  <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600 shadow-sm">
                    Bạn chưa có bài đăng nào. Hãy tạo bài mới từ mục đăng bài.
                  </div>
                )}
                  {posts.length > 0 && filteredPosts.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-14 text-center text-sm text-slate-500">
                      Không tìm thấy bài đăng phù hợp.
                    </div>
                  )}
                  {filteredPosts.length > 0 && (
                  <div className="space-y-5">
                    {visiblePosts.map((post) => (
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
                </div>

                {sortedPosts.length > postsPageSize && (
                  <div className="flex items-center justify-center gap-3 border-t border-slate-100 bg-white px-5 py-4">
                    <button
                      type="button"
                      disabled={currentPostPage <= 1}
                      onClick={() =>
                        setCurrentPostPage((page) => Math.max(1, page - 1))
                      }
                      className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200 disabled:pointer-events-none disabled:opacity-50"
                    >
                      Trước
                    </button>
                    <span className="px-3 py-2 text-sm font-medium text-slate-500">
                      {currentPostPage} / {totalPostPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentPostPage >= totalPostPages}
                      onClick={() =>
                        setCurrentPostPage((page) =>
                          Math.min(totalPostPages, page + 1),
                        )
                      }
                      className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200 disabled:pointer-events-none disabled:opacity-50"
                    >
                      Sau
                    </button>
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
