export const timeToMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export const isTimeRangeValid = (start, end) =>
  timeToMinutes(start) < timeToMinutes(end);

export const isTimeOverlap = (s1, e1, s2, e2) => s1 < e2 && e1 > s2;
