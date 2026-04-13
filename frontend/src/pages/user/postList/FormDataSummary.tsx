import type { PostWithAuthor } from "../../../types/post";
import { formatFindPlayerLevelForDisplay } from "../../../constants/postConstant";
import TournamentPost from "./templates/TournamentPost";
import ClassPost from "./templates/ClassPost";
import FindPlayerPost from "./templates/FindPlayerPost";
import GroupPost from "./templates/GroupPost";

/** Props type cho component */
type Props = {
  post: PostWithAuthor;
  branchInfoById: Record<
    number,
    { branchName: string; address?: string; district?: string; city?: string }
  >;
  courtNameById: Record<number, string>;
};

/** Component fallback về cách hiển thị cũ khi chưa có template */
const LegacyFormDataSummary = ({ post, branchInfoById, courtNameById }: Props) => {
  const fd = post.formData as Record<string, unknown> | null | undefined;
  if (!fd) return null;

  const getBranchFullLocation = (branchId?: number) => {
    if (!branchId) return "";
    const branch = branchInfoById[branchId];
    if (!branch) return `Chi nhánh #${branchId}`;
    return [branch.branchName, branch.address, branch.district, branch.city]
      .filter(Boolean)
      .join(", ");
  };

  const left: string[] = [];
  const right: string[] = [];

  // Copy toàn bộ logic cũ vào đây
  if (post.type === "FIND_PLAYER") {
    const schedule = fd.schedule as
      | { date?: string; startTime?: string; endTime?: string }
      | undefined;
    if (schedule?.date) {
      const time =
        schedule.startTime && schedule.endTime
          ? `${schedule.startTime} - ${schedule.endTime}`
          : [schedule.startTime, schedule.endTime].filter(Boolean).join(" - ");
      left.push(`Thời gian: ${schedule.date}${time ? ` • ${time}` : ""}`);
    }

    const location = fd.location as
      | { branchId?: number; courtId?: number }
      | undefined;
    if (location?.branchId) {
      const branchFullLocation = getBranchFullLocation(location.branchId);
      const courtName = location.courtId
        ? ` • ${courtNameById[location.courtId] || `Sân ${location.courtId}`}`
        : "";
      left.push(`Địa điểm: ${branchFullLocation}${courtName}`);
    }

    const level = (fd.playerRequirement as { level?: string } | undefined)?.level;
    const customLevel = (fd.playerRequirement as { customLevel?: string | null } | undefined)?.customLevel;
    const levelDisplay = formatFindPlayerLevelForDisplay(level, customLevel);
    if (levelDisplay) right.push(`Trình độ: ${levelDisplay}`);
    if (customLevel?.trim() && level !== "Tùy chỉnh") {
      right.push(`Mô tả: ${customLevel.trim()}`);
    }

    const slots = (fd.playerRequirement as { slotsNeeded?: number } | undefined)?.slotsNeeded;
    if (slots != null) right.push(`Số người: ${slots}`);

    const contact = fd.contact as
      | { inApp?: boolean; phone?: string | null; zalo?: string | null }
      | undefined;
    if (contact?.phone) left.push(`SĐT: ${contact.phone}`);
    if (contact?.zalo) left.push(`Zalo: ${contact.zalo}`);

    const notes = fd.notes as string | null | undefined;
    if (notes) right.push(`Ghi chú: ${notes}`);
  }

  if (post.type === "CLASS") {
    const schedule = fd.schedule as
      | { weekdays?: number[]; startTime?: string; endTime?: string; startDate?: string }
      | undefined;
    if (Array.isArray(schedule?.weekdays))
      left.push(
        `📅 T${schedule.weekdays.join(", T")} • ${schedule.startTime ?? "?"}–${schedule.endTime ?? "?"}${schedule?.startDate ? ` • Từ ${schedule.startDate}` : ""}`,
      );
    else if (schedule?.startDate || schedule?.startTime) {
      const bits = [schedule.startDate, schedule.startTime && schedule.endTime ? `${schedule.startTime}–${schedule.endTime}` : ""].filter(Boolean);
      if (bits.length) left.push(`📅 ${bits.join(" • ")}`);
    }

    const location = fd.location as { branchId?: number } | undefined;
    if (location?.branchId) {
      left.push(`📍 ${getBranchFullLocation(location.branchId)}`);
    }

    const inputLevel = fd.inputLevel as string | undefined;
    if (inputLevel) right.push(`Trình độ đầu vào: ${inputLevel}`);

    const ageRange = fd.ageRange as string | undefined;
    if (ageRange) right.push(`Độ tuổi: ${ageRange}`);

    const tuitionFee = fd.tuitionFee as string | undefined;
    if (tuitionFee) right.push(`Học phí: ${tuitionFee}`);

    const max = fd.maxStudents as number | undefined;
    if (max) right.push(`Tối đa ${max} học viên`);

    // Gộp thông tin liên hệ
    const contact = fd.contact as
      | { phone?: string | null; zalo?: string | null }
      | undefined;
    const contactParts: string[] = [];
    if (contact?.phone) contactParts.push(`📞 ${contact.phone}`);
    if (contact?.zalo) contactParts.push(`💬 Zalo: ${contact.zalo}`);
    if (contactParts.length > 0) {
      right.push(`Liên hệ: ${contactParts.join(" • ")}`);
    }

    const notes = fd.notes as string | null | undefined;
    if (notes) right.push(`📝 ${notes}`);
  }

  if (post.type === "TOURNAMENT") {
    const organizerName = fd.organizerName as string | undefined;
    if (organizerName) left.push(`Ban tổ chức: ${organizerName}`);

    const location = fd.location as
      | { branchId?: number; courtId?: number }
      | undefined;
    if (location?.branchId) {
      const branchFullLocation = getBranchFullLocation(location.branchId);
      const courtName = location.courtId
        ? ` • ${courtNameById[location.courtId] || `Sân ${location.courtId}`}`
        : "";
      left.push(`Địa điểm: ${branchFullLocation}${courtName}`);
    }

    const registration = fd.registration as
      | { startDate?: string; endDate?: string }
      | undefined;
    if (registration?.startDate || registration?.endDate) {
      right.push(
        `Đăng ký: ${[registration?.startDate, registration?.endDate]
          .filter(Boolean)
          .join(" - ")}`,
      );
    }

    const eventDate = fd.eventDate as string | undefined;
    if (eventDate) left.push(`📅 Ngày sự kiện: ${eventDate}`);

    const categories = fd.categories as string[] | undefined;
    if (Array.isArray(categories)) right.push(`Hạng mục: ${categories.join(", ")}`);

    const contact = fd.contact as
      | { phone?: string | null; email?: string | null; inApp?: boolean }
      | undefined;
    if (contact?.phone) left.push(`SĐT: ${contact.phone}`);
    if (contact?.email) left.push(`Email: ${contact.email}`);
    if (contact?.inApp) right.push("Nhận tin nhắn trên website: Có");
  }

  if (post.type === "GROUP") {
    const weekly = fd.weeklySchedule as
      | { weekdays?: number[]; startTime?: string; endTime?: string }
      | undefined;
    if (Array.isArray(weekly?.weekdays))
      left.push(`📅 T${weekly.weekdays.join(", T")} • ${weekly.startTime} - ${weekly.endTime}`);
    const levelWanted = fd.levelWanted as string | undefined;
    if (levelWanted) right.push(`Trình độ: ${levelWanted}`);
    const area = fd.area as { city?: string; district?: string } | undefined;
    if (area?.district || area?.city) {
      right.push(
        `📍 ${[area.district, area.city].filter(Boolean).join(", ")}`,
      );
    }
  }

  if (left.length === 0 && right.length === 0) return null;

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-700 border border-gray-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          {left.map((s, i) => (
            <p key={`l-${i}`} className="leading-5">
              {s}
            </p>
          ))}
        </div>
        <div className="space-y-1">
          {right.map((s, i) => (
            <p key={`r-${i}`} className="leading-5">
              {s}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

/** Hiển thị template giao diện theo từng loại bài đăng */
const FormDataSummary = ({ post, branchInfoById, courtNameById }: Props) => {
  const fd = post.formData as Record<string, unknown> | null | undefined;
  if (!fd) return null;

  // Helper function để lấy thông tin chi nhánh
  const getBranchInfo = (branchId?: number) => {
    if (!branchId) return null;
    const branch = branchInfoById[branchId];
    if (!branch) return { branchName: `Chi nhánh #${branchId}` };
    return branch;
  };

  // Render template theo type
  switch (post.type) {
    case "TOURNAMENT":
      return (
        <TournamentPost
          post={post}
          formData={fd}
          branchInfo={getBranchInfo}
          courtNameById={courtNameById}
        />
      );

    case "CLASS":
      return (
        <ClassPost
          post={post}
          formData={fd}
          branchInfo={getBranchInfo}
        />
      );

    case "FIND_PLAYER":
      return (
        <FindPlayerPost
          post={post}
          formData={fd}
          branchInfo={getBranchInfo}
          courtNameById={courtNameById}
          formatLevel={formatFindPlayerLevelForDisplay}
        />
      );

    case "GROUP":
      return (
        <GroupPost
          post={post}
          formData={fd}
        />
      );

    default:
      // Fallback về cách cũ nếu chưa có template
      return <LegacyFormDataSummary post={post} branchInfoById={branchInfoById} courtNameById={courtNameById} />;
  }
};

export default FormDataSummary;

