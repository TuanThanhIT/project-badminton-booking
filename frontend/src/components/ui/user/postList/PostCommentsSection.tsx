import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import type { PostComment } from "../../../../types/post";
import postSocialService from "../../../../services/user/postSocialService";
import { useAppDispatch } from "../../../../redux/hook";
import { createComment } from "../../../../redux/slices/user/postSlice";
import { formatRelativeTimeVi } from "../../../../utils/formatRelativeTimeVi";

type Props = {
  postId: number;
  open: boolean;
};

type CommentNode = PostComment & { children: CommentNode[] };

function buildCommentTree(comments: PostComment[]): CommentNode[] {
  const nodes = new Map<number, CommentNode>();
  const roots: CommentNode[] = [];

  comments.forEach((c) => {
    nodes.set(c.id, { ...c, children: [] });
  });

  comments.forEach((c) => {
    const node = nodes.get(c.id);
    if (!node) return;

    const parentId = c.parentId ?? null;
    if (!parentId) {
      roots.push(node);
      return;
    }

    const parentNode = nodes.get(parentId);
    if (parentNode) parentNode.children.push(node);
    else roots.push(node);
  });

  const visited = new Set<number>();
  const sortRecursive = (arr: CommentNode[]) => {
    arr.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    arr.forEach((n) => {
      if (visited.has(n.id)) return;
      visited.add(n.id);
      sortRecursive(n.children);
    });
  };
  sortRecursive(roots);

  return roots;
}

type CommentItemProps = {
  node: CommentNode;
  depth: number;
  replyToId: number | null;
  replyContent: string;
  replySubmitting: boolean;
  canReplySubmit: boolean;
  onOpenReply: (id: number) => void;
  onCancelReply: () => void;
  onReplyContentChange: (v: string) => void;
  onReplySubmit: (parentId: number) => void;
};

function CommentItem({
  node,
  depth,
  replyToId,
  replyContent,
  replySubmitting,
  canReplySubmit,
  onOpenReply,
  onCancelReply,
  onReplyContentChange,
  onReplySubmit,
}: CommentItemProps) {
  const name =
    node.author?.profile?.fullName || node.author?.username || "Ẩn danh";
  const avatarUrl = node.author?.profile?.avatar;
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [avatarUrl]);

  if (depth > 20) {
    return (
      <div className="mt-2 pl-2 border-l-2 border-gray-200">
        <p className="font-semibold text-[13px] text-gray-900">{name}</p>
        <p className="text-[15px] text-gray-800 whitespace-pre-wrap leading-snug">
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
      <div className="flex gap-2 items-start">
        <div className="shrink-0 w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
          {avatarUrl && !avatarError ? (
            <img
              src={avatarUrl}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-semibold">
              {initial}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="inline-block max-w-full rounded-2xl bg-gray-100 px-3 py-2">
            <p className="font-semibold text-[13px] text-gray-900 leading-tight">
              {name}
            </p>
            <p className="text-[15px] text-gray-800 whitespace-pre-wrap leading-snug break-words">
              {node.content}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 pl-1">
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
            <div className="mt-2 flex gap-2 items-end">
              <textarea
                value={replyContent}
                onChange={(e) => onReplyContentChange(e.target.value)}
                className="flex-1 min-h-[64px] rounded-xl border border-gray-200 bg-white px-3 py-2 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent resize-y"
                placeholder="Viết câu trả lời..."
                rows={2}
              />
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onReplySubmit(node.id)}
                  disabled={!canReplySubmit || replySubmitting}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-[13px] font-semibold disabled:opacity-50 disabled:pointer-events-none"
                >
                  {replySubmitting ? "…" : "Gửi"}
                </button>
                <button
                  type="button"
                  onClick={onCancelReply}
                  className="px-3 py-1.5 rounded-lg text-[13px] text-gray-600 hover:bg-gray-100"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {node.children.length > 0 && (
        <div className="border-l border-gray-200 ml-4 pl-1">
          {node.children.map((child) => (
            <CommentItem
              key={child.id}
              node={child}
              depth={depth + 1}
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
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(false);
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

  const commentTree = useMemo(
    () => buildCommentTree(comments),
    [comments],
  );

  useEffect(() => {
    if (!open) return;

    let ignore = false;
    setLoading(true);
    postSocialService
      .getCommentsService(postId)
      .then((res) => {
        if (ignore) return;
        setComments(
          (res.data as { data?: { comments?: PostComment[] } }).data?.comments ?? [],
        );
      })
      .catch(() => {
        toast.error("Không tải được bình luận.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [open, postId]);

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
        <div className="px-4 py-3 border-b border-slate-100 bg-white">
          <p className="text-[13px] font-semibold text-gray-700">Bình luận</p>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex gap-2 items-end">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[44px] max-h-40 flex-1 resize-y rounded-2xl border-0 bg-slate-100 px-4 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="Viết bình luận công khai..."
              rows={1}
            />
            <button
              type="button"
              disabled={!canSubmit || submitting}
              onClick={handleSubmit}
              className="shrink-0 rounded-full bg-sky-600 px-4 py-2 text-[14px] font-semibold text-white disabled:pointer-events-none disabled:opacity-50"
            >
              {submitting ? "…" : "Đăng"}
            </button>
          </div>

          {loading ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin w-7 h-7 border-2 border-sky-600 border-t-transparent rounded-full" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-[14px] text-gray-500 py-4">
              Hãy là người đầu tiên bình luận.
            </p>
          ) : (
            <div>
              {commentTree.map((node) => (
                <CommentItem
                  key={node.id}
                  node={node}
                  depth={0}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCommentsSection;
