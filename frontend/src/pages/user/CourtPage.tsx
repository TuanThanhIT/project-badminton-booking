import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Filter,
  MapPin,
  Navigation,
  Search,
  WalletCards,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { getBranchOptions } from "../../redux/slices/user/branchSlice";
import { getAvailableCourts } from "../../redux/slices/user/courtSlice";
import { calculateMonthlyBooking } from "../../redux/slices/user/monthlyBookingSlice";
import type { BranchOptions } from "../../types/branch";
import type { CourtAvailable } from "../../types/court";

const generateTimeOptions = () => {
  const options: string[] = [];
  for (let hour = 5; hour <= 23; hour += 1) {
    const h = hour.toString().padStart(2, "0");
    options.push(`${h}:00`);
    options.push(`${h}:30`);
  }
  return options;
};

const MIN_BOOKING_LEAD_MINUTES = 60;
const TIME_OPTIONS = generateTimeOptions();
const formatDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const getTodayDate = () => formatDateInputValue(new Date());
const today = getTodayDate();

const timeToMinutes = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

const minutesToTime = (value: number) => {
  const hour = Math.floor(value / 60);
  const minute = value % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const dateTimeFromDateAndTime = (date: string, time: string) => {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
};

const getEarliestBookingDateTime = (now: Date) =>
  new Date(now.getTime() + MIN_BOOKING_LEAD_MINUTES * 60 * 1000);

const isStartTimeBookable = (date: string, time: string, now: Date) => {
  const todayDate = getTodayDate();
  if (date < todayDate) return false;
  if (date > todayDate) return true;
  return dateTimeFromDateAndTime(date, time) >= getEarliestBookingDateTime(now);
};

const WEEK_DAYS = [
  { label: "Thứ 2", value: "Monday" },
  { label: "Thứ 3", value: "Tuesday" },
  { label: "Thứ 4", value: "Wednesday" },
  { label: "Thứ 5", value: "Thursday" },
  { label: "Thứ 6", value: "Friday" },
  { label: "Thứ 7", value: "Saturday" },
  { label: "Chủ nhật", value: "Sunday" },
];

const inputClass =
  "h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition-all hover:border-sky-200 hover:bg-white focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100";

const labelClass = "mb-2 block text-[13px] font-medium text-slate-600";

const isCourtBooked = (court: CourtAvailable) =>
  court.status?.toLowerCase() === "booked";

const CourtPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { branchOptions } = useAppSelector((state) => state.branch);
  const { availableCourts, loading } = useAppSelector((state) => state.court);

  const [mode, setMode] = useState<"daily" | "monthly">("daily");
  const [selectedBranch, setSelectedBranch] = useState<BranchOptions | null>(
    null,
  );
  const [selectedCourt, setSelectedCourt] = useState<CourtAvailable | null>(
    null,
  );
  const [bookingDate, setBookingDate] = useState(today);
  const [monthlyStartDate, setMonthlyStartDate] = useState(today);
  const [monthlyEndDate, setMonthlyEndDate] = useState("");
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");
  const [monthlyPrice, setMonthlyPrice] = useState(0);
  const [monthlySessions, setMonthlySessions] = useState(0);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const branchNameQuery = searchParams.get("branchName") || "";

  useEffect(() => {
    dispatch(getBranchOptions());
  }, [dispatch]);

  useEffect(() => {
    if (!branchNameQuery || branchOptions.length === 0) return;

    const normalize = (value: string) =>
      value.trim().toLocaleLowerCase("vi-VN");

    const matchedBranch = branchOptions.find(
      (branch) => normalize(branch.branchName) === normalize(branchNameQuery),
    );

    if (!matchedBranch || selectedBranch?.id === matchedBranch.id) return;

    setSelectedBranch(matchedBranch);
  }, [branchNameQuery, branchOptions, selectedBranch?.id]);

  useEffect(() => {
    const timer = window.setInterval(() => setNowTick(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const now = useMemo(() => new Date(nowTick), [nowTick]);
  const todayDate = useMemo(() => getTodayDate(), []);
  const activeDate = mode === "daily" ? bookingDate : monthlyStartDate || todayDate;
  const earliestBookingDateTime = useMemo(
    () => getEarliestBookingDateTime(now),
    [now],
  );
  const earliestBookingTimeLabel = minutesToTime(
    earliestBookingDateTime.getHours() * 60 + earliestBookingDateTime.getMinutes(),
  );
  const startTimeBookable = isStartTimeBookable(activeDate, startTime, now);

  const duration = useMemo(() => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const start = startHour + startMinute / 60;
    const end = endHour + endMinute / 60;
    return end > start ? end - start : 0;
  }, [startTime, endTime]);

  const scheduleWarning = useMemo(() => {
    if (activeDate < todayDate) {
      return "Không thể đặt sân cho ngày trong quá khứ.";
    }

    if (activeDate === todayDate && !startTimeBookable) {
      if (formatDateInputValue(earliestBookingDateTime) !== todayDate) {
        return "Hôm nay không còn khung giờ đủ điều kiện đặt trước 1 tiếng. Vui lòng chọn ngày mai hoặc ngày khác.";
      }

      return `Khung giờ bắt đầu phải sau thời điểm hiện tại ít nhất ${MIN_BOOKING_LEAD_MINUTES} phút. Hôm nay chỉ có thể đặt từ khoảng ${earliestBookingTimeLabel} trở đi.`;
    }

    if (duration <= 0) {
      return "Giờ kết thúc phải sau giờ bắt đầu.";
    }

    return "";
  }, [
    activeDate,
    todayDate,
    startTimeBookable,
    earliestBookingDateTime,
    earliestBookingTimeLabel,
    duration,
  ]);

  const canSearchCourts = !scheduleWarning && duration > 0;

  const availableStartTimes = useMemo(
    () => TIME_OPTIONS.filter((time) => isStartTimeBookable(activeDate, time, now)),
    [activeDate, now],
  );

  useEffect(() => {
    if (activeDate < todayDate) {
      if (mode === "daily") setBookingDate(todayDate);
      else setMonthlyStartDate(todayDate);
      return;
    }

    if (
      availableStartTimes.length > 0 &&
      !availableStartTimes.includes(startTime)
    ) {
      const nextStartTime = availableStartTimes[0];
      setStartTime(nextStartTime);

      const nextEndTime = TIME_OPTIONS.find(
        (time) => timeToMinutes(time) > timeToMinutes(nextStartTime),
      );
      if (nextEndTime) setEndTime(nextEndTime);
    }
  }, [
    activeDate,
    availableStartTimes,
    mode,
    startTime,
    todayDate,
  ]);

  useEffect(() => {
    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
      const nextEndTime = TIME_OPTIONS.find(
        (time) => timeToMinutes(time) > timeToMinutes(startTime),
      );
      if (nextEndTime) setEndTime(nextEndTime);
    }
  }, [endTime, startTime]);

  useEffect(() => {
    if (!selectedBranch || !canSearchCourts) {
      setSelectedCourt(null);
      return;
    }

    dispatch(
      getAvailableCourts({
        branchId: selectedBranch.id,
        date: mode === "daily" ? bookingDate : monthlyStartDate || todayDate,
        startTime,
        endTime,
      }),
    );
    setSelectedCourt(null);
  }, [
    dispatch,
    selectedBranch,
    mode,
    bookingDate,
    monthlyStartDate,
    todayDate,
    startTime,
    endTime,
    canSearchCourts,
  ]);

  useEffect(() => {
    const calculateMonthly = async () => {
      if (
        mode !== "monthly" ||
        !selectedBranch ||
        !selectedCourt ||
        !monthlyStartDate ||
        !monthlyEndDate ||
        daysOfWeek.length === 0 ||
        duration <= 0
      ) {
        setMonthlyPrice(0);
        setMonthlySessions(0);
        return;
      }

      try {
        const res = await dispatch(
          calculateMonthlyBooking({
            branchId: selectedBranch.id,
            courtId: selectedCourt.id,
            startDate: monthlyStartDate,
            endDate: monthlyEndDate,
            daysOfWeek,
            startTime,
            endTime,
          }),
        ).unwrap();

        setMonthlyPrice(res.data.totalAmount);
        setMonthlySessions(res.data.totalSessions);
      } catch (error) {
        console.log(error);
        setMonthlyPrice(0);
        setMonthlySessions(0);
      }
    };

    calculateMonthly();
  }, [
    dispatch,
    mode,
    selectedBranch,
    selectedCourt,
    monthlyStartDate,
    monthlyEndDate,
    daysOfWeek,
    startTime,
    endTime,
    duration,
  ]);

  const totalPrice = useMemo(() => {
    if (!selectedCourt) return 0;
    return mode === "daily"
      ? Number(selectedCourt.totalPrice || 0)
      : monthlyPrice;
  }, [selectedCourt, mode, monthlyPrice]);

  const toggleDay = (day: string) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day],
    );
  };

  const handleBooking = () => {
    if (!selectedBranch) {
      alert("Vui lòng chọn chi nhánh");
      return;
    }
    if (!selectedCourt) {
      alert("Vui lòng chọn sân");
      return;
    }
    if (duration <= 0) {
      alert("Giờ kết thúc phải lớn hơn giờ bắt đầu");
      return;
    }
    if (mode === "daily" && bookingDate < todayDate) {
      alert("Không thể đặt sân cho ngày trong quá khứ");
      setBookingDate(todayDate);
      return;
    }
    if (scheduleWarning) {
      alert(scheduleWarning);
      return;
    }
    if (isCourtBooked(selectedCourt)) {
      alert("Sân này đã có lịch trong khung giờ bạn chọn");
      return;
    }

    if (mode === "monthly") {
      if (monthlyStartDate < todayDate) {
        alert("Không thể đặt sân cho ngày bắt đầu trong quá khứ");
        setMonthlyStartDate(todayDate);
        return;
      }
      if (!monthlyStartDate || !monthlyEndDate) {
        alert("Vui lòng chọn ngày bắt đầu và kết thúc");
        return;
      }
      if (monthlyEndDate < monthlyStartDate) {
        alert("Ngày kết thúc phải sau ngày bắt đầu");
        return;
      }
      if (daysOfWeek.length === 0) {
        alert("Vui lòng chọn ít nhất một thứ trong tuần");
        return;
      }
    }

    navigate("/checkout/booking", {
      state: {
        type: mode,
        branchId: selectedBranch.id,
        branchName: selectedBranch.branchName,
        courtId: selectedCourt.id,
        courtName: selectedCourt.courtName,
        bookingDate: mode === "daily" ? bookingDate : null,
        startDate: mode === "monthly" ? monthlyStartDate : null,
        endDate: mode === "monthly" ? monthlyEndDate : null,
        daysOfWeek: mode === "monthly" ? daysOfWeek : [],
        totalSessions: mode === "monthly" ? monthlySessions : 0,
        startTime,
        endTime,
        totalAmount: totalPrice,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <section className="relative overflow-hidden bg-sky-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_32%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-sky-100">
                <Navigation size={16} className="text-sky-300" />
                Trung tâm đặt sân
              </div>

              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
                Đặt sân cầu lông
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-sky-100 sm:text-lg">
                Chọn chi nhánh, khung giờ và sân còn trống. Sau khi đặt, bạn có
                thể theo dõi toàn bộ lịch sân trong tài khoản.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:min-w-[420px]">
              {[
                {
                  icon: MapPin,
                  label: "Chi nhánh",
                  value: selectedBranch ? "Đã chọn" : branchOptions.length,
                },
                {
                  icon: Search,
                  label: "Sân phù hợp",
                  value: availableCourts.length,
                },
                {
                  icon: WalletCards,
                  label: "Tạm tính",
                  value: `${totalPrice.toLocaleString()}đ`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/10 px-3 py-4 text-white backdrop-blur-sm sm:px-4"
                >
                  <item.icon size={18} className="mb-2 text-sky-200" />
                  <p className="truncate text-xl font-semibold leading-none sm:text-2xl">
                    {item.value}
                  </p>
                  <p className="mt-2 text-xs text-sky-100">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto -mt-6 grid max-w-[1220px] gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-6">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-3 border-b border-slate-100 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
                <Filter size={21} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Thông tin tìm sân
                </h2>
                <p className="text-sm text-slate-500">
                  Đang đặt:{" "}
                  <span className="font-medium text-sky-700">
                    {mode === "daily" ? "Theo ngày" : "Theo tháng"}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                  { key: "daily", label: "Đặt theo ngày" },
                  { key: "monthly", label: "Đặt theo tháng" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setMode(item.key as "daily" | "monthly")}
                    className={`shrink-0 rounded-2xl border px-4 py-2.5 text-sm font-medium transition-all ${
                      mode === item.key
                        ? "border-sky-300 bg-sky-50 text-sky-800 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>Chi nhánh</span>
                  <div className="relative">
                    <select
                      value={selectedBranch?.id || ""}
                      onChange={(event) => {
                        const branch = branchOptions.find(
                          (item: BranchOptions) =>
                            item.id === Number(event.target.value),
                        );
                        setSelectedBranch(branch || null);
                      }}
                      className={`${inputClass} appearance-none pr-10`}
                    >
                      <option value="">Chọn chi nhánh</option>
                      {branchOptions.map((branch: BranchOptions) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.branchName}
                        </option>
                      ))}
                    </select>
                    <MapPin
                      size={18}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </label>

                {mode === "daily" ? (
                  <label className="block">
                    <span className={labelClass}>Ngày chơi</span>
                    <input
                      type="date"
                      value={bookingDate}
                      min={todayDate}
                      onChange={(event) => {
                        const value = event.target.value;
                        setBookingDate(value < todayDate ? todayDate : value);
                      }}
                      className={inputClass}
                    />
                  </label>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className={labelClass}>Bắt đầu</span>
                      <input
                        type="date"
                        value={monthlyStartDate}
                        min={todayDate}
                        onChange={(event) => {
                          const value = event.target.value;
                          const nextStart =
                            value < todayDate ? todayDate : value;
                          setMonthlyStartDate(nextStart);
                          if (monthlyEndDate && monthlyEndDate < nextStart) {
                            setMonthlyEndDate(nextStart);
                          }
                        }}
                        className={inputClass}
                      />
                    </label>
                    <label className="block">
                      <span className={labelClass}>Kết thúc</span>
                      <input
                        type="date"
                        value={monthlyEndDate}
                        min={monthlyStartDate || todayDate}
                        onChange={(event) => {
                          const minDate = monthlyStartDate || todayDate;
                          const value = event.target.value;
                          setMonthlyEndDate(value < minDate ? minDate : value);
                        }}
                        className={inputClass}
                      />
                    </label>
                  </div>
                )}
              </div>

              {mode === "monthly" && (
                <div>
                  <p className={labelClass}>Chọn thứ trong tuần</p>
                  <div className="flex flex-wrap gap-2">
                    {WEEK_DAYS.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`rounded-2xl border px-4 py-2.5 text-sm font-medium transition-all ${
                          daysOfWeek.includes(day.value)
                            ? "border-sky-300 bg-sky-50 text-sky-800 shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>Giờ bắt đầu</span>
                  <select
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                    className={`${inputClass} appearance-none`}
                  >
                    {TIME_OPTIONS.map((time) => (
                      <option
                        key={time}
                        value={time}
                        disabled={!isStartTimeBookable(activeDate, time, now)}
                      >
                        {time}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={labelClass}>Giờ kết thúc</span>
                  <select
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                    className={`${inputClass} appearance-none`}
                  >
                    {TIME_OPTIONS.map((time) => (
                      <option
                        key={time}
                        value={time}
                        disabled={timeToMinutes(time) <= timeToMinutes(startTime)}
                      >
                        {time}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {scheduleWarning && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-700">
                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0 text-amber-500"
                  />
                  <span>{scheduleWarning}</span>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Danh sách sân
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Chọn một sân còn trống để tiếp tục thanh toán.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-500">
                <Search size={15} />
                {availableCourts.length} sân
              </span>
            </div>

            <div className="bg-slate-50/80 p-4 sm:p-5">
              {!selectedBranch ? (
                <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
                  <div className="mb-4 rounded-3xl bg-sky-50 p-4 text-sky-600">
                    <MapPin size={34} />
                  </div>
                  <p className="text-lg font-semibold text-slate-800">
                    Chọn chi nhánh để xem sân trống
                  </p>
                </div>
              ) : loading ? (
                <div className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
                  Đang tải danh sách sân...
                </div>
              ) : availableCourts.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
                  <div className="mb-4 rounded-3xl bg-sky-50 p-4 text-sky-600">
                    <CalendarDays size={34} />
                  </div>
                  <p className="text-lg font-semibold text-slate-800">
                    Chưa có sân phù hợp
                  </p>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                    Hãy thử đổi ngày hoặc khung giờ khác.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {availableCourts.map((court: CourtAvailable) => {
                    const booked = isCourtBooked(court);
                    const selected = selectedCourt?.id === court.id;

                    return (
                      <button
                        key={court.id}
                        type="button"
                        onClick={() => {
                          if (booked) return;
                          setSelectedCourt(court);
                        }}
                        disabled={booked}
                        className={`group overflow-hidden rounded-[1.75rem] border bg-white text-left shadow-sm transition-all ${
                          selected
                            ? "border-sky-300 bg-sky-50 shadow-[0_10px_24px_rgba(14,165,233,0.12)]"
                            : "border-slate-200 hover:border-sky-200 hover:shadow-[0_14px_34px_rgba(14,165,233,0.1)]"
                        } ${booked ? "cursor-not-allowed opacity-60" : ""}`}
                      >
                        <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                          <img
                            src={
                              court.thumbnailUrl || "/img/logo_badminton.jpg"
                            }
                            alt={court.courtName}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <span
                            className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-medium ${
                              booked
                                ? "bg-rose-50 text-rose-600"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {booked ? "Đã đặt" : "Còn trống"}
                          </span>
                        </div>

                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="truncate font-semibold text-slate-900">
                                {court.courtName}
                              </h3>
                              <p className="mt-1 truncate text-sm text-slate-500">
                                {court.location || selectedBranch.branchName}
                              </p>
                            </div>
                            {selected && (
                              <CheckCircle2
                                size={22}
                                className="shrink-0 text-sky-600"
                              />
                            )}
                          </div>
                          <p className="mt-4 text-lg font-semibold text-sky-700">
                            {Number(court.totalPrice || 0).toLocaleString()}đ
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
            <div className="border-b border-slate-100 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
                  <WalletCards size={22} />
                </div>
                <div>
                  <p className="text-sm font-medium text-sky-700">
                    Tóm tắt lịch sân
                  </p>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Thông tin đặt sân
                  </h2>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-6 text-sm">
              {[
                ["Hình thức", mode === "daily" ? "Theo ngày" : "Theo tháng"],
                ["Chi nhánh", selectedBranch?.branchName || "Chưa chọn"],
                ["Sân", selectedCourt?.courtName || "Chưa chọn"],
                ["Thời gian", `${startTime} - ${endTime}`],
                [
                  mode === "daily" ? "Ngày chơi" : "Khoảng ngày",
                  mode === "daily"
                    ? bookingDate
                    : `${monthlyStartDate || "--"} - ${monthlyEndDate || "--"}`,
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <span className="text-slate-500">{label}</span>
                  <span className="text-right font-medium text-slate-900">
                    {value}
                  </span>
                </div>
              ))}

              {mode === "monthly" && (
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Số buổi</span>
                  <span className="font-medium text-slate-900">
                    {monthlySessions}
                  </span>
                </div>
              )}

              <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock3 size={16} />
                  Thời lượng: {duration || 0} giờ
                </div>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <span className="text-sm text-slate-500">Tổng tiền</span>
                  <span className="text-3xl font-semibold text-sky-700">
                    {totalPrice.toLocaleString()}đ
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBooking}
                disabled={!selectedCourt || !!scheduleWarning || duration <= 0}
                className="mt-3 w-full rounded-2xl bg-sky-600 px-5 py-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Tiếp tục thanh toán
              </button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default CourtPage;
