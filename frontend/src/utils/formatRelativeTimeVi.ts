const formatAbsoluteDateTimeVi = (date: Date): string =>
  date.toLocaleString("vi-VN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function formatRelativeTimeVi(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";

  const diff = Date.now() - d.getTime();

  if (diff < -60000) return formatAbsoluteDateTimeVi(d);

  const minutes = Math.max(0, Math.floor(diff / 60000));
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;

  return formatAbsoluteDateTimeVi(d);
}
