import { describe, expect, it } from "vitest";
import { AI_CONTEXT } from "../src/constants/aiConstant.js";
import { detectClassSearchIntent } from "../src/services/user/aiClassRouter.js";
import { resolvePlayerLevel } from "../src/services/user/aiToolsService.js";
import { PLAYER_LEVEL } from "../src/constants/userConstant.js";

describe("detectClassSearchIntent", () => {
  it("detects intermediate class queries in coach mode", () => {
    expect(
      detectClassSearchIntent("tim lop hoc trung binh", AI_CONTEXT.COACH),
    ).toBe(true);
  });

  it("ignores become-coach registration", () => {
    expect(
      detectClassSearchIntent("dang ky lam hlv", AI_CONTEXT.COACH),
    ).toBe(false);
  });
});

describe("class level resolution", () => {
  it("uses intermediate from message, not beginner profile", () => {
    expect(
      resolvePlayerLevel("lop hoc trung binh", {
        profileLevel: PLAYER_LEVEL.BEGINNER,
      }),
    ).toBe(PLAYER_LEVEL.INTERMEDIATE);
  });
});
