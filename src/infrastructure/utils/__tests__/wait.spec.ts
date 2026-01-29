import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { wait } from "../wait";

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
