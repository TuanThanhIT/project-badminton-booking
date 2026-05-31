import { useEffect, useMemo, useState } from "react";
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
        className="h-11 w-11 rounded-lg object-cover"
      />
    );
  }

  const initial = (employee.fullName || employee.username || "N")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-100 text-base font-bold text-sky-700">
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
    defaultValues: {
      gender: "male",
    },
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
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Quản lý nhân viên
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Danh sách nhân viên đang thuộc chi nhánh của quản lý.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
        >
          <Plus className="h-4 w-4" />
          Thêm nhân viên
        </button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-[220px_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Tổng nhân viên
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {employees.length}
              </p>
            </div>
          </div>
        </div>

        <label className="flex h-full min-h-20 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 shadow-sm">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="h-11 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            placeholder="Tìm theo tên, email, số điện thoại hoặc địa chỉ"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
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
                      className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${
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
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <UserRound className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-3 font-semibold text-slate-700">
                      Chưa có nhân viên
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Thêm nhân viên để bắt đầu phân quyền làm việc tại chi nhánh.
                    </p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
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
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Tên đăng nhập
                  </label>
                  <input
                    {...register("username")}
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                  {errors.username && (
                    <p className="mt-1 text-xs text-rose-600">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-rose-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Mật khẩu
                  </label>
                  <input
                    {...register("password")}
                    type="password"
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-rose-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Họ tên
                  </label>
                  <input
                    {...register("fullName")}
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-rose-600">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Số điện thoại
                  </label>
                  <input
                    {...register("phoneNumber")}
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-xs text-rose-600">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Giới tính
                  </label>
                  <select
                    {...register("gender")}
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-xs text-rose-600">
                      {errors.gender.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Địa chỉ
                </label>
                <input
                  {...register("address")}
                  className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-10 rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Đang lưu..." : "Thêm nhân viên"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPage;
