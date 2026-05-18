import { useEffect, useMemo, useRef } from "react";
import { ThumbsUp, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { PostWithAuthor } from "../../../../types/post";
import { POST_TYPE_LABEL } from "../../../../utils/constants/postConstant";
import { formatRelativeTimeVi } from "../../../../utils/formatRelativeTimeVi";
import FormDataSummary from "./FormDataSummary";
import PostActions from "./PostActions";
import RepostOriginalEmbed from "./RepostOriginalEmbed";
import { useAppSelector } from "../../../../redux/hook";

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
  const rightPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!post) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [post, onClose]);

  useEffect(() => {
    if (post) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [post]);

  const currentPost = latestPost || post;

  const commentPreviewNames = useMemo(() => {
    const names =
      currentPost?.comments
        ?.map(
          (comment) =>
            comment.author?.profile?.fullName ||
            comment.author?.username ||
            "Ẩn danh",
        )
        .filter(Boolean) ?? [];

    return Array.from(new Set(names)).slice(0, 5);
  }, [currentPost?.comments]);

  if (!currentPost) return null;

  const authorName =
    currentPost.author?.profile?.fullName ||
    currentPost.author?.username ||
    "Ẩn danh";
  const avatar = currentPost.author?.profile?.avatar;
  const letter = authorName.charAt(0).toUpperCase();
  const isRepost = Boolean(
    currentPost.repostOfPostId && currentPost.repostOfPostId > 0,
  );

  const handleNavigateToProfile = () => {
    const id = currentPost.author?.id;
    if (!id) return;
    onClose();
    navigate(id === myUserId ? "/profile" : `/profile/${id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-950/70 backdrop-blur-[2px]">
      <section className="relative hidden min-w-0 flex-1 overflow-hidden md:block">
        <div className="absolute left-5 top-5 z-20">
          <button
            type="button"
            onClick={onClose}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-900 shadow-lg transition-colors hover:bg-slate-100"
            aria-label="Đóng"
          >
            <X size={26} />
          </button>
        </div>

        <div className="flex h-full w-full items-center justify-center overflow-y-auto px-16 py-10">
          <div className="max-h-full w-full max-w-5xl overflow-y-auto rounded-md border border-white/70 bg-white text-slate-900 shadow-2xl">
            <div className="border-b border-slate-200 bg-white px-7 py-6">
              <span className="inline-flex items-center rounded-lg border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-700">
                {POST_TYPE_LABEL[currentPost.type]}
              </span>
              <h2 className="mt-3 text-[28px] font-bold leading-snug text-slate-950">
                {currentPost.title}
              </h2>
              {currentPost.content && !isRepost && (
                <p className="mt-2 text-[15px] leading-relaxed text-slate-700">
                  {currentPost.content}
                </p>
              )}
            </div>

            <div className="bg-white p-6">
              {isRepost ? (
                <div className="space-y-3">
                  {currentPost.content && (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                      {currentPost.content}
                    </p>
                  )}
                  <RepostOriginalEmbed
                    originalPostId={currentPost.repostOfPostId!}
                    branchInfoById={branchInfoById}
                    courtNameById={courtNameById}
                  />
                </div>
              ) : (
                <FormDataSummary
                  post={currentPost}
                  branchInfoById={branchInfoById}
                  courtNameById={courtNameById}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <aside
        ref={rightPanelRef}
        className="flex h-screen w-full shrink-0 flex-col overflow-hidden bg-white md:w-[450px] xl:w-[480px]"
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-5 py-4 md:hidden">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200"
            aria-label="Đóng"
          >
            <X size={22} />
          </button>
          <span className="font-semibold text-slate-900">
            Chi tiết bài viết
          </span>
        </div>

        <div className="shrink-0 border-b border-slate-100 bg-white px-5 py-5">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={handleNavigateToProfile}
              className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-sky-100 transition-opacity hover:opacity-90"
              title={authorName}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={authorName}
                  className="h-full w-full object-cover"
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
                className="block truncate text-[15px] font-semibold leading-tight text-slate-900 hover:underline"
              >
                {authorName}
              </button>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <span>{formatRelativeTimeVi(currentPost.createdDate)}</span>
                <span>·</span>
                <span>Công khai</span>
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="hidden shrink-0 rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 md:block"
              title="Đóng (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4">
            <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[10px] font-semibold text-sky-700">
              {POST_TYPE_LABEL[currentPost.type]}
            </span>
            <h1 className="mt-2 text-lg font-semibold leading-snug text-slate-900">
              {currentPost.title}
            </h1>
            {currentPost.content && (
              <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-700">
                {currentPost.content}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5 py-3">
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-white">
              <ThumbsUp size={12} />
            </span>
            <span className="text-sm font-medium text-gray-600">
              {currentPost.likesCount ?? 0}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="group relative cursor-default underline-offset-2 hover:underline">
              {currentPost.commentsCount ?? 0} bình luận
              {(currentPost.commentsCount ?? 0) > 0 && (
                <span className="pointer-events-none absolute right-0 top-full z-30 mt-2 hidden w-56 rounded-xl border border-slate-200 bg-white p-3 text-left text-xs text-slate-600 shadow-lg group-hover:block">
                  <span className="mb-1 block font-semibold text-slate-800">
                    Người đã bình luận
                  </span>
                  {commentPreviewNames.length > 0 ? (
                    commentPreviewNames.map((name) => (
                      <span key={name} className="block truncate py-0.5">
                        {name}
                      </span>
                    ))
                  ) : (
                    <span>Mở bình luận để xem chi tiết.</span>
                  )}
                </span>
              )}
            </span>
            {(currentPost.sharesCount ?? 0) > 0 && (
              <span>{currentPost.sharesCount} chia sẻ</span>
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-white">
          <PostActions post={currentPost} alwaysShowComments />
        </div>
      </aside>
    </div>
  );
};

export default PostDetailModal;
