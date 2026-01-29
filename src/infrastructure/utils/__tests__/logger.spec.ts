import type { MockInstance } from "vitest";
import { expect } from "vitest";
import { afterEach } from "vitest";
import { beforeEach } from "vitest";
import { describe } from "vitest";

import { logError, logMessage } from "../logger";

describe("logger", () => {
  describe("logMessage", () => {
    let spyLog: MockInstance;

    beforeEach(() => {
      spyLog = vi.spyOn(console, "log");
    });

    afterEach(vi.resetAllMocks);

    it("should log a message", () => {
      logMessage("message", { key: "value" });
      expect(spyLog).toHaveBeenCalledWith({
        data: '{"key":"value"}',
        message: "message"
      });
    });
  });

  describe("logError", () => {
    let spyError: MockInstance;

    beforeEach(() => {
      spyError = vi.spyOn(console, "error");
    });

    afterEach(vi.resetAllMocks);

    it("should log a message", () => {
      logError("message", { key: "value" });
      expect(spyError).toHaveBeenCalledWith({
        data: '{"key":"value"}',
        message: "message"
      });
    });
  });
});
