import { useMemo, useState } from "react";
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

  const canSubmit = useMemo(() => content.trim().length <= 2000, [content]);

  const handleRepost = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await dispatch(repostPost({ postId, content: content.trim() || undefined })).unwrap();
      setContent("");
      onClose();
      toast.success("Đã đăng lại bài viết.");
    } catch (error) {
      const err = error as ApiErrorType | undefined;
      toast.error(err?.message || "Chia sẻ thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Chia sẻ (Re-post)</h2>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg hover:bg-gray-100 text-sm"
          >
            Đóng
          </button>
        </div>

        <div className="p-4">
          <p className="text-sm text-gray-600 mb-3">
            Bạn có thể thêm một nội dung (tuỳ chọn) trước khi đăng lại.
          </p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border rounded-xl px-3 py-2 min-h-[90px] focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
            placeholder="VD: Ai chơi chung CN này không..."
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={!canSubmit || submitting}
              onClick={handleRepost}
              className="px-4 py-2 rounded-xl bg-sky-600 text-white text-sm disabled:opacity-50"
            >
              {submitting ? "Đang đăng..." : "Đăng lại"}
            </button>
          </div>
          {!canSubmit && (
            <p className="text-xs text-red-500 mt-2">Nội dung không quá 2000 ký tự.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostRepostModal;

