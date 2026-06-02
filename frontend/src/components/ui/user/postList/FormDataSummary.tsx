import type { PostWithAuthor } from "../../../../types/post";
import { formatFindPlayerLevelForDisplay } from "../../../../utils/constants/postConstant";
import { PLAYER_LEVEL_LABEL } from "../../../../utils/constants/profileConstant";
import TournamentPost from "./TournamentPost";
import ClassPost from "./ClassPost";
import FindPlayerPost from "./FindPlayerPost";
import GroupPost from "./GroupPost";

type BranchInfo = {
  branchName: string;
  address?: string;
  ward?: string;
  district?: string;
  province?: string;
  city?: string;
};

type Props = {
  post: PostWithAuthor;
  branchInfoById: Record<number, BranchInfo>;
  courtNameById: Record<number, string>;
};

const LegacyFormDataSummary = ({
  post,
  branchInfoById,
  courtNameById,
}: Props) => {
  const fd = post.formData as Record<string, unknown> | null | undefined;
  if (!fd) return null;

  const getBranchFullLocation = (branchId?: number) => {
    if (!branchId) return "";
    const branch = branchInfoById[branchId];
    if (!branch) return `Chi nhánh #${branchId}`;
    return [
      branch.branchName,
      branch.address,
      branch.ward,
      branch.district,
      branch.province ?? branch.city,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const left: string[] = [];
  const right: string[] = [];

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
      const courtName = location.courtId
        ? ` • ${courtNameById[location.courtId] || `Sân ${location.courtId}`}`
        : "";
      left.push(`Địa điểm: ${getBranchFullLocation(location.branchId)}${courtName}`);
    }

    const requirement = fd.playerRequirement as
      | { level?: string; customLevel?: string | null; slotsNeeded?: number }
      | undefined;
    const levelDisplay = formatFindPlayerLevelForDisplay(
      requirement?.level,
      requirement?.customLevel,
    );
    if (levelDisplay) right.push(`Trình độ: ${levelDisplay}`);
    if (requirement?.slotsNeeded != null) {
      right.push(`Số người: ${requirement.slotsNeeded}`);
    }

    const contact = fd.contact as
      | { phone?: string | null; zalo?: string | null }
      | undefined;
    if (contact?.phone) left.push(`SĐT: ${contact.phone}`);
    if (contact?.zalo) left.push(`Zalo: ${contact.zalo}`);

    const notes = fd.notes as string | null | undefined;
    if (notes) right.push(`Ghi chú: ${notes}`);
  }

  if (post.type === "CLASS") {
    const schedule = fd.schedule as
      | {
          weekdays?: number[];
          startTime?: string;
          endTime?: string;
          startDate?: string;
        }
      | undefined;
    if (Array.isArray(schedule?.weekdays)) {
      left.push(
        `T${schedule.weekdays.join(", T")} • ${schedule.startTime ?? "?"} - ${
          schedule.endTime ?? "?"
        }${schedule.startDate ? ` • Từ ${schedule.startDate}` : ""}`,
      );
    }

    const location = fd.location as { branchId?: number } | undefined;
    if (location?.branchId) left.push(`Địa điểm: ${getBranchFullLocation(location.branchId)}`);

    const inputLevel = fd.inputLevel as string | undefined;
    if (inputLevel) {
      right.push(`Trình độ đầu vào: ${PLAYER_LEVEL_LABEL[inputLevel] ?? inputLevel}`);
    }

    const ageRange = fd.ageRange as string | undefined;
    if (ageRange) right.push(`Độ tuổi: ${ageRange}`);

    const tuitionFee = fd.tuitionFee as string | undefined;
    if (tuitionFee) right.push(`Học phí: ${tuitionFee}`);

    const max = fd.maxStudents as number | undefined;
    if (max) right.push(`Tối đa ${max} học viên`);
  }

  if (post.type === "TOURNAMENT") {
    const organizerName = fd.organizerName as string | undefined;
    if (organizerName) left.push(`Ban tổ chức: ${organizerName}`);

    const location = fd.location as
      | { branchId?: number; courtId?: number }
      | undefined;
    if (location?.branchId) {
      const courtName = location.courtId
        ? ` • ${courtNameById[location.courtId] || `Sân ${location.courtId}`}`
        : "";
      left.push(`Địa điểm: ${getBranchFullLocation(location.branchId)}${courtName}`);
    }

    const registration = fd.registration as
      | { startDate?: string; endDate?: string }
      | undefined;
    if (registration?.startDate || registration?.endDate) {
      right.push(
        `Đăng ký: ${[registration.startDate, registration.endDate]
          .filter(Boolean)
          .join(" - ")}`,
      );
    }

    const eventDate = fd.eventDate as string | undefined;
    if (eventDate) left.push(`Ngày sự kiện: ${eventDate}`);

    const categories = fd.categories as string[] | undefined;
    if (Array.isArray(categories)) right.push(`Hạng mục: ${categories.join(", ")}`);
  }

  if (post.type === "GROUP") {
    const weekly = fd.weeklySchedule as
      | { weekdays?: number[]; startTime?: string; endTime?: string }
      | undefined;
    if (Array.isArray(weekly?.weekdays)) {
      left.push(`T${weekly.weekdays.join(", T")} • ${weekly.startTime} - ${weekly.endTime}`);
    }

    const levelWanted = fd.levelWanted as string | undefined;
    if (levelWanted) right.push(`Trình độ: ${PLAYER_LEVEL_LABEL[levelWanted] ?? levelWanted}`);

    const area = fd.area as { city?: string; district?: string } | undefined;
    if (area?.district || area?.city) {
      right.push(`Khu vực: ${[area.district, area.city].filter(Boolean).join(", ")}`);
    }
  }

  if (post.type === "FIND_COACH") {
    const location = fd.location as { branchId?: number } | undefined;
    if (location?.branchId) {
      left.push(`Dia diem: ${getBranchFullLocation(location.branchId)}`);
    }

    const currentLevel = fd.currentLevel as string | undefined;
    if (currentLevel) {
      right.push(`Trinh do hien tai: ${PLAYER_LEVEL_LABEL[currentLevel] ?? currentLevel}`);
    }

    const goal = fd.goal as string | undefined;
    if (goal) left.push(`Muc tieu: ${goal}`);

    const scheduleNote = fd.scheduleNote as string | undefined;
    if (scheduleNote) left.push(`Thoi gian: ${scheduleNote}`);

    const budget = fd.budget as string | undefined;
    if (budget) right.push(`Ngan sach: ${budget}`);

    const contact = fd.contact as
      | { phone?: string | null; zalo?: string | null }
      | undefined;
    if (contact?.phone) right.push(`SDT: ${contact.phone}`);
    if (contact?.zalo) right.push(`Zalo: ${contact.zalo}`);
  }

  if (left.length === 0 && right.length === 0) return null;

  return (
    <div className="mt-3 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {[left, right].map((items, columnIndex) => (
          <div key={columnIndex} className="space-y-2">
            {items.map((text, itemIndex) => (
              <p key={itemIndex} className="leading-6">
                {text}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const FormDataSummary = ({ post, branchInfoById, courtNameById }: Props) => {
  const fd = post.formData as Record<string, unknown> | null | undefined;
  if (!fd) return null;

  const getBranchInfo = (branchId?: number) => {
    if (!branchId) return null;
    const branch = branchInfoById[branchId];
    if (!branch) return { branchName: `Chi nhánh #${branchId}` };
    return branch;
  };

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
      return <ClassPost post={post} formData={fd} branchInfo={getBranchInfo} />;

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
      return <GroupPost post={post} formData={fd} />;

    default:
      return (
        <LegacyFormDataSummary
          post={post}
          branchInfoById={branchInfoById}
          courtNameById={courtNameById}
        />
      );
  }
};

export default FormDataSummary;
