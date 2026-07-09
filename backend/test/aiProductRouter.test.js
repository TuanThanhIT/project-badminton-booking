import { describe, expect, it } from "vitest";
import { AI_CONTEXT } from "../src/constants/aiConstant.js";
import { detectProductSearchIntent } from "../src/services/user/aiProductRouter.js";
import { relaxProductTypos } from "../src/services/user/aiTextUtils.js";

describe("detectProductSearchIntent", () => {
  it("detects racket price queries in shopping mode", () => {
    expect(
      detectProductSearchIntent("vot cau long gia 2 trieu", AI_CONTEXT.SHOPPING),
    ).toBe(true);
    expect(
      detectProductSearchIntent(
        "vot cau long cho nguoi lau nam gia duoi 5 trieu",
        AI_CONTEXT.SHOPPING,
      ),
    ).toBe(true);
  });

  it("ignores unrelated booking questions", () => {
    expect(
      detectProductSearchIntent("con san trong khong", AI_CONTEXT.BOOKING),
    ).toBe(false);
  });

  it("normalizes vuot typo to vot", () => {
    expect(relaxProductTypos("vuot duoi 2 trieu")).toBe("vot duoi 2 trieu");
  });

  it("detects typo vuot with price filter", () => {
    expect(
      detectProductSearchIntent("vuot duoi 2 trieu", AI_CONTEXT.SHOPPING),
    ).toBe(true);
  });
});
