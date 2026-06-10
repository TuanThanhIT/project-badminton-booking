import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Loader2, UserPlus } from "lucide-react";
import coachClassService from "../../../../services/user/coachClassService";
import type { PostEnrollmentContext } from "../../../../types/coachClass";
import { useAppSelector } from "../../../../redux/hook";
import { ROLE_NAME } from "../../../../utils/constants/role";
import { showConfirmDialog } from "../../../../utils/confirmDialog";

type ClassEnrollActionProps = {
  postId: number;
  compact?: boolean;
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ duyệt",
  ACTIVE: "Đã tham gia",
  REJECTED: "Bị từ chối",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const STATUS_LABEL_FULL: Record<string, string> = {
  PENDING: "Đang chờ người dạy duyệt",
  ACTIVE: "Đã tham gia lớp",
  REJECTED: "Bị từ chối",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy đăng ký",
};

const btnPrimary = (compact: boolean) =>
  compact
    ? "inline-flex shrink-0 items-center gap-1 rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sky-700 disabled:opacity-50"
    : "inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:opacity-50";

const ClassEnrollAction = ({ postId, compact = false }: ClassEnrollActionProps) => {
  const user = useAppSelector((state) => state.auth.user);
  const [ctx, setCtx] = useState<PostEnrollmentContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [acting, setActing] = useState(false);

  const fetchContext = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setFetchError(false);
    try {
      const res = await coachClassService.getPostEnrollmentContextService(postId);
      setCtx(res.data.data);
    } catch {
      setCtx(null);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [postId, user?.id]);

  useEffect(() => {
    fetchContext();
  }, [fetchContext]);

  if (user?.role === ROLE_NAME.ADMIN || user?.role === ROLE_NAME.EMPLOYEE) {
    return null;
  }

  if (!user) {
    if (compact) {
      return (
        <Link to="/login" className={btnPrimary(true)}>
          <UserPlus className="h-3.5 w-3.5" />
          Đăng ký
        </Link>
      );
    }
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <p className="text-sm text-slate-600">Đăng nhập để đăng ký tham gia lớp học.</p>
        <Link to="/login" className={`mt-3 ${btnPrimary(false)}`}>
          <UserPlus className="h-4 w-4" />
          Đăng nhập
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 text-xs text-slate-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        {!compact && "Đang kiểm tra..."}
      </span>
    );
  }

  if (fetchError) {
    return (
      <button
        type="button"
        onClick={fetchContext}
        className="shrink-0 text-xs font-medium text-red-600 hover:underline"
      >
        Thử lại
      </button>
    );
  }

  if (!ctx || ctx.isAuthor) return null;

  const mine = ctx.myEnrollment;
  const full = ctx.maxStudents != null && ctx.activeCount >= ctx.maxStudents;
  const statusLabels = compact ? STATUS_LABEL : STATUS_LABEL_FULL;

  const handleEnroll = async () => {
    setActing(true);
    try {
      await coachClassService.enrollInClassService(postId);
      toast.success("Đã gửi yêu cầu đăng ký. Người dạy sẽ phản hồi sớm.");
      fetchContext();
    } catch (err: any) {
      toast.error(err?.message || "Không thể đăng ký lớp");
    } finally {
      setActing(false);
    }
  };

  const handleCancel = async () => {
    if (!mine) return;
    const confirmed = await showConfirmDialog(
      "Hủy đăng ký lớp?",
      "Yêu cầu hoặc lượt tham gia lớp học này sẽ được hủy.",
      "Hủy đăng ký",
      "Quay lại",
      "danger",
    );
    if (!confirmed) return;

    setActing(true);
    try {
      await coachClassService.cancelEnrollmentService(mine.id);
      toast.success("Đã hủy đăng ký lớp học");
      fetchContext();
    } catch (err: any) {
      toast.error(err?.message || "Không thể hủy đăng ký");
    } finally {
      setActing(false);
    }
  };

  if (mine) {
    const canCancel = mine.status === "PENDING" || mine.status === "ACTIVE";

    if (compact) {
      return (
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
            {statusLabels[mine.status] || mine.status}
          </span>
          {canCancel && (
            <button
              type="button"
              disabled={acting}
              onClick={handleCancel}
              className="text-xs font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50"
            >
              Hủy
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4">
        <p className="text-sm font-semibold text-sky-900">
          {statusLabels[mine.status] || mine.status}
        </p>
        {mine.status === "REJECTED" && mine.rejectReason && (
          <p className="mt-1 text-xs text-slate-600">Lý do: {mine.rejectReason}</p>
        )}
        {canCancel && (
          <button
            type="button"
            disabled={acting}
            onClick={handleCancel}
            className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Hủy đăng ký
          </button>
        )}
      </div>
    );
  }

  if (full) {
    if (compact) {
      return (
        <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
          Đã đủ chỗ
        </span>
      );
    }
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
        Lớp đã đủ {ctx.maxStudents} học viên
      </div>
    );
  }

  if (ctx.enrollmentStatus === "ENDED") {
    if (compact) {
      return (
        <span className="shrink-0 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          Đã kết thúc
        </span>
      );
    }
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
        Lớp học đã kết thúc
      </div>
    );
  }

  if (ctx.enrollmentStatus === "LOCKED") {
    if (compact) {
      return (
        <span className="shrink-0 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          Tạm khóa
        </span>
      );
    }
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
        Lớp tạm khóa đăng ký
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={acting}
      onClick={handleEnroll}
      className={btnPrimary(compact)}
    >
      {acting ? (
        <Loader2 className={compact ? "h-3.5 w-3.5 animate-spin" : "h-4 w-4 animate-spin"} />
      ) : (
        <UserPlus className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      )}
      {compact ? "Đăng ký" : "Đăng ký tham gia lớp"}
    </button>
  );
};

export default ClassEnrollAction;
