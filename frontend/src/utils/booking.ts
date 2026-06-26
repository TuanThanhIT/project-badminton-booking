export const formatBookingCode = (
  id: string | number,
  createdAt?: string | null,
) => {
  if (!createdAt) {
    return `BK-${String(id).padStart(6, "0")}`;
  }

  const d = new Date(createdAt);

  const datePart = `${d.getFullYear().toString().slice(-2)}${String(
    d.getMonth() + 1,
  ).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

  return `BK-${datePart}-${String(id).padStart(4, "0")}`;
};

export const formatTimeShort = (value?: string | null) => {
  if (!value) return "--:--";

  const match = String(value).match(/(\d{1,2}):(\d{2})/);
  if (!match) return String(value);

  return `${match[1].padStart(2, "0")}:${match[2]}`;
};

export const formatTimeRange = (
  startTime?: string | null,
  endTime?: string | null,
) => `${formatTimeShort(startTime)} - ${formatTimeShort(endTime)}`;
