import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  BadgeDollarSign,
  CalendarDays,
  Clock,
  Plus,
  Trash2,
  UserPlus,
  X,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "react-toastify";

import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { getEmployees } from "../../redux/slices/manager/employeeSlice";
import {
  assignManagerShiftEmployee,
  createManagerWorkShift,
  getManagerWorkShifts,
  removeManagerShiftAssignment,
  updateManagerShiftAssignment,
} from "../../redux/slices/manager/workShiftSlice";
import {
  FormShiftAssignmentSchema,
  FormWorkShiftSchema,
} from "../../schemas/FormWorkShiftSchema";
import type { ManagerShiftRole, ManagerWorkShift } from "../../types/workShift";
import {
  ManagerModalOverlay,
  ManagerPageHeader,
  managerInputClass,
  managerPrimaryButtonClass,
  managerSecondaryButtonClass,
} from "../../components/commons/manager/ManagerPage";
import TablePagination from "../../components/ui/user/pagination/TablePagination";

const today = new Date().toISOString().slice(0, 10);
const LIMIT = 10;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const timeShort = (time: string) => time?.slice(0, 5) || "--:--";

const ShiftStatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
}) => (
  <div className={`rounded-xl border p-4 ${color}`}>
    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-semibold opacity-75">{label}</p>
        <p className="mt-2 text-3xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

const ShiftField = ({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) => (
  <label className={className}>
    <span className="mb-1 block text-xs font-medium text-slate-600">
      {label}
    </span>
    {children}
  </label>
);

const WorkShiftPage = () => {
  const dispatch = useAppDispatch();
  const { workShifts, loading, actionLoading } = useAppSelector(
    (state) => state.managerWorkShift,
  );
  const { employees } = useAppSelector((state) => state.managerEmployee);

  const [workDate, setWorkDate] = useState(today);
  const [shiftForm, setShiftForm] = useState({
    shiftName: "",
    workDate: today,
    startTime: "08:00",
    endTime: "12:00",
    cashierShiftWage: 150000,
    staffShiftWage: 120000,
  });
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [assignmentForms, setAssignmentForms] = useState<
    Record<number, { employeeId: string; roleInShift: ManagerShiftRole }>
  >({});
  const [assignmentPages, setAssignmentPages] = useState<
    Record<number, number>
  >({});

  useEffect(() => {
    dispatch(getEmployees());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getManagerWorkShifts({ workDate }));
    setShiftForm((current) => ({ ...current, workDate }));
  }, [dispatch, workDate]);

  const employeeOptions = useMemo(
    () => employees.filter((employee) => employee.isActive),
    [employees],
  );

  const stats = useMemo(() => {
    const assignmentCount = workShifts.reduce(
      (sum, shift) => sum + shift.assignments.length,
      0,
    );
    const cashierCount = workShifts.reduce(
      (sum, shift) =>
        sum +
        shift.assignments.filter((item) => item.roleInShift === "CASHIER")
          .length,
      0,
    );

    return {
      shiftCount: workShifts.length,
      assignmentCount,
      cashierCount,
      availableEmployeeCount: employeeOptions.length,
    };
  }, [employeeOptions.length, workShifts]);

  const handleCreateShift = async () => {
    const parsed = FormWorkShiftSchema.safeParse(shiftForm);

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Dữ liệu ca không hợp lệ");
      return;
    }

    try {
      await dispatch(createManagerWorkShift(parsed.data)).unwrap();
      toast.success("Đã tạo ca làm việc");
      setShiftForm((current) => ({
        ...current,
        shiftName: "",
      }));
      setShowShiftForm(false);
    } catch (error: any) {
      toast.error(error?.message || "Tạo ca thất bại");
    }
  };

  const handleAssign = async (shift: ManagerWorkShift) => {
    const form = assignmentForms[shift.id];
    const parsed = FormShiftAssignmentSchema.safeParse(form);

    if (!parsed.success) {
      toast.warning("Vui lòng chọn nhân viên");
      return;
    }

    try {
      await dispatch(
        assignManagerShiftEmployee({
          workShiftId: shift.id,
          employeeId: parsed.data.employeeId,
          roleInShift: parsed.data.roleInShift,
        }),
      ).unwrap();
      toast.success("Đã phân ca cho nhân viên");
      setAssignmentForms((current) => ({
        ...current,
        [shift.id]: { employeeId: "", roleInShift: "STAFF" },
      }));
    } catch (error: any) {
      toast.error(error?.message || "Phân ca thất bại");
    }
  };

  const handleUpdateRole = async (
    assignmentId: number,
    roleInShift: ManagerShiftRole,
  ) => {
    try {
      await dispatch(
        updateManagerShiftAssignment({ assignmentId, roleInShift }),
      ).unwrap();
      toast.success("Đã cập nhật vai trò trong ca");
    } catch (error: any) {
      toast.error(error?.message || "Cập nhật thất bại");
    }
  };

  const handleRemove = async (assignmentId: number) => {
    try {
      await dispatch(removeManagerShiftAssignment(assignmentId)).unwrap();
      toast.success("Đã xóa phân ca");
    } catch (error: any) {
      toast.error(error?.message || "Xóa phân ca thất bại");
    }
  };

  const setAssignmentForm = (
    shiftId: number,
    patch: Partial<{ employeeId: string; roleInShift: ManagerShiftRole }>,
  ) => {
    setAssignmentForms((current) => ({
      ...current,
      [shiftId]: {
        employeeId: current[shiftId]?.employeeId || "",
        roleInShift: current[shiftId]?.roleInShift || "STAFF",
        ...patch,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <ManagerPageHeader
        eyebrow="Manager shifts"
        title="Phân ca nhân viên"
        description="Tạo ca và phân nhân viên theo branch đang quản lý."
        actions={
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex h-11 items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-3 text-white">
              <CalendarDays className="h-4 w-4 text-sky-100" />
              <input
                type="date"
                value={workDate}
                onChange={(event) => setWorkDate(event.target.value)}
                className="bg-transparent text-sm font-medium text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </label>
            <button
              type="button"
              onClick={() => setShowShiftForm(true)}
              className={managerPrimaryButtonClass}
            >
              <Plus className="h-4 w-4" />
              Tạo ca mới
            </button>
          </div>
        }
      />

      <div className="hidden flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Phân ca nhân viên
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            ///MANAGER tạo ca và phân nhân viên theo chi nhánh đang quản lý.
          </p>
        </div>

        <label className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 shadow-sm">
          <CalendarDays className="h-4 w-4 text-slate-400" />
          <input
            type="date"
            value={workDate}
            onChange={(event) => setWorkDate(event.target.value)}
            className="bg-transparent text-sm font-medium text-slate-700 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ShiftStatCard
          label="Số ca"
          value={stats.shiftCount}
          icon={Clock}
          color="bg-sky-50 border-sky-200 text-sky-700"
        />
        <ShiftStatCard
          label="Nhân viên đã phân"
          value={stats.assignmentCount}
          icon={UserPlus}
          color="bg-emerald-50 border-emerald-200 text-emerald-700"
        />
        <ShiftStatCard
          label="Thu ngân"
          value={stats.cashierCount}
          icon={BadgeDollarSign}
          color="bg-amber-50 border-amber-200 text-amber-700"
        />
        <ShiftStatCard
          label="Nhân viên khả dụng"
          value={stats.availableEmployeeCount}
          icon={Users}
          color="bg-indigo-50 border-indigo-200 text-indigo-700"
        />
      </div>

      {showShiftForm ? (
        <ManagerModalOverlay>
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Tạo ca mới</h2>
                <p className="text-sm text-slate-500">
                  Thiết lập thời gian làm việc và mức lương theo vai trò.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowShiftForm(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <ShiftField label="Tên ca" className="md:col-span-2">
                <input
                  value={shiftForm.shiftName}
                  onChange={(event) =>
                    setShiftForm((current) => ({
                      ...current,
                      shiftName: event.target.value,
                    }))
                  }
                  placeholder="VD: Ca sáng"
                  className={`w-full ${managerInputClass}`}
                />
              </ShiftField>

              <ShiftField label="Ngày làm việc">
                <input
                  type="date"
                  value={shiftForm.workDate}
                  onChange={(event) =>
                    setShiftForm((current) => ({
                      ...current,
                      workDate: event.target.value,
                    }))
                  }
                  className={`w-full ${managerInputClass}`}
                />
              </ShiftField>

              <ShiftField label="Giờ bắt đầu">
                <input
                  type="time"
                  value={shiftForm.startTime}
                  onChange={(event) =>
                    setShiftForm((current) => ({
                      ...current,
                      startTime: event.target.value,
                    }))
                  }
                  className={`w-full ${managerInputClass}`}
                />
              </ShiftField>

              <ShiftField label="Giờ kết thúc">
                <input
                  type="time"
                  value={shiftForm.endTime}
                  onChange={(event) =>
                    setShiftForm((current) => ({
                      ...current,
                      endTime: event.target.value,
                    }))
                  }
                  className={`w-full ${managerInputClass}`}
                />
              </ShiftField>

              <ShiftField label="Lương thu ngân">
                <input
                  type="number"
                  min={0}
                  value={shiftForm.cashierShiftWage}
                  onChange={(event) =>
                    setShiftForm((current) => ({
                      ...current,
                      cashierShiftWage: Number(event.target.value),
                    }))
                  }
                  className={`w-full ${managerInputClass}`}
                />
              </ShiftField>

              <ShiftField label="Lương nhân viên">
                <input
                  type="number"
                  min={0}
                  value={shiftForm.staffShiftWage}
                  onChange={(event) =>
                    setShiftForm((current) => ({
                      ...current,
                      staffShiftWage: Number(event.target.value),
                    }))
                  }
                  className={`w-full ${managerInputClass}`}
                />
              </ShiftField>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowShiftForm(false)}
                className={managerSecondaryButtonClass}
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleCreateShift}
                className={managerPrimaryButtonClass}
              >
                {actionLoading ? "Đang lưu..." : "Tạo ca"}
              </button>
            </div>
          </div>
        </ManagerModalOverlay>
      ) : null}

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white py-14 text-center text-sm font-semibold text-slate-500">
          Đang tải ca làm việc...
        </div>
      ) : workShifts.length ? (
        <div className="space-y-4">
          {workShifts.map((shift) => {
            const form = assignmentForms[shift.id] || {
              employeeId: "",
              roleInShift: "STAFF" as ManagerShiftRole,
            };
            const assignedIds = new Set(
              shift.assignments.map((item) => item.employeeId),
            );

            return (
              <article
                key={shift.id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        {shift.shiftName}
                      </h3>
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                        {shift.shiftStatus}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {shift.workDate} • {timeShort(shift.startTime)} -{" "}
                      {timeShort(shift.endTime)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Thu ngân: {formatCurrency(shift.cashierShiftWage)} • Nhân
                      viên: {formatCurrency(shift.staffShiftWage)}
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-[220px_120px_44px]">
                    <select
                      value={form.employeeId}
                      onChange={(event) =>
                        setAssignmentForm(shift.id, {
                          employeeId: event.target.value,
                        })
                      }
                      className={managerInputClass}
                    >
                      <option value="">Chọn nhân viên</option>
                      {employeeOptions.map((employee) => (
                        <option
                          key={employee.employeeId}
                          value={employee.employeeId}
                          disabled={assignedIds.has(employee.employeeId)}
                        >
                          {employee.fullName || employee.username}
                        </option>
                      ))}
                    </select>
                    <select
                      value={form.roleInShift}
                      onChange={(event) =>
                        setAssignmentForm(shift.id, {
                          roleInShift: event.target.value as ManagerShiftRole,
                        })
                      }
                      className={managerInputClass}
                    >
                      <option value="STAFF">Nhân viên</option>
                      <option value="CASHIER">Thu ngân</option>
                    </select>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleAssign(shift)}
                      className="flex h-11 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      title="Phân ca"
                    >
                      <UserPlus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-100">
                  {shift.assignments.length ? (
                    <>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                            <th className="px-3 py-3 font-semibold">#</th>
                            <th className="px-3 py-3 font-semibold">
                              Nhân viên
                            </th>
                            <th className="px-3 py-3 font-semibold">Vai trò</th>
                            <th className="px-3 py-3 font-semibold">
                              Check-in
                            </th>
                            <th className="px-3 py-3 font-semibold">
                              Check-out
                            </th>
                            <th className="px-3 py-3 text-right font-semibold">
                              Thao tác
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 [&_td]:align-top">
                          {shift.assignments
                            .slice(
                              ((assignmentPages[shift.id] || 1) - 1) * LIMIT,
                              (assignmentPages[shift.id] || 1) * LIMIT,
                            )
                            .map((assignment, index) => (
                              <tr key={assignment.assignmentId}>
                                <td className="px-3 py-3 text-slate-400">
                                  {((assignmentPages[shift.id] || 1) - 1) *
                                    LIMIT +
                                    index +
                                    1}
                                </td>
                                <td className="px-3 py-3">
                                  <p className="font-bold text-slate-800">
                                    {assignment.employee?.fullName ||
                                      assignment.employee?.username ||
                                      "Nhân viên"}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {assignment.employee?.email}
                                  </p>
                                </td>
                                <td className="px-3 py-3">
                                  <select
                                    value={assignment.roleInShift}
                                    onChange={(event) =>
                                      handleUpdateRole(
                                        assignment.assignmentId,
                                        event.target.value as ManagerShiftRole,
                                      )
                                    }
                                    className={managerInputClass}
                                  >
                                    <option value="STAFF">Nhân viên</option>
                                    <option value="CASHIER">Thu ngân</option>
                                  </select>
                                </td>
                                <td className="px-3 py-3 text-slate-600">
                                  {assignment.checkIn || "Chưa check-in"}
                                </td>
                                <td className="px-3 py-3 text-slate-600">
                                  {assignment.checkOut || "Chưa check-out"}
                                </td>
                                <td className="px-3 py-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemove(assignment.assignmentId)
                                    }
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-red-600 transition hover:bg-red-50"
                                    title="Xóa phân ca"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      <TablePagination
                        page={assignmentPages[shift.id] || 1}
                        totalPages={Math.ceil(shift.assignments.length / LIMIT)}
                        total={shift.assignments.length}
                        onPage={(nextPage) =>
                          setAssignmentPages((current) => ({
                            ...current,
                            [shift.id]: nextPage,
                          }))
                        }
                        unit="nhân viên"
                      />
                    </>
                  ) : (
                    <div className="py-8 text-center text-sm font-semibold text-slate-500">
                      Chưa phân nhân viên cho ca này.
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white py-14 text-center">
          <Clock className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-700">
            Chưa có ca làm việc trong ngày này
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkShiftPage;
