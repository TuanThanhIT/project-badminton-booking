import { describe, expect, it } from "vitest";
import {
  messagesToPromptHistory,
  stripAiCards,
} from "../src/services/user/aiChatHistoryService.js";

describe("ai chat history prompt cleanup", () => {
  it("strips AI card payloads from assistant content", () => {
    const content =
      "Here are products.\n<<AI_CARDS>>[{\"type\":\"product\",\"id\":1}]<<END_AI_CARDS>>";

    expect(stripAiCards(content)).toBe("Here are products.");
  });

  it("does not pass empty card-only messages into prompt history", () => {
    const history = messagesToPromptHistory([
      {
        role: "assistant",
        content: "<<AI_CARDS>>[{\"type\":\"product\",\"id\":1}]<<END_AI_CARDS>>",
      },
      { role: "user", content: "thanks" },
    ]);

    expect(history).toEqual([{ role: "user", content: "thanks" }]);
  });
});
