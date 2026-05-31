import { memo, useEffect, useRef, useState } from "react";
import { Globe2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
  ownerMenuActions?: {
    onEdit: () => void;
    onDelete: () => void;
  };
  onOpenDetail?: () => void;
};

const PostCard = ({
  post,
  branchInfoById,
  courtNameById,
  ownerMenuActions,
  onOpenDetail,
}: PostCardProps) => {
  const navigate = useNavigate();
  const myUserId = useAppSelector((state) => state.auth.user?.id);
  const [ownerMenuOpen, setOwnerMenuOpen] = useState(false);
  const ownerMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ownerMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (ownerMenuRef.current && !ownerMenuRef.current.contains(e.target as Node)) {
        setOwnerMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [ownerMenuOpen]);

  const authorName =
    post.author?.profile?.fullName || post.author?.username || "Ẩn danh";
  const avatar = post.author?.profile?.avatar;
  const [avatarError, setAvatarError] = useState(false);
  useEffect(() => { setAvatarError(false); }, [avatar]);
  const repostOfPostId =
    post.repostOfPostId && post.repostOfPostId > 0 ? post.repostOfPostId : null;
  const isRepost = repostOfPostId != null;
  const commentPreviewNames =
    post.comments
      ?.map(
        (comment) =>
          comment.author?.profile?.fullName ||
          comment.author?.username ||
          "Ẩn danh",
      )
      .filter(Boolean) ?? [];
  const uniqueCommentPreviewNames = Array.from(new Set(commentPreviewNames)).slice(0, 5);

  return (
    <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50/40">
      <div className="flex items-start gap-3 p-5">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-sky-100 ring-4 ring-sky-50">
          {avatar && !avatarError ? (
            <img src={avatar} alt={authorName} className="h-full w-full object-cover" onError={() => setAvatarError(true)} />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-sky-700">
              {authorName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="max-w-[220px] truncate font-semibold text-slate-800 transition-colors hover:text-sky-600 sm:max-w-none"
              onClick={() => {
                const id = post.author?.id;
                if (!id) return;
                navigate(id === myUserId ? "/profile" : `/profile/${id}`);
              }}
            >
              {authorName}
            </button>

            {!isRepost && (
              <span className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
                {POST_TYPE_LABEL[post.type]}
              </span>
            )}
          </div>

          {isRepost && (
            <p className="mt-0.5 text-sm font-medium text-emerald-600">
              Bài đăng lại
            </p>
          )}

          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-400">
            {formatRelativeTimeVi(post.createdDate)}
            <span>-</span>
            <Globe2 size={13} />
            <span>Công khai</span>
          </p>
        </div>

        {ownerMenuActions && (
          <div className="relative shrink-0" ref={ownerMenuRef}>
            <button
              type="button"
              className="rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
              title="Tùy chọn bài đăng"
              aria-expanded={ownerMenuOpen}
              aria-haspopup="menu"
              onClick={() => setOwnerMenuOpen((open) => !open)}
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {ownerMenuOpen && (
              <div
                className="absolute right-0 top-full z-30 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-100 bg-white py-1 shadow-xl"
                role="menu"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-sky-50"
                  onClick={() => {
                    ownerMenuActions.onEdit();
                    setOwnerMenuOpen(false);
                  }}
                >
                  <Pencil className="h-4 w-4 shrink-0 text-sky-600" />
                  Chỉnh sửa
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                  onClick={() => {
                    ownerMenuActions.onDelete();
                    setOwnerMenuOpen(false);
                  }}
                >
                  <Trash2 className="h-4 w-4 shrink-0" />
                  Xóa bài
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className={`px-5 pb-4 ${onOpenDetail ? "cursor-pointer group/content" : ""}`}
        onClick={onOpenDetail}
        title={onOpenDetail ? "Nhấn để xem chi tiết" : undefined}
      >
        {!isRepost ? (
          <FormDataSummary
            post={post}
            branchInfoById={branchInfoById}
            courtNameById={courtNameById}
          />
        ) : (
          <>
            {post.content && (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
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

        {onOpenDetail && (
          <p className="mt-3 text-xs font-medium text-slate-500 opacity-0 transition-opacity group-hover/content:opacity-100">
            Nhấn để xem bài viết chi tiết và bình luận
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
        <span className="flex items-center gap-2">
          <span className="font-medium">{post.likesCount ?? 0}</span>
          lượt thích
        </span>

        <button
          type="button"
          onClick={onOpenDetail}
          className={`${onOpenDetail ? "cursor-pointer hover:text-slate-700 hover:underline" : "cursor-default"} group/comment relative transition-colors`}
        >
          {post.commentsCount ?? 0} bình luận
          {(post.commentsCount ?? 0) > 0 && (
            <span className="pointer-events-none absolute right-0 top-full z-30 mt-2 hidden w-56 rounded-xl border border-slate-200 bg-white p-3 text-left text-xs text-slate-600 shadow-lg group-hover/comment:block">
              <span className="mb-1 block font-semibold text-slate-800">
                Người đã bình luận
              </span>
              {uniqueCommentPreviewNames.length > 0 ? (
                uniqueCommentPreviewNames.map((name) => (
                  <span key={name} className="block truncate py-0.5">
                    {name}
                  </span>
                ))
              ) : (
                <span>Mở bài viết để xem chi tiết.</span>
              )}
            </span>
          )}
        </button>
      </div>

      <div className="border-t border-slate-100">
        <PostActions post={post} />
      </div>
    </article>
  );
};

export default memo(PostCard);
