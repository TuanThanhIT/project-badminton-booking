import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../redux/hook";

import { getBranchOptions } from "../../redux/slices/user/branchSlice";

import { getAvailableCourts } from "../../redux/slices/user/courtSlice";

import type { BranchOptions } from "../../types/branch";
import type { CourtAvailable } from "../../types/court";
import { createMonthlyBooking } from "../../redux/slices/user/monthlyBookingSlice";
import { calculateMonthlyBooking } from "../../redux/slices/user/monthlyBookingSlice";
import { useNavigate } from "react-router-dom";

// ======================================================
// HELPERS
// ======================================================

const generateTimeOptions = () => {
  const options = [];

  for (let hour = 5; hour <= 23; hour++) {
    const h = hour.toString().padStart(2, "0");

    options.push(`${h}:00`);
    options.push(`${h}:30`);
  }

  return options;
};

const TIME_OPTIONS = generateTimeOptions();

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// ======================================================
// COMPONENT
// ======================================================

const CourtPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { branchOptions } = useAppSelector((state) => state.branch);

  const { availableCourts } = useAppSelector((state) => state.court);

  // ======================================================
  // MODE
  // ======================================================

  const [mode, setMode] = useState<"daily" | "monthly">("daily");

  // ======================================================
  // COMMON STATES
  // ======================================================

  const [selectedBranch, setSelectedBranch] = useState<BranchOptions | null>(
    null,
  );

  const [selectedCourt, setSelectedCourt] = useState<CourtAvailable | null>(
    null,
  );

  const [startTime, setStartTime] = useState("08:00");

  const [endTime, setEndTime] = useState("10:00");

  // ======================================================
  // DAILY STATES
  // ======================================================

  const [bookingDate, setBookingDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // ======================================================
  // MONTHLY STATES
  // ======================================================

  const [monthlyStartDate, setMonthlyStartDate] = useState("");

  const [monthlyEndDate, setMonthlyEndDate] = useState("");

  const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);

  const [monthlyPrice, setMonthlyPrice] = useState(0);

  const [monthlySessions, setMonthlySessions] = useState(0);

  // ======================================================
  // LOAD BRANCHES
  // ======================================================

  useEffect(() => {
    dispatch(getBranchOptions());
  }, [dispatch]);

  // ======================================================
  // DURATION
  // ======================================================

  const durationNum = useMemo(() => {
    const [sH, sM] = startTime.split(":").map(Number);

    const [eH, eM] = endTime.split(":").map(Number);

    const start = sH + sM / 60;

    const end = eH + eM / 60;

    return end > start ? end - start : 0;
  }, [startTime, endTime]);

  // ======================================================
  // LOAD AVAILABLE COURTS (ONLY DAILY)
  // ======================================================

  useEffect(() => {
    if (!selectedBranch || durationNum <= 0) return;

    dispatch(
      getAvailableCourts({
        branchId: selectedBranch.id,
        date:
          mode === "daily"
            ? bookingDate
            : monthlyStartDate || new Date().toISOString().split("T")[0],

        startTime,
        endTime,
      }),
    );

    setSelectedCourt(null);
  }, [
    mode,
    selectedBranch,
    bookingDate,
    monthlyStartDate,
    startTime,
    endTime,
    durationNum,
    dispatch,
  ]);

  useEffect(() => {
    const calculate = async () => {
      if (
        mode !== "monthly" ||
        !selectedBranch ||
        !selectedCourt ||
        !monthlyStartDate ||
        !monthlyEndDate ||
        daysOfWeek.length === 0
      ) {
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
      }
    };

    calculate();
  }, [
    mode,
    selectedBranch,
    selectedCourt,
    monthlyStartDate,
    monthlyEndDate,
    daysOfWeek,
    startTime,
    endTime,
    dispatch,
  ]);

  // ======================================================
  // MONTHLY SESSIONS COUNT
  // ======================================================

  const totalSessions = useMemo(() => {
    if (
      mode !== "monthly" ||
      !monthlyStartDate ||
      !monthlyEndDate ||
      daysOfWeek.length === 0
    ) {
      return 0;
    }

    let count = 0;

    const start = new Date(monthlyStartDate);

    const end = new Date(monthlyEndDate);

    const mapDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    while (start <= end) {
      const dayName = mapDays[start.getDay()];

      if (daysOfWeek.includes(dayName)) {
        count++;
      }

      start.setDate(start.getDate() + 1);
    }

    return count;
  }, [mode, monthlyStartDate, monthlyEndDate, daysOfWeek]);

  // ======================================================
  // PRICE
  // ======================================================

  const totalPrice = useMemo(() => {
    if (!selectedCourt) return 0;

    if (mode === "daily") {
      return selectedCourt.totalPrice * durationNum;
    }

    return monthlyPrice;
  }, [selectedCourt, mode, durationNum, monthlyPrice]);

  // ======================================================
  // TOGGLE WEEK DAY
  // ======================================================

  const toggleDay = (day: string) => {
    setDaysOfWeek((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      }

      return [...prev, day];
    });
  };

  // ======================================================
// BOOKING
// ======================================================

const handleBooking = async () => {
  if (!selectedCourt || !selectedBranch) {
    alert("Vui lòng chọn sân");
    return;
  }

  try {
    // ==================================================
    // VALIDATE MONTHLY
    // ==================================================

    if (mode === "monthly") {
      if (!monthlyStartDate || !monthlyEndDate) {
        alert("Vui lòng chọn ngày bắt đầu và kết thúc");
        return;
      }

      if (daysOfWeek.length === 0) {
        alert("Vui lòng chọn ít nhất 1 thứ trong tuần");
        return;
      }
    }

    // ==================================================
    // CHUYỂN TỚI PAYMENT PAGE CHO CẢ 2 MODE
    // ==================================================

    navigate("/payment", {
      state: {
        type: mode,

        branchId: selectedBranch.id,
        branchName: selectedBranch.branchName,

        courtId: selectedCourt.id,
        courtName: selectedCourt.courtName,

        // DAILY
        bookingDate: mode === "daily" ? bookingDate : null,

        // MONTHLY
        startDate: mode === "monthly" ? monthlyStartDate : null,
        endDate: mode === "monthly" ? monthlyEndDate : null,
        daysOfWeek: mode === "monthly" ? daysOfWeek : [],
        totalSessions: mode === "monthly" ? monthlySessions : 0,

        // COMMON
        startTime,
        endTime,

        totalAmount: totalPrice,
      },
    });
  } catch (error: any) {
    console.log(error);

    alert(error?.response?.data?.message || "Có lỗi xảy ra");
  }
};

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="bg-slate-100 min-h-screen pb-20">
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <section className="bg-slate-900 text-white pt-16 pb-28 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-black">ĐẶT SÂN ONLINE</h1>

          <p className="text-slate-400 mt-3">
            Đặt sân theo ngày hoặc theo tháng
          </p>
        </div>
      </section>

      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      <div className="max-w-7xl mx-auto px-6 -mt-12">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* ================================================= */}
          {/* LEFT */}
          {/* ================================================= */}

          <div className="lg:col-span-8 space-y-6">
            {/* ================================================= */}
            {/* FILTER */}
            {/* ================================================= */}

            <div className="bg-white rounded-3xl p-8 shadow-xl space-y-6">
              {/* MODE */}

              <div className="flex gap-4">
                <button
                  onClick={() => setMode("daily")}
                  className={`px-5 py-3 rounded-2xl font-bold transition ${
                    mode === "daily" ? "bg-sky-500 text-white" : "bg-slate-200"
                  }`}
                >
                  Đặt theo ngày
                </button>

                <button
                  onClick={() => setMode("monthly")}
                  className={`px-5 py-3 rounded-2xl font-bold transition ${
                    mode === "monthly"
                      ? "bg-sky-500 text-white"
                      : "bg-slate-200"
                  }`}
                >
                  Đặt theo tháng
                </button>
              </div>

              {/* BRANCH */}

              <div>
                <label className="font-bold text-sm mb-2 block">
                  Chi nhánh
                </label>

                <div className="relative">
                  <select
                    className="w-full bg-slate-100 p-4 rounded-2xl outline-none"
                    onChange={(e) => {
                      const branch = branchOptions.find(
                        (b: BranchOptions) => b.id === Number(e.target.value),
                      );

                      setSelectedBranch(branch || null);
                    }}
                  >
                    <option value="">-- Chọn chi nhánh --</option>

                    {branchOptions.map((branch: BranchOptions) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.branchName}
                      </option>
                    ))}
                  </select>

                  <MapPin
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sky-500"
                  />
                </div>
              </div>

              {/* DAILY */}

              {mode === "daily" && (
                <div>
                  <label className="font-bold text-sm mb-2 block">
                    Ngày thi đấu
                  </label>

                  <input
                    type="date"
                    value={bookingDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-slate-100 p-4 rounded-2xl"
                  />
                </div>
              )}

              {/* MONTHLY */}

              {mode === "monthly" && (
                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-sm mb-2 block">
                        Ngày bắt đầu
                      </label>

                      <input
                        type="date"
                        value={monthlyStartDate}
                        onChange={(e) => setMonthlyStartDate(e.target.value)}
                        className="w-full bg-slate-100 p-4 rounded-2xl"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-sm mb-2 block">
                        Ngày kết thúc
                      </label>

                      <input
                        type="date"
                        value={monthlyEndDate}
                        onChange={(e) => setMonthlyEndDate(e.target.value)}
                        className="w-full bg-slate-100 p-4 rounded-2xl"
                      />
                    </div>
                  </div>

                  {/* DAYS */}

                  <div>
                    <label className="font-bold text-sm mb-3 block">
                      Chọn thứ trong tuần
                    </label>

                    <div className="flex flex-wrap gap-3">
                      {WEEK_DAYS.map((day) => (
                        <button
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={`px-4 py-2 rounded-xl font-bold transition ${
                            daysOfWeek.includes(day)
                              ? "bg-sky-500 text-white"
                              : "bg-slate-200"
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TIME */}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-sm mb-2 block">
                    Giờ bắt đầu
                  </label>

                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-100 p-4 rounded-2xl"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-sm mb-2 block">
                    Giờ kết thúc
                  </label>

                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-100 p-4 rounded-2xl"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ================================================= */}
            {/* COURTS */}
            {/* ================================================= */}

            <div className="space-y-5">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <Navigation className="text-sky-500" />
                Danh sách sân
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {availableCourts.map((court: CourtAvailable) => (
                  <div
                    key={court.id}
                    // onClick={() =>
                    //   court.status === "available" && setSelectedCourt(court)
                    // }
                    onClick={() => {
                      console.log("SELECT COURT: ", court);

                      setSelectedCourt(court);
                    }}
                    className={`bg-white rounded-3xl p-5 shadow-lg border-2 transition cursor-pointer ${
                      selectedCourt?.id === court.id
                        ? "border-sky-500"
                        : "border-transparent"
                    } ${
                      court.status?.toLowerCase() === "booked"
                        ? "opacity-60 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <img
                      src={court.thumbnailUrl}
                      className="w-full h-48 object-cover rounded-2xl mb-4"
                    />

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-black">{court.courtName}</h3>
                        <p className="text-sm font-bold text-sky-500 mt-2">
                          {court.totalPrice.toLocaleString()}đ / giờ
                        </p>

                        <p className="text-sm text-slate-400">
                          {court.location}
                        </p>
                      </div>

                      {selectedCourt?.id === court.id && (
                        <CheckCircle2 className="text-sky-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* RIGHT */}
          {/* ================================================= */}

          <div className="lg:col-span-4">
            <div className="bg-slate-900 text-white rounded-3xl p-8 sticky top-10 shadow-2xl space-y-6">
              <h2 className="text-2xl font-black">Thông tin đặt sân</h2>

              <div className="space-y-3 text-sm">
                <p>
                  Hình thức:
                  <b className="ml-2">
                    {mode === "daily" ? "Theo ngày" : "Theo tháng"}
                  </b>
                </p>

                <p>
                  Chi nhánh:
                  <b className="ml-2">{selectedBranch?.branchName || "---"}</b>
                </p>

                {mode === "daily" ? (
                  <p>
                    Ngày:
                    <b className="ml-2">{bookingDate}</b>
                  </p>
                ) : (
                  <>
                    <p>
                      Từ:
                      <b className="ml-2">{monthlyStartDate || "---"}</b>
                    </p>

                    <p>
                      Đến:
                      <b className="ml-2">{monthlyEndDate || "---"}</b>
                    </p>

                    <p>
                      Số buổi:
                      <b className="ml-2">{monthlySessions}</b>
                    </p>
                  </>
                )}

                <p>
                  Giờ:
                  <b className="ml-2">
                    {startTime} - {endTime}
                  </b>
                </p>

                {selectedCourt && (
                  <p className="text-sky-400">
                    Sân:
                    <b className="ml-2">{selectedCourt.courtName}</b>
                  </p>
                )}
              </div>

              <div className="border-t border-slate-700 pt-5 flex items-end justify-between">
                <span className="text-slate-400">Tổng tiền</span>

                <span className="text-3xl font-black text-sky-400">
                  {totalPrice.toLocaleString()}đ
                </span>
              </div>

              <button
                onClick={handleBooking}
                disabled={!selectedCourt}
                className="w-full py-5 rounded-2xl font-black bg-sky-500 disabled:bg-slate-700 transition"
              >
                THANH TOÁN NGAY
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourtPage;
