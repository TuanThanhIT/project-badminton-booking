import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Check,
  CheckCircle2,
  GraduationCap,
  Info,
  Loader2,
  MessageCircle,
  Plus,
  Search,
  Send,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import CoachClassCard from "../../components/ui/user/coach/CoachClassCard";
import coachClassService from "../../services/user/coachClassService";
import userSearchService from "../../services/user/userSearchService";
import conversationService from "../../services/user/conversationService";
import type {
  ClassEnrollmentItem,
  CoachClassSummary,
  EnrollmentStatus,
} from "../../types/coachClass";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { getAllBranches } from "../../redux/slices/user/branchSlice";
import { ROLE_NAME } from "../../utils/constants/role";
import { showConfirmDialog } from "../../utils/confirmDialog";

type Tab = "students" | "classes";

const normalizeTab = (value: string | null): Tab => {
  if (value === "classes") return "classes";
  return "students";
};

const STATUS_OPTIONS: { value: "" | EnrollmentStatus; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "ACTIVE", label: "Đang học" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const STATUS_META: Record<
  EnrollmentStatus,
  { label: string; badge: string; dot: string; desc: string }
> = {
  PENDING: {
    label: "Chờ duyệt",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    desc: "Yêu cầu mới từ học viên.",
  },
  ACTIVE: {
    label: "Đang học",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    desc: "Học viên đã được duyệt.",
  },
  REJECTED: {
    label: "Từ chối",
    badge: "bg-red-50 text-red-600 border-red-200",
    dot: "bg-red-500",
    desc: "Yêu cầu đã bị từ chối.",
  },
  COMPLETED: {
    label: "Hoàn thành",
    badge: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
    desc: "Học viên đã hoàn thành lớp.",
  },
  CANCELLED: {
    label: "Đã hủy",
    badge: "bg-slate-50 text-slate-500 border-slate-200",
    dot: "bg-slate-400",
    desc: "Đăng ký đã hủy.",
  },
};

const modalInputClass =
  "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-100";

const CoachStudentsPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAppSelector((state) => state.auth.user);
  const branches = useAppSelector((state) => state.branch.branches);

  const initialPostId = searchParams.get("postId");
  const initialTab =
    searchParams.get("tab") === "overview"
      ? "students"
      : initialPostId && !searchParams.get("tab")
        ? "students"
        : normalizeTab(searchParams.get("tab"));

  const [tab, setTab] = useState<Tab>(initialTab);
  const [classes, setClasses] = useState<CoachClassSummary[]>([]);
  const [enrollments, setEnrollments] = useState<ClassEnrollmentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showStatusHelp, setShowStatusHelp] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [classFilter, setClassFilter] = useState<string>(initialPostId || "");
  const [studentSearch, setStudentSearch] = useState("");

  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addMemberPostId, setAddMemberPostId] = useState<number | null>(
    initialPostId ? Number(initialPostId) : null,
  );
  const [userSearchQ, setUserSearchQ] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<
    { id: number; username: string; fullName?: string; avatar?: string }[]
  >([]);
  const [userSearching, setUserSearching] = useState(false);

  const [notifyPostId, setNotifyPostId] = useState<number | null>(null);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [alsoSendChat, setAlsoSendChat] = useState(true);

  const [rejectModal, setRejectModal] = useState<{
    id: number;
    reason: string;
  } | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);

  const branchById = useMemo(
    () =>
      branches.reduce<
        Record<
          number,
          {
            branchName: string;
            address?: string;
            district?: string;
            province?: string;
          }
        >
      >((acc, b) => {
        acc[b.id] = {
          branchName: b.branchName,
          address: b.address,
          district: b.districtName,
          province: b.provinceName,
        };
        return acc;
      }, {}),
    [branches],
  );

  const fetchClasses = useCallback(async () => {
    try {
      const res = await coachClassService.getCoachClassesService();
      setClasses(res.data.data || []);
    } catch (err: any) {
      setClasses([]);
      toast.error(err?.message || "Không thể tải danh sách lớp học");
    }
  }, []);

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: 1, limit: 100 };
      if (statusFilter) params.status = statusFilter;
      if (classFilter) params.postId = Number(classFilter);
      const res = await coachClassService.getCoachEnrollmentsService(params);
      setEnrollments(res.data.data.data || []);
      setTotal(res.data.data.total || 0);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải danh sách học viên");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, classFilter]);

  useEffect(() => {
    if (initialPostId) setClassFilter(initialPostId);
  }, [initialPostId]);

  useEffect(() => {
    if (user?.role !== ROLE_NAME.COACH) return;
    dispatch(getAllBranches());
    fetchClasses();
  }, [user?.role, dispatch, fetchClasses]);

  useEffect(() => {
    if (user?.role !== ROLE_NAME.COACH) return;
    if (tab === "students") fetchEnrollments();
  }, [user?.role, tab, fetchEnrollments]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!userSearchQ.trim() || !addMemberOpen) {
        setUserSearchResults([]);
        return;
      }

      setUserSearching(true);
      try {
        const res = await userSearchService.searchUsersService(
          userSearchQ.trim(),
        );
        setUserSearchResults((res.data as any).data || []);
      } catch {
        setUserSearchResults([]);
      } finally {
        setUserSearching(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [userSearchQ, addMemberOpen]);

  const summary = useMemo(
    () => ({
      pending: classes.reduce((s, c) => s + c.stats.pending, 0),
      active: classes.reduce((s, c) => s + c.stats.active, 0),
      classCount: classes.length,
    }),
    [classes],
  );

  const filteredEnrollments = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return enrollments;

    return enrollments.filter((item) => {
      const name = item.student?.profile?.fullName?.toLowerCase() || "";
      const username = item.student?.username?.toLowerCase() || "";
      const phone = item.student?.profile?.phoneNumber || "";
      const className = item.post?.title?.toLowerCase() || "";
      return (
        name.includes(q) ||
        username.includes(q) ||
        phone.includes(q) ||
        className.includes(q)
      );
    });
  }, [enrollments, studentSearch]);

  const selectedNotifyClass = classes.find((cls) => cls.id === notifyPostId);

  const handleApprove = async (id: number) => {
    const confirmed = await showConfirmDialog(
      "Duyệt học viên này?",
      "Học viên sẽ được thêm vào danh sách đang học của lớp.",
      "Duyệt",
      "Hủy",
      "success",
    );
    if (!confirmed) return;

    try {
      await coachClassService.updateEnrollmentService(id, { status: "ACTIVE" });
      toast.success("Đã duyệt học viên");
      fetchEnrollments();
      fetchClasses();
    } catch (err: any) {
      toast.error(err?.message || "Không thể duyệt");
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      await coachClassService.updateEnrollmentService(rejectModal.id, {
        status: "REJECTED",
        rejectReason: rejectModal.reason,
      });
      toast.success("Đã từ chối học viên");
      setRejectModal(null);
      fetchEnrollments();
      fetchClasses();
    } catch (err: any) {
      toast.error(err?.message || "Không thể từ chối");
    }
  };

  const handleComplete = async (id: number) => {
    const confirmed = await showConfirmDialog(
      "Đánh dấu hoàn thành?",
      "Trạng thái học viên sẽ chuyển sang hoàn thành lớp học.",
      "Hoàn thành",
      "Hủy",
      "success",
    );
    if (!confirmed) return;

    try {
      await coachClassService.updateEnrollmentService(id, {
        status: "COMPLETED",
      });
      toast.success("Đã đánh dấu hoàn thành");
      fetchEnrollments();
      fetchClasses();
    } catch (err: any) {
      toast.error(err?.message || "Không thể cập nhật");
    }
  };

  const handleChat = async (studentUserId: number) => {
    try {
      const res =
        await conversationService.createOrGetDirectConversationService(
          studentUserId,
        );
      navigate(`/messages/${res.data.data.id}`);
    } catch {
      toast.error("Không thể mở chat");
    }
  };

  const handleOpenClassChat = async (postId: number) => {
    try {
      const res =
        await coachClassService.getOrCreateClassConversationService(postId);
      navigate(`/messages/${res.data.data.conversationId}`);
    } catch (err: any) {
      toast.error(err?.message || "Không thể mở nhóm chat lớp");
    }
  };

  const openAddMember = (postId?: number) => {
    setAddMemberPostId(postId ?? (classFilter ? Number(classFilter) : null));
    setUserSearchQ("");
    setUserSearchResults([]);
    setAddMemberOpen(true);
  };

  const closeAddMember = () => {
    setAddMemberOpen(false);
    setAddMemberPostId(null);
    setUserSearchQ("");
    setUserSearchResults([]);
  };

  const handleAddMember = async (studentUserId: number) => {
    if (!addMemberPostId) {
      toast.error("Vui lòng chọn lớp trước khi thêm học viên");
      return;
    }

    try {
      await coachClassService.addMemberManuallyService(
        addMemberPostId,
        studentUserId,
      );
      toast.success("Đã thêm học viên vào lớp");
      closeAddMember();
      fetchEnrollments();
      fetchClasses();
    } catch (err: any) {
      toast.error(err?.message || "Không thể thêm học viên");
    }
  };

  const handleNotify = async () => {
    if (!notifyPostId || !notifyMessage.trim()) return;

    try {
      const res = await coachClassService.notifyClassMembersService(
        notifyPostId,
        {
          title: notifyTitle.trim() || undefined,
          message: notifyMessage.trim(),
          alsoSendChat,
        },
      );
      toast.success(
        `Đã gửi thông báo tới ${res.data.data.notifiedCount} học viên`,
      );
      setNotifyPostId(null);
      setNotifyTitle("");
      setNotifyMessage("");
    } catch (err: any) {
      toast.error(err?.message || "Không thể gửi thông báo");
    }
  };

  const handleClassStatus = async (
    postId: number,
    action: "lock" | "unlock" | "end",
  ) => {
    const messages = {
      lock: "Khóa đăng ký lớp này?",
      unlock: "Mở lại đăng ký cho lớp này?",
      end: "Kết thúc lớp này?",
    };
    const confirmed = await showConfirmDialog(
      messages[action],
      "Vui lòng xác nhận trước khi tiếp tục thao tác này.",
      "Xác nhận",
      "Hủy",
      action === "end" ? "danger" : "warning",
    );
    if (!confirmed) return;

    setStatusUpdatingId(postId);
    try {
      await coachClassService.updateClassStatusService(postId, action);
      toast.success(
        action === "lock"
          ? "Đã khóa đăng ký"
          : action === "unlock"
            ? "Đã mở đăng ký"
            : "Đã kết thúc lớp",
      );
      fetchClasses();
    } catch (err: any) {
      toast.error(err?.message || "Không thể cập nhật trạng thái lớp");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const getBranchForClass = (cls: CoachClassSummary) => {
    const branchId = (
      cls.formData as { location?: { branchId?: number } } | null
    )?.location?.branchId;
    return branchId ? branchById[branchId] : null;
  };

  const switchTab = (next: Tab) => {
    setTab(next);
    const params = new URLSearchParams(searchParams);
    params.set("tab", next);
    setSearchParams(params);
  };

  if (user?.role !== ROLE_NAME.COACH) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16 text-center">
        <GraduationCap className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">
          Chỉ dành cho huấn luyện viên
        </h1>
      </div>
    );
  }

  const renderEnrollmentRow = (item: ClassEnrollmentItem) => {
    const name =
      item.student?.profile?.fullName || item.student?.username || "Học viên";
    const avatar = item.student?.profile?.avatar;
    const letter = name.charAt(0).toUpperCase();
    const meta = STATUS_META[item.status] || STATUS_META.CANCELLED;
    const classTitle = item.post?.title || `#${item.postId}`;
    const username = item.student?.username;
    const phoneNumber = item.student?.profile?.phoneNumber;
    const registeredAt = new Date(item.createdAt).toLocaleDateString("vi-VN");

    return (
      <article
        key={item.id}
        className="group overflow-hidden rounded-[1.35rem] border border-sky-100 bg-gradient-to-br from-white via-white to-sky-50/60 p-4 shadow-sm transition-colors hover:border-sky-200 sm:p-5"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-[20px] bg-sky-100 text-base font-semibold text-sky-700 ring-4 ring-white">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                letter
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[15px] font-semibold leading-5 text-slate-950 sm:text-base">
                  {name}
                </p>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-[2px] text-[10.5px] font-semibold ${meta.badge}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                  {meta.label}
                </span>
              </div>

              <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[12.5px] text-slate-600 sm:text-[13px]">
                <GraduationCap className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                <span className="shrink-0 text-slate-400">Lớp:</span>
                <span className="truncate font-medium text-slate-800">
                  {classTitle}
                </span>
              </div>

              <div className="mt-2.5 flex flex-wrap gap-2 text-[11px]">
                {username ? (
                  <span className="rounded-full border border-slate-200 bg-white/90 px-2.5 py-[3px] font-medium text-slate-500 shadow-sm">
                    @{username}
                  </span>
                ) : null}
                {phoneNumber ? (
                  <span className="rounded-full border border-slate-200 bg-white/90 px-2.5 py-[3px] font-medium text-slate-500 shadow-sm">
                    SĐT: {phoneNumber}
                  </span>
                ) : null}
                <span className="rounded-full border border-slate-200 bg-white/90 px-2.5 py-[3px] font-medium text-slate-500 shadow-sm">
                  ĐK: {registeredAt}
                </span>
              </div>

              {item.rejectReason ? (
                <p className="mt-3 rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                  Lý do từ chối: {item.rejectReason}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {item.status === "PENDING" ? (
              <>
                <button
                  type="button"
                  onClick={() => handleApprove(item.id)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  <Check className="h-4 w-4" />
                  Duyệt
                </button>
                <button
                  type="button"
                  onClick={() => setRejectModal({ id: item.id, reason: "" })}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                >
                  <X className="h-4 w-4" />
                  Từ chối
                </button>
              </>
            ) : null}

            {item.status === "ACTIVE" ? (
              <button
                type="button"
                onClick={() => handleComplete(item.id)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
              >
                <CheckCircle2 className="h-4 w-4" />
                Hoàn thành
              </button>
            ) : null}

            {item.studentUserId && item.status !== "PENDING" ? (
              <button
                type="button"
                onClick={() => handleChat(item.studentUserId)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-sky-200 hover:text-sky-700"
              >
                <MessageCircle className="h-4 w-4" />
                Chat
              </button>
            ) : null}
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <section className="bg-[#0b3f56] text-white">
        <div className="mx-auto max-w-7xl px-4 pb-28 pt-14 sm:px-6 lg:pt-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-sky-100">
                <GraduationCap size={16} className="text-sky-200" />
                Khu vực huấn luyện viên
              </div>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                Quản lý lớp học
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-sky-50">
                Duyệt đăng ký, theo dõi học viên, chat và gửi thông báo cho từng
                lớp.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:min-w-[480px]">
              {[
                { value: summary.pending, label: "Chờ duyệt", icon: Users },
                {
                  value: summary.active,
                  label: "Đang học",
                  icon: CheckCircle2,
                },
                {
                  value: summary.classCount,
                  label: "Lớp mở",
                  icon: GraduationCap,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4"
                >
                  <item.icon size={18} className="text-sky-200" />
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
          <div className="border-b border-slate-200 p-3">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["students", "Học viên", Users],
                  ["classes", "Lớp học", GraduationCap],
                ] as const
              ).map(([key, label, Icon]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => switchTab(key)}
                  className={`inline-flex h-11 items-center gap-2 rounded-2xl px-5 text-sm font-semibold transition ${
                    tab === key
                      ? "bg-sky-600 text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {tab === "students" ? (
            <>
              <div className="border-b border-slate-200 p-5 sm:p-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <div className="relative min-w-0 flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Tìm tên, username, SĐT hoặc tên lớp..."
                      className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
                    />
                  </div>

                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
                  >
                    <option value="">Tất cả lớp</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => openAddMember()}
                    className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-700"
                  >
                    <UserPlus className="h-4 w-4" />
                    Thêm học viên
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((o) => (
                    <button
                      key={o.value || "all"}
                      type="button"
                      onClick={() => setStatusFilter(o.value)}
                      className={`h-9 rounded-full border px-3 text-xs font-semibold transition ${
                        statusFilter === o.value
                          ? "border-sky-300 bg-sky-50 text-sky-800"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-sky-200"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setShowStatusHelp((v) => !v)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:underline"
                  >
                    <Info className="h-3.5 w-3.5" />
                    {showStatusHelp ? "Ẩn trạng thái" : "Trạng thái học viên"}
                  </button>
                  <span className="text-xs text-slate-500">
                    {filteredEnrollments.length}/{total} học viên
                  </span>
                </div>

                {showStatusHelp ? (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                    {STATUS_OPTIONS.filter((o) => o.value).map((o) => {
                      const meta = STATUS_META[o.value as EnrollmentStatus];
                      return (
                        <div
                          key={o.value}
                          className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                        >
                          <p className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                            <span
                              className={`h-2 w-2 rounded-full ${meta.dot}`}
                            />
                            {meta.label}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-600">
                            {meta.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <div className="p-5 sm:p-6">
                {loading ? (
                  <div className="flex min-h-[260px] items-center justify-center text-slate-500">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin text-sky-600" />
                    Đang tải học viên...
                  </div>
                ) : filteredEnrollments.length === 0 ? (
                  <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                    <Users className="h-12 w-12 text-slate-300" />
                    <p className="mt-4 text-sm font-medium text-slate-700">
                      {studentSearch
                        ? "Không tìm thấy học viên phù hợp"
                        : "Chưa có học viên nào"}
                    </p>
                    {!studentSearch ? (
                      <button
                        type="button"
                        onClick={() => openAddMember()}
                        className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-700"
                      >
                        <Plus className="h-4 w-4" />
                        Thêm học viên đầu tiên
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredEnrollments.map(renderEnrollmentRow)}
                  </div>
                )}
              </div>
            </>
          ) : null}

          {tab === "classes" ? (
            <div className="p-5 sm:p-6">
              {classes.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                  <GraduationCap className="h-12 w-12 text-slate-300" />
                  <p className="mt-4 text-sm text-slate-600">
                    Chưa có lớp học nào.
                  </p>
                  <Link
                    to="/create-post?type=CLASS"
                    className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-700"
                  >
                    <Plus className="h-4 w-4" />
                    Tạo lớp học
                  </Link>
                </div>
              ) : (
                <div className="-mx-5 sm:-mx-6">
                  <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 pt-1 scroll-smooth sm:px-6 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent">
                    {classes.map((cls) => (
                      <CoachClassCard
                        key={cls.id}
                        cls={cls}
                        branch={getBranchForClass(cls)}
                        statusUpdating={statusUpdatingId === cls.id}
                        onViewStudents={() => {
                          setClassFilter(String(cls.id));
                          switchTab("students");
                        }}
                        onAddMember={() => openAddMember(cls.id)}
                        onOpenChat={() => handleOpenClassChat(cls.id)}
                        onNotify={() => setNotifyPostId(cls.id)}
                        onLock={() => handleClassStatus(cls.id, "lock")}
                        onUnlock={() => handleClassStatus(cls.id, "unlock")}
                        onEnd={() => handleClassStatus(cls.id, "end")}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </section>
      </main>

      {addMemberOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Thêm học viên
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Chọn lớp và tìm user cần thêm.
                </p>
              </div>
              <button
                type="button"
                onClick={closeAddMember}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <label className="mt-4 block text-xs font-semibold text-slate-600">
              Chọn lớp
              <select
                value={addMemberPostId ?? ""}
                onChange={(e) =>
                  setAddMemberPostId(
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                className={`${modalInputClass} mt-1.5`}
              >
                <option value="">-- Chọn lớp --</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>

            <div className="relative mt-3">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                className={`${modalInputClass} pl-10`}
                placeholder="Tìm theo tên hoặc username..."
                value={userSearchQ}
                onChange={(e) => setUserSearchQ(e.target.value)}
                disabled={!addMemberPostId}
              />
            </div>

            <div className="mt-3 max-h-60 space-y-2 overflow-y-auto">
              {!addMemberPostId ? (
                <p className="py-4 text-center text-sm text-slate-500">
                  Chọn lớp trước khi tìm học viên
                </p>
              ) : null}
              {addMemberPostId && userSearching ? (
                <p className="py-2 text-center text-sm text-slate-500">
                  Đang tìm...
                </p>
              ) : null}
              {addMemberPostId &&
              !userSearching &&
              userSearchQ.trim() &&
              userSearchResults.length === 0 ? (
                <p className="py-2 text-center text-sm text-slate-500">
                  Không tìm thấy user
                </p>
              ) : null}

              {userSearchResults.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleAddMember(u.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 text-left transition hover:border-sky-200 hover:bg-sky-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sky-100 text-xs font-bold text-sky-700">
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      (u.fullName || u.username).charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800">
                      {u.fullName || u.username}
                    </p>
                    <p className="text-xs text-slate-500">@{u.username}</p>
                  </div>
                  <UserPlus className="ml-auto h-4 w-4 shrink-0 text-emerald-600" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {notifyPostId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Gửi thông báo
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedNotifyClass?.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNotifyPostId(null)}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <input
              className={`${modalInputClass} mt-4`}
              placeholder="Tiêu đề"
              value={notifyTitle}
              onChange={(e) => setNotifyTitle(e.target.value)}
            />
            <textarea
              className={`${modalInputClass} mt-3 min-h-[110px]`}
              placeholder="Nội dung thông báo..."
              value={notifyMessage}
              onChange={(e) => setNotifyMessage(e.target.value)}
            />
            <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={alsoSendChat}
                onChange={(e) => setAlsoSendChat(e.target.checked)}
              />
              Gửi vào nhóm chat lớp
            </label>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleNotify}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                <Send className="h-4 w-4" />
                Gửi
              </button>
              <button
                type="button"
                onClick={() => setNotifyPostId(null)}
                className="h-10 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {rejectModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <h3 className="text-lg font-bold text-slate-950">
              Từ chối đăng ký
            </h3>
            <textarea
              className={`${modalInputClass} mt-4 min-h-[100px]`}
              placeholder="Lý do từ chối..."
              value={rejectModal.reason}
              onChange={(e) =>
                setRejectModal({ ...rejectModal, reason: e.target.value })
              }
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleReject}
                className="h-10 flex-1 rounded-xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Xác nhận
              </button>
              <button
                type="button"
                onClick={() => setRejectModal(null)}
                className="h-10 flex-1 rounded-xl border border-slate-200 text-sm font-semibold transition hover:bg-slate-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CoachStudentsPage;
