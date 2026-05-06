import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { PostWithAuthor } from "../../../../types/post";
import { POST_TYPE_LABEL } from "../../../../utils/constants/postConstant";
import { useAppSelector } from "../../../../redux/hook";
import FormDataSummary from "./FormDataSummary";
import PostActions from "./PostActions";
import RepostOriginalEmbed from "./RepostOriginalEmbed";
import { formatRelativeTimeVi } from "../../../../utils/formatRelativeTimeVi";

type PostCardProps = {
  post: PostWithAuthor;
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
  /** Chỉ dùng trên trang profile: menu ⋮ với chỉnh sửa / xóa */
  ownerMenuActions?: {
    onEdit: () => void;
    onDelete: () => void;
  };
};

const PostCard = ({
  post,
  branchInfoById,
  courtNameById,
  ownerMenuActions,
}: PostCardProps) => {
  const navigate = useNavigate();
  const myUserId = useAppSelector((state) => state.auth.user?.id);
  const [ownerMenuOpen, setOwnerMenuOpen] = useState(false);
  const ownerMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ownerMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (
        ownerMenuRef.current &&
        !ownerMenuRef.current.contains(e.target as Node)
      ) {
        setOwnerMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [ownerMenuOpen]);
  const authorName =
    post.author?.profile?.fullName || post.author?.username || "Ẩn danh";
  const avatar = post.author?.profile?.avatar;

  const repostOfPostId = (() => {
    const n = post.repostOfPostId ?? null;
    return n && n > 0 ? n : null;
  })();
  const isRepost = repostOfPostId != null;

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-full bg-sky-100 overflow-hidden">
          {avatar ? (
            <img
              src={avatar}
              alt={authorName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sky-600 font-semibold text-sm">
              {authorName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              className="font-semibold text-gray-900 hover:underline"
              onClick={() => {
                const id = post.author?.id;
                if (!id) return;
                navigate(id === myUserId ? "/profile" : `/profile/${id}`);
              }}
            >
              {authorName}
            </button>
            {!isRepost && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
                {POST_TYPE_LABEL[post.type]}
              </span>
            )}
          </div>
          {isRepost && (
            <p className="text-sm text-emerald-600 mt-0.5 font-medium">
              Bài đăng lại
            </p>
          )}
          <p className="text-sm text-gray-500 flex items-center gap-1">
            {formatRelativeTimeVi(post.createdDate)}
            <span className="inline-flex items-center text-gray-400">
              • Công khai
            </span>
          </p>
        </div>

        {ownerMenuActions && (
          <div className="relative shrink-0" ref={ownerMenuRef}>
            <button
              type="button"
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
              title="Tùy chọn bài đăng"
              aria-expanded={ownerMenuOpen}
              aria-haspopup="menu"
              onClick={() => setOwnerMenuOpen((o) => !o)}
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {ownerMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-44 py-1 bg-white rounded-xl border border-gray-200 shadow-lg z-30"
                role="menu"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-sky-50 flex items-center gap-2"
                  onClick={() => {
                    ownerMenuActions.onEdit();
                    setOwnerMenuOpen(false);
                  }}
                >
                  <Pencil className="w-4 h-4 shrink-0 text-sky-600" />
                  Chỉnh sửa
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  onClick={() => {
                    ownerMenuActions.onDelete();
                    setOwnerMenuOpen(false);
                  }}
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  Xóa bài
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-4 pb-3">
        {!isRepost ? (
          <FormDataSummary
            post={post}
            branchInfoById={branchInfoById}
            courtNameById={courtNameById}
          />
        ) : (
          <>
            {/* Caption của người repost (optional) */}
            {post.content && (
              <p className="text-gray-700 text-sm whitespace-pre-wrap">
                {post.content}
              </p>
            )}
            <RepostOriginalEmbed
              originalPostId={repostOfPostId!}
              branchInfoById={branchInfoById}
              courtNameById={courtNameById}
            />
          </>
        )}
      </div>

      <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500 border-b border-gray-100">
        <span className="flex items-center gap-1">
          <span className="flex -space-x-1">
            <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
              👍
            </span>
            <span className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center text-white text-xs">
              😂
            </span>
          </span>
          <span>{post.likesCount ?? 0}</span>
        </span>
        <span>{post.commentsCount ?? 0} bình luận</span>
      </div>

      <PostActions post={post} />
    </article>
  );
};

export default PostCard;
