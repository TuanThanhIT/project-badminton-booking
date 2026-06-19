import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Banknote,
  BookOpenCheck,
  CalendarDays,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  GraduationCap,
  Loader2,
  MapPin,
  Search,
  UserRound,
  UsersRound,
} from "lucide-react";
import { toast } from "react-toastify";
import coachClassService from "../../services/user/coachClassService";
import type {
  ClassEnrollmentItem,
  EnrollmentStatus,
} from "../../types/coachClass";
import { showConfirmDialog } from "../../utils/confirmDialog";

const STATUS_OPTIONS: { value: "" | EnrollmentStatus; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "ACTIVE", label: "Đang học" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-50 text-red-600 border-red-200",
  COMPLETED: "bg-sky-50 text-sky-700 border-sky-200",
  CANCELLED: "bg-slate-50 text-slate-500 border-slate-200",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ duyệt",
  ACTIVE: "Đang học",
  REJECTED: "Từ chối",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const LIMIT = 10;
const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : null;

const cleanClassText = (value?: string | null) =>
  String(value || "")
    .replace(/\[DEMO-SEED-3M\]\s*/gi, "")
    .replace(/\bLop cau long demo\b/gi, "Lớp cầu lông")
    .replace(/\bLop huong dan ky thuat co ban, danh doi va phan xa cho hoc vien demo\.?/gi, "Lớp hướng dẫn kỹ thuật cơ bản, đánh đôi và rèn luyện phản xạ dành cho học viên.")
    .trim();

const formatMoney = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(numeric)
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(numeric)
    : String(value);
};

type EnrollmentCardProps = {
  item: ClassEnrollmentItem;
  acting: boolean;
  onCancel: () => void;
};

const EnrollmentCard = ({
  item,
  acting,
  onCancel,
}: EnrollmentCardProps) => {
  const canCancel = item.status === "PENDING" || item.status === "ACTIVE";
  const formData = (item.post?.formData || {}) as {
    imageUrl?: string;
    images?: string[];
    inputLevel?: string;
    maxStudents?: number;
    capacity?: number;
    tuitionFee?: string | number;
    fee?: string | number;
    startDate?: string;
    schedule?: {
      weekdays?: number[];
      startDate?: string;
      startTime?: string;
      endTime?: string;
    };
    location?: {
      branchName?: string;
      address?: string;
      district?: string;
      province?: string;
      branchId?: number;
    };
  };

  const imageUrl = formData.imageUrl || formData.images?.[0];
  const classTitle =
    cleanClassText(item.post?.title) || `Lớp #${item.postId}`;
  const classContent = cleanClassText(item.post?.content);
  const startDate = formData.schedule?.startDate || formData.startDate;
  const tuitionFee = formatMoney(formData.tuitionFee ?? formData.fee);
  const capacity = formData.maxStudents ?? formData.capacity;
  const weekdays = formData.schedule?.weekdays
    ?.map((day) => WEEKDAYS[day])
    .join(", ");
  const time =
    formData.schedule?.startTime && formData.schedule?.endTime
      ? `${formData.schedule.startTime} - ${formData.schedule.endTime}`
      : null;
  const location =
    [
      formData.location?.branchName,
      formData.location?.address,
      formData.location?.district,
      formData.location?.province,
    ]
      .filter(Boolean)
      .join(", ") ||
    (formData.location?.branchId
      ? `Chi nhánh #${formData.location.branchId}`
      : null);

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md">
      <div className="grid md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="relative min-h-44 overflow-hidden bg-gradient-to-br from-sky-600 via-cyan-600 to-indigo-700">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={classTitle}
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <>
              <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
              <div className="absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-cyan-300/15" />
              <div className="relative flex h-full min-h-44 flex-col items-center justify-center px-5 text-center text-white">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur">
                  <GraduationCap className="h-8 w-8" />
                </div>
                <p className="mt-4 text-sm font-semibold">Lớp cầu lông B-Hub</p>
                <p className="mt-1 text-xs text-sky-100">
                  Luyện tập · Kết nối · Tiến bộ
                </p>
              </div>
            </>
          )}

          <span
            className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm ${
              STATUS_BADGE[item.status] || STATUS_BADGE.CANCELLED
            }`}
          >
            {STATUS_LABEL[item.status] || item.status}
          </span>
        </div>

        <div className="flex min-w-0 flex-col p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-sky-600">
                <BookOpenCheck className="h-3.5 w-3.5" />
                Thông tin lớp học
              </p>
              <h2 className="mt-2 line-clamp-2 text-lg font-bold leading-snug text-slate-950">
                {classTitle}
              </h2>
              {classContent ? (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                  {classContent}
                </p>
              ) : null}
            </div>

            {canCancel ? (
              <button
                type="button"
                disabled={acting}
                onClick={onCancel}
                className="h-10 shrink-0 rounded-xl border border-red-100 bg-red-50 px-3 text-xs font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-100 disabled:opacity-50"
              >
                {acting ? "Đang xử lý..." : "Hủy đăng ký"}
              </button>
            ) : null}
          </div>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {item.post?.coach ? (
              <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5">
                {item.post.coach.avatar ? (
                  <img
                    src={item.post.coach.avatar}
                    alt={item.post.coach.fullName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <UserRound className="h-4 w-4 text-indigo-500" />
                )}
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400">Huấn luyện viên</p>
                  <p className="truncate text-sm font-semibold text-slate-700">
                    {item.post.coach.fullName}
                  </p>
                </div>
              </div>
            ) : null}

            {startDate ? (
              <InfoTile
                icon={<CalendarDays className="h-4 w-4 text-sky-600" />}
                label="Ngày bắt đầu"
                value={formatDate(startDate) || ""}
              />
            ) : null}
            {time || weekdays ? (
              <InfoTile
                icon={<Clock3 className="h-4 w-4 text-amber-600" />}
                label="Lịch học"
                value={[weekdays, time].filter(Boolean).join(" · ")}
              />
            ) : null}
            {location ? (
              <InfoTile
                icon={<MapPin className="h-4 w-4 text-rose-500" />}
                label="Địa điểm"
                value={location}
              />
            ) : null}
            {tuitionFee ? (
              <InfoTile
                icon={<Banknote className="h-4 w-4 text-emerald-600" />}
                label="Học phí"
                value={tuitionFee}
                valueClassName="text-emerald-700"
              />
            ) : null}
            {capacity ? (
              <InfoTile
                icon={<UsersRound className="h-4 w-4 text-violet-600" />}
                label="Quy mô lớp"
                value={`Tối đa ${capacity} học viên`}
              />
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CalendarCheck className="h-3.5 w-3.5 text-sky-600" />
              Đăng ký {formatDate(item.createdAt)}
            </span>
            {formData.inputLevel ? (
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-indigo-500" />
                Trình độ: {formData.inputLevel}
              </span>
            ) : null}
          </div>

          {item.coachNote ? (
            <p className="mt-3 rounded-xl bg-sky-50 px-3 py-2 text-xs text-sky-700">
              Ghi chú HLV: {item.coachNote}
            </p>
          ) : null}
          {item.rejectReason ? (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
              Lý do: {item.rejectReason}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
};

const InfoTile = ({
  icon,
  label,
  value,
  valueClassName = "text-slate-700",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) => (
  <div className="flex min-w-0 items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5">
    <span className="shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className={`truncate text-sm font-semibold ${valueClassName}`} title={value}>
        {value}
      </p>
    </div>
  </div>
);

const MyClassEnrollmentsPage = () => {
  const [enrollments, setEnrollments] = useState<ClassEnrollmentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [actingId, setActingId] = useState<number | null>(null);

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: LIMIT };
      if (statusFilter) params.status = statusFilter;
      const res = await coachClassService.getMyEnrollmentsService(params);
      setEnrollments(res.data.data.data || []);
      setTotal(res.data.data.total || 0);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const handleCancel = async (id: number) => {
    const confirmed = await showConfirmDialog(
      "Hủy đăng ký lớp?",
      "Yêu cầu hoặc lượt tham gia lớp học này sẽ được hủy.",
      "Hủy đăng ký",
      "Quay lại",
      "danger",
    );
    if (!confirmed) return;

    setActingId(id);
    try {
      await coachClassService.cancelEnrollmentService(id);
      toast.success("Đã hủy đăng ký lớp học");
      fetchEnrollments();
    } catch (err: any) {
      toast.error(err?.message || "Không thể hủy đăng ký");
    } finally {
      setActingId(null);
    }
  };

  const totalPages = Math.max(Math.ceil(total / LIMIT), 1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <section className="user-hero-surface text-white">
        <div className="mx-auto max-w-7xl px-4 pb-28 pt-14 sm:px-6 lg:pt-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl">
              <div className="user-hero-badge mb-8">
                <CalendarCheck />
                Lớp học của tôi
              </div>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                Lớp đã đăng ký
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-sky-50">
                Theo dõi trạng thái đăng ký và các lớp đang tham gia trong một
                nơi.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-sky-100">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2">
                  <CalendarCheck size={16} />
                  Theo dõi trạng thái lớp
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2">
                  <Search size={16} />
                  Khám phá lớp phù hợp
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[360px]">
              {[
                { value: total, label: "Theo bộ lọc" },
                { value: enrollments.length, label: "Đang hiển thị" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4"
                >
                  <GraduationCap size={18} className="text-sky-200" />
                  <p className="mt-4 text-2xl font-bold leading-none">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm text-sky-100">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto -mt-16 max-w-7xl px-4 pb-12 sm:px-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Filter className="h-4 w-4 text-sky-600" />
                Bộ lọc trạng thái
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-11 min-w-[180px] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value || "all"} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-slate-500">{total} lớp</span>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-sky-600" />
                Đang tải...
              </div>
            ) : enrollments.length === 0 ? (
              <div className="grid min-h-[360px] lg:grid-cols-[1fr_320px]">
                <div className="flex flex-col justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold text-slate-950">
                    Chưa có lớp nào trong danh sách
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    Khi bạn gửi yêu cầu tham gia lớp học, trạng thái và thông
                    tin lớp sẽ xuất hiện tại đây.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                      to="/posts"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-700"
                    >
                      <Search className="h-4 w-4" />
                      Khám phá lớp học
                    </Link>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("")}
                      className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Xóa bộ lọc
                    </button>
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-200 pt-6 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-medium uppercase text-slate-400">
                      Tiến trình
                    </p>
                    <div className="mt-5 space-y-4">
                      {["Gửi yêu cầu", "Chờ HLV duyệt", "Tham gia lớp"].map(
                        (label, index) => (
                          <div key={label} className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-xs font-medium text-sky-700">
                              {index + 1}
                            </span>
                            <span className="text-sm font-medium text-slate-700">
                              {label}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {enrollments.map((item) => {
                  return (
                    <EnrollmentCard
                      key={item.id}
                      item={item}
                      acting={actingId === item.id}
                      onCancel={() => handleCancel(item.id)}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {!loading && enrollments.length > 0 ? (
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm text-slate-600 sm:px-6">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 px-3 font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </button>
              <span>
                Trang {page}/{totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 px-3 font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sau
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
};

export default MyClassEnrollmentsPage;
