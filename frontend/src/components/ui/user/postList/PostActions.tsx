import { useMemo, useState } from "react";
import { MessageCircle, Share2, ThumbsUp } from "lucide-react";
import { toast } from "react-toastify";
import type { PostWithAuthor } from "../../../../types/post";
import { useAppDispatch } from "../../../../redux/hook";
import { toggleLike } from "../../../../redux/slices/user/postSlice";
import PostCommentsSection from "./PostCommentsSection";
import PostRepostModal from "./PostRepostModal";

type Props = {
  post: PostWithAuthor;
  alwaysShowComments?: boolean;
};

const PostActions = ({ post, alwaysShowComments = false }: Props) => {
  const dispatch = useAppDispatch();
  const [busy, setBusy] = useState(false);
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [repostOpen, setRepostOpen] = useState(false);
  const isCommentsOpen = alwaysShowComments || commentsExpanded;

  const likesCount = post.likesCount ?? 0;
  const commentsCount = post.commentsCount ?? 0;
  const sharesCount = post.sharesCount ?? 0;
  const likedByMe = Boolean(post.likedByMe);
  const sharedByMe = Boolean(post.sharedByMe);

  const likeButtonClass = useMemo(
    () => (likedByMe ? "text-sky-700 bg-sky-50" : "text-slate-600"),
    [likedByMe],
  );

  const shareButtonClass = useMemo(
    () => (sharedByMe ? "text-emerald-700 bg-emerald-50" : "text-slate-600"),
    [sharedByMe],
  );

  const handleToggleLike = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await dispatch(toggleLike({ postId: post.id })).unwrap();
    } catch {
      toast.error("Không thể thao tác like. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="flex border-t border-slate-100">
        <button
          type="button"
          onClick={handleToggleLike}
          disabled={busy}
          className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition hover:bg-slate-50 disabled:opacity-50 ${likeButtonClass}`}
        >
          <ThumbsUp className={`h-4 w-4 ${likedByMe ? "text-sky-600" : ""}`} />
          Thích
          <span className="ml-1 text-xs text-slate-400">{likesCount}</span>
        </button>

        <button
          type="button"
          onClick={() => !alwaysShowComments && setCommentsExpanded((v) => !v)}
          className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition hover:bg-slate-50 ${
            isCommentsOpen ? "bg-sky-50/80 text-sky-700" : "text-slate-600"
          } ${alwaysShowComments ? "cursor-default" : ""}`}
        >
          <MessageCircle className="h-4 w-4" />
          Bình luận
          <span className="ml-1 text-xs text-slate-400">{commentsCount}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (sharedByMe) return;
            setRepostOpen(true);
          }}
          className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition hover:bg-slate-50 ${shareButtonClass}`}
        >
          <Share2 className={`h-4 w-4 ${sharedByMe ? "text-emerald-600" : ""}`} />
          {sharedByMe ? "Đã chia sẻ" : "Chia sẻ"}
          <span className="ml-1 text-xs text-slate-400">{sharesCount}</span>
        </button>
      </div>

      <PostCommentsSection postId={post.id} open={isCommentsOpen} />
      <PostRepostModal open={repostOpen} postId={post.id} onClose={() => setRepostOpen(false)} />
    </>
  );
};

export default PostActions;
