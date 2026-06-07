import { describe, expect, test } from "vitest";
import { SHIPPING_STATUS } from "../src/constants/orderConstant.js";
import {
  isKnownGHNStatus,
  mapGHNStatusToSystem,
} from "../src/utils/shippingMapper.js";

describe("shippingMapper", () => {
  test.each([
    ["ready_to_pick", SHIPPING_STATUS.CREATED],
    ["money_collect_picking", SHIPPING_STATUS.PICKING],
    ["storing", SHIPPING_STATUS.IN_TRANSIT],
    ["sorting", SHIPPING_STATUS.IN_TRANSIT],
    ["money_collect_delivering", SHIPPING_STATUS.DELIVERING],
    ["waiting_to_return", SHIPPING_STATUS.RETURNING],
    ["return_transporting", SHIPPING_STATUS.RETURNING],
    ["return_sorting", SHIPPING_STATUS.RETURNING],
    ["return_fail", SHIPPING_STATUS.FAILED],
    ["exception", SHIPPING_STATUS.FAILED],
    ["damage", SHIPPING_STATUS.FAILED],
    ["lost", SHIPPING_STATUS.FAILED],
  ])("maps GHN status %s", (ghnStatus, expected) => {
    expect(mapGHNStatusToSystem(ghnStatus)).toBe(expected);
    expect(isKnownGHNStatus(ghnStatus)).toBe(true);
  });

  test("normalizes status separators and case", () => {
    expect(mapGHNStatusToSystem("Money Collect Delivering")).toBe(
      SHIPPING_STATUS.DELIVERING,
    );
    expect(mapGHNStatusToSystem("READY-TO-PICK")).toBe(SHIPPING_STATUS.CREATED);
  });

  test("keeps unknown GHN statuses explicit", () => {
    expect(mapGHNStatusToSystem("new_ghn_status")).toBe(SHIPPING_STATUS.PENDING);
    expect(isKnownGHNStatus("new_ghn_status")).toBe(false);
  });
});
