/**
 * Hằng số cho module bài đăng
 * Mỗi loại bài có formData khác nhau, dùng cho filter và hiển thị
 */

import type { PostType } from "../../types/post";

/** Nhãn hiển thị cho từng loại bài đăng */
export const POST_TYPE_LABEL: Record<PostType, string> = {
  FIND_PLAYER: "Tìm người chơi cùng",
  TOURNAMENT: "Giải đấu",
  GROUP: "Nhóm",
  FIND_COACH: "Tìm HLV",
  CLASS: "Lớp học",
};

/** Danh sách loại bài đăng (dùng cho tab/filter) */
export const POST_TYPES: PostType[] = [
  "FIND_PLAYER",
  "CLASS",
  "TOURNAMENT",
  "GROUP",
];

/**
 * Cấu hình filter riêng cho từng loại bài
 * key: param gửi lên API (formData.xxx hoặc formData.xxx.yyy)
 * label: nhãn hiển thị
 * type: input type
 */
export type FilterField = {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "date";
  options?: { value: string; label: string }[];
};

/** Giá trị lưu & lọc cho Find_player — thống nhất tiếng Việt với form đăng bài */
export const FIND_PLAYER_LEVEL_VALUES = [
  "Mới chơi",
  "Trung bình",
  "Cao",
  "Tùy chỉnh",
] as const;

/** Chuỗi hiển thị trình độ (preset hoặc mô tả khi chọn "Tùy chỉnh") */
export function formatFindPlayerLevelForDisplay(
  level: string | null | undefined,
  customLevel?: string | null,
): string {
  if (!level) return "";
  if (level === "Tùy chỉnh") {
    const t = customLevel?.trim();
    return t || level;
  }
  return level;
}

/** Filter cho Find_player: level, ngày, chi nhánh, slot */
export const FIND_PLAYER_FILTERS: FilterField[] = [
  {
    key: "playerRequirement.level",
    label: "Trình độ",
    type: "select",
    options: FIND_PLAYER_LEVEL_VALUES.map((v) => ({ value: v, label: v })),
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

/** Giá trị lưu trong formData.inputLevel — trùng với filter feed */
export const CLASS_INPUT_LEVEL_VALUES = [
  "Mới chơi",
  "Trung bình",
  "Nâng cao",
] as const;
export type ClassInputLevelValue = (typeof CLASS_INPUT_LEVEL_VALUES)[number];

export const CLASS_INPUT_LEVEL_OPTIONS: {
  value: ClassInputLevelValue;
  label: string;
}[] = [
  { value: "Mới chơi", label: "Mới chơi" },
  { value: "Trung bình", label: "Trung bình" },
  { value: "Nâng cao", label: "Nâng cao" },
];

/** Filter cho Class: trình độ, độ tuổi, chi nhánh */
export const CLASS_FILTERS: FilterField[] = [
  {
    key: "inputLevel",
    label: "Trình độ đầu vào",
    type: "select",
    options: CLASS_INPUT_LEVEL_OPTIONS.map((o) => ({
      value: o.value,
      label: o.label,
    })),
  },
  {
    key: "ageRange",
    label: "Độ tuổi (tìm trong mô tả)",
    type: "text",
  },
  {
    key: "location.branchId",
    label: "Chi nhánh",
    type: "select",
  },
];

/** Hạng mục giải đấu — dùng form đăng bài + lưu formData.categories */
export const TOURNAMENT_CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "Đơn nam", label: "Đơn nam" },
  { value: "Đơn nữ", label: "Đơn nữ" },
  { value: "Đôi nam", label: "Đôi nam" },
  { value: "Đôi nữ", label: "Đôi nữ" },
  { value: "Đôi nam nữ", label: "Đôi nam nữ (mixed)" },
  { value: "Đồng đội", label: "Đồng đội / team" },
];

/** Filter cho Tournament: ngày sự kiện, chi nhánh */
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

/** Trình độ nhóm — dùng chung form đăng + filter feed */
export const GROUP_LEVEL_VALUES = ["Mới chơi", "Trung bình", "Cao"] as const;
export type GroupLevelValue = (typeof GROUP_LEVEL_VALUES)[number];

export const GROUP_LEVEL_OPTIONS: { value: GroupLevelValue; label: string }[] =
  [
    { value: "Mới chơi", label: "Mới chơi" },
    { value: "Trung bình", label: "Trung bình" },
    { value: "Cao", label: "Cao" },
  ];

/** Filter cho Group: trình độ (khớp chính xác), khu vực (tìm gần đúng — backend LIKE) */
export const GROUP_FILTERS: FilterField[] = [
  {
    key: "levelWanted",
    label: "Trình độ",
    type: "select",
    options: GROUP_LEVEL_OPTIONS.map((o) => ({
      value: o.value,
      label: o.label,
    })),
  },
  {
    key: "area.city",
    label: "Thành phố / tỉnh (gõ một phần)",
    type: "text",
  },
  {
    key: "area.district",
    label: "Quận / huyện (gõ một phần)",
    type: "text",
  },
];

/** Filter cho Find_coach (tạm giống Find_player) */
export const FIND_COACH_FILTERS: FilterField[] = [
  {
    key: "location.branchId",
    label: "Chi nhánh",
    type: "select",
  },
];

/** Map loại bài -> danh sách filter tương ứng */
export const POST_TYPE_FILTERS: Record<PostType, FilterField[]> = {
  FIND_PLAYER: FIND_PLAYER_FILTERS,
  CLASS: CLASS_FILTERS,
  TOURNAMENT: TOURNAMENT_FILTERS,
  GROUP: GROUP_FILTERS,
  FIND_COACH: FIND_COACH_FILTERS,
};
