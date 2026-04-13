export const ROLE_NAME = Object.freeze({
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  EMPLOYEE: "EMPLOYEE",
  USER: "USER",
  COACH: "COACH",
});

export const PLAYER_LEVEL = Object.freeze({
  BEGINNER: "BEGINNER", // Người chơi mới
  CASUAL: "CASUAL", // Chơi giải trí
  BASIC: "BASIC", // Biết luật và kĩ thuật cơ bản
  INTERMEDIATE: "INTERMEDIATE", //Trình trung bình
  ADVANCED: "ADVANCED", //Trình khá
  COMPETITIVE: "COMPETITIVE", // Trình thi đấu phong trào
  SEMIPRO: "SEMI_PRO", // Trình bán chuyên
  PRO: "PRO", //Trình chuyên nghiệp
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
