export function formatLastSeen(
  isOnline?: boolean,
  lastSeenAt?: string | null,
): string {
  if (isOnline) return "Đang hoạt động";
  if (!lastSeenAt) return "";

  const lastSeen = new Date(lastSeenAt);
  if (Number.isNaN(lastSeen.getTime())) return "";

  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - lastSeen.getTime());
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 1) return "Hoạt động vừa xong";
  if (minutes < 60) return `Hoạt động ${minutes} phút trước`;
  if (hours < 24) return `Hoạt động ${hours} giờ trước`;
  if (days < 2) return "Hoạt động hôm qua";

  return `Hoạt động ${lastSeen.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })}`;
}
