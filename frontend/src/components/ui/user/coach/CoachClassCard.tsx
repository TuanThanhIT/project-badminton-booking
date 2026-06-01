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
    label: "Đang mở đăng ký",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    desc: "Học viên có thể gửi yêu cầu tham gia",
  },
  LOCKED: {
    label: "Tạm khóa",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    desc: "Không nhận đăng ký mới, người dạy vẫn thêm HV thủ công",
  },
  ENDED: {
    label: "Đã kết thúc",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    desc: "Lớp đã đóng, không nhận thêm học viên",
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
    <article className="flex w-[min(340px,calc(100vw-2.5rem))] shrink-0 snap-start flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:border-sky-200 hover:shadow-md">
      <div className="border-b border-sky-100 bg-gradient-to-r from-sky-50/90 to-white px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900">
              {cls.title}
            </h3>
            {fd.inputLevel && (
              <p className="mt-1 text-xs font-medium text-sky-700">
                Trình độ: {PLAYER_LEVEL_LABEL[fd.inputLevel] ?? fd.inputLevel}
              </p>
            )}
          </div>
          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusMeta.badge}`}
          >
            {statusMeta.label}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col space-y-3 px-5 py-4">
        <div className="space-y-2 text-xs text-slate-600">
          {weekdayLabel && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-sky-600" />
              <span className="font-medium text-slate-700">{weekdayLabel}</span>
            </div>
          )}

          {schedule?.startTime && schedule?.endTime && (
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
              <span>
                {schedule.startTime} – {schedule.endTime}
              </span>
            </div>
          )}

          {schedule?.startDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-amber-600" />
              <span>
                Bắt đầu {new Date(schedule.startDate).toLocaleDateString("vi-VN")}
              </span>
            </div>
          )}

          {locationLabel && (
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />
              <span className="line-clamp-2">{locationLabel}</span>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-slate-600">
              <span className="font-bold text-emerald-700">{cls.stats.active}</span>
              {max != null ? ` / ${max}` : ""} đang học
            </span>
            {cls.stats.pending > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                {cls.stats.pending} chờ duyệt
              </span>
            )}
          </div>
          {fd.tuitionFee && (
            <p className="mt-1 text-[11px] font-medium text-slate-500">HP: {fd.tuitionFee}</p>
          )}
          {pct != null && (
            <div className="mt-2">
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/80">
                <div
                  className={`h-full rounded-full transition-all ${
                    pct >= 100 ? "bg-amber-500" : "bg-sky-500"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onViewStudents}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-2.5 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Users className="h-3.5 w-3.5" />
            Học viên
          </button>
          <button
            type="button"
            onClick={onAddMember}
            disabled={isEnded}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Thêm HV
          </button>
          <button
            type="button"
            onClick={onOpenChat}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-2.5 py-2 text-[11px] font-semibold text-sky-700 hover:bg-sky-100"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Chat
          </button>
          <button
            type="button"
            onClick={onNotify}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11px] font-semibold text-amber-800 hover:bg-amber-100"
          >
            <Bell className="h-3.5 w-3.5" />
            TB
          </button>
        </div>

        {!isEnded && (
          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
            {status === "OPEN" ? (
              <button
                type="button"
                disabled={statusUpdating}
                onClick={onLock}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-2.5 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <Lock className="h-3.5 w-3.5" />
                Khóa ĐK
              </button>
            ) : (
              <button
                type="button"
                disabled={statusUpdating}
                onClick={onUnlock}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
              >
                <Unlock className="h-3.5 w-3.5" />
                Mở ĐK
              </button>
            )}
            <button
              type="button"
              disabled={statusUpdating}
              onClick={onEnd}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-2.5 py-2 text-[11px] font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              <XCircle className="h-3.5 w-3.5" />
              Kết thúc
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default CoachClassCard;
