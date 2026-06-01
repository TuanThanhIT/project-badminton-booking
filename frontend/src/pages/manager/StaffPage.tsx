import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";
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
  ManagerStatCard,
  managerCardClass,
  managerInputClass,
  managerPrimaryButtonClass,
  managerSecondaryButtonClass,
} from "../../components/commons/manager/ManagerPage";

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
    if (!normalizedKeyword) return employees;

    return employees.filter((employee) =>
      [
        employee.username,
        employee.email,
        employee.fullName,
        employee.phoneNumber,
        employee.address,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedKeyword)),
    );
  }, [employees, keyword]);

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
          <button onClick={() => setShowForm(true)} className={managerPrimaryButtonClass}>
            <Plus className="h-4 w-4" />
            Thêm nhân viên
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <ManagerStatCard label="Tổng nhân viên" value={employees.length} icon={Users} />

        <label className={`flex min-h-20 items-center gap-3 px-4 ${managerCardClass}`}>
          <Search className="h-5 w-5 text-slate-400" />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="h-11 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            placeholder="Tìm theo tên, email, số điện thoại hoặc địa chỉ"
          />
        </label>
      </div>

      <div className={`${managerCardClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="bg-slate-100 text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Nhân viên</th>
                <th className="px-5 py-4">Liên hệ</th>
                <th className="px-5 py-4">Giới tính</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((employee) => (
                <tr key={employee.employeeId} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
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
                  <td className="px-5 py-4">
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
                  <td className="px-5 py-4 text-sm font-medium text-slate-700">
                    {employee.gender ? genderLabel[employee.gender] || employee.gender : "--"}
                  </td>
                  <td className="px-5 py-4">
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
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {formatDate(employee.createdAt)}
                  </td>
                </tr>
              ))}

              {!loading && filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12">
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
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">
                    Đang tải danh sách nhân viên...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <ManagerModalOverlay>
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
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
                  <input {...register("username")} className={`w-full ${managerInputClass}`} />
                </Field>

                <Field label="Email" error={errors.email?.message}>
                  <input {...register("email")} type="email" className={`w-full ${managerInputClass}`} />
                </Field>

                <Field label="Mật khẩu" error={errors.password?.message}>
                  <input {...register("password")} type="password" className={`w-full ${managerInputClass}`} />
                </Field>

                <Field label="Họ tên" error={errors.fullName?.message}>
                  <input {...register("fullName")} className={`w-full ${managerInputClass}`} />
                </Field>

                <Field label="Số điện thoại" error={errors.phoneNumber?.message}>
                  <input {...register("phoneNumber")} className={`w-full ${managerInputClass}`} />
                </Field>

                <Field label="Giới tính" error={errors.gender?.message}>
                  <select {...register("gender")} className={`w-full ${managerInputClass}`}>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </Field>
              </div>

              <Field label="Địa chỉ" error={errors.address?.message}>
                <input {...register("address")} className={`w-full ${managerInputClass}`} />
              </Field>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button type="button" onClick={closeForm} className={managerSecondaryButtonClass}>
                  Hủy
                </button>
                <button type="submit" disabled={loading} className={managerPrimaryButtonClass}>
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
    <label className="mb-1 block text-sm font-semibold text-slate-700">
      {label}
    </label>
    {children}
    {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
  </div>
);

export default StaffPage;
