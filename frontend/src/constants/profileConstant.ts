export const PLAYER_LEVELS = [
  "BEGINNER",
  "RECREATIONAL",
  "INTERMEDIATE",
  "ADVANCED",
  "COMPETITIVE",
] as const;

export type PlayerLevel = (typeof PLAYER_LEVELS)[number];

export const PLAYER_LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "Mới bắt đầu",
  RECREATIONAL: "Chơi giải trí",
  INTERMEDIATE: "Trung bình",
  ADVANCED: "Khá - Nâng cao",
  COMPETITIVE: "Thi đấu phong trào",
};

export const PLAYER_LEVEL_OPTIONS = PLAYER_LEVELS.map((key) => ({
  value: key,
  label: PLAYER_LEVEL_LABEL[key],
}));
