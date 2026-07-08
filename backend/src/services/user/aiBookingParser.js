import { normalizeText } from "./aiTextUtils.js";

const VN_TIMEZONE = "Asia/Ho_Chi_Minh";

export const getTodayInVietnam = () => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: VN_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
};

const addDaysToYmd = (ymd, n) => {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().split("T")[0];
};

export const parseNaturalDate = (text) => {
  if (!text) return null;
  const t = normalizeText(text);

  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;

  const todayStr = getTodayInVietnam();
  const [todayYear, todayMonth, todayDay] = todayStr.split("-").map(Number);

  const dmyMatch = t.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (dmyMatch) {
    const day = String(dmyMatch[1]).padStart(2, "0");
    const month = String(dmyMatch[2]).padStart(2, "0");
    return `${dmyMatch[3]}-${month}-${day}`;
  }

  const dmMatch = t.match(/(?:^|\b)(\d{1,2})[/.-](\d{1,2})(?:\b|$)/);
  if (dmMatch) {
    const day = Number(dmMatch[1]);
    const month = Number(dmMatch[2]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      let year = todayYear;
      const alreadyPassed =
        month < todayMonth || (month === todayMonth && day < todayDay);
      if (alreadyPassed) year += 1;
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }

  if (t.includes("hom nay") || t === "nay") return todayStr;
  if (t.includes("ngay kia") || /\bkia\b/.test(t)) return addDaysToYmd(todayStr, 2);
  if (t.includes("ngay mai") || /\bmai\b/.test(t) || t.includes("tomorrow")) {
    return addDaysToYmd(todayStr, 1);
  }

  return null;
};

export const normalizeTime = (text) => {
  if (text == null) return null;
  const t = String(text).trim().toLowerCase();
  if (!t) return null;

  const build = (h, m) =>
    h >= 0 && h <= 23 && m >= 0 && m <= 59
      ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      : null;

  let m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (m) return build(Number(m[1]), Number(m[2]));

  m = t.match(/^(\d{1,2})\s*(am|pm)$/);
  if (m) {
    let h = Number(m[1]) % 12;
    if (m[2] === "pm") h += 12;
    return build(h, 0);
  }

  m = t.match(/^(\d{1,2})\s*(?:h|g|giờ|gio)\s*(\d{1,2})?$/);
  if (m) return build(Number(m[1]), m[2] ? Number(m[2]) : 0);

  m = t.match(/^(\d{1,2})$/);
  if (m) return build(Number(m[1]), 0);

  return null;
};

const parseHourMinuteToken = (hourRaw, minuteRaw) => {
  const h = Number(hourRaw);
  const m = minuteRaw != null && minuteRaw !== "" ? Number(minuteRaw) : 0;
  return normalizeTime(`${h}:${String(m).padStart(2, "0")}`);
};

/**
 * Trích date/startTime/endTime từ CÂU HỎI HIỆN TẠI (ưu tiên hơn LLM + lịch sử).
 */
export const extractBookingSlotsFromMessage = (message) => {
  if (!message?.trim()) return {};

  const raw = String(message);
  const norm = normalizeText(raw);
  const result = {};

  const dateFromText = parseNaturalDate(norm);
  if (dateFromText) result.date = dateFromText;

  const rangePatterns = [
    /(\d{1,2})\s*:\s*(\d{2})\s*[-–—]\s*(\d{1,2})\s*:\s*(\d{2})/i,
    /(\d{1,2})\s*h\s*(\d{2})?\s*[-–—]\s*(\d{1,2})\s*h\s*(\d{2})?/i,
    /(\d{1,2})\s*:\s*(\d{2})\s*(?:den|đến|to)\s*(\d{1,2})\s*:\s*(\d{2})/i,
    /(?:tu|từ)\s*(\d{1,2})\s*h\s*(\d{2})?\s*(?:den|đến|to)\s*(\d{1,2})\s*h\s*(\d{2})?/i,
    /(\d{1,2})\s*[-–—]\s*(\d{1,2})\s*h/i,
  ];

  for (const pattern of rangePatterns) {
    const match = raw.match(pattern) || norm.match(pattern);
    if (!match) continue;

    if (match[0].includes(":")) {
      result.startTime = parseHourMinuteToken(match[1], match[2]);
      result.endTime = parseHourMinuteToken(match[3], match[4]);
    } else if (match[0].includes("h")) {
      result.startTime = parseHourMinuteToken(match[1], match[2]);
      result.endTime = parseHourMinuteToken(match[3], match[4]);
    } else {
      result.startTime = normalizeTime(`${match[1]}h`);
      result.endTime = normalizeTime(`${match[2]}h`);
    }
    break;
  }

  if (!result.startTime) {
    const singlePatterns = [
      /(?:luc|lúc|khoang|khoảng|khung)\s*(\d{1,2})\s*h\s*(\d{2})?/i,
      /(\d{1,2})\s*:\s*(\d{2})/,
      /(\d{1,2})\s*h\s*(\d{2})?/i,
    ];
    for (const pattern of singlePatterns) {
      const match = raw.match(pattern) || norm.match(pattern);
      if (!match) continue;
      result.startTime = parseHourMinuteToken(match[1], match[2]);
      break;
    }
  }

  return result;
};

/**
 * Gộp ngày/giờ: ưu tiên tin hiện tại, thiếu thì lấy từ tin user trước trong phiên.
 */
export const resolveBookingSlots = (currentMessage, historyMessages = []) => {
  const merged = extractBookingSlotsFromMessage(currentMessage);

  const priorUserTexts = (Array.isArray(historyMessages) ? historyMessages : [])
    .filter((m) => m?.role === "user" && m?.content?.trim())
    .map((m) => String(m.content).trim());

  for (let i = priorUserTexts.length - 1; i >= 0; i -= 1) {
    const text = priorUserTexts[i];
    if (text === String(currentMessage || "").trim()) continue;

    const prev = extractBookingSlotsFromMessage(text);
    if (!merged.date && prev.date) merged.date = prev.date;
    if (!merged.startTime && prev.startTime) merged.startTime = prev.startTime;
    if (!merged.endTime && prev.endTime) merged.endTime = prev.endTime;

    if (merged.date && merged.startTime && merged.endTime) break;
  }

  return merged;
};

export const applyBookingSlotsToArgs = (args, message, historyMessages = []) => {
  const slots = resolveBookingSlots(message, historyMessages);
  const next = { ...args };

  if (slots.date) next.date = slots.date;
  if (slots.startTime) next.startTime = slots.startTime;
  if (slots.endTime) next.endTime = slots.endTime;

  if (next.date && typeof next.date === "string") {
    const parsed = parseNaturalDate(next.date);
    if (parsed) next.date = parsed;
  }
  if (next.startTime != null) {
    const nt = normalizeTime(next.startTime);
    if (nt) next.startTime = nt;
  }
  if (next.endTime != null) {
    const nt = normalizeTime(next.endTime);
    if (nt) next.endTime = nt;
  }

  return { args: next, slots };
};

export default extractBookingSlotsFromMessage;
