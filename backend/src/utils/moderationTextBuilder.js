import {
  LEVEL_TEXT,
  POST_TYPE_TEXT,
  WEEKDAY_TEXT,
} from "../constants/postConstant.js";

const URL_PATTERN = /\b(?:https?:\/\/|www\.)[^\s<>()]+/gi;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const VIETNAMESE_PHONE_PATTERN = /(?<!\d)(?:\+?84|0)(?:[\s.-]?\d){9}(?!\d)/g;

export const parseFormData = (value) => {
  if (!value) return {};

  if (typeof value === "object") {
    return Array.isArray(value) ? {} : value;
  }

  if (typeof value !== "string") return {};

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
};

export const normalizeText = (value) => {
  if (value === null || value === undefined) return "";

  return String(value)
    .replace(URL_PATTERN, "[LINK]")
    .replace(EMAIL_PATTERN, "[EMAIL]")
    .replace(VIETNAMESE_PHONE_PATTERN, "[PHONE]")
    .replace(/\s+/g, " ")
    .trim();
};

export const getLevelText = (level) => {
  const normalizedLevel = normalizeText(level).toUpperCase();
  return (
    LEVEL_TEXT[normalizedLevel] || normalizeText(level) || LEVEL_TEXT.UNKNOWN
  );
};

export const getWeekdaysText = (weekdays) => {
  if (!Array.isArray(weekdays)) return "";

  return weekdays
    .map((weekday) => WEEKDAY_TEXT[Number(weekday)])
    .filter(Boolean)
    .join(", ");
};

export const pushPart = (parts, value) => {
  if (!Array.isArray(parts)) return;

  const normalizedValue = normalizeText(value).replace(/\.+$/g, "");
  if (normalizedValue) parts.push(normalizedValue);
};

const pushLabeledPart = (parts, label, value) => {
  const normalizedValue = normalizeText(value);
  if (normalizedValue) pushPart(parts, `${label}: ${normalizedValue}`);
};

const pushTimeRange = (parts, label, startTime, endTime) => {
  const start = normalizeText(startTime);
  const end = normalizeText(endTime);

  if (start && end) {
    pushPart(parts, `${label}: ${start} đến ${end}`);
  }
};

const buildFindPlayerParts = (parts, formData) => {
  const schedule = formData.schedule || {};
  const requirement = formData.playerRequirement || {};

  pushLabeledPart(parts, "Ngày chơi", schedule.date);
  pushTimeRange(parts, "Giờ chơi", schedule.startTime, schedule.endTime);

  if (requirement.level) {
    pushLabeledPart(parts, "Trình độ yêu cầu", getLevelText(requirement.level));
  }

  pushLabeledPart(parts, "Trình độ tùy chỉnh", requirement.customLevel);
  pushLabeledPart(parts, "Số người cần tìm", requirement.slotsNeeded);
  pushLabeledPart(parts, "Ghi chú", formData.notes);
};

const buildFindCoachParts = (parts, formData) => {
  if (formData.currentLevel) {
    pushLabeledPart(
      parts,
      "Trình độ hiện tại",
      getLevelText(formData.currentLevel),
    );
  }

  pushLabeledPart(parts, "Mục tiêu học", formData.goal);
  pushLabeledPart(parts, "Thời gian mong muốn", formData.scheduleNote);
  pushLabeledPart(parts, "Ngân sách", formData.budget);
  pushLabeledPart(parts, "Ghi chú", formData.notes);
};

const buildClassParts = (parts, formData) => {
  const schedule = formData.schedule || {};

  if (formData.inputLevel) {
    pushLabeledPart(
      parts,
      "Trình độ đầu vào",
      getLevelText(formData.inputLevel),
    );
  }

  pushLabeledPart(parts, "Độ tuổi", formData.ageRange);
  pushLabeledPart(
    parts,
    "Ngày học trong tuần",
    getWeekdaysText(schedule.weekdays),
  );
  pushLabeledPart(parts, "Ngày bắt đầu", schedule.startDate);
  pushTimeRange(parts, "Giờ học", schedule.startTime, schedule.endTime);
  pushLabeledPart(parts, "Số học viên tối đa", formData.maxStudents);
  pushLabeledPart(parts, "Học phí", formData.tuitionFee);
  pushLabeledPart(parts, "Ghi chú", formData.notes);
};

const buildTournamentParts = (parts, formData) => {
  const registration = formData.registration || {};
  const categories = Array.isArray(formData.categories)
    ? formData.categories.map(normalizeText).filter(Boolean).join(", ")
    : "";

  pushLabeledPart(parts, "Ban tổ chức", formData.organizerName);
  pushTimeRange(
    parts,
    "Thời gian đăng ký",
    registration.startDate,
    registration.endDate,
  );
  pushLabeledPart(parts, "Ngày diễn ra giải", formData.eventDate);
  pushLabeledPart(parts, "Hạng mục thi đấu", categories);
};

const buildGroupParts = (parts, formData) => {
  const area = formData.area || {};
  const schedule = formData.weeklySchedule || {};
  const areaText = [area.city, area.district]
    .map(normalizeText)
    .filter(Boolean)
    .join(", ");

  pushLabeledPart(parts, "Khu vực", areaText);
  pushLabeledPart(
    parts,
    "Ngày sinh hoạt trong tuần",
    getWeekdaysText(schedule.weekdays),
  );
  pushTimeRange(parts, "Giờ sinh hoạt", schedule.startTime, schedule.endTime);

  if (formData.levelWanted) {
    pushLabeledPart(
      parts,
      "Trình độ mong muốn",
      getLevelText(formData.levelWanted),
    );
  }
};

const TYPE_BUILDERS = Object.freeze({
  FIND_PLAYER: buildFindPlayerParts,
  FIND_COACH: buildFindCoachParts,
  CLASS: buildClassParts,
  TOURNAMENT: buildTournamentParts,
  GROUP: buildGroupParts,
});

export const buildModerationText = (post) => {
  const safePost = post && typeof post === "object" ? post : {};
  const type = normalizeText(safePost.type).toUpperCase();
  const typeText = POST_TYPE_TEXT[type] || "không xác định";
  const formData = parseFormData(safePost.formData);
  const parts = [];

  pushPart(parts, `Loại bài: ${typeText}`);
  pushPart(parts, safePost.title);
  pushPart(parts, safePost.content);

  const buildTypeParts = TYPE_BUILDERS[type];
  if (buildTypeParts) buildTypeParts(parts, formData);

  const result = parts
    .join(". ")
    .replace(/(?:\s*\.){2,}/g, ".")
    .replace(/\s+/g, " ")
    .trim();

  return result ? `${result}.` : "";
};
