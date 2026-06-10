import { useEffect, useState } from "react";
import { Globe2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { PostReactionType, PostWithAuthor } from "../../../../types/post";
import { POST_TYPE_LABEL } from "../../../../utils/constants/postConstant";
import { formatRelativeTimeVi } from "../../../../utils/formatRelativeTimeVi";
import FormDataSummary from "./FormDataSummary";
import PostActions from "./PostActions";
import RepostOriginalEmbed from "./RepostOriginalEmbed";
import { useAppSelector } from "../../../../redux/hook";
import ClassEnrollAction from "../coach/ClassEnrollAction";

type Props = {
  post: PostWithAuthor | null;
  onClose: () => void;
  branchInfoById: Record<
    number,
    {
      branchName: string;
      address?: string;
      ward?: string;
      district?: string;
      province?: string;
    }
  >;
  courtNameById: Record<number, string>;
};

const REACTION_ICON: Record<PostReactionType, string> = {
  LIKE: "\u{1F44D}",
  LOVE: "\u2764\uFE0F",
  HAHA: "\u{1F606}",
  WOW: "\u{1F62E}",
  SAD: "\u{1F622}",
  ANGRY: "\u{1F621}",
};

const PostDetailModal = ({
  post,
  onClose,
  branchInfoById,
  courtNameById,
}: Props) => {
  const navigate = useNavigate();
  const myUserId = useAppSelector((state) => state.auth.user?.id);
  const latestPost = useAppSelector((state) => {
    if (!post) return null;

    return (
      state.post.posts.posts.find((item) => item.id === post.id) ||
      state.profile.myPosts.find((item) => item.id === post.id) ||
      state.profile.publicPosts.find((item) => item.id === post.id) ||
      post
    );
  });

  useEffect(() => {
    if (!post) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [post, onClose]);

  useEffect(() => {
    if (post) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [post]);

  const currentPost = latestPost || post;
  const avatar = currentPost?.author?.profile?.avatar;
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [avatar]);

  if (!currentPost) return null;

  const authorName =
    currentPost.author?.profile?.fullName ||
    currentPost.author?.username ||
    "Ẩn danh";
  const letter = authorName.charAt(0).toUpperCase();
  const isRepost = Boolean(
    currentPost.repostOfPostId && currentPost.repostOfPostId > 0,
  );
  const reactionEntries = Object.entries(currentPost.reactionSummary ?? {})
    .filter((entry): entry is [PostReactionType, number] => Number(entry[1]) > 0)
    .sort((a, b) => b[1] - a[1]);
  const reactionIcons = reactionEntries.slice(0, 3).map(([type]) => REACTION_ICON[type]);
  const likesCount = currentPost.likesCount ?? 0;
  const commentsCount = currentPost.commentsCount ?? 0;
  const sharesCount = currentPost.sharesCount ?? 0;

  const handleNavigateToProfile = () => {
    const id = currentPost.author?.id;
    if (!id) return;
    onClose();
    navigate(id === myUserId ? "/profile" : `/profile/${id}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-2 py-4 backdrop-blur-[2px] sm:px-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="flex h-[min(94vh,900px)] w-full max-w-[740px] flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <header className="relative flex h-14 shrink-0 items-center justify-center border-b border-slate-200 bg-white px-14">
          <h2 className="max-w-full truncate text-base font-semibold text-slate-900 sm:text-lg">
            Bài viết của {authorName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
            aria-label="Đóng"
            title="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#f0f2f5]">
          <article className="bg-white">
            <div className="flex items-start gap-3 px-4 pb-3 pt-4 sm:px-5">
              <button
                type="button"
                onClick={handleNavigateToProfile}
                className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-sky-100 transition-opacity hover:opacity-90"
                title={authorName}
              >
                {avatar && !avatarError ? (
                  <img
                    src={avatar}
                    alt={authorName}
                    className="h-full w-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-sky-600">
                    {letter}
                  </div>
                )}
              </button>

              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={handleNavigateToProfile}
                  className="block max-w-full truncate text-[15px] font-semibold leading-tight text-slate-900 hover:underline"
                >
                  {authorName}
                </button>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                  <span>{formatRelativeTimeVi(currentPost.createdAt)}</span>
                  <span>-</span>
                  <Globe2 className="h-3.5 w-3.5" />
                  <span>Công khai</span>
                  {!isRepost && (
                    <>
                      <span>-</span>
                      <span className="rounded-full bg-sky-50 px-2 py-0.5 font-semibold text-sky-700">
                        {POST_TYPE_LABEL[currentPost.type]}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 px-4 pb-4 sm:px-5">
              {isRepost ? (
                <>
                  {currentPost.content && (
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-900">
                      {currentPost.content}
                    </p>
                  )}
                  <RepostOriginalEmbed
                    originalPostId={currentPost.repostOfPostId!}
                    branchInfoById={branchInfoById}
                    courtNameById={courtNameById}
                  />
                </>
              ) : (
                <>
                  <div>
                    <h1 className="text-xl font-semibold leading-snug text-slate-950">
                      {currentPost.title}
                    </h1>
                    {currentPost.content && (
                      <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-900">
                        {currentPost.content}
                      </p>
                    )}
                  </div>
                  <FormDataSummary
                    post={currentPost}
                    branchInfoById={branchInfoById}
                    courtNameById={courtNameById}
                  />
                </>
              )}

              {currentPost.type === "CLASS" && (
                <div className="pt-1">
                  <ClassEnrollAction postId={currentPost.id} compact />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500 sm:px-5">
              <span className="flex items-center gap-2">
                {reactionIcons.length > 0 && (
                  <span className="flex -space-x-1">
                    {reactionIcons.map((icon, index) => (
                      <span
                        key={`${icon}-${index}`}
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm shadow-sm ring-1 ring-white"
                      >
                        {icon}
                      </span>
                    ))}
                  </span>
                )}
                <span className="font-medium">{likesCount}</span>
              </span>

              <div className="flex items-center gap-4">
                <span>{commentsCount} bình luận</span>
                <span>{sharesCount} chia sẻ</span>
              </div>
            </div>

            <PostActions post={currentPost} alwaysShowComments />
          </article>
        </div>
      </section>
    </div>
  );
};

export default PostDetailModal;
