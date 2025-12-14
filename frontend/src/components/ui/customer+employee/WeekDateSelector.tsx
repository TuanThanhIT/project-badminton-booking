import { useEffect, useState } from "react";

interface WeekDateSelectorProps {
  selectedDate: string;
  onChange: (date: string) => void;
  setWeekday: (weekday: string) => void;
}

const START_DATE = new Date("2025-11-17T00:00:00+07:00"); // giờ VN

const WeekDateSelector: React.FC<WeekDateSelectorProps> = ({
  selectedDate,
  onChange,
  setWeekday,
}) => {
  const [weekDays, setWeekDays] = useState<{ date: string; isPast: boolean }[]>(
    []
  );
  const [currentSelected, setCurrentSelected] = useState<string>("");

  // Helper format yyyy-mm-dd theo VN
  const formatVNDate = (d: Date) =>
    d.toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });

  // Load ngày đã lưu
  useEffect(() => {
    const saved = localStorage.getItem("selectedBookingDate");
    if (saved) {
      setCurrentSelected(saved);
      onChange(saved);
    }
    generateWeek();
  }, []);

  // Đồng bộ selectedDate từ props
  useEffect(() => {
    if (selectedDate) setCurrentSelected(selectedDate);
  }, [selectedDate]);

  // Cập nhật weekday mỗi khi currentSelected thay đổi
  useEffect(() => {
    if (currentSelected) {
      const [year, month, day] = currentSelected.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day);
      const weekdayEN = dateObj.toLocaleDateString("en-US", {
        weekday: "long",
        timeZone: "Asia/Ho_Chi_Minh",
      });
      setWeekday(weekdayEN);
      localStorage.setItem("selectedBookingWeekday", weekdayEN);
    }
  }, [currentSelected, setWeekday]);

  // Tạo tuần hiện tại từ START_DATE
  const generateWeek = () => {
    const now = new Date();
    const todayStr = formatVNDate(now);

    const diffTime = now.getTime() - START_DATE.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weeksPassed = diffDays >= 0 ? Math.floor(diffDays / 7) : 0;

    const weekStart = new Date(START_DATE);
    weekStart.setDate(weekStart.getDate() + weeksPassed * 7);

    const days: { date: string; isPast: boolean }[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const dateStr = formatVNDate(d);
      const isPast = dateStr < todayStr;
      days.push({ date: dateStr, isPast });
    }

    setWeekDays(days);

    // Nếu chưa có localStorage, set ngày hôm nay mặc định
    const saved = localStorage.getItem("selectedBookingDate");
    if (!saved && days.some((d) => d.date === todayStr && !d.isPast)) {
      setCurrentSelected(todayStr);
      onChange(todayStr);
    }
  };

  const handleSelect = (date: string) => {
    setCurrentSelected(date);
    localStorage.setItem("selectedBookingDate", date);
    onChange(date);
  };

  return (
    <div className="flex gap-3 flex-wrap justify-center">
      {weekDays.map((d) => {
        const isSelected = currentSelected === d.date;
        const todayStr = formatVNDate(new Date());
        const isToday = d.date === todayStr;

        return (
          <button
            key={d.date}
            disabled={d.isPast}
            onClick={() => handleSelect(d.date)}
            className={`
              w-20 h-20 flex flex-col items-center justify-center rounded-2xl
              transition-all duration-150 font-medium text-sm
              ${
                d.isPast
                  ? "text-gray-400 opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-50 hover:text-blue-600"
              }
              ${isSelected ? "bg-green-100 text-green-700 shadow-sm" : ""}
            `}
          >
            {/* Thứ */}
            <span
              className={`uppercase text-[11px] ${
                isSelected
                  ? "text-green-700"
                  : d.isPast
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              {new Date(d.date + "T00:00:00+07:00").toLocaleDateString(
                "vi-VN",
                {
                  weekday: "long",
                  timeZone: "Asia/Ho_Chi_Minh",
                }
              )}
            </span>

            {/* Ngày */}
            <div className="mt-1 flex items-center justify-center">
              <span
                className={`text-xl font-semibold relative ${
                  isSelected
                    ? "text-green-700"
                    : d.isPast
                    ? "text-gray-400"
                    : "text-gray-700"
                }`}
              >
                {isToday && !d.isPast && (
                  <span className="absolute inset-0 w-10 h-10 rounded-full -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 bg-green-200 flex items-center justify-center"></span>
                )}
                <span className="relative z-10">
                  {new Date(d.date + "T00:00:00+07:00").getDate()}
                </span>
              </span>
            </div>

            {/* Tháng/Năm */}
            <span
              className={`text-[11px] mt-1 ${
                isSelected ? "text-green-700" : "text-gray-400"
              }`}
            >
              {new Date(d.date + "T00:00:00+07:00").getMonth() + 1}/
              {new Date(d.date + "T00:00:00+07:00").getFullYear()}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default WeekDateSelector;
