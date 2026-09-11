import type { APIGatewayEvent } from "aws-lambda";
import type { MockInstance } from "vitest";

import {
  ForbiddenError,
  UnauthorizedError,
  verifyGoogleBearerToken
} from "../../../infrastructure/googleAuth/verifyGoogleBearerToken";
import { saveSession } from "../../../infrastructure/sessionsTable";
import { expectedHttpHeaders } from "../../../infrastructure/utils/__tests__/__fixtures__/expectedHttpHeaders";
import { generateCookie, SEVEN_DAYS_IN_SECONDS } from "../../../infrastructure/utils/cookies";
import { logError } from "../../../infrastructure/utils/logger";
import { handler } from "../index";

vi.mock("node:crypto", () => ({
  randomBytes: vi.fn(() => ({
    toString: () => "mock-session-id"
  }))
}));

vi.mock("../../../infrastructure/googleAuth/verifyGoogleBearerToken");
vi.mock("../../../infrastructure/sessionsTable");
vi.mock("../../../infrastructure/utils/logger");
vi.mock("../../../infrastructure/utils/cookies");

describe("handler", () => {
  let verifyGoogleBearerTokenMock: MockInstance;
  let saveSessionMock: MockInstance;
  let generateCookieMock: MockInstance;
  let logErrorMock: MockInstance;

  const verifiedUser = {
    sub: "__GOOGLE_SUB__",
    name: "test",
    email: "a@a.com"
  };

  beforeEach(() => {
    verifyGoogleBearerTokenMock = vi.mocked(verifyGoogleBearerToken);
    saveSessionMock = vi.mocked(saveSession);
    logErrorMock = vi.mocked(logError);
    generateCookieMock = vi.mocked(generateCookie);

    vi.useFakeTimers({
      now: new Date("2026-01-01T00:00:00.000Z").getTime()
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  it("should return 400 when credential is missing", async () => {
    const response = await handler({
      body: JSON.stringify({}),
      headers: {
        origin: "http://localhost:5173"
      }
    } as unknown as APIGatewayEvent);

    expect(response).toEqual({
      body: JSON.stringify({
        message: "Invalid body"
      }),
      headers: expectedHttpHeaders,
      statusCode: 400
    });
    expect(verifyGoogleBearerTokenMock).not.toHaveBeenCalled();
  });

  it("should create a session and return user data with a cookie", async () => {
    const cookie = "__Host-session=mock-session-id; Max-Age=604800; Path=/; HttpOnly; Secure; SameSite=Lax";
    verifyGoogleBearerTokenMock.mockResolvedValue(verifiedUser);
    generateCookieMock.mockReturnValue(cookie);

    const response = await handler({
      body: JSON.stringify({ credential: "valid-token" }),
      headers: {
        origin: "http://localhost:5173"
      }
    } as unknown as APIGatewayEvent);

    expect(saveSessionMock).toHaveBeenCalledWith({
      sub: verifiedUser.sub,
      name: verifiedUser.name,
      email: verifiedUser.email,
      expiresAt: Date.now() + SEVEN_DAYS_IN_SECONDS * 1000,
      id: "mock-session-id"
    });
    expect(response).toEqual({
      body: JSON.stringify(verifiedUser),
      cookies: ["__Host-session=mock-session-id; Max-Age=604800; Path=/; HttpOnly; Secure; SameSite=Lax"],
      headers: expectedHttpHeaders,
      statusCode: 200
    });
    expect(verifyGoogleBearerTokenMock).toHaveBeenCalledWith("valid-token");
    expect(generateCookieMock).toHaveBeenCalledOnce();
    expect(saveSessionMock).toHaveBeenCalledWith({
      email: "a@a.com",
      expiresAt: 1767830400000,
      id: "mock-session-id",
      name: "test",
      sub: "__GOOGLE_SUB__"
    });
  });

  it("should return 401 when token verification fails with UnauthorizedError", async () => {
    verifyGoogleBearerTokenMock.mockRejectedValue(new UnauthorizedError());

    const response = await handler({
      body: JSON.stringify({ credential: "invalid-token" }),
      headers: {
        origin: "http://localhost:5173"
      }
    } as unknown as APIGatewayEvent);

    expect(response).toEqual({
      body: JSON.stringify({ message: "Unauthorized" }),
      headers: expectedHttpHeaders,
      statusCode: 401
    });
    expect(logErrorMock).toHaveBeenCalled();
    expect(saveSessionMock).not.toHaveBeenCalled();
  });

  it("should return 403 when token verification fails with ForbiddenError", async () => {
    verifyGoogleBearerTokenMock.mockRejectedValue(new ForbiddenError());

    const response = await handler({
      body: JSON.stringify({ credential: "forbidden-token" }),
      headers: {
        origin: "http://localhost:5173"
      }
    } as unknown as APIGatewayEvent);

    expect(response).toEqual({
      body: JSON.stringify({ message: "Forbidden" }),
      headers: expectedHttpHeaders,
      statusCode: 403
    });
    expect(logErrorMock).toHaveBeenCalled();
    expect(saveSessionMock).not.toHaveBeenCalled();
  });

  it("should rethrow unexpected errors", async () => {
    const error = new Error("Unexpected failure");
    verifyGoogleBearerTokenMock.mockRejectedValue(error);

    await expect(
      handler({
        body: JSON.stringify({ credential: "valid-token" }),
        headers: {
          origin: "http://localhost:5173"
        }
      } as unknown as APIGatewayEvent)
    ).rejects.toThrow("Unexpected failure");

    expect(logErrorMock).toHaveBeenCalledWith("Error login in", error);
  });
});
