import { useMemo, useState } from "react";
import { MessageSquareText, Repeat2, Send, X } from "lucide-react";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../../../redux/hook";
import { repostPost } from "../../../../redux/slices/user/postSlice";
import type { ApiErrorType } from "../../../../types/error";

type Props = {
  open: boolean;
  postId: number;
  onClose: () => void;
};

const PostRepostModal = ({ open, postId, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const trimmedContent = content.trim();
  const canSubmit = useMemo(
    () => trimmedContent.length <= 2000,
    [trimmedContent],
  );

  const handleRepost = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await dispatch(
        repostPost({ postId, content: trimmedContent || undefined }),
      ).unwrap();
      setContent("");
      onClose();
      toast.success("Đã chia sẻ bài viết.");
    } catch (error) {
      const err = error as ApiErrorType | undefined;
      toast.error(err?.message || "Chia sẻ thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
              <Repeat2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Chia sẻ bài viết
              </h2>
              <p className="text-sm text-slate-500">
                Thêm cảm nghĩ của bạn trước khi đăng lại.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
              <MessageSquareText size={16} className="text-sky-600" />
              Nội dung chia sẻ
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[130px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-700 outline-none placeholder:text-slate-400 focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
              placeholder="Viết vài dòng giới thiệu hoặc cảm nghĩ của bạn..."
            />
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className={canSubmit ? "text-slate-400" : "text-red-500"}>
                {content.length}/2000 ký tự
              </span>
              <span className="text-slate-400">Có thể để trống</span>
            </div>
          </div>

          {!canSubmit && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
              Nội dung không quá 2000 ký tự.
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={!canSubmit || submitting}
              onClick={handleRepost}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={16} />
              {submitting ? "Đang chia sẻ..." : "Chia sẻ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostRepostModal;
