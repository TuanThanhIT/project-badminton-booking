import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { PostComment } from "../../../../types/post";
import postSocialService from "../../../../services/user/postSocialService";
import { useAppDispatch, useAppSelector } from "../../../../redux/hook";
import {
  createComment,
  deleteComment,
} from "../../../../redux/slices/user/postSlice";
import { formatRelativeTimeVi } from "../../../../utils/formatRelativeTimeVi";
import { showConfirmDialog } from "../../../../utils/confirmDialog";
import type { CommentReportReason } from "../../../../types/post";

type Props = {
  postId: number;
  open: boolean;
};

type CommentNode = PostComment & { children: CommentNode[] };

const COMMENTS_PAGE_LIMIT = 10;
const DELETE_COMMENT_CONFIRM =
  "B\u1ea1n mu\u1ed1n g\u1ee1 b\u00ecnh lu\u1eadn n\u00e0y?";
const DELETE_COMMENT_DESCRIPTION =
  "B\u00ecnh lu\u1eadn s\u1ebd b\u1ecb g\u1ee1 kh\u1ecfi b\u00e0i vi\u1ebft. N\u1ebfu \u0111\u00e2y l\u00e0 b\u00ecnh lu\u1eadn g\u1ed1c, c\u00e1c ph\u1ea3n h\u1ed3i b\u00ean d\u01b0\u1edbi c\u0169ng s\u1ebd \u0111\u01b0\u1ee3c g\u1ee1.";
const DELETE_COMMENT_SUCCESS = "\u0110\u00e3 g\u1ee1 b\u00ecnh lu\u1eadn.";
const DELETE_COMMENT_ERROR = "Kh\u00f4ng th\u1ec3 g\u1ee1 b\u00ecnh lu\u1eadn.";
const DELETE_COMMENT_LABEL = "G\u1ee1";
const DELETING_COMMENT_LABEL = "\u0110ang g\u1ee1...";

const REPORT_REASONS: { value: CommentReportReason; label: string }[] = [
  { value: "SPAM", label: "Spam" },
  { value: "OFFENSIVE", label: "Ngôn từ xúc phạm" },
  { value: "UNAUTHORIZED_AD", label: "Quảng cáo trái phép" },
  { value: "HARASSMENT", label: "Quấy rối" },
  { value: "OTHER", label: "Khác" },
];

const mergeUniqueComments = (current: PostComment[], next: PostComment[]) => {
  const map = new Map<number, PostComment>();
  [...current, ...next].forEach((comment) => {
    map.set(comment.id, comment);
  });
  return Array.from(map.values());
};

const resizeTextareaToContent = (textarea: HTMLTextAreaElement | null) => {
  if (!textarea) return;
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
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
  onOpenReport: (comment: CommentNode) => void;
  onDelete: (comment: CommentNode) => void;
  deletingCommentId: number | null;
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
  onOpenReport,
  onDelete,
  deletingCommentId,
}: CommentItemProps) {
  const navigate = useNavigate();
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const name =
    node.author?.profile?.fullName || node.author?.username || "Ẩn danh";
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

  const isReplyBoxOpen = replyToId === node.id;
  const canReport =
    node.isDeleted !== true &&
    node.isActive !== false &&
    (!authorId || authorId !== myUserId);
  const canDelete =
    node.isDeleted !== true &&
    node.isActive !== false &&
    Boolean(authorId && authorId === myUserId);
  const initial = name.charAt(0).toUpperCase();
  const indentClass = depth > 0 ? "mt-2" : "mt-3";

  useEffect(() => {
    if (isReplyBoxOpen) {
      resizeTextareaToContent(replyTextareaRef.current);
    }
  }, [isReplyBoxOpen, replyContent]);

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

  return (
    <div className={indentClass}>
      <div className="flex items-start gap-2.5">
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
            <div className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-600">
              {initial}
            </div>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="inline-block max-w-full rounded-2xl bg-gray-100 px-3.5 py-2">
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

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 pl-3">
            <span className="text-[12px] text-gray-500">
              {formatRelativeTimeVi(node.createdAt)}
            </span>
            <button
              type="button"
              onClick={() => onOpenReply(node.id)}
              className="text-[12px] font-bold text-gray-700 hover:text-blue-700 hover:underline"
            >
              Trả lời
            </button>
            {canReport ? (
              <button
                type="button"
                onClick={() => onOpenReport(node)}
                className="text-[12px] font-medium text-gray-700 hover:text-red-600 hover:underline"
              >
                Báo cáo
              </button>
            ) : null}
            {canDelete ? (
              <button
                type="button"
                onClick={() => onDelete(node)}
                disabled={deletingCommentId === node.id}
                className="text-[12px] font-medium text-red-600 hover:underline disabled:cursor-wait disabled:opacity-60"
              >
                {deletingCommentId === node.id
                  ? DELETING_COMMENT_LABEL
                  : DELETE_COMMENT_LABEL}
              </button>
            ) : null}
          </div>

          {isReplyBoxOpen && (
            <div className="mt-2 flex items-stretch overflow-hidden rounded-2xl border border-gray-300 bg-white focus-within:border-sky-200">
              <textarea
                ref={replyTextareaRef}
                value={replyContent}
                onChange={(event) => {
                  onReplyContentChange(event.target.value);
                  resizeTextareaToContent(event.currentTarget);
                }}
                className="min-h-[56px] flex-1 resize-none overflow-hidden border-0 bg-transparent px-3.5 py-3 text-[15px] text-gray-900 outline-none placeholder:text-gray-400"
                placeholder="Viết câu trả lời..."
                rows={1}
              />
              <div className="flex w-[72px] shrink-0 flex-col border-l border-gray-100 bg-slate-50/70">
                <button
                  type="button"
                  onClick={() => onReplySubmit(node.id)}
                  disabled={!canReplySubmit || replySubmitting}
                  className="flex flex-1 items-center justify-center bg-sky-500 px-3 text-[13px] font-semibold text-white transition hover:bg-sky-600 disabled:pointer-events-none disabled:opacity-50"
                >
                  {replySubmitting ? "..." : "Gửi"}
                </button>
                <button
                  type="button"
                  onClick={onCancelReply}
                  className="flex flex-1 items-center justify-center px-3 text-[13px] font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-800"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {node.children.length > 0 && (
        <div className="ml-4 border-l border-gray-200 pl-3 sm:ml-10">
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
              onOpenReport={onOpenReport}
              onDelete={onDelete}
              deletingCommentId={deletingCommentId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const PostCommentsSection = ({ postId, open }: Props) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const commentTextareaRef = useRef<HTMLTextAreaElement>(null);
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
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null,
  );
  const [reportTarget, setReportTarget] = useState<CommentNode | null>(null);
  const [reportReason, setReportReason] = useState<CommentReportReason>("SPAM");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const canSubmit = useMemo(() => content.trim().length > 0, [content]);
  const canReplySubmit = useMemo(
    () => replyContent.trim().length > 0 && replyToId != null,
    [replyContent, replyToId],
  );

  const commentTree = useMemo(() => buildCommentTree(comments), [comments]);

  useEffect(() => {
    resizeTextareaToContent(commentTextareaRef.current);
  }, [content]);

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

  const onOpenReport = useCallback(
    (comment: CommentNode) => {
      if (!myUserId) {
        toast.info("Vui lòng đăng nhập để báo cáo bình luận.");
        navigate("/login");
        return;
      }
      setReportTarget(comment);
      setReportReason("SPAM");
      setReportDescription("");
    },
    [myUserId, navigate],
  );

  const closeReportModal = useCallback(() => {
    if (reportSubmitting) return;
    setReportTarget(null);
    setReportDescription("");
  }, [reportSubmitting]);

  const removeCommentFromList = useCallback((commentId: number) => {
    setComments((prev) =>
      prev.filter(
        (comment) => comment.id !== commentId && comment.parentId !== commentId,
      ),
    );
  }, []);

  const handleDeleteComment = useCallback(
    async (comment: CommentNode) => {
      if (deletingCommentId) return;
      const confirmed = await showConfirmDialog(
        DELETE_COMMENT_CONFIRM,
        DELETE_COMMENT_DESCRIPTION,
        DELETE_COMMENT_LABEL,
        "H\u1ee7y",
        "danger",
      );
      if (!confirmed) return;

      setDeletingCommentId(comment.id);
      try {
        await dispatch(
          deleteComment({ postId, commentId: comment.id }),
        ).unwrap();
        removeCommentFromList(comment.id);
        if (replyToId === comment.id) {
          setReplyToId(null);
          setReplyContent("");
        }
        toast.success(DELETE_COMMENT_SUCCESS);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || DELETE_COMMENT_ERROR);
      } finally {
        setDeletingCommentId(null);
      }
    },
    [deletingCommentId, dispatch, postId, removeCommentFromList, replyToId],
  );

  const handleReportSubmit = async () => {
    if (!reportTarget || reportSubmitting) return;
    setReportSubmitting(true);
    try {
      const res = await postSocialService.reportCommentService(
        reportTarget.id,
        {
          reason: reportReason,
          description: reportDescription.trim() || null,
        },
      );
      const payload = res.data.data;
      toast.success(res.data.message || "Đã gửi báo cáo bình luận.");
      if (payload?.autoHidden) {
        removeCommentFromList(reportTarget.id);
      }
      setReportTarget(null);
      setReportDescription("");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Không thể báo cáo bình luận.",
      );
    } finally {
      setReportSubmitting(false);
    }
  };

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
              ref={commentTextareaRef}
              value={content}
              onChange={(event) => {
                setContent(event.target.value);
                resizeTextareaToContent(event.currentTarget);
              }}
              className="min-h-[44px] flex-1 resize-none overflow-hidden rounded-2xl border-0 bg-slate-100 px-4 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-sky-400"
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
                  onOpenReport={onOpenReport}
                  onDelete={handleDeleteComment}
                  deletingCommentId={deletingCommentId}
                />
              ))}
              {hasMoreComments && (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="mt-3 text-[13px] font-medium text-slate-600 hover:underline disabled:opacity-50"
                >
                  {loadingMore ? "Đang tải..." : "Xem thêm bình luận"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {reportTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-slate-900">
                Báo cáo bình luận
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                {reportTarget.content}
              </p>
            </div>

            <label className="mb-1 block text-xs font-medium text-slate-600">
              Lý do
            </label>
            <select
              value={reportReason}
              onChange={(event) =>
                setReportReason(event.target.value as CommentReportReason)
              }
              className="mb-3 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
            >
              {REPORT_REASONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <label className="mb-1 block text-xs font-medium text-slate-600">
              Mô tả thêm
            </label>
            <textarea
              value={reportDescription}
              onChange={(event) => setReportDescription(event.target.value)}
              rows={3}
              maxLength={1000}
              className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
              placeholder="Nếu cần, hãy nói rõ vấn đề..."
            />

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeReportModal}
                disabled={reportSubmitting}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleReportSubmit}
                disabled={reportSubmitting}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
              >
                {reportSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PostCommentsSection;
