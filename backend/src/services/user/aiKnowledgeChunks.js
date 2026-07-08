import { AI_CONTEXT } from "../../constants/aiConstant.js";

/**
 * Knowledge chunks cho RAG-lite (BM25/keyword retrieval).
 * Mỗi chunk: id, title, content, keywords, contexts (general|booking|shopping|coach).
 */
export const AI_KNOWLEDGE_CHUNKS = [
  {
    id: "intro",
    title: "Giới thiệu B-Hub",
    content:
      "B-Hub là hệ thống đặt sân và mua dụng cụ cầu lông trực tuyến: đặt sân theo giờ hoặc theo tháng, mua vợt/giày/phụ kiện, ví điện tử, thanh toán VNPay, cộng đồng tìm đối/giải đấu, đăng ký lớp học với HLV.",
    keywords: ["b-hub", "bhub", "gioi thieu", "tinh nang", "la gi", "lam gi"],
    contexts: [AI_CONTEXT.GENERAL, AI_CONTEXT.BOOKING, AI_CONTEXT.SHOPPING, AI_CONTEXT.COACH],
  },
  {
    id: "chatbot-free",
    title: "Phí sử dụng chatbot",
    content:
      "Chatbot B-Hub Assistant miễn phí cho người dùng. Bạn không mất phí khi hỏi trợ lý AI. Chi phí phát sinh khi đặt sân, mua hàng hoặc đăng ký lớp học theo giá dịch vụ thực tế.",
    keywords: [
      "mất phí",
      "mat phi",
      "tính phí",
      "tinh phi",
      "miễn phí",
      "mien phi",
      "free",
      "chatbot",
      "bot",
      "tro ly",
      "trợ lý",
      "ai",
      "co phi",
      "có phí",
      "ton tien",
      "tốn tiền",
    ],
    contexts: [AI_CONTEXT.GENERAL, AI_CONTEXT.BOOKING, AI_CONTEXT.SHOPPING, AI_CONTEXT.COACH],
  },
  {
    id: "booking-online",
    title: "Cách đặt sân online",
    content:
      "Đặt sân online: vào Chi nhánh → chọn chi nhánh → chọn ngày, khung giờ và sân còn trống → thanh toán VNPay hoặc ví B-Hub. Có thể đặt lịch cố định theo tháng (lặp theo thứ trong tuần). Xem chi nhánh tại /branches.",
    keywords: [
      "dat san",
      "đặt sân",
      "cach dat",
      "cách đặt",
      "booking",
      "online",
      "theo thang",
      "theo tháng",
    ],
    contexts: [AI_CONTEXT.GENERAL, AI_CONTEXT.BOOKING],
  },
  {
    id: "booking-fee",
    title: "Phí đặt sân",
    content:
      "Đặt sân có tính phí theo giá từng sân và khung giờ tại chi nhánh. Giá hiển thị khi tra cứu sân trống. Thanh toán qua VNPay hoặc ví B-Hub.",
    keywords: ["phi dat san", "phí đặt sân", "gia san", "giá sân", "bao nhieu", "bao nhiêu"],
    contexts: [AI_CONTEXT.GENERAL, AI_CONTEXT.BOOKING],
  },
  {
    id: "booking-offline",
    title: "Đặt sân tại quầy",
    content:
      "Khách có thể đến trực tiếp chi nhánh; nhân viên hỗ trợ đặt sân, bán đồ uống và dụng cụ tại quầy.",
    keywords: ["tai quay", "tại quầy", "offline", "truc tiep", "trực tiếp"],
    contexts: [AI_CONTEXT.GENERAL, AI_CONTEXT.BOOKING],
  },
  {
    id: "shopping",
    title: "Mua sắm dụng cụ",
    content:
      "Danh mục: vợt, giày, áo, quần, váy, túi vợt, balo, phụ kiện. Thêm giỏ hàng → thanh toán → theo dõi đơn hàng tại /products và /orders.",
    keywords: ["mua sam", "mua sắm", "vot", "vợt", "giay", "giày", "san pham", "sản phẩm"],
    contexts: [AI_CONTEXT.GENERAL, AI_CONTEXT.SHOPPING],
  },
  {
    id: "wallet",
    title: "Ví & thanh toán",
    content:
      "Nạp tiền vào ví B-Hub qua VNPay tại /wallet. Dùng ví để thanh toán đặt sân hoặc đơn hàng.",
    keywords: [
      "nap vi",
      "nạp ví",
      "vi dien tu",
      "ví điện tử",
      "vnpay",
      "thanh toan",
      "thanh toán",
      "tien",
      "tiền",
    ],
    contexts: [AI_CONTEXT.GENERAL, AI_CONTEXT.BOOKING, AI_CONTEXT.SHOPPING],
  },
  {
    id: "community-coach",
    title: "Cộng đồng & HLV",
    content:
      "Bài đăng cộng đồng: tìm người chơi, giải đấu, nhóm, tìm HLV, lớp học (CLASS) tại /posts. Đăng ký làm HLV tại /become-coach (admin duyệt). Học viên đăng ký lớp CLASS; HLV duyệt. Lớp đã đăng ký xem tại /my-classes.",
    keywords: [
      "hlv",
      "lớp học",
      "lop hoc",
      "coach",
      "cong dong",
      "cộng đồng",
      "bai dang",
      "bài đăng",
      "tro thanh hlv",
      "trở thành hlv",
    ],
    contexts: [AI_CONTEXT.GENERAL, AI_CONTEXT.COACH],
  },
  {
    id: "class-fee",
    title: "Học phí lớp học",
    content:
      "Mỗi lớp CLASS do HLV đăng có học phí riêng (tuitionFee trong bài đăng). Chatbot có thể gợi ý lớp và hiển thị học phí từ dữ liệu thực tế.",
    keywords: ["hoc phi", "học phí", "lop hoc phi", "lớp học phí"],
    contexts: [AI_CONTEXT.GENERAL, AI_CONTEXT.COACH],
  },
  {
    id: "player-levels",
    title: "Trình độ người chơi",
    content:
      "Trình độ trong profile: BEGINNER (mới), RECREATIONAL (giải trí), INTERMEDIATE (trung bình), ADVANCED (khá), COMPETITIVE (thi đấu).",
    keywords: ["trinh do", "trình độ", "beginner", "nguoi moi", "người mới", "tam trung", "tầm trung"],
    contexts: [AI_CONTEXT.GENERAL, AI_CONTEXT.SHOPPING, AI_CONTEXT.COACH],
  },
  {
    id: "badminton-rules",
    title: "Luật cầu lông (tóm tắt)",
    content:
      "Đánh đơn/đôi trên sân 13.4m x 6.1m (đơn hẹp cột giữa). Giao cầu phải đánh chéo vào vùng giao cầu đối phương. Điểm: thắng rally được ghi điểm; đơn 21 điểm (cách 2, tối đa 30). Lỗi phổ biến: cầu chạm lưới khi đánh qua (trừ giao cầu), cầu ra ngoài, chạm lưới người hoặc vợt.",
    keywords: [
      "luat",
      "luật",
      "giao cau",
      "giao cầu",
      "diem",
      "điểm",
      "cau long",
      "cầu lông",
      "rules",
    ],
    contexts: [AI_CONTEXT.GENERAL],
  },
  {
    id: "navigation",
    title: "Đường dẫn hệ thống",
    content:
      "Các trang chính: /branches (chi nhánh & đặt sân), /products (mua sắm), /bookings (lịch đặt), /posts (cộng đồng & lớp học), /become-coach (đăng ký HLV), /wallet (ví), /my-classes (lớp đã đăng ký).",
    keywords: ["duong dan", "đường dẫn", "link", "trang", "menu", "vao dau", "vào đâu"],
    contexts: [AI_CONTEXT.GENERAL, AI_CONTEXT.BOOKING, AI_CONTEXT.SHOPPING, AI_CONTEXT.COACH],
  },
];

export default AI_KNOWLEDGE_CHUNKS;
