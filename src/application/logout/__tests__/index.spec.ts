import type { APIGatewayEvent } from "aws-lambda";
import type { MockInstance } from "vitest";

import { deleteSession } from "../../../infrastructure/sessionsTable";
import { expectedHttpHeaders } from "../../../infrastructure/utils/__tests__/__fixtures__/expectedHttpHeaders";
import { generateDeleteCookie } from "../../../infrastructure/utils/cookies";
import { logError } from "../../../infrastructure/utils/logger";
import { handler } from "../index";

vi.mock("../../../infrastructure/sessionsTable");
vi.mock("../../../infrastructure/utils/logger");
vi.mock("../../../infrastructure/utils/cookies");

describe("handler", () => {
  let deleteSessionMock: MockInstance;
  let logErrorMock: MockInstance;
  let generateDeleteCookieMock: MockInstance;

  afterEach(vi.resetAllMocks);

  beforeEach(() => {
    deleteSessionMock = vi.mocked(deleteSession);
    logErrorMock = vi.mocked(logError);
    generateDeleteCookieMock = vi.mocked(generateDeleteCookie);
  });

  it("should return OK when cookie header is missing", async () => {
    const response = await handler({
      headers: {
        origin: "http://localhost:5173"
      }
    } as unknown as APIGatewayEvent);

    expect(response).toEqual({
      body: JSON.stringify({ message: "OK" }),
      headers: expectedHttpHeaders,
      statusCode: 200
    });
    expect(deleteSessionMock).not.toHaveBeenCalled();
  });

  it("should return OK when session cookie is missing", async () => {
    const response = await handler({
      headers: {
        cookie: "other_cookie=123",
        origin: "http://localhost:5173"
      }
    } as unknown as APIGatewayEvent);

    expect(response).toEqual({
      body: JSON.stringify({ message: "OK" }),
      headers: expectedHttpHeaders,
      statusCode: 200
    });
    expect(deleteSessionMock).not.toHaveBeenCalled();
  });

  it("should delete the session and clear the cookie when session cookie is present", async () => {
    const deleteCookie = "__Host-session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax";
    generateDeleteCookieMock.mockReturnValue(deleteCookie);
    deleteSessionMock.mockResolvedValue(undefined);

    const response = await handler({
      headers: {
        cookie: "__Host-session=123; Max-Age=604800; Path=/; HttpOnly; Secure; SameSite=Lax",
        origin: "http://localhost:5173"
      }
    } as unknown as APIGatewayEvent);

    expect(deleteSessionMock).toHaveBeenCalledWith("123");
    expect(response).toEqual({
      body: JSON.stringify({ message: "OK" }),
      cookies: ["__Host-session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax"],
      headers: expectedHttpHeaders,
      statusCode: 200
    });
  });

  it("should rethrow unexpected errors", async () => {
    const error = new Error("Delete failed");
    deleteSessionMock.mockRejectedValue(error);

    await expect(
      handler({
        headers: {
          cookie: "__Host-session=123"
        }
      } as unknown as APIGatewayEvent)
    ).rejects.toThrow("Delete failed");

    expect(logErrorMock).toHaveBeenCalledWith("Error login out", error);
  });
});
