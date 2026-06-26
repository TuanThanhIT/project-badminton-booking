import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  WalletCards,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  checkOutEmployeeWorkShift,
  checkInEmployeeWorkShift,
  getCurrentEmployeeWorkShift,
  getEmployeeWorkShifts,
  getShiftAssignments,
} from "../../redux/slices/employee/workShiftSlice";
import type { EmployeeWorkShift } from "../../types/workShift";
import {
  isShiftCheckoutWindowOpen,
  SHIFT_CHECKOUT_EARLY_MINUTES,
} from "../../utils/workShift";
import { formatTimeRange } from "../../utils/booking";

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

const ShiftSummary = ({ shift }: { shift: EmployeeWorkShift }) => (
  <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
      <Clock className="h-4 w-4 text-sky-600" />
      <span>
        {formatTimeRange(shift.workShift.startTime, shift.workShift.endTime)}
      </span>
    </div>
    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
      <CalendarDays className="h-4 w-4 text-sky-600" />
      <span>{shift.workShift.workDate}</span>
    </div>
    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 sm:col-span-2">
      <MapPin className="h-4 w-4 text-sky-600" />
      <span className="truncate">
        {shift.workShift.branch?.branchName || "Chi nhánh B-Hub"}
      </span>
    </div>
  </div>
);

const CashRegisterPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentWorkShift, workShifts, shiftAssignments } = useAppSelector(
    (state) => state.employeeWorkShift,
  );
  const loadingMap = useAppSelector((state) => state.ui.loadingMap);

  const loading =
    loadingMap["employeeWorkShift/getEmployeeWorkShifts"] ||
    loadingMap["employeeWorkShift/getCurrentEmployeeWorkShift"] ||
    false;

  const actionLoading =
    loadingMap["employeeWorkShift/checkInEmployeeWorkShift"] ||
    loadingMap["employeeWorkShift/checkOutEmployeeWorkShift"] ||
    false;

  const [amount, setAmount] = useState("");
  const [closingCash, setClosingCash] = useState("");
  const today = useMemo(() => getToday(), []);

  useEffect(() => {
    const time = getCurrentTime();
    dispatch(getEmployeeWorkShifts({ data: { date: today } }));
    dispatch(getCurrentEmployeeWorkShift({ data: { date: today, time } }));
  }, [dispatch, today]);

  const hasCheckedIn = Boolean(currentWorkShift?.checkIn);
  const hasCheckedOut = Boolean(currentWorkShift?.checkOut);
  const canCheckIn = Boolean(currentWorkShift && !currentWorkShift.checkIn);
  const canCheckOut = Boolean(
    currentWorkShift &&
    currentWorkShift.roleInShift === "CASHIER" &&
    currentWorkShift.checkIn &&
    !currentWorkShift.checkOut,
  );

  useEffect(() => {
    if (canCheckOut && currentWorkShift?.workShiftId) {
      dispatch(
        getShiftAssignments({
          data: { workShiftId: currentWorkShift.workShiftId },
        }),
      );
    }
  }, [canCheckOut, currentWorkShift?.workShiftId, dispatch]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const openingCash = Number(amount);

    if (!currentWorkShift) {
      toast.error("Không xác định được ca hiện tại!");
      return;
    }

    if (!Number.isFinite(openingCash) || openingCash < 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ!");
      return;
    }

    try {
      const res = await dispatch(
        checkInEmployeeWorkShift({
          data: {
            workShiftId: currentWorkShift.workShiftId,
            checkInTime: getCurrentTime(),
            openingCash,
          },
        }),
      ).unwrap();

      toast.success(res.message);
      setAmount("");
      navigate("/employee/shifts");
    } catch {
      // Global redux middleware handles API errors.
    }
  };

  const handleCheckout = async (event: React.FormEvent) => {
    event.preventDefault();

    const closingAmount = Number(closingCash);

    if (!currentWorkShift) {
      toast.error("Không xác định được ca hiện tại!");
      return;
    }

    if (!Number.isFinite(closingAmount) || closingAmount < 0) {
      toast.error("Vui lòng nhập số tiền cuối ca hợp lệ!");
      return;
    }

    if (!isShiftCheckoutWindowOpen(currentWorkShift.workShift)) {
      toast.warning(
        `Chỉ có thể checkout trong vòng ${SHIFT_CHECKOUT_EARLY_MINUTES} phút trước khi ca kết thúc.`,
      );
      return;
    }

    const openStaff = shiftAssignments.filter(
      (item) =>
        item.assignmentId !== currentWorkShift.assignmentId &&
        !item.checkOut,
    );

    if (openStaff.length) {
      toast.error(
        "Vui lòng nhập và lưu checkout cho tất cả nhân viên trong ca trước.",
      );
      navigate("/employee/shifts");
      return;
    }

    try {
      const res = await dispatch(
        checkOutEmployeeWorkShift({
          data: {
            workShiftId: currentWorkShift.workShiftId,
            checkOutTime: getCurrentTime(),
            closingCash: closingAmount,
          },
        }),
      ).unwrap();

      toast.success(res.message);
      setClosingCash("");
    } catch {
      // Global redux middleware handles API errors.
    }
  };

  return (
    <section className="box-border h-[calc(100dvh-72px)] overflow-hidden bg-slate-50 px-4 py-5 text-slate-700 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-full max-w-7xl items-center">
        <div className="grid h-full w-full min-h-0 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)] lg:grid-cols-[0.95fr_1.05fr]">
          {/* LEFT IMAGE */}
          <div className="relative hidden h-full overflow-hidden lg:block">
            <img
              src="/img/logo-employee.jpg"
              alt="B-Hub employee"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-sky-950/45 to-slate-900/10" />

            <div className="absolute inset-x-0 bottom-0 p-8 text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-sky-100 backdrop-blur-sm">
                <WalletCards className="h-4 w-4" />
                Cash Register
              </div>

              <h1 className="mt-4 max-w-lg text-2xl font-bold leading-tight sm:text-3xl">
                {hasCheckedIn
                  ? "Chốt tiền mặt cuối ca"
                  : "Kiểm soát tiền mặt đầu ca"}
              </h1>

              <p className="mt-3 max-w-lg text-sm leading-relaxed text-sky-100">
                {hasCheckedIn
                  ? "Thu ngân nhập số tiền mặt thực tế tại quầy trước khi checkout ca làm."
                  : "Nhân viên cần đăng ký số tiền mặt hiện có tại quầy trước khi bắt đầu xử lý vận hành trong ca."}
              </p>
            </div>
          </div>

          {/* RIGHT CONTENT SCROLL */}
          <div className="cash-scroll min-h-0 overflow-y-auto px-5 py-6 sm:px-7 sm:py-7">
            {loading ? (
              <div className="flex min-h-full items-center justify-center gap-3 text-slate-600">
                <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
                <span>Đang tải thông tin ca làm...</span>
              </div>
            ) : (
              <div className="mx-auto w-full max-w-xl pb-4">
                {/* HEADER */}
                <div className="mb-5">
                  <p className="text-sm font-semibold text-sky-700">
                    Vận hành ca làm
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-slate-800">
                    Quầy thu ngân
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {hasCheckedIn
                      ? "Xác nhận số tiền cuối ca để hệ thống ghi nhận checkout và đối soát quầy."
                      : "Xác nhận số tiền đầu ca để hệ thống ghi nhận check-in và mở phiên quầy."}
                  </p>
                </div>

                {currentWorkShift ? (
                  <div className="space-y-5">
                    {/* CURRENT SHIFT CARD */}
                    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold text-sky-600">
                            Ca hiện tại
                          </p>

                          <h3 className="mt-1 text-xl font-bold text-slate-800">
                            {currentWorkShift.workShift.shiftName}
                          </h3>
                        </div>

                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                          {currentWorkShift.roleInShift}
                        </span>
                      </div>

                      <ShiftSummary shift={currentWorkShift} />

                      {hasCheckedIn && (
                        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                          <div className="flex items-center gap-2 font-semibold">
                            <CheckCircle2 className="h-4 w-4" />
                            Đã check-in lúc{" "}
                            {formatDateTime(currentWorkShift.checkIn)}
                          </div>

                          <p className="mt-1">
                            Tiền đầu ca:{" "}
                            <span className="font-bold">
                              {formatCurrency(
                                currentWorkShift.cashRegister?.openingCash || 0,
                              )}
                            </span>
                          </p>

                          {hasCheckedOut ? (
                            <div className="mt-3 rounded-xl bg-white/70 px-3 py-2">
                              <p>
                                Đã checkout lúc{" "}
                                <span className="font-bold">
                                  {formatDateTime(currentWorkShift.checkOut)}
                                </span>
                              </p>

                              <p>
                                Tiền cuối ca:{" "}
                                <span className="font-bold">
                                  {formatCurrency(
                                    currentWorkShift.cashRegister
                                      ?.closingCash || 0,
                                  )}
                                </span>
                              </p>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => navigate("/employee/shifts")}
                              className="mt-3 inline-flex h-10 items-center justify-center rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
                            >
                              Quản lý ca làm
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* CHECK IN FORM */}
                    {canCheckIn && (
                      <form
                        onSubmit={handleSubmit}
                        className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4"
                      >
                        <label className="block">
                          <span className="text-sm font-semibold text-slate-700">
                            Số tiền mặt đầu ca
                          </span>

                          <div className="relative mt-2">
                            <Banknote className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sky-600" />

                            <input
                              type="number"
                              min={0}
                              step={1000}
                              value={amount}
                              onChange={(event) =>
                                setAmount(event.target.value)
                              }
                              placeholder="Nhập số tiền hiện có tại quầy"
                              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pl-12 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-500 hover:border-sky-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
                            />
                          </div>
                        </label>

                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {actionLoading && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                          Xác nhận bắt đầu ca
                        </button>
                      </form>
                    )}

                    {/* CHECK OUT FORM */}
                    {canCheckOut && (
                      <form
                        onSubmit={handleCheckout}
                        className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="mb-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                            <p className="text-xs font-semibold text-slate-500">
                              Tiền dự kiến
                            </p>

                            <p className="mt-1 text-lg font-bold text-slate-800">
                              {formatCurrency(
                                currentWorkShift.cashRegister?.expectedCash ||
                                  0,
                              )}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => navigate("/employee/shifts")}
                            className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-left text-sm font-semibold text-sky-700 transition hover:bg-sky-100 active:scale-[0.98]"
                          >
                            Kiểm tra giờ nhân viên
                          </button>
                        </div>

                        <label className="block">
                          <span className="text-sm font-semibold text-slate-700">
                            Số tiền mặt cuối ca
                          </span>

                          <div className="relative mt-2">
                            <Banknote className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sky-600" />

                            <input
                              type="number"
                              min={0}
                              step={1000}
                              value={closingCash}
                              onChange={(event) =>
                                setClosingCash(event.target.value)
                              }
                              placeholder="Nhập số tiền thực tế tại quầy"
                              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pl-12 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-500 hover:border-sky-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
                            />
                          </div>
                        </label>

                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {actionLoading && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                          Xác nhận checkout ca
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-lg font-bold text-slate-800">
                      Không có ca đang diễn ra
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Hệ thống chỉ mở đăng ký tiền mặt khi thời gian hiện tại
                      nằm trong khung giờ ca được phân.
                    </p>

                    {workShifts.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {workShifts.map((shift) => (
                          <div
                            key={shift.assignmentId}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                          >
                            <p className="font-semibold text-slate-800">
                              {shift.workShift.shiftName}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {formatTimeRange(
                                shift.workShift.startTime,
                                shift.workShift.endTime,
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CashRegisterPage;
