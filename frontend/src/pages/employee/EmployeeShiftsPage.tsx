import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
  Save,
  UserRound,
  WalletCards,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  checkOutEmployeeWorkShift,
  getCurrentEmployeeWorkShift,
  getEmployeeWorkShifts,
  getShiftAssignments,
  updateShiftAssignment,
} from "../../redux/slices/employee/workShiftSlice";
import type { ShiftAssignment } from "../../types/workShift";

const getToday = () =>
  new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

const getCurrentTime = () =>
  new Date().toLocaleTimeString("en-GB", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDateTime = (value?: string | null) => {
  if (!value) return "--";
  return new Date(value).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const toTimeInput = (value?: string | null) => {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("en-GB", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });
};

type AssignmentForm = {
  checkInTime: string;
  checkOutTime: string;
};

const buildForms = (assignments: ShiftAssignment[]) =>
  assignments.reduce<Record<number, AssignmentForm>>((acc, item) => {
    acc[item.assignmentId] = {
      checkInTime: toTimeInput(item.checkIn),
      checkOutTime: toTimeInput(item.checkOut),
    };
    return acc;
  }, {});

const EmployeeShiftsPage = () => {
  const dispatch = useAppDispatch();
  const { currentWorkShift, workShifts, shiftAssignments } = useAppSelector(
    (state) => state.employeeWorkShift,
  );
  const loadingMap = useAppSelector((state) => state.ui.loadingMap);

  const today = useMemo(() => getToday(), []);
  const [forms, setForms] = useState<Record<number, AssignmentForm>>({});
  const [closingCash, setClosingCash] = useState("");

  const loading =
    loadingMap["employeeWorkShift/getCurrentEmployeeWorkShift"] ||
    loadingMap["employeeWorkShift/getShiftAssignments"] ||
    loadingMap["employeeWorkShift/getEmployeeWorkShifts"];
  const updateLoading = loadingMap["employeeWorkShift/updateShiftAssignment"];
  const checkoutLoading =
    loadingMap["employeeWorkShift/checkOutEmployeeWorkShift"];

  const loadShift = () => {
    const time = getCurrentTime();
    dispatch(getEmployeeWorkShifts({ data: { date: today } }));
    dispatch(getCurrentEmployeeWorkShift({ data: { date: today, time } }));
  };

  useEffect(() => {
    loadShift();
  }, [dispatch, today]);

  useEffect(() => {
    if (currentWorkShift?.workShiftId && currentWorkShift.checkIn) {
      dispatch(
        getShiftAssignments({
          data: { workShiftId: currentWorkShift.workShiftId },
        }),
      );
    }
  }, [dispatch, currentWorkShift?.workShiftId, currentWorkShift?.checkIn]);

  useEffect(() => {
    setForms(buildForms(shiftAssignments));
  }, [shiftAssignments]);

  const isCashier = currentWorkShift?.roleInShift === "CASHIER";
  const hasCheckedIn = Boolean(currentWorkShift?.checkIn);
  const formatCompletionRate = (value: number) =>
    `${Math.round(Number(value || 0) * 100)}%`;

  const setFormValue = (
    assignmentId: number,
    field: keyof AssignmentForm,
    value: string,
  ) => {
    setForms((prev) => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        [field]: value,
      },
    }));
  };

  const saveAssignment = async (assignment: ShiftAssignment) => {
    const form = forms[assignment.assignmentId];
    if (!currentWorkShift || !form) return;

    try {
      const res = await dispatch(
        updateShiftAssignment({
          data: {
            workShiftId: currentWorkShift.workShiftId,
            assignmentId: assignment.assignmentId,
            checkInTime: form.checkInTime || undefined,
            checkOutTime: form.checkOutTime || undefined,
          },
        }),
      ).unwrap();
      toast.success(res.message);
    } catch {
      // global middleware handles API errors
    }
  };

  const checkoutCashier = async (event: FormEvent) => {
    event.preventDefault();

    if (!currentWorkShift) return;

    const amount = Number(closingCash);
    if (!Number.isFinite(amount) || amount < 0) {
      toast.error("Số tiền cuối ca không hợp lệ.");
      return;
    }

    const openStaff = shiftAssignments.filter(
      (item) =>
        item.assignmentId !== currentWorkShift.assignmentId &&
        item.checkIn &&
        !item.checkOut,
    );

    if (openStaff.length) {
      toast.error("Vui lòng nhập checkout cho tất cả nhân viên đã check-in.");
      return;
    }

    try {
      const res = await dispatch(
        checkOutEmployeeWorkShift({
          data: {
            workShiftId: currentWorkShift.workShiftId,
            checkOutTime: getCurrentTime(),
            closingCash: amount,
          },
        }),
      ).unwrap();
      toast.success(res.message);
      setClosingCash("");
      dispatch(
        getShiftAssignments({
          data: { workShiftId: currentWorkShift.workShiftId },
        }),
      );
    } catch {
      // global middleware handles API errors
    }
  };

  return (
    <div className="h-full overflow-hidden bg-slate-50 px-4 py-6 sm:px-6">
      <div className="mx-auto flex h-full max-w-[1500px]">
        <section className="flex h-full w-full flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          {/* HEADER FIXED */}
          <div className="shrink-0 border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div>
                <p className="text-sm font-bold text-sky-700">
                  Vận hành ca làm
                </p>
                <h2 className="mt-1 text-2xl font-extrabold text-slate-800">
                  Nhân sự trong ca
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Theo dõi check-in, check-out, tỷ lệ hoàn thành và lương ca.
                </p>
              </div>

              <button
                onClick={loadShift}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-800 hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" />
                Làm mới
              </button>
            </div>

            {currentWorkShift && (
              <div className="mt-5 grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Ca hiện tại
                  </p>
                  <p className="mt-1 font-extrabold text-slate-800">
                    {currentWorkShift.workShift.shiftName}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Ngày làm
                  </p>
                  <p className="mt-1 font-extrabold text-slate-800">
                    {currentWorkShift.workShift.workDate}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Khung giờ
                  </p>
                  <p className="mt-1 font-extrabold text-slate-800">
                    {currentWorkShift.workShift.startTime} -{" "}
                    {currentWorkShift.workShift.endTime}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Thu ngân check-in
                  </p>
                  <p className="mt-1 font-extrabold text-slate-800">
                    {formatDateTime(currentWorkShift.checkIn)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* BODY SCROLL */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {!currentWorkShift && !loading && (
              <div className="p-10 text-center text-slate-500">
                Không có ca làm đang diễn ra. Các ca hôm nay:{" "}
                <span className="font-bold text-slate-800">
                  {workShifts.length}
                </span>
              </div>
            )}

            {currentWorkShift && (!isCashier || !hasCheckedIn) && (
              <div className="p-5 sm:p-6">
                <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                  Chỉ thu ngân đã check-in và nhập tiền đầu ca mới được quản lý
                  giờ làm của nhân viên trong ca.
                </div>
              </div>
            )}

            {currentWorkShift && isCashier && hasCheckedIn && (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-[980px] w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-5 py-4">Nhân viên</th>
                        <th className="px-5 py-4">Vai trò</th>
                        <th className="px-5 py-4">Check-in</th>
                        <th className="px-5 py-4">Check-out</th>
                        <th className="px-5 py-4">Tỷ lệ hoàn thành</th>
                        <th className="px-5 py-4">Lương ca</th>
                        <th className="px-5 py-4 text-right">Thao tác</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {shiftAssignments.map((assignment) => {
                        const form = forms[assignment.assignmentId];

                        return (
                          <tr
                            key={assignment.assignmentId}
                            className="align-top"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-50 text-sky-700">
                                  <UserRound className="h-5 w-5" />
                                </div>

                                <div>
                                  <p className="font-bold text-slate-600">
                                    {assignment.employee?.username ||
                                      "Nhân viên"}
                                  </p>
                                  <p className="mt-0.5 text-xs text-slate-500">
                                    {assignment.employee?.email || "--"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                  assignment.roleInShift === "CASHIER"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-800"
                                }`}
                              >
                                {assignment.roleInShift}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <input
                                type="time"
                                value={form?.checkInTime || ""}
                                onChange={(event) =>
                                  setFormValue(
                                    assignment.assignmentId,
                                    "checkInTime",
                                    event.target.value,
                                  )
                                }
                                className="h-10 w-32 rounded-xl border border-slate-200 px-3 font-semibold outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
                              />
                            </td>

                            <td className="px-5 py-4">
                              <input
                                type="time"
                                value={form?.checkOutTime || ""}
                                onChange={(event) =>
                                  setFormValue(
                                    assignment.assignmentId,
                                    "checkOutTime",
                                    event.target.value,
                                  )
                                }
                                className="h-10 w-32 rounded-xl border border-slate-200 px-3 font-semibold outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
                              />
                            </td>

                            <td className="px-5 py-4">
                              <span className="inline-flex h-10 min-w-24 items-center rounded-xl bg-slate-100 px-3 font-bold text-slate-800">
                                {formatCompletionRate(
                                  assignment.completionRate,
                                )}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <p className="font-extrabold text-slate-800">
                                {formatCurrency(assignment.earnedWage)}
                              </p>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <button
                                onClick={() => saveAssignment(assignment)}
                                disabled={updateLoading}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-sky-600 px-3 text-xs font-bold text-white hover:bg-sky-700 disabled:bg-slate-300"
                              >
                                {updateLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                                Lưu
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {loading && (
                  <div className="grid place-items-center p-10 text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
                  </div>
                )}

                {!loading && shiftAssignments.length === 0 && (
                  <div className="p-10 text-center text-sm text-slate-500">
                    Chưa có nhân viên nào trong ca.
                  </div>
                )}
              </div>
            )}

            {currentWorkShift &&
              isCashier &&
              hasCheckedIn &&
              !currentWorkShift.checkOut && (
                <div className="border-t border-slate-100 p-5 sm:p-6">
                  <form
                    onSubmit={checkoutCashier}
                    className="grid gap-5 lg:grid-cols-[1fr_220px_170px]"
                  >
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-800">
                        <WalletCards className="h-5 w-5 text-sky-600" />
                        Chốt ca thu ngân
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Nhập checkout cho nhân viên trước, sau đó chốt tiền cuối
                        ca.
                      </p>
                    </div>

                    <div className="relative">
                      <Banknote className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-600" />
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={closingCash}
                        onChange={(event) => setClosingCash(event.target.value)}
                        placeholder="Tiền cuối ca"
                        className="h-11 w-full rounded-2xl border border-slate-200 pl-10 pr-3 text-sm font-semibold outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={checkoutLoading}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 text-sm font-bold text-white hover:bg-sky-700 disabled:bg-slate-300"
                    >
                      {checkoutLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Checkout
                    </button>
                  </form>
                </div>
              )}

            {currentWorkShift?.checkOut && (
              <div className="border-t border-slate-100 p-5 sm:p-6">
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="h-5 w-5" />
                    Ca đã checkout lúc{" "}
                    {formatDateTime(currentWorkShift.checkOut)}
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-slate-100 p-5 sm:p-6">
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    icon: UserRound,
                    label: "Nhân viên",
                    value: shiftAssignments.length,
                  },
                  {
                    icon: Clock3,
                    label: "Đã check-in",
                    value: shiftAssignments.filter((item) => item.checkIn)
                      .length,
                  },
                  {
                    icon: CalendarDays,
                    label: "Tổng lương ca",
                    value: formatCurrency(
                      shiftAssignments.reduce(
                        (sum, item) => sum + Number(item.earnedWage || 0),
                        0,
                      ),
                    ),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <item.icon className="h-5 w-5 text-sky-600" />
                    <p className="mt-3 text-2xl font-extrabold text-slate-800">
                      {item.value}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EmployeeShiftsPage;
