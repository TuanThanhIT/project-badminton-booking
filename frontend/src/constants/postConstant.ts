/**
 * Hằng số cho module bài đăng
 * Mỗi loại bài có formData khác nhau, dùng cho filter và hiển thị
 */

import type { PostType } from "../types/post";

/** Nhãn hiển thị cho từng loại bài đăng */
export const POST_TYPE_LABEL: Record<PostType, string> = {
  Find_player: "Tìm người chơi cùng",
  Tournament: "Giải đấu",
  Group: "Nhóm",
  Find_coach: "Tìm HLV",
  Class: "Lớp học",
};

/** Danh sách loại bài đăng (dùng cho tab/filter) */
export const POST_TYPES: PostType[] = [
  "Find_player",
  "Class",
  "Tournament",
  "Group",
  "Find_coach",
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

/** Filter cho Find_player: level, ngày, chi nhánh, slot */
export const FIND_PLAYER_FILTERS: FilterField[] = [
  {
    key: "playerRequirement.level",
    label: "Trình độ",
    type: "select",
    options: [
      { value: "Beginner", label: "Mới chơi" },
      { value: "Intermediate", label: "Trung bình" },
      { value: "Advanced", label: "Cao" },
      { value: "Custom", label: "Tùy chỉnh" },
    ],
  },
  {
    key: "schedule.date",
    label: "Ngày chơi",
    type: "date",
  },
  {
    key: "location.branchId",
    label: "Chi nhánh (ID)",
    type: "number",
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
    label: "Trình độ",
    type: "select",
    options: [
      { value: "Beginner", label: "Cơ bản" },
      { value: "Intermediate", label: "Trung bình" },
      { value: "Advanced", label: "Nâng cao" },
    ],
  },
  {
    key: "ageRange",
    label: "Độ tuổi",
    type: "text",
  },
  {
    key: "location.branchId",
    label: "Chi nhánh (ID)",
    type: "number",
  },
];

/** Filter cho Tournament: ngày sự kiện, chi nhánh */
export const TOURNAMENT_FILTERS: FilterField[] = [
  {
    key: "eventDate",
    label: "Ngày sự kiện",
    type: "date",
  },
  {
    key: "location.branchId",
    label: "Chi nhánh (ID)",
    type: "number",
  },
];

/** Filter cho Group: trình độ, khu vực */
export const GROUP_FILTERS: FilterField[] = [
  {
    key: "levelWanted",
    label: "Trình độ",
    type: "select",
    options: [
      { value: "Beginner", label: "Mới chơi" },
      { value: "Intermediate", label: "Trung bình" },
      { value: "Advanced", label: "Cao" },
    ],
  },
  {
    key: "area.district",
    label: "Quận",
    type: "text",
  },
];

/** Filter cho Find_coach (tạm giống Find_player) */
export const FIND_COACH_FILTERS: FilterField[] = [
  {
    key: "location.branchId",
    label: "Chi nhánh (ID)",
    type: "number",
  },
];

/** Map loại bài -> danh sách filter tương ứng */
export const POST_TYPE_FILTERS: Record<PostType, FilterField[]> = {
  Find_player: FIND_PLAYER_FILTERS,
  Class: CLASS_FILTERS,
  Tournament: TOURNAMENT_FILTERS,
  Group: GROUP_FILTERS,
  Find_coach: FIND_COACH_FILTERS,
};
