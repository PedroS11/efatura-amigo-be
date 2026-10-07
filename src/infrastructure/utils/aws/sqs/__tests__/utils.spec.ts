import { SQSClient } from "@aws-sdk/client-sqs";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@aws-sdk/client-sqs");

// The client is cached in module state, so each test re-imports a fresh copy
const loadUtils = async () => {
  vi.resetModules();
  return import("../utils.js");
};

describe("getSQSClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new SQSClient on first call", async () => {
    const { getSQSClient } = await loadUtils();

    const client = getSQSClient();

    expect(SQSClient).toHaveBeenCalledOnce();
    expect(client).toBeInstanceOf(SQSClient);
  });

  it("returns the same instance on subsequent calls", async () => {
    const { getSQSClient } = await loadUtils();

    const first = getSQSClient();
    const second = getSQSClient();

    expect(second).toBe(first);
    expect(SQSClient).toHaveBeenCalledOnce();
  });

  it("creates a fresh client when the module is reloaded", async () => {
    const { getSQSClient: getFirst } = await loadUtils();
    const first = getFirst();

    const { getSQSClient: getSecond } = await loadUtils();
    const second = getSecond();

    expect(second).not.toBe(first);
    expect(SQSClient).toHaveBeenCalledTimes(2);
  });
});
