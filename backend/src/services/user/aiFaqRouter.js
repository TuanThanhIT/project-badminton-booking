import { AI_CONTEXT } from "../../constants/aiConstant.js";
import { normalizeText } from "./aiTextUtils.js";

/** Câu hỏi cần dữ liệu động → bỏ qua FAQ router, chuyển LLM + tools. */
const NEEDS_DYNAMIC_DATA = [
  /con san|san trong|con cho|khung gio/,
  /tim lop|lop hoc|lop hoc gan|goi y vot/,
  /so sanh|yonex|lining|victor/,
  /chi nhanh|branch/,
  /ngay mai|hom nay|thu [2-7]|thu hai|thu ba/,
];

const FAQ_RULES = [
  {
    id: "greeting",
    patterns: [/^(xin chao|chao|hello|hi|hey)\b/, /\b(xin chao|chao ban)\b/],
    answer:
      "Xin chào! Mình là B-Hub Assistant. Bạn có thể hỏi về đặt sân, mua dụng cụ, lớp học HLV hoặc FAQ hệ thống. Chọn chế độ phù hợp ở thanh trên để được hỗ trợ nhanh hơn.",
  },
  {
    id: "chatbot-fee",
    patterns: [
      /\b(chat|bot|tro ly|ai)\b.*\b(mat phi|mien phi|tinh phi|free|ton tien|co phi)\b/,
      /\b(mat phi|mien phi|tinh phi|free|ton tien|co phi)\b.*\b(chat|bot|tro ly|ai)\b/,
      /\bchatbot\b.*\bphi\b/,
      /^(co )?(mat phi|tinh phi|ton tien)( khong| ko| k)?\??$/,
      /\b(co mat phi|co tinh phi|co ton tien)( khong| ko| k)?\b/,
    ],
    skipContexts: [AI_CONTEXT.BOOKING],
    answer:
      "Dùng chatbot B-Hub Assistant là miễn phí. Bạn chỉ trả phí khi đặt sân, mua hàng hoặc đăng ký lớp học theo giá dịch vụ thực tế trên hệ thống.",
  },
  {
    id: "features",
    patterns: [
      /\bb-?hub\b.*\b(co gi|tinh nang|la gi)\b/,
      /\b(tinh nang)\b.*\bb-?hub\b/,
    ],
    answer:
      "B-Hub hỗ trợ: đặt sân online/theo tháng, mua vợt/giày/phụ kiện, ví & VNPay, cộng đồng bài đăng, đăng ký HLV và lớp học CLASS. Bạn có thể vào [Chi nhánh](/branches), [Sản phẩm](/products) hoặc [Bài đăng](/posts).",
  },
  {
    id: "wallet-guide",
    patterns: [
      /\b(nap tien|nap vi)\b/,
      /\b(vi dien tu)\b/,
      /\bvnpay\b.*\b(nap|huong dan)\b/,
    ],
    answer:
      "Bạn nạp tiền vào ví B-Hub qua VNPay tại [Ví của tôi](/wallet). Sau khi nạp, có thể dùng ví để thanh toán đặt sân hoặc đơn hàng.",
  },
  {
    id: "become-coach",
    patterns: [
      /\b(dang ky|tro thanh)\b.*\b(hlv|coach|huan luyen)\b/,
      /\b(lam hlv|day cau long)\b/,
    ],
    answer:
      "Đăng ký làm HLV tại [Trở thành HLV](/become-coach). Admin sẽ duyệt hồ sơ; sau khi được duyệt bạn có thể đăng bài lớp CLASS và quản lý học viên.",
  },
  {
    id: "booking-guide",
    patterns: [
      /\b(cach dat san|huong dan dat san)\b/,
      /\bdat san\b.*\b(online|theo thang)\b/,
    ],
    answer:
      "Đặt sân: vào [Chi nhánh](/branches) → chọn chi nhánh → chọn ngày, giờ và sân trống → thanh toán VNPay hoặc ví. Có thể đặt lịch cố định theo tháng.",
    skipContexts: [AI_CONTEXT.BOOKING],
  },
];

const needsDynamicData = (text) => {
  const norm = normalizeText(text);
  return NEEDS_DYNAMIC_DATA.some((pattern) => pattern.test(norm));
};

/**
 * Tầng 1: FAQ Router — trả lời cứng, không gọi OpenAI.
 * @returns {{ tier: 1, intent: string, answer: string } | null}
 */
export const tryFaqRouter = (message, context = AI_CONTEXT.GENERAL) => {
  const norm = normalizeText(message);
  if (!norm || norm.length < 2) return null;
  if (needsDynamicData(norm)) return null;

  for (const rule of FAQ_RULES) {
    if (rule.skipContexts?.includes(context)) continue;
    if (rule.patterns.some((pattern) => pattern.test(norm))) {
      return { tier: 1, intent: rule.id, answer: rule.answer };
    }
  }

  return null;
};

export default tryFaqRouter;
