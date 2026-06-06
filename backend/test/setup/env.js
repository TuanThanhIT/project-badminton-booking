import path from "path";
import dotenv from "dotenv";
import { vi } from "vitest";

dotenv.config({
  path: path.resolve(process.cwd(), ".env.test"),
  override: true,
});

if (process.env.NODE_ENV !== "test") {
  throw new Error("Refusing to run tests because NODE_ENV is not test.");
}

if (!process.env.DB_NAME?.endsWith("_test")) {
  throw new Error("Refusing to run tests because DB_NAME must end with _test.");
}

vi.mock("nodemailer", () => ({
  default: {
    createTransport: () => ({
      sendMail: vi.fn().mockResolvedValue({ messageId: "test-message" }),
    }),
  },
}));

vi.mock("axios", () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { data: { total: 30000 } } }),
    get: vi.fn().mockResolvedValue({ data: { data: [] } }),
  },
}));

vi.mock("../../src/services/shared/ghnService.js", () => ({
  getAvailableServices: vi.fn().mockResolvedValue([
    { service_id: 53320, service_type_id: 2, short_name: "GHN Test" },
  ]),
  getLeadtimeService: vi.fn().mockResolvedValue({
    leadtime: Math.floor((Date.now() + 3 * 24 * 60 * 60 * 1000) / 1000),
    fromDate: new Date().toISOString(),
    toDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  }),
}));

vi.mock("../../src/socket/emitter.js", () => ({
  emitNotificationToRole: vi.fn(),
  emitNotificationToUser: vi.fn(),
}));

vi.mock("../../src/services/shared/emitRealtime.js", () => ({
  emitOrderActionRealtime: vi.fn(),
}));
