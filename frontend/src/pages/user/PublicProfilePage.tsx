import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Award,
  GraduationCap,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  clearPublicProfileState,
  getPublicPosts,
  getPublicProfile,
} from "../../redux/slices/user/profileSlice";
import { createOrGetDirectConversation } from "../../redux/slices/user/conversationSlice";
import { getCourtsByIds } from "../../redux/slices/user/courtSlice";
import ProfileHeroBanner from "../../components/ui/user/profile/ProfileHeroBanner";
import PostCard from "../../components/ui/user/postList/PostCard";
import PostDetailModal from "../../components/ui/user/postList/PostDetailModal";
import { getAllBranches } from "../../redux/slices/user/branchSlice";
import { PLAYER_LEVEL_LABEL } from "../../utils/constants/profileConstant";
import { ROLE_NAME } from "../../utils/constants/role";
import type {
  PostReactionType,
  PostType,
  PostWithAuthor,
} from "../../types/post";
import {
  POST_TYPE_LABEL,
  POST_TYPES,
} from "../../utils/constants/postConstant";

const PublicProfilePage = () => {
  const dispatch = useAppDispatch();
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);
  const branches = useAppSelector((state) => state.branch.branches);
  const courts = useAppSelector((state) => state.court.courts);
  const profile = useAppSelector((state) => state.profile.publicProfile);
  const posts = useAppSelector((state) => state.profile.publicPosts);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<PostType | "">("");
  const [hideReposts, setHideReposts] = useState(false);
  const [sortBy, setSortBy] = useState<"latest" | "likes" | "comments">(
    "latest",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [detailPost, setDetailPost] = useState<PostWithAuthor | null>(null);
  const [coachProfileOpen, setCoachProfileOpen] = useState(false);
  const loading = useAppSelector(
    (state) =>
      Boolean(state.ui.loadingMap["profile/getPublicProfile"]) ||
      Boolean(state.ui.loadingMap["profile/getPublicPosts"]),
  );

  const parsedUserId = useMemo(() => Number(userId), [userId]);

  useEffect(() => {
    dispatch(getAllBranches());
  }, [dispatch]);

  useEffect(() => {
    if (!parsedUserId || Number.isNaN(parsedUserId)) return;

    if (currentUser?.id === parsedUserId) {
      navigate("/profile", { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(getPublicProfile({ userId: parsedUserId })).unwrap(),
          dispatch(getPublicPosts({ userId: parsedUserId })).unwrap(),
        ]);
      } catch {
        // Error toast is handled by middleware.
      }
    };

    fetchData();
    return () => {
      dispatch(clearPublicProfileState());
    };
  }, [parsedUserId, currentUser?.id, navigate, dispatch]);

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

  useEffect(() => {
    setAvatarLoadError(false);
  }, [profile?.profile?.avatar]);

  const handleMessage = () => {
    if (!profile) return;
    dispatch(createOrGetDirectConversation({ userId: profile.id }))
      .unwrap()
      .then((res) => navigate(`/messages/${res.data.id}`))
      .catch(() => toast.error("Không thể tạo cuộc trò chuyện."));
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

  const engagementStats = useMemo(
    () =>
      posts.reduce(
        (acc, post) => ({
          likes: acc.likes + (post.likesCount ?? 0),
          comments: acc.comments + (post.commentsCount ?? 0),
          shares: acc.shares + (post.sharesCount ?? 0),
          reactions: Object.entries(post.reactionSummary ?? {}).reduce(
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

  const displayName = profile?.profile?.fullName || profile?.username || "";

  const filteredPosts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return posts.filter((post) => {
      if (selectedType && post.type !== selectedType) return false;
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
  }, [hideReposts, posts, profile?.username, search, selectedType]);

  const sortedPosts = useMemo(() => {
    const list = [...filteredPosts];
    if (sortBy === "likes") {
      return list.sort((a, b) => (b.likesCount ?? 0) - (a.likesCount ?? 0));
    }
    if (sortBy === "comments") {
      return list.sort(
        (a, b) => (b.commentsCount ?? 0) - (a.commentsCount ?? 0),
      );
    }
    return list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [filteredPosts, sortBy]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(sortedPosts.length / pageSize));
  const visiblePosts = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * pageSize;
    return sortedPosts.slice(start, start + pageSize);
  }, [currentPage, sortedPosts, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [hideReposts, search, selectedType, sortBy]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-sm text-gray-500">
        Đang tải hồ sơ...
      </div>
    );
  }

  if (!profile) return null;

  const avatarLetter = displayName.charAt(0).toUpperCase();
  const avatarUrl = profile.profile?.avatar || "";
  const isCoach = profile?.role === ROLE_NAME.COACH;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/90 via-white to-slate-50 pb-16">
      <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 sm:pt-12">
        <ProfileHeroBanner
          displayName={displayName}
          username={profile.username}
          postCount={profile.postCount}
          stats={engagementStats}
          avatarUrl={avatarUrl}
          avatarLetter={avatarLetter}
          avatarLoadError={avatarLoadError}
          onAvatarImgError={() => setAvatarLoadError(true)}
          levelLabel={
            !isCoach && profile.profile?.level
              ? PLAYER_LEVEL_LABEL[profile.profile.level]
              : undefined
          }
          isCoach={isCoach}
          coachExperienceYears={
            profile.coachProfile?.experienceYears ?? undefined
          }
          trailingActions={
            <div className="flex flex-wrap justify-end gap-2">
              {isCoach && (
                <button
                  type="button"
                  onClick={() => setCoachProfileOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white px-4 py-2.5 text-sm font-semibold text-sky-700 shadow-sm transition-colors hover:bg-sky-50"
                >
                  <GraduationCap className="h-4 w-4" />
                  Xem hồ sơ dạy
                </button>
              )}
              <button
                type="button"
                onClick={handleMessage}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
              >
                Nhắn tin
              </button>
            </div>
          }
        />

        <section className="mt-10 overflow-visible rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Bài đăng
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Các bài viết công khai của {displayName}
                </p>
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
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm bài viết..."
                  className="w-full bg-transparent py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target.value as "latest" | "likes" | "comments",
                  )
                }
                className="min-h-[48px] rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 outline-none transition-colors focus:border-sky-300 focus:ring-1 focus:ring-sky-100"
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
                Ẩn bài chia sẻ lại
              </label>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                <SlidersHorizontal className="h-4 w-4" />
                Loại bài viết
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedType("")}
                  className={`rounded-full border px-3 py-1.5 text-[13px] font-semibold leading-tight tracking-normal transition-colors ${
                    selectedType === ""
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
                    onClick={() => setSelectedType(type)}
                    className={`rounded-full border px-3 py-1.5 text-[13px] font-semibold leading-tight tracking-normal transition-colors ${
                      selectedType === type
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
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-14 text-center text-sm text-slate-500">
                Chưa có bài đăng nào.
              </div>
            )}
            {posts.length > 0 && filteredPosts.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-14 text-center text-sm text-slate-500">
                Không tìm thấy bài đăng phù hợp.
              </div>
            )}
            {visiblePosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                branchInfoById={branchInfoById}
                courtNameById={courtNameById}
                onOpenDetail={() => setDetailPost(post)}
              />
            ))}
          </div>

          {sortedPosts.length > pageSize && (
            <div className="flex items-center justify-center gap-3 border-t border-slate-100 bg-white px-5 py-4">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200 disabled:pointer-events-none disabled:opacity-50"
              >
                Trước
              </button>
              <span className="px-3 py-2 text-sm font-medium text-slate-500">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200 disabled:pointer-events-none disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </section>
      </div>

      {coachProfileOpen && isCoach && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="coach-profile-title"
          onMouseDown={() => setCoachProfileOpen(false)}
        >
          <div
            className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                  <GraduationCap size={22} />
                </div>
                <div className="min-w-0">
                  <h2
                    id="coach-profile-title"
                    className="text-lg font-semibold text-slate-900"
                  >
                    Hồ sơ dạy cầu lông
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {displayName} · {profile.coachProfile?.experienceYears ?? 0}{" "}
                    năm kinh nghiệm
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCoachProfileOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                aria-label="Đóng hồ sơ dạy"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-5 sm:px-6">
              {profile.coachProfile?.certificate && (
                <div className="flex items-start gap-2 rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-sm font-medium text-slate-700">
                  <Award className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                  <span>{profile.coachProfile.certificate}</span>
                </div>
              )}

              {profile.coachProfile?.introduction ? (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                  {profile.coachProfile.introduction}
                </p>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  Chưa cập nhật giới thiệu dạy cầu lông.
                </p>
              )}

              {Array.isArray(profile.coachProfile?.certificateImages) &&
                profile.coachProfile.certificateImages.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-3 text-sm font-semibold text-slate-800">
                      Hình ảnh chứng chỉ
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {profile.coachProfile.certificateImages.map((url) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition hover:border-sky-200"
                        >
                          <img
                            src={url}
                            alt="Chứng chỉ dạy cầu lông"
                            className="aspect-[4/3] w-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      <PostDetailModal
        post={detailPost}
        onClose={() => setDetailPost(null)}
        branchInfoById={branchInfoById}
        courtNameById={courtNameById}
      />
    </div>
  );
};

export default PublicProfilePage;
