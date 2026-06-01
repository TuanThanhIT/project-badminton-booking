import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  Plus,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
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
import { FormWorkShiftSchema } from "../../schemas/FormWorkShiftSchema";
import type { ManagerShiftRole, ManagerWorkShift } from "../../types/workShift";

const today = new Date().toISOString().slice(0, 10);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const timeShort = (time: string) => time?.slice(0, 5) || "--:--";

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
  const [assignmentForms, setAssignmentForms] = useState<
    Record<number, { employeeId: string; roleInShift: ManagerShiftRole }>
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
    };
  }, [workShifts]);

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
    } catch (error: any) {
      toast.error(error?.message || "Tạo ca thất bại");
    }
  };

  const handleAssign = async (shift: ManagerWorkShift) => {
    const form = assignmentForms[shift.id];
    const employeeId = Number(form?.employeeId);

    if (!employeeId) {
      toast.warning("Vui lòng chọn nhân viên");
      return;
    }

    try {
      await dispatch(
        assignManagerShiftEmployee({
          workShiftId: shift.id,
          employeeId,
          roleInShift: form.roleInShift,
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
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
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
            className="bg-transparent text-sm font-semibold text-slate-800 outline-none"
          />
        </label>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-sky-600" />
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">
                Số ca
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.shiftCount}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">
                Nhân viên đã phân
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.assignmentCount}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <UserPlus className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">
                Thu ngân
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.cashierCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Tạo ca mới</h2>
          <span className="rounded-md bg-sky-50 px-2 py-1 text-xs font-bold text-sky-700">
            ///MANAGER
          </span>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.2fr_160px_130px_130px_150px_150px_44px]">
          <input
            value={shiftForm.shiftName}
            onChange={(event) =>
              setShiftForm((current) => ({
                ...current,
                shiftName: event.target.value,
              }))
            }
            placeholder="Tên ca"
            className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-400"
          />
          <input
            type="date"
            value={shiftForm.workDate}
            onChange={(event) =>
              setShiftForm((current) => ({
                ...current,
                workDate: event.target.value,
              }))
            }
            className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-400"
          />
          <input
            type="time"
            value={shiftForm.startTime}
            onChange={(event) =>
              setShiftForm((current) => ({
                ...current,
                startTime: event.target.value,
              }))
            }
            className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-400"
          />
          <input
            type="time"
            value={shiftForm.endTime}
            onChange={(event) =>
              setShiftForm((current) => ({
                ...current,
                endTime: event.target.value,
              }))
            }
            className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-400"
          />
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
            placeholder="Lương thu ngân"
            className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-400"
          />
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
            placeholder="Lương nhân viên"
            className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-400"
          />
          <button
            type="button"
            disabled={actionLoading}
            onClick={handleCreateShift}
            className="flex h-11 items-center justify-center rounded-lg bg-sky-600 text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            title="Tạo ca"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </section>

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
                      className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-400"
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
                      className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-400"
                    >
                      <option value="STAFF">Nhân viên</option>
                      <option value="CASHIER">Thu ngân</option>
                    </select>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleAssign(shift)}
                      className="flex h-10 items-center justify-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      title="Phân ca"
                    >
                      <UserPlus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-100">
                  {shift.assignments.length ? (
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-3 py-3">Nhân viên</th>
                          <th className="px-3 py-3">Vai trò</th>
                          <th className="px-3 py-3">Check-in</th>
                          <th className="px-3 py-3">Check-out</th>
                          <th className="px-3 py-3 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {shift.assignments.map((assignment) => (
                          <tr key={assignment.assignmentId}>
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
                                className="h-9 rounded-md border border-slate-200 px-2 text-sm outline-none focus:border-sky-400"
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
