import type { PostType } from "../../types/post";
import {
  PLAYER_LEVELS,
  PLAYER_LEVEL_LABEL,
  PLAYER_LEVEL_OPTIONS,
} from "./profileConstant";

export const POST_TYPE_LABEL: Record<PostType, string> = {
  FIND_PLAYER: "Tìm người chơi cùng",
  TOURNAMENT: "Giải đấu",
  GROUP: "Nhóm",
  FIND_COACH: "Tìm người dạy",
  CLASS: "Lớp học",
};

export const POST_TYPES: PostType[] = [
  "FIND_PLAYER",
  "CLASS",
  "TOURNAMENT",
  "GROUP",
];

export type FilterField = {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "date";
  options?: { value: string; label: string }[];
};

export const FIND_PLAYER_LEVEL_VALUES = [...PLAYER_LEVELS, "CUSTOM"] as const;
export type FindPlayerLevelValue = (typeof FIND_PLAYER_LEVEL_VALUES)[number];

export function formatFindPlayerLevelForDisplay(
  level: string | null | undefined,
  customLevel?: string | null,
): string {
  if (!level) return "";
  if (level === "CUSTOM") {
    const t = customLevel?.trim();
    return t || "Tùy chỉnh";
  }
  return PLAYER_LEVEL_LABEL[level] ?? level;
}

export const CLASS_INPUT_LEVEL_VALUES = PLAYER_LEVELS;
export type ClassInputLevelValue = (typeof CLASS_INPUT_LEVEL_VALUES)[number];
export const CLASS_INPUT_LEVEL_OPTIONS = PLAYER_LEVEL_OPTIONS;

export const GROUP_LEVEL_VALUES = PLAYER_LEVELS;
export type GroupLevelValue = (typeof GROUP_LEVEL_VALUES)[number];
export const GROUP_LEVEL_OPTIONS = PLAYER_LEVEL_OPTIONS;

export const FIND_PLAYER_FILTERS: FilterField[] = [
  {
    key: "playerRequirement.level",
    label: "Trình độ",
    type: "select",
    options: PLAYER_LEVELS.map((v) => ({
      value: v,
      label: PLAYER_LEVEL_LABEL[v],
    })),
  },
  {
    key: "schedule.date",
    label: "Ngày chơi",
    type: "date",
  },
  {
    key: "location.branchId",
    label: "Chi nhánh",
    type: "select",
  },
  {
    key: "playerRequirement.slotsNeeded",
    label: "Số slot cần",
    type: "number",
  },
];

export const CLASS_FILTERS: FilterField[] = [
  {
    key: "inputLevel",
    label: "Trình độ đầu vào",
    type: "select",
    options: PLAYER_LEVEL_OPTIONS.map((o) => ({
      value: o.value,
      label: o.label,
    })),
  },
  {
    key: "ageRange",
    label: "Độ tuổi",
    type: "text",
  },
  {
    key: "location.branchId",
    label: "Chi nhánh",
    type: "select",
  },
];

export const TOURNAMENT_CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "Đơn nam", label: "Đơn nam" },
  { value: "Đơn nữ", label: "Đơn nữ" },
  { value: "Đôi nam", label: "Đôi nam" },
  { value: "Đôi nữ", label: "Đôi nữ" },
  { value: "Đôi nam nữ", label: "Đôi nam nữ" },
  { value: "Đồng đội", label: "Đồng đội" },
];

export const TOURNAMENT_FILTERS: FilterField[] = [
  {
    key: "registration.endDate__gte",
    label: "Còn hạn đăng ký đến ngày",
    type: "date",
  },
  {
    key: "eventDate",
    label: "Ngày sự kiện",
    type: "date",
  },
  {
    key: "location.branchId",
    label: "Chi nhánh",
    type: "select",
  },
];

export const GROUP_FILTERS: FilterField[] = [
  {
    key: "levelWanted",
    label: "Trình độ",
    type: "select",
    options: PLAYER_LEVEL_OPTIONS.map((o) => ({
      value: o.value,
      label: o.label,
    })),
  },
  {
    key: "area.city",
    label: "Thành phố / tỉnh",
    type: "text",
  },
  {
    key: "area.district",
    label: "Quận / huyện",
    type: "text",
  },
];

export const FIND_COACH_FILTERS: FilterField[] = [
  {
    key: "location.branchId",
    label: "Chi nhánh",
    type: "select",
  },
];

export const POST_TYPE_FILTERS: Record<PostType, FilterField[]> = {
  FIND_PLAYER: FIND_PLAYER_FILTERS,
  CLASS: CLASS_FILTERS,
  TOURNAMENT: TOURNAMENT_FILTERS,
  GROUP: GROUP_FILTERS,
  FIND_COACH: FIND_COACH_FILTERS,
};
