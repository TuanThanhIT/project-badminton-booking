import {
  Bell,
  Calendar,
  Clock,
  Lock,
  MapPin,
  MessageCircle,
  Unlock,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import type { ClassEnrollmentStatus, CoachClassSummary } from "../../../../types/coachClass";
import { PLAYER_LEVEL_LABEL } from "../../../../utils/constants/profileConstant";

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const CLASS_STATUS_META: Record<
  ClassEnrollmentStatus,
  { label: string; badge: string; desc: string }
> = {
  OPEN: {
    label: "Đang mở",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    desc: "Nhận đăng ký mới",
  },
  LOCKED: {
    label: "Tạm khóa",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    desc: "Không nhận đăng ký mới",
  },
  ENDED: {
    label: "Đã kết thúc",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    desc: "Lớp đã đóng",
  },
};

type BranchInfo = {
  branchName: string;
  address?: string;
  district?: string;
  province?: string;
};

type CoachClassCardProps = {
  cls: CoachClassSummary;
  branch?: BranchInfo | null;
  onViewStudents: () => void;
  onAddMember: () => void;
  onOpenChat: () => void;
  onNotify: () => void;
  onLock: () => void;
  onUnlock: () => void;
  onEnd: () => void;
  statusUpdating?: boolean;
};

const actionClass =
  "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50";

const CoachClassCard = ({
  cls,
  branch,
  onViewStudents,
  onAddMember,
  onOpenChat,
  onNotify,
  onLock,
  onUnlock,
  onEnd,
  statusUpdating,
}: CoachClassCardProps) => {
  const fd = (cls.formData || {}) as {
    inputLevel?: string;
    schedule?: {
      weekdays?: number[];
      startTime?: string;
      endTime?: string;
      startDate?: string;
    };
    location?: { branchId?: number };
    tuitionFee?: string;
  };

  const schedule = fd.schedule;
  const status = cls.enrollmentStatus || "OPEN";
  const statusMeta = CLASS_STATUS_META[status];
  const max = cls.maxStudents ?? null;
  const pct =
    max && max > 0 ? Math.min(100, Math.round((cls.stats.active / max) * 100)) : null;

  const weekdayLabel =
    schedule?.weekdays && schedule.weekdays.length > 0
      ? schedule.weekdays.map((d) => WEEKDAYS[d]).join(", ")
      : null;

  const locationLabel = branch
    ? [branch.branchName, branch.district, branch.province].filter(Boolean).join(" · ")
    : fd.location?.branchId
      ? `Chi nhánh #${fd.location.branchId}`
      : null;

  const isEnded = status === "ENDED";

  return (
    <article className="flex w-[min(360px,calc(100vw-2rem))] shrink-0 snap-start flex-col rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-sky-200 hover:shadow-md">
      <div className="border-b border-slate-100 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-950">
              {cls.title}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Tạo ngày {new Date(cls.createdAt).toLocaleDateString("vi-VN")}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusMeta.badge}`}
          >
            {statusMeta.label}
          </span>
        </div>

        {fd.inputLevel ? (
          <p className="mt-3 inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
            {PLAYER_LEVEL_LABEL[fd.inputLevel] ?? fd.inputLevel}
          </p>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="space-y-2 text-sm text-slate-600">
          {weekdayLabel ? (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0 text-sky-600" />
              <span className="font-medium text-slate-700">{weekdayLabel}</span>
            </div>
          ) : null}

          {schedule?.startTime && schedule?.endTime ? (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-indigo-500" />
              <span>
                {schedule.startTime} - {schedule.endTime}
              </span>
            </div>
          ) : null}

          {schedule?.startDate ? (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0 text-amber-600" />
              <span>Bắt đầu {new Date(schedule.startDate).toLocaleDateString("vi-VN")}</span>
            </div>
          ) : null}

          {locationLabel ? (
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
              <span className="line-clamp-2">{locationLabel}</span>
            </div>
          ) : null}
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-slate-600">
              <span className="font-bold text-emerald-700">{cls.stats.active}</span>
              {max != null ? ` / ${max}` : ""} đang học
            </span>
            {cls.stats.pending > 0 ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                {cls.stats.pending} chờ duyệt
              </span>
            ) : null}
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-500">
            <span>{cls.stats.rejected} từ chối</span>
            <span>{cls.stats.completed} hoàn thành</span>
          </div>

          {fd.tuitionFee ? (
            <p className="mt-2 text-xs font-medium text-slate-600">Học phí: {fd.tuitionFee}</p>
          ) : null}

          {pct != null ? (
            <div className="mt-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full transition-all ${
                    pct >= 100 ? "bg-amber-500" : "bg-sky-500"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>

        <p className="text-xs text-slate-500">{statusMeta.desc}</p>

        <div className="mt-auto grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onViewStudents}
            className={`${actionClass} border-slate-200 text-slate-700 hover:bg-slate-50`}
          >
            <Users className="h-3.5 w-3.5" />
            Học viên
          </button>
          <button
            type="button"
            onClick={onAddMember}
            disabled={isEnded}
            className={`${actionClass} border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Thêm
          </button>
          <button
            type="button"
            onClick={onOpenChat}
            className={`${actionClass} border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100`}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Chat
          </button>
          <button
            type="button"
            onClick={onNotify}
            className={`${actionClass} border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100`}
          >
            <Bell className="h-3.5 w-3.5" />
            Báo tin
          </button>
        </div>

        {!isEnded ? (
          <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
            {status === "OPEN" ? (
              <button
                type="button"
                disabled={statusUpdating}
                onClick={onLock}
                className={`${actionClass} border-slate-200 text-slate-700 hover:bg-slate-50`}
              >
                <Lock className="h-3.5 w-3.5" />
                Khóa
              </button>
            ) : (
              <button
                type="button"
                disabled={statusUpdating}
                onClick={onUnlock}
                className={`${actionClass} border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}
              >
                <Unlock className="h-3.5 w-3.5" />
                Mở
              </button>
            )}
            <button
              type="button"
              disabled={statusUpdating}
              onClick={onEnd}
              className={`${actionClass} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
            >
              <XCircle className="h-3.5 w-3.5" />
              Kết thúc
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
};

export default CoachClassCard;
