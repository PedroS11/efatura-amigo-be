import type { APIGatewayRequestAuthorizerEvent } from "aws-lambda";
import type { MockInstance } from "vitest";

import { getSessionById } from "../../../infrastructure/sessionsTable";
import { logError } from "../../../infrastructure/utils/logger";
import { handler } from "../index";

vi.mock("../../../infrastructure/utils/logger");
vi.mock("../../../infrastructure/sessionsTable");

describe("handler", () => {
  let logErrorMock: MockInstance;
  let getSessionByIdMock: MockInstance;

  const event = {
    headers: {
      cookie: "__Host-session=123; Max-Age=604800; Path=/; HttpOnly; Secure; SameSite=Lax"
    }
  } as unknown as APIGatewayRequestAuthorizerEvent;

  beforeEach(() => {
    getSessionByIdMock = vi.mocked(getSessionById);
    logErrorMock = vi.mocked(logError);

    vi.useFakeTimers({
      now: new Date("2026-01-01T00:00:00.000Z").getTime()
    });
  });

  afterEach(vi.resetAllMocks);

  it("should deny requests without a cookie header", async () => {
    const response = await handler({
      headers: {}
    } as unknown as APIGatewayRequestAuthorizerEvent);

    expect(response).toEqual({
      context: undefined,
      isAuthorized: false
    });
  });

  it("should deny requests with an empty cookie header", async () => {
    const response = await handler({
      headers: {
        cookie: ""
      }
    } as unknown as APIGatewayRequestAuthorizerEvent);

    expect(response).toEqual({
      context: undefined,
      isAuthorized: false
    });
  });

  it("should deny requests without a session cookie", async () => {
    const response = await handler({
      headers: {
        cookie: "any_cookie=456;"
      }
    } as unknown as APIGatewayRequestAuthorizerEvent);

    expect(response).toEqual({
      context: undefined,
      isAuthorized: false
    });
  });

  it("should deny requests when session does exist", async () => {
    getSessionByIdMock.mockResolvedValue(undefined);

    const response = await handler(event);

    expect(response).toEqual({
      isAuthorized: false,
      context: undefined
    });
    expect(getSessionByIdMock).toHaveBeenCalledWith("123");
  });

  it("should deny requests with an expired session ", async () => {
    getSessionByIdMock.mockResolvedValue({
      sub: "__GOOGLE_SUB__",
      name: "test",
      email: "a@a.com",
      id: "123",
      expiresAt: Date.now() - 1000
    });

    const response = await handler(event);

    expect(response).toEqual({
      isAuthorized: false,
      context: undefined
    });
    expect(getSessionByIdMock).toHaveBeenCalledWith("123");
  });

  it("should deny requests when something goes wrong", async () => {
    const error = new Error("Something went wrong");
    getSessionByIdMock.mockRejectedValue(error);

    const response = await handler(event);

    expect(response).toEqual({
      isAuthorized: false,
      context: undefined
    });

    expect(logErrorMock).toHaveBeenCalledWith("Authorization failed", {
      error: "Something went wrong"
    });
  });

  it("should authorize valid cookies for the configured user", async () => {
    getSessionByIdMock.mockResolvedValue({
      sub: "__GOOGLE_SUB__",
      name: "test",
      email: "a@a.com",
      id: "123",
      expiresAt: Date.now() + 1000
    });

    const response = await handler(event);

    expect(response).toEqual({
      isAuthorized: true,
      context: {
        sub: "__GOOGLE_SUB__",
        name: "test",
        email: "a@a.com"
      }
    });
    expect(getSessionByIdMock).toHaveBeenCalledWith("123");
  });
});
