/**
 * Hằng số cho module bài đăng
 * Mỗi loại bài có formData khác nhau, dùng cho filter và hiển thị
 */

import type { PostType } from "../types/post";
import { PLAYER_LEVELS, PLAYER_LEVEL_LABEL, PLAYER_LEVEL_OPTIONS } from "./profileConstant";

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

// ─── Trình độ dùng chung cho TẤT CẢ loại bài ───────────────────────────────
// Nguồn gốc từ profileConstant — đảm bảo profile và bài đăng dùng cùng thang đo

/** Giá trị lưu & lọc cho FIND_PLAYER — 5 mức chuẩn + CUSTOM cho mô tả tự do */
export const FIND_PLAYER_LEVEL_VALUES = [...PLAYER_LEVELS, "CUSTOM"] as const;
export type FindPlayerLevelValue = (typeof FIND_PLAYER_LEVEL_VALUES)[number];

/** Chuỗi hiển thị trình độ (preset hoặc mô tả khi chọn "CUSTOM") */
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

/** CLASS và GROUP dùng đúng 5 mức chuẩn từ profileConstant */
export const CLASS_INPUT_LEVEL_VALUES = PLAYER_LEVELS;
export type ClassInputLevelValue = (typeof CLASS_INPUT_LEVEL_VALUES)[number];
export const CLASS_INPUT_LEVEL_OPTIONS = PLAYER_LEVEL_OPTIONS;

export const GROUP_LEVEL_VALUES = PLAYER_LEVELS;
export type GroupLevelValue = (typeof GROUP_LEVEL_VALUES)[number];
export const GROUP_LEVEL_OPTIONS = PLAYER_LEVEL_OPTIONS;

// ─── Filters ────────────────────────────────────────────────────────────────

/** Filter cho Find_player: level (5 mức chuẩn, không có CUSTOM), ngày, chi nhánh, slot */
export const FIND_PLAYER_FILTERS: FilterField[] = [
  {
    key: "playerRequirement.level",
    label: "Trình độ",
    type: "select",
    options: PLAYER_LEVELS.map((v) => ({ value: v, label: PLAYER_LEVEL_LABEL[v] })),
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

/** Filter cho Class: trình độ, độ tuổi, chi nhánh */
export const CLASS_FILTERS: FilterField[] = [
  {
    key: "inputLevel",
    label: "Trình độ đầu vào",
    type: "select",
    options: PLAYER_LEVEL_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
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

/** Filter cho Group: trình độ (khớp chính xác), khu vực (tìm gần đúng — backend LIKE) */
export const GROUP_FILTERS: FilterField[] = [
  {
    key: "levelWanted",
    label: "Trình độ",
    type: "select",
    options: PLAYER_LEVEL_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
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
