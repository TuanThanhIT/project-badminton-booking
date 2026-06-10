import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MapPin, Phone, Plus, Search, UserRound, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import {
  FormEmployeeSchema,
  type FormEmployee,
} from "../../schemas/FormEmployeeSchema";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  createEmployee,
  getEmployees,
} from "../../redux/slices/manager/employeeSlice";
import type { ManagerEmployee } from "../../types/employee";
import type { ApiErrorType } from "../../types/error";
import {
  ManagerEmptyState,
  ManagerModalOverlay,
  ManagerPageHeader,
  managerCardClass,
  managerInputClass,
  managerPrimaryButtonClass,
  managerSecondaryButtonClass,
} from "../../components/commons/manager/ManagerPage";
import TablePagination from "../../components/ui/user/pagination/TablePagination";

const LIMIT = 10;
const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "LOCKED", label: "Tạm khóa" },
];

const genderLabel: Record<string, string> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
};

const formatDate = (value?: string) => {
  if (!value) return "--";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

const getErrorMessage = (error: unknown) => {
  const apiError = error as ApiErrorType;
  return apiError?.message || "Thao tác thất bại";
};

const EmployeeAvatar = ({ employee }: { employee: ManagerEmployee }) => {
  if (employee.avatar) {
    return (
      <img
        src={employee.avatar}
        alt={employee.fullName || employee.username}
        className="h-11 w-11 rounded-xl object-cover"
      />
    );
  }

  const initial = (employee.fullName || employee.username || "N")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-base font-bold text-sky-700">
      {initial}
    </div>
  );
};

const StaffPage = () => {
  const dispatch = useAppDispatch();
  const { employees, loading } = useAppSelector(
    (state) => state.managerEmployee,
  );
  const [showForm, setShowForm] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormEmployee>({
    resolver: zodResolver(FormEmployeeSchema),
    defaultValues: { gender: "male" },
  });

  useEffect(() => {
    dispatch(getEmployees());
  }, [dispatch]);

  const filteredEmployees = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return employees.filter((employee) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && employee.isActive) ||
        (statusFilter === "LOCKED" && !employee.isActive);

      if (!matchesStatus) return false;
      if (!normalizedKeyword) return true;

      return [
        employee.username,
        employee.email,
        employee.fullName,
        employee.phoneNumber,
        employee.address,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedKeyword));
    });
  }, [employees, keyword, statusFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / LIMIT));
  const paginatedEmployees = filteredEmployees.slice(
    (page - 1) * LIMIT,
    page * LIMIT,
  );

  useEffect(() => {
    setPage(1);
  }, [keyword, statusFilter]);

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages));
  }, [totalPages]);

  const closeForm = () => {
    setShowForm(false);
    reset({ gender: "male" });
  };

  const onSubmit = async (data: FormEmployee) => {
    try {
      await dispatch(createEmployee(data)).unwrap();
      toast.success("Thêm nhân viên thành công");
      closeForm();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <ManagerPageHeader
        eyebrow="Manager staff"
        title="Quản lý nhân viên"
        description="Danh sách nhân viên đang thuộc chi nhánh của quản lý."
        metrics={[{ label: "Tổng nhân viên", value: employees.length }]}
        actions={
          <button
            onClick={() => setShowForm(true)}
            className={managerPrimaryButtonClass}
          >
            <Plus className="h-4 w-4" />
            Thêm nhân viên
          </button>
        }
      />

      <div className="grid items-end gap-4 md:grid-cols-[1fr_240px]">
        <label>
          <span className="mb-1 block text-xs font-medium text-slate-600">
            Tìm kiếm
          </span>
          <div
            className={`
              flex h-11 items-center gap-2.5 px-3
              border border-slate-200 bg-white
              transition-all duration-200
              focus-within:border-sky-400
              focus-within:ring-2
              focus-within:ring-sky-100
              ${managerCardClass}
            `}
          >
            <Search className="h-4 w-4 shrink-0 text-slate-400 transition-colors duration-200 group-focus-within:text-sky-500" />

            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="h-full flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              placeholder="Tên, email, số điện thoại hoặc địa chỉ..."
            />
          </div>
        </label>

        <label>
          <span className="mb-1 block text-xs font-medium text-slate-600">
            Trạng thái
          </span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={`w-full ${managerInputClass}`}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className={`${managerCardClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Nhân viên</th>
                <th className="px-4 py-3 font-semibold">Liên hệ</th>
                <th className="px-4 py-3 font-semibold">Giới tính</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 font-semibold">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 [&_td]:align-top">
              {paginatedEmployees.map((employee, index) => (
                <tr key={employee.employeeId} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-400">
                    {(page - 1) * LIMIT + index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <EmployeeAvatar employee={employee} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                          {employee.fullName || employee.username}
                        </p>
                        <p className="truncate text-sm text-slate-500">
                          @{employee.username}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1 text-sm text-slate-600">
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        {employee.email}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400" />
                        {employee.phoneNumber || "--"}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {employee.address || "--"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {employee.gender
                      ? genderLabel[employee.gender] || employee.gender
                      : "--"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-xl px-2.5 py-1 text-xs font-bold ${
                        employee.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {employee.isActive ? "Đang hoạt động" : "Tạm khóa"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(employee.createdAt)}
                  </td>
                </tr>
              ))}

              {!loading && filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12">
                    <ManagerEmptyState
                      icon={UserRound}
                      title="Chưa có nhân viên"
                      description="Thêm nhân viên để bắt đầu phân quyền làm việc tại chi nhánh."
                    />
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    Đang tải danh sách nhân viên...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={page}
          totalPages={totalPages}
          total={filteredEmployees.length}
          onPage={setPage}
          unit="nhân viên"
          alwaysShow
        />
      </div>

      {showForm && (
        <ManagerModalOverlay>
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Thêm nhân viên
                </h2>
                <p className="text-sm text-slate-500">
                  Tài khoản mới sẽ được gán vào chi nhánh hiện tại.
                </p>
              </div>
              <button
                onClick={closeForm}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Tên đăng nhập" error={errors.username?.message}>
                  <input
                    {...register("username")}
                    className={`w-full ${managerInputClass}`}
                  />
                </Field>

                <Field label="Email" error={errors.email?.message}>
                  <input
                    {...register("email")}
                    type="email"
                    className={`w-full ${managerInputClass}`}
                  />
                </Field>

                <Field label="Mật khẩu" error={errors.password?.message}>
                  <input
                    {...register("password")}
                    type="password"
                    className={`w-full ${managerInputClass}`}
                  />
                </Field>

                <Field label="Họ tên" error={errors.fullName?.message}>
                  <input
                    {...register("fullName")}
                    className={`w-full ${managerInputClass}`}
                  />
                </Field>

                <Field
                  label="Số điện thoại"
                  error={errors.phoneNumber?.message}
                >
                  <input
                    {...register("phoneNumber")}
                    className={`w-full ${managerInputClass}`}
                  />
                </Field>

                <Field label="Giới tính" error={errors.gender?.message}>
                  <select
                    {...register("gender")}
                    className={`w-full ${managerInputClass}`}
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </Field>
              </div>

              <Field label="Địa chỉ" error={errors.address?.message}>
                <input
                  {...register("address")}
                  className={`w-full ${managerInputClass}`}
                />
              </Field>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  className={managerSecondaryButtonClass}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={managerPrimaryButtonClass}
                >
                  {loading ? "Đang lưu..." : "Thêm nhân viên"}
                </button>
              </div>
            </form>
          </div>
        </ManagerModalOverlay>
      )}
    </div>
  );
};

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) => (
  <div>
    <label className="mb-1 block text-xs font-medium text-slate-600">
      {label}
    </label>
    {children}
    {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
  </div>
);

export default StaffPage;
