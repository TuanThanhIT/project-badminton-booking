import { describe, expect, it } from "vitest";
import { PLAYER_LEVEL } from "../src/constants/userConstant.js";
import { resolvePlayerLevel } from "../src/services/user/aiToolsService.js";

describe("resolvePlayerLevel", () => {
  it("prefers skill mentioned in the message over user profile", () => {
    expect(
      resolvePlayerLevel("vot cho nguoi lau nam gia duoi 5 trieu", {
        profileLevel: PLAYER_LEVEL.BEGINNER,
      }),
    ).toBe(PLAYER_LEVEL.ADVANCED);
  });

  it("detects nguoi choi lau as advanced", () => {
    expect(
      resolvePlayerLevel("vot cho nguoi choi lau gia tren 2 trieu", {
        profileLevel: PLAYER_LEVEL.BEGINNER,
      }),
    ).toBe(PLAYER_LEVEL.ADVANCED);
  });

  it("does not use profile for price-only queries", () => {
    expect(
      resolvePlayerLevel("vot cau long gia tren 2 trieu", {
        profileLevel: PLAYER_LEVEL.BEGINNER,
      }),
    ).toBeNull();
  });

  it("uses profile for personalized recommendation queries", () => {
    expect(
      resolvePlayerLevel("goi y vot cho toi", {
        profileLevel: PLAYER_LEVEL.BEGINNER,
      }),
    ).toBe(PLAYER_LEVEL.BEGINNER);
  });

  it("detects advanced player with min price", () => {
    expect(
      resolvePlayerLevel("vot cau long cho nguoi choi lau gia tren 2 trieu", {
        profileLevel: PLAYER_LEVEL.BEGINNER,
      }),
    ).toBe(PLAYER_LEVEL.ADVANCED);
  });
});
