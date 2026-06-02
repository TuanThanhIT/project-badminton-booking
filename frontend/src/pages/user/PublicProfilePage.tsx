import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Award, GraduationCap } from "lucide-react";
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
import { getAllBranches } from "../../redux/slices/user/branchSlice";
import { PLAYER_LEVEL_LABEL } from "../../utils/constants/profileConstant";
import { ROLE_NAME } from "../../utils/constants/role";

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
        // middleware xử lý toast lỗi
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
        (acc, p) => ({
          likes: acc.likes + (p.likesCount ?? 0),
          comments: acc.comments + (p.commentsCount ?? 0),
        }),
        { likes: 0, comments: 0 },
      ),
    [posts],
  );

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-gray-500 text-sm">
        Đang tải hồ sơ…
      </div>
    );
  }

  if (!profile) return null;

  const displayName = profile.profile?.fullName || profile.username;
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const avatarUrl = profile.profile?.avatar || "";

  const isCoach = profile?.role === ROLE_NAME.COACH;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/90 via-white to-slate-50 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-12">
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
          coachExperienceYears={profile.coachProfile?.experienceYears ?? undefined}
          trailingActions={
            <button
              type="button"
              onClick={handleMessage}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-sm hover:bg-emerald-700 transition-colors"
            >
              Nhắn tin
            </button>
          }
        />

        {isCoach && (
          <section className="mt-8 rounded-[2rem] border border-sky-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                <GraduationCap size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    Hồ sơ dạy cầu lông
                  </h2>
                  <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                    {profile.coachProfile?.experienceYears ?? 0} năm kinh nghiệm
                  </span>
                </div>

                {profile.coachProfile?.certificate && (
                  <p className="mt-3 flex items-start gap-2 text-sm font-medium text-slate-700">
                    <Award className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                    {profile.coachProfile.certificate}
                  </p>
                )}

                {profile.coachProfile?.introduction ? (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                    {profile.coachProfile.introduction}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    Chưa cập nhật giới thiệu dạy cầu lông.
                  </p>
                )}
                {Array.isArray(profile.coachProfile?.certificateImages) &&
                  profile.coachProfile.certificateImages.length > 0 && (
                    <div className="mt-5">
                      <p className="mb-3 text-sm font-semibold text-slate-800">
                        Hinh anh chung chi
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
          </section>
        )}

        <section className="mt-10">
          <div className="flex items-baseline justify-between gap-3 mb-4">
            <h2 className="text-lg font-bold text-gray-900">Bài đăng</h2>
            <span className="text-sm text-gray-500 tabular-nums">
              {posts.length} bài
            </span>
          </div>

          <div className="space-y-5">
            {posts.length === 0 && (
              <div className="text-center py-14 px-4 rounded-2xl border border-dashed border-gray-200 bg-white/60 text-gray-500 text-sm">
                Chưa có bài đăng nào.
              </div>
            )}
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                branchInfoById={branchInfoById}
                courtNameById={courtNameById}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PublicProfilePage;
