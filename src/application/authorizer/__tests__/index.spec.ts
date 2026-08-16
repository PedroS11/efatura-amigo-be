import type { APIGatewayRequestAuthorizerEventV2 } from "aws-lambda";
import { jwtVerify } from "jose";
import type { MockInstance } from "vitest";

import { logError } from "../../../infrastructure/utils/logger";
import { handler } from "../index";

const { mockJwks } = vi.hoisted(() => ({
  mockJwks: {}
}));

vi.mock("jose", () => ({
  createRemoteJWKSet: vi.fn(() => mockJwks),
  jwtVerify: vi.fn()
}));

vi.mock("../../../infrastructure/utils/logger");

describe("handler", () => {
  let jwtVerifyMock: MockInstance;
  let logErrorMock: MockInstance;

  const event = {
    identitySource: ["Bearer valid-token"]
  } as APIGatewayRequestAuthorizerEventV2;

  beforeEach(() => {
    jwtVerifyMock = vi.mocked(jwtVerify);
    logErrorMock = vi.mocked(logError);
  });

  afterEach(vi.resetAllMocks);

  it("should deny requests without a token", async () => {
    const response = await handler({
      identitySource: []
    } as unknown as APIGatewayRequestAuthorizerEventV2);

    expect(response).toEqual({
      isAuthorized: false
    });
    expect(jwtVerifyMock).not.toHaveBeenCalled();
  });

  it("should authorize valid tokens for the configured user", async () => {
    jwtVerifyMock.mockResolvedValue({
      payload: {
        sub: "__GOOGLE_SUB__"
      },
      protectedHeader: {
        alg: "RS256"
      }
    });

    const response = await handler(event);

    expect(response).toEqual({
      isAuthorized: true
    });
    expect(jwtVerifyMock).toHaveBeenCalledWith("valid-token", mockJwks, {
      issuer: ["https://accounts.google.com", "https://accounts.google.com"],
      audience: "__GOOGLE_CLIENT_ID__"
    });
  });

  it("should strip Bearer prefix before verifying the token", async () => {
    jwtVerifyMock.mockResolvedValue({
      payload: {
        sub: "__GOOGLE_SUB__"
      },
      protectedHeader: {
        alg: "RS256"
      }
    });

    await handler({
      identitySource: ["Bearer valid-token"]
    } as APIGatewayRequestAuthorizerEventV2);

    expect(jwtVerifyMock).toHaveBeenCalledWith("valid-token", mockJwks, {
      audience: "__GOOGLE_CLIENT_ID__",
      issuer: ["https://accounts.google.com", "https://accounts.google.com"]
    });
  });

  it("should deny requests when sub does not match", async () => {
    jwtVerifyMock.mockResolvedValue({
      payload: {
        sub: "another-user"
      },
      protectedHeader: {
        alg: "RS256"
      }
    });

    const response = await handler(event);

    expect(response).toEqual({
      isAuthorized: false
    });
  });

  it("should deny requests when token verification fails", async () => {
    jwtVerifyMock.mockRejectedValue(new Error("Invalid token"));

    const response = await handler(event);

    expect(response).toEqual({
      isAuthorized: false
    });
    expect(logErrorMock).toHaveBeenCalledWith("Authorization failed", {
      error: "Invalid token"
    });
  });
});
