import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  GraduationCap,
  Info,
  Loader2,
  MessageCircle,
  Plus,
  Search,
  UserPlus,
  Users,
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
    desc: "Học viên đã gửi yêu cầu, người dạy chưa duyệt hoặc từ chối.",
  },
  ACTIVE: {
    label: "Đang học",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    desc: "Đã được duyệt, đang tham gia lớp và nhận thông báo/chat lớp.",
  },
  REJECTED: {
    label: "Từ chối",
    badge: "bg-red-50 text-red-600 border-red-200",
    dot: "bg-red-500",
    desc: "Người dạy từ chối yêu cầu đăng ký (có thể kèm lý do).",
  },
  COMPLETED: {
    label: "Hoàn thành",
    badge: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
    desc: "Người dạy đánh dấu học viên đã hoàn thành khóa/lớp.",
  },
  CANCELLED: {
    label: "Đã hủy",
    badge: "bg-slate-50 text-slate-500 border-slate-200",
    dot: "bg-slate-400",
    desc: "Học viên hoặc người dạy hủy đăng ký khi còn chờ duyệt hoặc đang học.",
  },
};

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
          { branchName: string; address?: string; district?: string; province?: string }
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
        const res = await userSearchService.searchUsersService(userSearchQ.trim());
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

  const handleApprove = async (id: number) => {
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
    try {
      await coachClassService.updateEnrollmentService(id, { status: "COMPLETED" });
      toast.success("Đã đánh dấu hoàn thành");
      fetchEnrollments();
      fetchClasses();
    } catch (err: any) {
      toast.error(err?.message || "Không thể cập nhật");
    }
  };

  const handleChat = async (studentUserId: number) => {
    try {
      const res = await conversationService.createOrGetDirectConversationService(
        studentUserId,
      );
      navigate(`/messages/${res.data.data.id}`);
    } catch {
      toast.error("Không thể mở chat");
    }
  };

  const handleOpenClassChat = async (postId: number) => {
    try {
      const res = await coachClassService.getOrCreateClassConversationService(postId);
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
      await coachClassService.addMemberManuallyService(addMemberPostId, studentUserId);
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
      const res = await coachClassService.notifyClassMembersService(notifyPostId, {
        title: notifyTitle.trim() || undefined,
        message: notifyMessage.trim(),
        alsoSendChat,
      });
      toast.success(`Đã gửi thông báo tới ${res.data.data.notifiedCount} học viên`);
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
      lock: "Khóa đăng ký lớp này? Học viên mới sẽ không thể gửi yêu cầu.",
      unlock: "Mở lại đăng ký cho lớp này?",
      end: "Kết thúc lớp? Lớp sẽ không nhận thêm học viên (kể cả thêm thủ công).",
    };
    if (!window.confirm(messages[action])) return;

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
    const branchId = (cls.formData as { location?: { branchId?: number } } | null)?.location
      ?.branchId;
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
      <div className="min-h-[60vh] bg-slate-50 px-4 py-16 text-center">
        <GraduationCap className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">Chỉ dành cho người dạy cầu lông</h1>
      </div>
    );
  }

  const renderEnrollmentRow = (item: ClassEnrollmentItem) => {
    const name =
      item.student?.profile?.fullName || item.student?.username || "Học viên";
    const avatar = item.student?.profile?.avatar;
    const letter = name.charAt(0).toUpperCase();
    const meta = STATUS_META[item.status] || STATUS_META.CANCELLED;

    return (
      <div
        key={item.id}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-200"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-sky-100 text-sm font-bold text-sky-700">
              {avatar ? (
                <img src={avatar} alt={name} className="h-full w-full object-cover" />
              ) : (
                letter
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-900">{name}</p>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.badge}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                  {meta.label}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Lớp:{" "}
                <span className="font-medium text-slate-800">
                  {item.post?.title || `#${item.postId}`}
                </span>
              </p>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
                {item.student?.username && <span>@{item.student.username}</span>}
                {item.student?.profile?.phoneNumber && (
                  <span>SĐT: {item.student.profile.phoneNumber}</span>
                )}
                <span>
                  ĐK: {new Date(item.createdDate).toLocaleDateString("vi-VN")}
                </span>
              </div>
              {item.rejectReason && (
                <p className="mt-1.5 text-xs text-red-600">Lý do từ chối: {item.rejectReason}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            {item.status === "PENDING" && (
              <>
                <button
                  type="button"
                  onClick={() => handleApprove(item.id)}
                  className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Duyệt
                </button>
                <button
                  type="button"
                  onClick={() => setRejectModal({ id: item.id, reason: "" })}
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                >
                  Từ chối
                </button>
              </>
            )}
            {item.status === "ACTIVE" && (
              <button
                type="button"
                onClick={() => handleComplete(item.id)}
                className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100"
              >
                Hoàn thành
              </button>
            )}
            {item.studentUserId && (
              <button
                type="button"
                onClick={() => handleChat(item.studentUserId)}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Chat
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">
                Dạy cầu lông
              </p>
              <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Quản lý lớp học
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Duyệt đăng ký, thêm học viên, chat và gửi thông báo cho từng lớp.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Chờ duyệt", value: summary.pending, cls: "border-amber-200 bg-amber-50 text-amber-800" },
                { label: "Đang học", value: summary.active, cls: "border-emerald-200 bg-emerald-50 text-emerald-800" },
                { label: "Lớp mở", value: summary.classCount, cls: "border-sky-200 bg-sky-50 text-sky-800" },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`rounded-2xl border px-4 py-2.5 text-center ${s.cls}`}
                >
                  <p className="text-xl font-extrabold tabular-nums">{s.value}</p>
                  <p className="text-xs font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-1">
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
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                tab === key
                  ? "border-sky-600 text-sky-700"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === "students" && (
          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Tìm theo tên, username, SĐT hoặc tên lớp..."
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
                  />
                </div>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
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
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
                >
                  <UserPlus className="h-4 w-4" />
                  Thêm học viên
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((o) => (
                  <button
                    key={o.value || "all"}
                    type="button"
                    onClick={() => setStatusFilter(o.value)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      statusFilter === o.value
                        ? "border-sky-300 bg-sky-50 text-sky-800"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-sky-200"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowStatusHelp((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:underline"
                >
                  <Info className="h-3.5 w-3.5" />
                  {showStatusHelp ? "Ẩn giải thích trạng thái" : "Giải thích trạng thái học viên"}
                </button>
                <span className="text-xs text-slate-500">
                  {filteredEnrollments.length}/{total} học viên
                </span>
              </div>

              {showStatusHelp && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {(Object.entries(STATUS_META) as [EnrollmentStatus, typeof STATUS_META.PENDING][]).map(
                    ([key, meta]) => (
                      <div
                        key={key}
                        className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5"
                      >
                        <p className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                          <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">{meta.desc}</p>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang tải học viên...
              </div>
            ) : filteredEnrollments.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-10 text-center">
                <Users className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-700">
                  {studentSearch ? "Không tìm thấy học viên phù hợp" : "Chưa có học viên nào"}
                </p>
                {!studentSearch && (
                  <button
                    type="button"
                    onClick={() => openAddMember()}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm học viên đầu tiên
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">{filteredEnrollments.map(renderEnrollmentRow)}</div>
            )}
          </div>
        )}

        {tab === "classes" && (
          <div className="space-y-4">
            {classes.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-10 text-center">
                <GraduationCap className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm text-slate-600">Chưa có lớp học nào.</p>
                <Link
                  to="/create-post?type=CLASS"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
                >
                  <Plus className="h-4 w-4" />
                  Tạo lớp học
                </Link>
              </div>
            ) : (
              <div className="relative -mx-4 sm:-mx-6">
                <div className="flex gap-4 overflow-x-auto px-4 pb-3 pt-1 snap-x snap-mandatory scroll-smooth sm:px-6 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent">
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
                {classes.length > 1 && (
                  <p className="px-4 text-center text-[11px] text-slate-400 sm:px-6">
                    Vuốt ngang để xem thêm lớp
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {addMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Thêm học viên vào lớp</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Tìm user và thêm trực tiếp — học viên vào lớp ngay (không cần duyệt).
                </p>
              </div>
              <button
                type="button"
                onClick={closeAddMember}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <label className="mt-4 block text-xs font-semibold text-slate-600">
              Chọn lớp
              <select
                value={addMemberPostId ?? ""}
                onChange={(e) =>
                  setAddMemberPostId(e.target.value ? Number(e.target.value) : null)
                }
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
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
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-sky-400"
                placeholder="Tìm theo tên hoặc username..."
                value={userSearchQ}
                onChange={(e) => setUserSearchQ(e.target.value)}
                disabled={!addMemberPostId}
              />
            </div>

            <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
              {!addMemberPostId && (
                <p className="py-4 text-center text-sm text-slate-500">
                  Chọn lớp trước khi tìm học viên
                </p>
              )}
              {addMemberPostId && userSearching && (
                <p className="py-2 text-center text-sm text-slate-500">Đang tìm...</p>
              )}
              {addMemberPostId &&
                !userSearching &&
                userSearchQ.trim() &&
                userSearchResults.length === 0 && (
                  <p className="py-2 text-center text-sm text-slate-500">Không tìm thấy user</p>
                )}
              {userSearchResults.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleAddMember(u.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 text-left hover:border-sky-200 hover:bg-sky-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sky-100 text-xs font-bold text-sky-700">
                    {u.avatar ? (
                      <img src={u.avatar} alt="" className="h-full w-full object-cover" />
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
      )}

      {notifyPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Gửi thông báo lớp</h3>
            <input
              className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              placeholder="Tiêu đề (tùy chọn)"
              value={notifyTitle}
              onChange={(e) => setNotifyTitle(e.target.value)}
            />
            <textarea
              className="mt-3 min-h-[100px] w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              placeholder="Nội dung gửi tới học viên đang học..."
              value={notifyMessage}
              onChange={(e) => setNotifyMessage(e.target.value)}
            />
            <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={alsoSendChat}
                onChange={(e) => setAlsoSendChat(e.target.checked)}
              />
              Gửi thêm vào nhóm chat lớp
            </label>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleNotify}
                className="flex-1 rounded-xl bg-sky-600 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
              >
                Gửi
              </button>
              <button
                type="button"
                onClick={() => setNotifyPostId(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Từ chối đăng ký</h3>
            <textarea
              className="mt-4 min-h-[90px] w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
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
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Xác nhận
              </button>
              <button
                type="button"
                onClick={() => setRejectModal(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachStudentsPage;
