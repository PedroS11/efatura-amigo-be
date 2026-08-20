import type { APIGatewayRequestAuthorizerEventV2 } from "aws-lambda";
import type { MockInstance } from "vitest";

import { UnauthorizedError, verifyGoogleBearerToken } from "../../../infrastructure/auth/verifyGoogleBearerToken";
import { logError } from "../../../infrastructure/utils/logger";
import { handler } from "../index";

vi.mock("../../../infrastructure/auth/verifyGoogleBearerToken", async importOriginal => {
  const actual = await importOriginal<typeof import("../../../infrastructure/auth/verifyGoogleBearerToken")>();

  return {
    ...actual,
    verifyGoogleBearerToken: vi.fn()
  };
});

vi.mock("../../../infrastructure/utils/logger");

describe("handler", () => {
  let verifyGoogleBearerTokenMock: MockInstance;
  let logErrorMock: MockInstance;

  const event = {
    identitySource: ["Bearer valid-token"]
  } as APIGatewayRequestAuthorizerEventV2;

  beforeEach(() => {
    verifyGoogleBearerTokenMock = vi.mocked(verifyGoogleBearerToken);
    logErrorMock = vi.mocked(logError);
  });

  afterEach(vi.resetAllMocks);

  it("should deny requests without a token", async () => {
    verifyGoogleBearerTokenMock.mockRejectedValue(new UnauthorizedError());

    const response = await handler({
      identitySource: []
    } as unknown as APIGatewayRequestAuthorizerEventV2);

    expect(response).toEqual({
      isAuthorized: false
    });
  });

  it("should authorize valid tokens for the configured user", async () => {
    verifyGoogleBearerTokenMock.mockResolvedValue({
      sub: "__GOOGLE_SUB__"
    });

    const response = await handler(event);

    expect(response).toEqual({
      isAuthorized: true
    });
    expect(verifyGoogleBearerTokenMock).toHaveBeenCalledWith("Bearer valid-token");
  });

  it("should deny requests when sub does not match", async () => {
    verifyGoogleBearerTokenMock.mockRejectedValue(new UnauthorizedError());

    const response = await handler(event);

    expect(response).toEqual({
      isAuthorized: false
    });
  });

  it("should deny requests when token verification fails", async () => {
    verifyGoogleBearerTokenMock.mockRejectedValue(new Error("Invalid token"));

    const response = await handler(event);

    expect(response).toEqual({
      isAuthorized: false
    });
    expect(logErrorMock).toHaveBeenCalledWith("Authorization failed", {
      error: "Invalid token"
    });
  });
});
