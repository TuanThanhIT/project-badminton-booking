import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  clearPublicProfileState,
  getPublicPosts,
  getPublicProfile,
} from "../../redux/slices/user/profileSlice";
import { createOrGetDirectConversation } from "../../redux/slices/user/conversationSlice";
import { getAllBranchesFull } from "../../redux/slices/user/branchSlice";
import { getCourtsByIds } from "../../redux/slices/user/courtSlice";
import ProfileHeroBanner from "./components/ProfileHeroBanner";
import PostCard from "./postList/PostCard";

const PublicProfilePage = () => {
  const dispatch = useAppDispatch();
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);
  const branches = useAppSelector((state) => state.branch.branches);
  const courts = useAppSelector((state) => state.court.courts);
  const profile = useAppSelector((state) => state.profile.publicProfile);
  const posts = useAppSelector((state) => state.profile.publicPosts);
  const [loading, setLoading] = useState(true);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const parsedUserId = useMemo(() => Number(userId), [userId]);

  useEffect(() => {
    dispatch(getAllBranchesFull());
  }, [dispatch]);

  useEffect(() => {
    if (!parsedUserId || Number.isNaN(parsedUserId)) return;

    if (currentUser?.id === parsedUserId) {
      navigate("/profile", { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          dispatch(getPublicProfile({ userId: parsedUserId })).unwrap(),
          dispatch(getPublicPosts({ userId: parsedUserId })).unwrap(),
        ]);
      } catch {
        // middleware xử lý toast lỗi
      } finally {
        setLoading(false);
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
            district?: string;
            city?: string;
          }
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
