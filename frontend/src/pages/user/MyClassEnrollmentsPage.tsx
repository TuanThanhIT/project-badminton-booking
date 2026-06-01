import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import coachClassService from "../../services/user/coachClassService";
import type { ClassEnrollmentItem, EnrollmentStatus } from "../../types/coachClass";

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

const MyClassEnrollmentsPage = () => {
  const [enrollments, setEnrollments] = useState<ClassEnrollmentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [actingId, setActingId] = useState<number | null>(null);

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: 1, limit: 50 };
      if (statusFilter) params.status = statusFilter;
      const res = await coachClassService.getMyEnrollmentsService(params);
      setEnrollments(res.data.data.data || []);
      setTotal(res.data.data.total || 0);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleCancel = async (id: number) => {
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

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-600">
            Lớp học
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
            Lớp đã đăng ký
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Theo dõi trạng thái các lớp bạn đã gửi yêu cầu tham gia.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <span className="ml-auto text-sm text-slate-500">{total} lớp</span>
        </div>

        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Đang tải...
          </div>
        ) : enrollments.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm font-medium text-slate-700">
              Bạn chưa đăng ký lớp học nào.
            </p>
            <Link
              to="/posts"
              className="mt-4 inline-flex rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
            >
              Khám phá lớp học
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {enrollments.map((item) => {
              const canCancel =
                item.status === "PENDING" || item.status === "ACTIVE";
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-slate-900">
                          {item.post?.title || `Lớp #${item.postId}`}
                        </h2>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            STATUS_BADGE[item.status] || STATUS_BADGE.CANCELLED
                          }`}
                        >
                          {STATUS_LABEL[item.status] || item.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Đăng ký{" "}
                        {new Date(item.createdDate).toLocaleDateString("vi-VN")}
                      </p>
                      {item.rejectReason && (
                        <p className="mt-1 text-xs text-red-600">
                          Lý do: {item.rejectReason}
                        </p>
                      )}
                    </div>

                    {canCancel && (
                      <button
                        type="button"
                        disabled={actingId === item.id}
                        onClick={() => handleCancel(item.id)}
                        className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        {actingId === item.id ? "Đang xử lý..." : "Hủy đăng ký"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyClassEnrollmentsPage;
