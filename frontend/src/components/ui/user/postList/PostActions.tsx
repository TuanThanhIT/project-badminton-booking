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
    () =>
      likedByMe
        ? "text-sky-600 hover:bg-slate-100"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-800",
    [likedByMe],
  );

  const shareButtonClass = useMemo(
    () =>
      sharedByMe
        ? "text-emerald-600 hover:bg-slate-100"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-800",
    [sharedByMe],
  );

  const handleToggleLike = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await dispatch(toggleLike({ postId: post.id })).unwrap();
    } catch {
      toast.error("Không thể thao tác thích. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-1 border-t border-slate-100 px-3 py-2">
        <button
          type="button"
          onClick={handleToggleLike}
          disabled={busy}
          className={`flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors disabled:opacity-50 ${likeButtonClass}`}
        >
          <ThumbsUp className="h-5 w-5" />
          <span className="hidden sm:inline">{likedByMe ? "Đã thích" : "Thích"}</span>
          <span className={likedByMe ? "text-sky-600" : "text-slate-400"}>
            {likesCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => !alwaysShowComments && setCommentsExpanded((v) => !v)}
          className={`flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800 ${
            alwaysShowComments ? "cursor-default" : ""
          }`}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Bình luận</span>
          <span className="text-slate-400">{commentsCount}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (sharedByMe) return;
            setRepostOpen(true);
          }}
          className={`flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors ${shareButtonClass}`}
        >
          <Share2 className={`h-4 w-4 ${sharedByMe ? "text-emerald-600" : ""}`} />
          <span className="hidden sm:inline">
            {sharedByMe ? "Đã chia sẻ" : "Chia sẻ"}
          </span>
          <span className={sharedByMe ? "text-emerald-600" : "text-slate-400"}>
            {sharesCount}
          </span>
        </button>
      </div>

      <PostCommentsSection postId={post.id} open={isCommentsOpen} />
      <PostRepostModal
        open={repostOpen}
        postId={post.id}
        onClose={() => setRepostOpen(false)}
      />
    </>
  );
};

export default PostActions;
