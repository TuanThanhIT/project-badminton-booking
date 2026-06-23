import { buildModerationText } from "../src/utils/moderationTextBuilder.js";

const samples = {
  FIND_PLAYER: {
    title: "Tìm 2 bạn đánh cầu tối nay",
    content: "Ưu tiên trình độ trung bình",
    type: "FIND_PLAYER",
    formData: {
      location: { branchId: 1, courtId: 2 },
      schedule: {
        date: "2026-06-25",
        startTime: "19:00",
        endTime: "21:00",
      },
      playerRequirement: {
        level: "INTERMEDIATE",
        customLevel: null,
        slotsNeeded: 2,
      },
      contact: {
        inApp: true,
        phone: "0901234567",
        zalo: "0901234567",
      },
      notes: "Có mặt trước 15 phút",
    },
  },
  FIND_COACH: {
    title: "Tìm huấn luyện viên dạy cuối tuần",
    content: "Muốn cải thiện kỹ thuật đánh đôi",
    type: "FIND_COACH",
    formData: {
      location: { branchId: 1 },
      currentLevel: "BEGINNER",
      goal: "Cải thiện kỹ thuật và phản xạ",
      scheduleNote: "Tối thứ 7 và chủ nhật",
      budget: "500.000 đồng/tháng",
      contact: {
        inApp: true,
        phone: "0901234567",
        zalo: "0901234567",
      },
      notes: "Ưu tiên huấn luyện viên có kinh nghiệm",
    },
  },
  CLASS: {
    title: "Lớp cầu lông căn bản tối 2-4-6",
    content: "Hướng dẫn kỹ thuật cơ bản cho người mới",
    type: "CLASS",
    formData: {
      inputLevel: "BEGINNER",
      ageRange: "15–25 tuổi",
      schedule: {
        weekdays: [2, 4, 6],
        startTime: "19:00",
        endTime: "21:00",
        startDate: "2026-07-01",
      },
      location: { branchId: 1 },
      maxStudents: 10,
      tuitionFee: "2 triệu đồng/khóa",
      contact: {
        inAppChat: true,
        phone: "0901234567",
        zalo: "0901234567",
      },
      notes: "Học viên tự chuẩn bị vợt",
    },
  },
  TOURNAMENT: {
    title: "Giải cầu lông B-Hub mở rộng",
    content: "Giải đấu dành cho người chơi phong trào",
    type: "TOURNAMENT",
    formData: {
      organizerName: "B-Hub Badminton",
      location: { branchId: 1, courtId: 2 },
      registration: {
        startDate: "2026-06-25",
        endDate: "2026-07-10",
      },
      eventDate: "2026-07-20",
      categories: ["Đơn nam", "Đôi nam nữ"],
      contact: {
        phone: "0901234567",
        email: "tournament@bhub.vn",
        inApp: true,
      },
    },
  },
  GROUP: {
    title: "Nhóm cầu lông Thủ Đức",
    content: "Tìm thành viên tham gia đánh cầu hằng tuần",
    type: "GROUP",
    formData: {
      area: {
        city: "Hồ Chí Minh",
        district: "Thủ Đức",
      },
      weeklySchedule: {
        weekdays: [3, 5, 7],
        startTime: "18:00",
        endTime: "20:00",
      },
      levelWanted: "INTERMEDIATE",
      contact: {
        inApp: true,
        zaloGroupLink: "https://zalo.me/g/example",
      },
    },
  },
};

for (const [type, post] of Object.entries(samples)) {
  console.log(`${type}:`);
  console.log(buildModerationText(post));
  console.log();
}
