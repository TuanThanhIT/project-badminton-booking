import { useMemo, useRef, useState } from "react";
import { MessageCircle, Share2 } from "lucide-react";
import { toast } from "react-toastify";
import type { PostReactionType, PostWithAuthor } from "../../../../types/post";
import { useAppDispatch } from "../../../../redux/hook";
import { toggleLike } from "../../../../redux/slices/user/postSlice";
import PostCommentsSection from "./PostCommentsSection";
import PostRepostModal from "./PostRepostModal";

const REACTIONS: Array<{
  type: PostReactionType;
  icon: string;
  label: string;
  className: string;
}> = [
  { type: "LIKE", icon: "\u{1F44D}", label: "Thích", className: "text-sky-600" },
  { type: "LOVE", icon: "\u2764\uFE0F", label: "Yêu thích", className: "text-rose-600" },
  { type: "HAHA", icon: "\u{1F606}", label: "Haha", className: "text-amber-500" },
  { type: "WOW", icon: "\u{1F62E}", label: "Wow", className: "text-amber-500" },
  { type: "SAD", icon: "\u{1F622}", label: "Buồn", className: "text-amber-500" },
  { type: "ANGRY", icon: "\u{1F621}", label: "Phẫn nộ", className: "text-orange-600" },
];

type Props = {
  post: PostWithAuthor;
  alwaysShowComments?: boolean;
  onOpenDetail?: () => void;
};

const PostActions = ({ post, alwaysShowComments = false, onOpenDetail }: Props) => {
  const dispatch = useAppDispatch();
  const closeTimerRef = useRef<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [repostOpen, setRepostOpen] = useState(false);
  const [reactionPickerOpen, setReactionPickerOpen] = useState(false);

  const likesCount = post.likesCount ?? 0;
  const commentsCount = post.commentsCount ?? 0;
  const sharesCount = post.sharesCount ?? 0;
  const likedByMe = Boolean(post.likedByMe);
  const sharedByMe = Boolean(post.sharedByMe);
  const currentReaction =
    REACTIONS.find((reaction) => reaction.type === post.reactionByMe) ||
    (likedByMe ? REACTIONS[0] : null);

  const likeButtonClass = useMemo(
    () =>
      likedByMe
        ? `${currentReaction?.className || "text-sky-600"} hover:bg-slate-100`
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-800",
    [currentReaction?.className, likedByMe],
  );

  const shareButtonClass = useMemo(
    () =>
      sharedByMe
        ? "text-emerald-600 hover:bg-slate-100"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-800",
    [sharedByMe],
  );

  const openPicker = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    setReactionPickerOpen(true);
  };

  const closePickerSoon = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setReactionPickerOpen(false);
    }, 180);
  };

  const handleToggleLike = async (reactionType: PostReactionType = "LIKE") => {
    if (busy) return;
    setBusy(true);
    try {
      await dispatch(toggleLike({ postId: post.id, reactionType })).unwrap();
      setReactionPickerOpen(false);
    } catch {
      toast.error("Không thể thao tác cảm xúc. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-1 border-t border-slate-100 px-3 py-2">
        <div
          className="relative"
          onPointerEnter={openPicker}
          onPointerLeave={closePickerSoon}
        >
          {reactionPickerOpen && (
            <div
              className="absolute bottom-full left-1/2 z-50 flex -translate-x-1/2 translate-y-1 items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-xl"
              onPointerEnter={openPicker}
              onPointerLeave={closePickerSoon}
            >
              {REACTIONS.map((reaction) => (
                <button
                  key={reaction.type}
                  type="button"
                  disabled={busy}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleToggleLike(reaction.type);
                  }}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[22px] leading-none transition-transform hover:-translate-y-1 hover:scale-125 disabled:opacity-50"
                  title={reaction.label}
                  aria-label={reaction.label}
                >
                  {reaction.icon}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => handleToggleLike(currentReaction?.type || "LIKE")}
            onTouchStart={openPicker}
            disabled={busy}
            className={`flex min-h-10 w-full items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors disabled:opacity-50 ${likeButtonClass}`}
          >
            <span className="text-lg leading-none">
              {currentReaction?.icon || "\u{1F44D}"}
            </span>
            <span className="hidden sm:inline">
              {currentReaction?.label || "Thích"}
            </span>
            <span className="min-w-[1.25rem] text-left text-sm font-semibold text-emerald-600">
              {likesCount}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!alwaysShowComments) onOpenDetail?.();
          }}
          className={`flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800 ${
            alwaysShowComments ? "cursor-default" : ""
          }`}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Bình luận</span>
          <span className="min-w-[1.25rem] text-left text-sm font-semibold text-emerald-600">
            {commentsCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setRepostOpen(true)}
          className={`flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors ${shareButtonClass}`}
        >
          <Share2 className={`h-4 w-4 ${sharedByMe ? "text-emerald-600" : ""}`} />
          <span className="hidden sm:inline">Chia sẻ</span>
          <span className="min-w-[1.25rem] text-left text-sm font-semibold text-emerald-600">
            {sharesCount}
          </span>
        </button>
      </div>

      <PostCommentsSection postId={post.id} open={alwaysShowComments} />
      <PostRepostModal
        open={repostOpen}
        postId={post.id}
        onClose={() => setRepostOpen(false)}
      />
    </>
  );
};

export default PostActions;
