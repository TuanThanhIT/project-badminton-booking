import { useEffect, useState } from "react";
import { CheckCircle2, ShieldAlert, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import adminPostService from "../../../../services/admin/postService";
import type {
  AdminModerationPost,
  ModerationLabel,
} from "../../../../types/admin";
import AdminModal, {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  adminTextAreaClass,
} from "../AdminModal";

const LABEL_TEXT: Record<string, string> = {
  normal: "Bình thường",
  spam: "Spam",
  unauthorized_ad: "Quảng cáo trái phép",
  offensive: "Công kích / xúc phạm",
};

type Props = {
  postId: number;
  onClose: () => void;
  onResolved: () => void;
};

const ModerationReviewModal = ({
  postId,
  onClose,
  onResolved,
}: Props) => {
  const [post, setPost] = useState<AdminModerationPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<"approve" | "reject" | null>(
    null,
  );
  const [reason, setReason] = useState("");
  const [label, setLabel] = useState<ModerationLabel | "">("");

  useEffect(() => {
    adminPostService
      .getPostModerationDetailService(postId)
      .then((response) => {
        const data = (response.data as any).data as AdminModerationPost;
        setPost(data);
        setReason(data.moderationReason || "");
        setLabel(data.moderationLabel || "");
      })
      .catch((error: any) => {
        toast.error(error?.message || "Không thể tải chi tiết kiểm duyệt");
        onClose();
      })
      .finally(() => setLoading(false));
  }, [onClose, postId]);

  const approve = async () => {
    setSubmitting("approve");
    try {
      await adminPostService.approveModerationPostService(postId, { reason });
      toast.success("Đã duyệt và công khai bài viết");
      onResolved();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Không thể duyệt bài viết");
    } finally {
      setSubmitting(null);
    }
  };

  const reject = async () => {
    if (!label || label === "normal") {
      toast.warning("Vui lòng chọn một nhãn vi phạm");
      return;
    }

    setSubmitting("reject");
    try {
      await adminPostService.rejectModerationPostService(postId, {
        label,
        reason,
      });
      toast.success("Đã từ chối bài viết và ghi nhận vi phạm");
      onResolved();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Không thể từ chối bài viết");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <AdminModal
      title="Duyệt nội dung bài viết"
      description={`Bài viết #${postId}`}
      icon={<ShieldAlert className="h-5 w-5 text-amber-600" />}
      onClose={onClose}
      maxWidth="max-w-4xl"
    >
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
        </div>
      ) : post ? (
        <div className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <section className="space-y-3 rounded-xl border border-slate-200 p-4">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Tác giả
                </p>
                <p className="font-semibold text-slate-800">
                  {post.author?.profile?.fullName ||
                    post.author?.username ||
                    "Không rõ"}
                </p>
                <p className="text-xs text-slate-500">
                  @{post.author?.username} · {post.author?.violationCount || 0} vi
                  phạm
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Nội dung gốc
                </p>
                <h3 className="mt-1 font-bold text-slate-900">{post.title}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                  {post.content || "Không có mô tả"}
                </p>
              </div>
            </section>

            <section className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500">Nhãn AI</p>
                  <p className="font-semibold text-slate-800">
                    {LABEL_TEXT[post.moderationLabel || ""] || "Không xác định"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Độ tin cậy</p>
                  <p className="font-semibold text-slate-800">
                    {post.moderationConfidence != null
                      ? `${(post.moderationConfidence * 100).toFixed(1)}%`
                      : "—"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">Lý do AI</p>
                <p className="text-sm text-slate-700">
                  {post.moderationReason || "Không có"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Văn bản gửi AI</p>
                <div className="mt-1 max-h-40 overflow-y-auto rounded-lg bg-white p-3 text-sm text-slate-700 ring-1 ring-amber-100">
                  {post.moderationText || "Không có"}
                </div>
              </div>
            </section>
          </div>

          <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Nhãn vi phạm khi từ chối
              </label>
              <select
                value={label}
                onChange={(event) =>
                  setLabel(event.target.value as ModerationLabel | "")
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-400"
              >
                <option value="">Chọn nhãn</option>
                <option value="spam">Spam</option>
                <option value="unauthorized_ad">Quảng cáo trái phép</option>
                <option value="offensive">Công kích / xúc phạm</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Ghi chú của quản trị viên
              </label>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={3}
                placeholder="Nhập lý do duyệt hoặc từ chối..."
                className={`${adminTextAreaClass} w-full`}
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={adminSecondaryButtonClass}
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={reject}
              disabled={submitting !== null || post.moderationStatus !== "REVIEW_REQUIRED"}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-60"
            >
              <XCircle className="h-4 w-4" />
              {submitting === "reject" ? "Đang từ chối..." : "Từ chối"}
            </button>
            <button
              type="button"
              onClick={approve}
              disabled={submitting !== null || post.moderationStatus !== "REVIEW_REQUIRED"}
              className={adminPrimaryButtonClass}
            >
              <CheckCircle2 className="h-4 w-4" />
              {submitting === "approve" ? "Đang duyệt..." : "Duyệt bài"}
            </button>
          </div>
        </div>
      ) : null}
    </AdminModal>
  );
};

export default ModerationReviewModal;
