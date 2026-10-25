import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SEVEN_DAYS_IN_SECONDS } from "../cookies";
import { calculateExpiresAtInSecs, wait } from "../timeUtils";

const FROZEN_INSTANT = "2026-01-01T00:00:00.000Z";
const FROZEN_TIME_MS = new Date(FROZEN_INSTANT).getTime();
const FROZEN_TIME_SEC = Math.floor(FROZEN_TIME_MS / 1000);

describe("timeUtils", () => {
  describe("calculateExpiresAtInSecs()", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns the current time in whole Unix seconds when offset is zero", () => {
      vi.useFakeTimers({ now: FROZEN_TIME_MS });

      expect(calculateExpiresAtInSecs()).toBe(FROZEN_TIME_SEC);
    });

    it("adds the offset in seconds to the current time", () => {
      vi.useFakeTimers({ now: FROZEN_TIME_MS });

      expect(calculateExpiresAtInSecs(SEVEN_DAYS_IN_SECONDS)).toBe(FROZEN_TIME_SEC + SEVEN_DAYS_IN_SECONDS);
    });

    it("floors sub-second precision from Date.now()", () => {
      vi.useFakeTimers({ now: FROZEN_TIME_MS + 999 });

      expect(calculateExpiresAtInSecs()).toBe(FROZEN_TIME_SEC);
      expect(calculateExpiresAtInSecs(SEVEN_DAYS_IN_SECONDS)).toBe(FROZEN_TIME_SEC + SEVEN_DAYS_IN_SECONDS);
    });
  });

  describe("wait()", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("resolves after the specified time", async () => {
      const promise = wait(300);

      vi.advanceTimersByTime(300);
      await expect(promise).resolves.toBeUndefined();
    });
  });
});
