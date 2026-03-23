import type { PostWithAuthor } from "../../../types/post";

/** Hiển thị tóm tắt formData theo từng loại bài đăng */
const FormDataSummary = ({ post }: { post: PostWithAuthor }) => {
  const fd = post.formData as Record<string, unknown> | null | undefined;
  if (!fd) return null;

  const items: string[] = [];

  if (post.type === "Find_player") {
    const schedule = fd.schedule as
      | { date?: string; startTime?: string; endTime?: string }
      | undefined;
    if (schedule?.date)
      items.push(
        `📅 ${schedule.date} ${schedule.startTime || ""} - ${schedule.endTime || ""}`,
      );
    const level = (fd.playerRequirement as { level?: string } | undefined)?.level;
    if (level) items.push(`Trình độ: ${level}`);
    const slots = (fd.playerRequirement as { slotsNeeded?: number } | undefined)?.slotsNeeded;
    if (slots != null) items.push(`Cần ${slots} người`);
  }

  if (post.type === "Class") {
    const schedule = fd.schedule as
      | { weekdays?: number[]; startTime?: string; endTime?: string }
      | undefined;
    if (Array.isArray(schedule?.weekdays))
      items.push(
        `📅 T${schedule.weekdays.join(", T")} • ${schedule.startTime} - ${schedule.endTime}`,
      );
    const tuition = fd.tuition as { amount?: number; currency?: string } | undefined;
    if (tuition?.amount)
      items.push(
        `Học phí: ${tuition.amount.toLocaleString("vi-VN")} ${tuition.currency || "VND"}`,
      );
    const max = fd.maxStudents as number | undefined;
    if (max) items.push(`Tối đa ${max} học viên`);
  }

  if (post.type === "Tournament") {
    const eventDate = fd.eventDate as string | undefined;
    if (eventDate) items.push(`📅 Ngày sự kiện: ${eventDate}`);
    const categories = fd.categories as string[] | undefined;
    if (Array.isArray(categories)) items.push(`Hạng mục: ${categories.join(", ")}`);
  }

  if (post.type === "Group") {
    const weekly = fd.weeklySchedule as
      | { weekdays?: number[]; startTime?: string; endTime?: string }
      | undefined;
    if (Array.isArray(weekly?.weekdays))
      items.push(`📅 T${weekly.weekdays.join(", T")} • ${weekly.startTime} - ${weekly.endTime}`);
    const area = fd.area as { city?: string; district?: string } | undefined;
    if (area?.district || area?.city) {
      items.push(
        `📍 ${[area.district, area.city].filter(Boolean).join(", ")}`,
      );
    }
  }

  if (items.length === 0) return null;

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 space-y-1">
      {items.map((s, i) => (
        <p key={i}>{s}</p>
      ))}
    </div>
  );
};

export default FormDataSummary;

