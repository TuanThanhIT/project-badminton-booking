import { afterEach, describe, expect, test, vi } from "vitest";
import {
  addUserSocket,
  clearOfflineTimer,
  getOnlineUserIds,
  getUserSocketCount,
  isUserOnline,
  removeUserSocket,
  resetPresenceMemory,
  scheduleOffline,
} from "../src/socket/presenceManager.js";

afterEach(() => {
  resetPresenceMemory();
  vi.useRealTimers();
});

describe("presenceManager", () => {
  test("tracks multiple sockets for one user", () => {
    expect(addUserSocket(10, "s1")).toBe(1);
    expect(addUserSocket(10, "s2")).toBe(2);
    expect(isUserOnline(10)).toBe(true);
    expect(getUserSocketCount(10)).toBe(2);
    expect(getOnlineUserIds()).toEqual([10]);

    expect(removeUserSocket(10, "s1")).toBe(1);
    expect(isUserOnline(10)).toBe(true);

    expect(removeUserSocket(10, "s2")).toBe(0);
    expect(isUserOnline(10)).toBe(false);
  });

  test("keeps users isolated", () => {
    addUserSocket(10, "s1");
    addUserSocket(11, "s2");

    removeUserSocket(10, "s1");

    expect(isUserOnline(10)).toBe(false);
    expect(isUserOnline(11)).toBe(true);
  });

  test("runs offline callback after grace period", async () => {
    vi.useFakeTimers();
    const callback = vi.fn();

    scheduleOffline(10, callback, 1000);
    await vi.advanceTimersByTimeAsync(999);
    expect(callback).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(callback).toHaveBeenCalledWith(10);
  });

  test("does not run offline callback when user reconnects during grace period", async () => {
    vi.useFakeTimers();
    const callback = vi.fn();

    scheduleOffline(10, callback, 1000);
    addUserSocket(10, "s1");

    await vi.advanceTimersByTimeAsync(1000);
    expect(callback).not.toHaveBeenCalled();
  });

  test("can cancel pending offline timeout", async () => {
    vi.useFakeTimers();
    const callback = vi.fn();

    scheduleOffline(10, callback, 1000);
    clearOfflineTimer(10);

    await vi.advanceTimersByTimeAsync(1000);
    expect(callback).not.toHaveBeenCalled();
  });
});
