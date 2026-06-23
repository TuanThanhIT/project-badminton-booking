import {
  decideModerationAction,
  predictModerationText,
} from "../src/services/aiModerationService.js";

const samples = {
  NORMAL:
    "Loại bài: tìm người chơi. Tối nay thiếu 2 bạn đánh đôi ở Thủ Đức. Ưu tiên trình trung bình, tiền sân chia đều. Ngày chơi: 2026-06-25. Giờ chơi: 19:00 đến 21:00. Trình độ yêu cầu: trung bình. Số người cần tìm: 2.",
  SPAM:
    "Loại bài: tìm người chơi. Ai muốn kiếm thêm tiền buổi tối thì inbox. Chỉ cần điện thoại là làm được.",
  UNAUTHORIZED_AD:
    "Loại bài: nhóm cộng đồng. Shop mình mới về mấy mẫu giày cầu lông, đủ size, ai cần thì nhắn riêng.",
  OFFENSIVE:
    "Loại bài: giải đấu. Ban tổ chức làm ăn như trò hề, xếp lịch vậy thì đừng tổ chức nữa.",
};

for (const [name, text] of Object.entries(samples)) {
  console.log(`\n=== ${name} ===`);

  try {
    const aiResult = await predictModerationText(text);
    const decision = decideModerationAction(aiResult);

    console.log("AI result:", JSON.stringify(aiResult, null, 2));
    console.log("Decision:", JSON.stringify(decision, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
    process.exitCode = 1;
  }
}
