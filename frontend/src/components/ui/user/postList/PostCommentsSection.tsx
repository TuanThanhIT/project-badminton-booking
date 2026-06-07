import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { PostComment } from "../../../../types/post";
import postSocialService from "../../../../services/user/postSocialService";
import { useAppDispatch, useAppSelector } from "../../../../redux/hook";
import { createComment } from "../../../../redux/slices/user/postSlice";
import { formatRelativeTimeVi } from "../../../../utils/formatRelativeTimeVi";

type Props = {
  postId: number;
  open: boolean;
};

type CommentNode = PostComment & { children: CommentNode[] };

const COMMENTS_PAGE_LIMIT = 10;

const mergeUniqueComments = (current: PostComment[], next: PostComment[]) => {
  const map = new Map<number, PostComment>();
  [...current, ...next].forEach((comment) => {
    map.set(comment.id, comment);
  });
  return Array.from(map.values());
};

function buildCommentTree(comments: PostComment[]): CommentNode[] {
  const nodes = new Map<number, CommentNode>();
  const roots: CommentNode[] = [];

  comments.forEach((comment) => {
    nodes.set(comment.id, { ...comment, children: [] });
  });

  comments.forEach((comment) => {
    const node = nodes.get(comment.id);
    if (!node) return;

    const parentId = comment.parentId ?? null;
    if (!parentId) {
      roots.push(node);
      return;
    }

    const parentNode = nodes.get(parentId);
    if (parentNode) parentNode.children.push(node);
    else roots.push(node);
  });

  const visited = new Set<number>();
  const sortRecursive = (items: CommentNode[]) => {
    items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    items.forEach((node) => {
      if (visited.has(node.id)) return;
      visited.add(node.id);
      sortRecursive(node.children);
    });
  };
  sortRecursive(roots);

  return roots;
}

type CommentItemProps = {
  node: CommentNode;
  depth: number;
  myUserId?: number;
  replyToId: number | null;
  replyContent: string;
  replySubmitting: boolean;
  canReplySubmit: boolean;
  onOpenReply: (id: number) => void;
  onCancelReply: () => void;
  onReplyContentChange: (value: string) => void;
  onReplySubmit: (parentId: number) => void;
};

function CommentItem({
  node,
  depth,
  myUserId,
  replyToId,
  replyContent,
  replySubmitting,
  canReplySubmit,
  onOpenReply,
  onCancelReply,
  onReplyContentChange,
  onReplySubmit,
}: CommentItemProps) {
  const navigate = useNavigate();
  const name = node.author?.profile?.fullName || node.author?.username || "Ẩn danh";
  const authorId = node.author?.id;
  const avatarUrl = node.author?.profile?.avatar;
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [avatarUrl]);

  const openAuthorProfile = () => {
    if (!authorId) return;
    navigate(authorId === myUserId ? "/profile" : `/profile/${authorId}`);
  };

  if (depth > 20) {
    return (
      <div className="mt-2 border-l-2 border-gray-200 pl-2">
        <button
          type="button"
          onClick={openAuthorProfile}
          disabled={!authorId}
          className="text-[13px] font-semibold text-gray-900 hover:underline disabled:cursor-default disabled:hover:no-underline"
        >
          {name}
        </button>
        <p className="whitespace-pre-wrap text-[15px] leading-snug text-gray-800">
          {node.content}
        </p>
      </div>
    );
  }

  const isReplyBoxOpen = replyToId === node.id;
  const initial = name.charAt(0).toUpperCase();
  const indentClass = depth > 0 ? "ml-10 mt-2" : "mt-3";

  return (
    <div className={indentClass}>
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={openAuthorProfile}
          disabled={!authorId}
          className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gray-200 transition-opacity hover:opacity-80 disabled:cursor-default disabled:hover:opacity-100"
          title={authorId ? `Xem trang cá nhân của ${name}` : undefined}
        >
          {avatarUrl && !avatarError ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-600">
              {initial}
            </div>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="inline-block max-w-full rounded-2xl bg-gray-100 px-3 py-2">
            <button
              type="button"
              onClick={openAuthorProfile}
              disabled={!authorId}
              className="block text-[13px] font-semibold leading-tight text-gray-900 hover:underline disabled:cursor-default disabled:hover:no-underline"
            >
              {name}
            </button>
            <p className="whitespace-pre-wrap break-words text-[15px] leading-snug text-gray-800">
              {node.content}
            </p>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 pl-1">
            <span className="text-[12px] text-gray-500">
              {formatRelativeTimeVi(node.createdAt)}
            </span>
            <button
              type="button"
              onClick={() => onOpenReply(node.id)}
              className="text-[12px] font-semibold text-gray-700 hover:underline"
            >
              Trả lời
            </button>
          </div>

          {isReplyBoxOpen && (
            <div className="mt-2 flex items-end gap-2">
              <textarea
                value={replyContent}
                onChange={(event) => onReplyContentChange(event.target.value)}
                className="min-h-[64px] flex-1 resize-y rounded-xl border border-gray-200 bg-white px-3 py-2 text-[15px] text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Viết câu trả lời..."
                rows={2}
              />
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  onClick={() => onReplySubmit(node.id)}
                  disabled={!canReplySubmit || replySubmitting}
                  className="rounded-lg bg-sky-600 px-3 py-1.5 text-[13px] font-semibold text-white disabled:pointer-events-none disabled:opacity-50"
                >
                  {replySubmitting ? "..." : "Gửi"}
                </button>
                <button
                  type="button"
                  onClick={onCancelReply}
                  className="rounded-lg px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {node.children.length > 0 && (
        <div className="ml-4 border-l border-gray-200 pl-1">
          {node.children.map((child) => (
            <CommentItem
              key={child.id}
              node={child}
              depth={depth + 1}
              myUserId={myUserId}
              replyToId={replyToId}
              replyContent={replyContent}
              replySubmitting={replySubmitting}
              canReplySubmit={canReplySubmit}
              onOpenReply={onOpenReply}
              onCancelReply={onCancelReply}
              onReplyContentChange={onReplyContentChange}
              onReplySubmit={onReplySubmit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const PostCommentsSection = ({ postId, open }: Props) => {
  const dispatch = useAppDispatch();
  const myUserId = useAppSelector((state) => state.auth.user?.id);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [commentPage, setCommentPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const canSubmit = useMemo(() => content.trim().length > 0, [content]);
  const canReplySubmit = useMemo(
    () => replyContent.trim().length > 0 && replyToId != null,
    [replyContent, replyToId],
  );

  const commentTree = useMemo(() => buildCommentTree(comments), [comments]);

  useEffect(() => {
    if (!open) return;

    let ignore = false;
    setLoading(true);
    setCommentPage(1);
    postSocialService
      .getCommentsService(postId, { page: 1, limit: COMMENTS_PAGE_LIMIT })
      .then((res) => {
        if (ignore) return;
        const payload = res.data.data;
        setComments(payload?.comments ?? []);
        setHasMoreComments(Boolean(payload?.hasMore));
      })
      .catch(() => {
        if (ignore) return;
        setComments([]);
        setHasMoreComments(false);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [open, postId]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMoreComments) return;
    const nextPage = commentPage + 1;
    setLoadingMore(true);
    try {
      const res = await postSocialService.getCommentsService(postId, {
        page: nextPage,
        limit: COMMENTS_PAGE_LIMIT,
      });
      const payload = res.data.data;
      setComments((prev) => mergeUniqueComments(prev, payload?.comments ?? []));
      setCommentPage(payload?.page ?? nextPage);
      setHasMoreComments(Boolean(payload?.hasMore));
    } catch {
      toast.error("Không thể tải thêm bình luận.");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const result = await dispatch(
        createComment({ data: { postId, content: content.trim() } }),
      ).unwrap();
      setContent("");
      setComments((prev) => [result.comment, ...prev]);
      toast.success("Đã bình luận.");
    } catch {
      toast.error("Bình luận thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentId: number) => {
    if (!replyContent.trim() || replyToId !== parentId) return;
    setReplySubmitting(true);
    try {
      const result = await dispatch(
        createComment({
          data: { postId, content: replyContent.trim(), parentId },
        }),
      ).unwrap();
      setReplyContent("");
      setReplyToId(null);
      setComments((prev) => [result.comment, ...prev]);
      toast.success("Đã trả lời.");
    } catch {
      toast.error("Trả lời thất bại. Vui lòng thử lại.");
    } finally {
      setReplySubmitting(false);
    }
  };

  const onOpenReply = useCallback((id: number) => {
    setReplyToId(id);
    setReplyContent("");
  }, []);

  const onCancelReply = useCallback(() => {
    setReplyToId(null);
    setReplyContent("");
  }, []);

  if (!open) return null;

  return (
    <div className="border-t border-slate-200 bg-[#f0f2f5] px-4 py-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 bg-white px-4 py-3">
          <p className="text-[13px] font-semibold text-gray-700">Bình luận</p>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-end gap-2">
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="max-h-40 min-h-[44px] flex-1 resize-y rounded-2xl border-0 bg-slate-100 px-4 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="Viết bình luận công khai..."
              rows={1}
            />
            <button
              type="button"
              disabled={!canSubmit || submitting}
              onClick={handleSubmit}
              className="shrink-0 rounded-full bg-sky-600 px-4 py-2 text-[14px] font-semibold text-white disabled:pointer-events-none disabled:opacity-50"
            >
              {submitting ? "..." : "Đăng"}
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
            </div>
          ) : comments.length === 0 ? (
            <p className="py-4 text-center text-[14px] text-gray-500">
              Hãy là người đầu tiên bình luận.
            </p>
          ) : (
            <div>
              {commentTree.map((node) => (
                <CommentItem
                  key={node.id}
                  node={node}
                  depth={0}
                  myUserId={myUserId}
                  replyToId={replyToId}
                  replyContent={replyContent}
                  replySubmitting={replySubmitting}
                  canReplySubmit={canReplySubmit}
                  onOpenReply={onOpenReply}
                  onCancelReply={onCancelReply}
                  onReplyContentChange={setReplyContent}
                  onReplySubmit={handleReplySubmit}
                />
              ))}
              {hasMoreComments && (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="mt-3 text-[13px] font-semibold text-slate-600 hover:underline disabled:opacity-50"
                >
                  {loadingMore ? "Đang tải..." : "Xem thêm bình luận"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCommentsSection;
