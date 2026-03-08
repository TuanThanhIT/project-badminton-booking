// utils/dateRange.util.js
export const buildDayRange = (date) => {
  const baseDate = date
    ? new Date(`${date}T00:00:00+07:00`)
    : new Date(
        new Date().toLocaleString("en-US", {
          timeZone: "Asia/Ho_Chi_Minh",
        }),
      );

  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(baseDate);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const getCurrentWeekRange = () => {
  const now = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
    }),
  );

  const day = now.getDay(); // 0 = CN
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const start = new Date(now);
  start.setDate(now.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};
