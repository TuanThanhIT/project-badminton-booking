import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { PostWithAuthor } from "../../../../types/post";
import { POST_TYPE_LABEL } from "../../../../constants/postConstant";
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

const TYPE_GRADIENT: Record<string, string> = {
  FIND_PLAYER: "from-sky-500 to-blue-600",
  TOURNAMENT: "from-amber-500 to-orange-600",
  GROUP: "from-emerald-500 to-teal-600",
  CLASS: "from-violet-500 to-purple-600",
  FIND_COACH: "from-rose-500 to-pink-600",
};

const PostDetailModal = ({ post, onClose, branchInfoById, courtNameById }: Props) => {
  const navigate = useNavigate();
  const myUserId = useAppSelector((state) => state.auth.user?.id);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!post) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [post, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (post) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [post]);

  if (!post) return null;

  const authorName = post.author?.profile?.fullName || post.author?.username || "Ẩn danh";
  const avatar = post.author?.profile?.avatar;
  const letter = authorName.charAt(0).toUpperCase();
  const isRepost = Boolean(post.repostOfPostId && post.repostOfPostId > 0);
  const gradient = TYPE_GRADIENT[post.type] || "from-sky-500 to-blue-600";

  const handleNavigateToProfile = () => {
    const id = post.author?.id;
    if (!id) return;
    onClose();
    navigate(id === myUserId ? "/profile" : `/profile/${id}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-2 md:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-5xl h-[96vh] md:h-[90vh] flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ═══ LEFT PANEL: Post content ═══ */}
        <div className="hidden md:flex flex-1 flex-col overflow-hidden bg-gradient-to-br from-slate-50 to-gray-100 border-r border-gray-200">
          {/* Type gradient header */}
          <div className={`bg-gradient-to-r ${gradient} px-6 py-5 shrink-0`}>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-white/20 text-white border border-white/30 backdrop-blur-sm">
              {POST_TYPE_LABEL[post.type]}
            </span>
            <h2 className="text-xl font-bold text-white mt-3 leading-snug drop-shadow-sm">
              {post.title}
            </h2>
            {post.content && !isRepost && (
              <p className="mt-2 text-sm text-white/85 leading-relaxed line-clamp-3">
                {post.content}
              </p>
            )}
          </div>

          {/* FormData content */}
          <div className="flex-1 overflow-y-auto p-5">
            {isRepost ? (
              <div className="space-y-3">
                {post.content && (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </p>
                )}
                <RepostOriginalEmbed
                  originalPostId={post.repostOfPostId!}
                  branchInfoById={branchInfoById}
                  courtNameById={courtNameById}
                />
              </div>
            ) : (
              <FormDataSummary
                post={post}
                branchInfoById={branchInfoById}
                courtNameById={courtNameById}
              />
            )}
          </div>
        </div>

        {/* ═══ RIGHT PANEL: Author + Comments ═══ */}
        <div
          ref={rightPanelRef}
          className="w-full md:w-[390px] flex flex-col shrink-0 bg-white overflow-hidden"
        >
          {/* Author header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3 shrink-0 bg-white shadow-sm">
            <button
              type="button"
              onClick={handleNavigateToProfile}
              className="w-10 h-10 rounded-full overflow-hidden bg-sky-100 shrink-0 hover:opacity-90 transition-opacity"
              title={authorName}
            >
              {avatar ? (
                <img src={avatar} alt={authorName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sky-600 font-bold text-sm">
                  {letter}
                </div>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <button
                type="button"
                onClick={handleNavigateToProfile}
                className="font-semibold text-gray-900 text-sm hover:underline leading-tight block truncate"
              >
                {authorName}
              </button>
              <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                <span>{formatRelativeTimeVi(post.createdDate)}</span>
                <span>·</span>
                <span>🌐 Công khai</span>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
              title="Đóng (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile-only: type + title + content */}
          <div className="md:hidden shrink-0">
            <div className={`bg-gradient-to-r ${gradient} px-4 py-3`}>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">
                {POST_TYPE_LABEL[post.type]}
              </span>
              <p className="font-semibold text-white text-sm mt-2 leading-snug">{post.title}</p>
              {post.content && !isRepost && (
                <p className="text-xs text-white/80 mt-1 line-clamp-2">{post.content}</p>
              )}
            </div>
          </div>

          {/* Social counts row */}
          <div className="px-4 py-2 flex items-center justify-between border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1">
                <span className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center text-[11px] border-2 border-white">
                  👍
                </span>
                <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[11px] border-2 border-white">
                  ❤️
                </span>
              </div>
              <span className="text-sm text-gray-600 font-medium">{post.likesCount ?? 0}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{post.commentsCount ?? 0} bình luận</span>
              {(post.sharesCount ?? 0) > 0 && (
                <span>{post.sharesCount} chia sẻ</span>
              )}
            </div>
          </div>

          {/* Actions + Comments — scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <PostActions post={post} alwaysShowComments />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;
