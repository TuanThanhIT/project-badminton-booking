import { useEffect, useMemo, useState } from "react";
import { Banknote, CalendarDays, Clock, Users } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { getManagerMonthlySalary } from "../../redux/slices/manager/salarySlice";
import { ManagerPageHeader } from "../../components/commons/manager/ManagerPage";
import TablePagination from "../../components/ui/TablePagination";

const now = new Date();
const LIMIT = 10;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatPercent = (value: number) =>
  `${Math.round(Number(value || 0) * 100)}%`;

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

const timeShort = (value: string) => value?.slice(0, 5) || "--:--";

///MANAGER
const SalaryPage = () => {
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((state) => state.managerSalary);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<number | null>(
    null,
  );
  const [assignmentPages, setAssignmentPages] = useState<Record<number, number>>({});

  useEffect(() => {
    dispatch(getManagerMonthlySalary({ month, year }));
  }, [dispatch, month, year]);

  const years = useMemo(() => {
    const currentYear = now.getFullYear();
    return Array.from({ length: 5 }, (_, index) => currentYear - index);
  }, []);

  return (
    <div className="space-y-6">
      <ManagerPageHeader
        eyebrow="Manager salary"
        title="Tính lương nhân viên"
        description="Tổng hợp lương theo ca đã check-in/check-out trong tháng của branch đang quản lý."
        metrics={[
          { label: "Nhân viên", value: data?.employees?.length || 0 },
          { label: "Tổng lương", value: formatCurrency(data?.totalSalary || 0) },
        ]}
        actions={
          <div className="flex gap-2">
            <label className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 text-white">
              <CalendarDays className="h-4 w-4 text-sky-100" />
              <select
                value={month}
                onChange={(event) => setMonth(Number(event.target.value))}
                className="bg-transparent text-sm font-semibold text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-100"
              >
                {Array.from({ length: 12 }, (_, index) => index + 1).map(
                  (item) => (
                    <option key={item} value={item} className="text-slate-900">
                      Tháng {item}
                    </option>
                  ),
                )}
              </select>
            </label>
            <select
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              className="h-11 rounded-xl border border-white/10 bg-white/10 px-3 text-sm font-semibold text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-100"
            >
              {years.map((item) => (
                <option key={item} value={item} className="text-slate-900">
                  {item}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="hidden flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Tính lương nhân viên
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            ///MANAGER tổng hợp lương theo ca đã check-in/check-out trong tháng.
          </p>
        </div>

        <div className="flex gap-2">
          <label className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 shadow-sm">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            <select
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
              className="bg-transparent text-sm font-semibold text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-100"
            >
              {Array.from({ length: 12 }, (_, index) => index + 1).map(
                (item) => (
                  <option key={item} value={item}>
                    Tháng {item}
                  </option>
                ),
              )}
            </select>
          </label>
          <select
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-100"
          >
            {years.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-sky-600" />
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">
                Nhân viên
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {data?.employeeCount || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">
                Tổng ca
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {data?.totalShiftCount || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Banknote className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">
                Tổng lương
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(data?.totalSalary || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="font-bold text-slate-900">
            Bảng lương tháng {data?.month || month}/{data?.year || year}
          </h2>
        </div>

        {loading ? (
          <div className="py-14 text-center text-sm font-semibold text-slate-500">
            Đang tải dữ liệu lương...
          </div>
        ) : data?.employees.length ? (
          <div className="divide-y divide-slate-100">
            {data.employees.map((employee) => {
              const expanded = expandedEmployeeId === employee.employeeId;

              return (
                <article key={employee.employeeId}>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedEmployeeId(expanded ? null : employee.employeeId)
                    }
                    className="grid w-full gap-3 px-4 py-4 text-left transition hover:bg-slate-50 lg:grid-cols-[1.5fr_120px_150px_140px_170px]"
                  >
                    <div>
                      <p className="font-bold text-slate-900">
                        {employee.fullName || employee.username}
                      </p>
                      <p className="text-xs text-slate-500">{employee.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Số ca</p>
                      <p className="font-bold text-slate-900">
                        {employee.shiftCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Ca hoàn thành</p>
                      <p className="font-bold text-slate-900">
                        {employee.completedShiftCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Tỷ lệ TB</p>
                      <p className="font-bold text-slate-900">
                        {formatPercent(employee.averageCompletionRate)}
                      </p>
                    </div>
                    <div className="lg:text-right">
                      <p className="text-xs text-slate-500">Lương</p>
                      <p className="font-bold text-emerald-700">
                        {formatCurrency(employee.totalEarnedWage)}
                      </p>
                    </div>
                  </button>

                  {expanded && (
                    <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                            <tr>
                              <th className="px-3 py-3">Ca</th>
                              <th className="px-3 py-3">Vai trò</th>
                              <th className="px-3 py-3">Check-in</th>
                              <th className="px-3 py-3">Check-out</th>
                              <th className="px-3 py-3">Tỷ lệ</th>
                              <th className="px-3 py-3 text-right">Lương</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {employee.assignments
                              .slice(
                                ((assignmentPages[employee.employeeId] || 1) - 1) * LIMIT,
                                (assignmentPages[employee.employeeId] || 1) * LIMIT,
                              )
                              .map((assignment) => (
                              <tr key={assignment.assignmentId}>
                                <td className="px-3 py-3">
                                  <p className="font-bold text-slate-800">
                                    {assignment.workShift.shiftName}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {assignment.workShift.workDate} •{" "}
                                    {timeShort(assignment.workShift.startTime)} -{" "}
                                    {timeShort(assignment.workShift.endTime)}
                                  </p>
                                </td>
                                <td className="px-3 py-3">
                                  {assignment.roleInShift === "CASHIER"
                                    ? "Thu ngân"
                                    : "Nhân viên"}
                                </td>
                                <td className="px-3 py-3">
                                  {formatDateTime(assignment.checkIn)}
                                </td>
                                <td className="px-3 py-3">
                                  {formatDateTime(assignment.checkOut)}
                                </td>
                                <td className="px-3 py-3">
                                  {formatPercent(assignment.completionRate)}
                                </td>
                                <td className="px-3 py-3 text-right font-bold text-emerald-700">
                                  {formatCurrency(assignment.earnedWage)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <TablePagination
                          page={assignmentPages[employee.employeeId] || 1}
                          totalPages={Math.ceil(employee.assignments.length / LIMIT)}
                          total={employee.assignments.length}
                          onPage={(nextPage) =>
                            setAssignmentPages((current) => ({
                              ...current,
                              [employee.employeeId]: nextPage,
                            }))
                          }
                          unit="ca"
                        />
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="py-14 text-center text-sm font-semibold text-slate-500">
            Chưa có dữ liệu lương trong tháng này.
          </div>
        )}
      </section>
    </div>
  );
};

export default SalaryPage;
