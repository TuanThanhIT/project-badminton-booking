export const ROLE_NAME = Object.freeze({
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  EMPLOYEE: "EMPLOYEE",
  USER: "USER",
  COACH: "COACH",
});

export const PLAYER_LEVEL = Object.freeze({
  BEGINNER: "BEGINNER",       // Mới bắt đầu
  RECREATIONAL: "RECREATIONAL", // Chơi giải trí
  INTERMEDIATE: "INTERMEDIATE", // Trung bình
  ADVANCED: "ADVANCED",       // Khá - Nâng cao
  COMPETITIVE: "COMPETITIVE", // Thi đấu phong trào
});

export const OTP_TYPE = Object.freeze({
  REGISTER: "REGISTER",
  RESET_PASSWORD: "RESET_PASSWORD",
  WITHDRAW_REQUEST: "WITHDRAW_REQUEST",
});

export const USER_ADDRESS_LABEL = Object.freeze({
  HOME: "HOME",
  OFFICE: "OFFICE",
});
