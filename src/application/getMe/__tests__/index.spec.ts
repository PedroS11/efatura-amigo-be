import type { APIGatewayProxyEventV2 } from "aws-lambda";
import type { MockInstance } from "vitest";

import { UnauthorizedError, verifyGoogleBearerToken } from "../../../infrastructure/auth/verifyGoogleBearerToken";
import { handler } from "../index";

vi.mock("../../../infrastructure/auth/verifyGoogleBearerToken", async importOriginal => {
  const actual = await importOriginal<typeof import("../../../infrastructure/auth/verifyGoogleBearerToken")>();

  return {
    ...actual,
    verifyGoogleBearerToken: vi.fn()
  };
});

describe("handler", () => {
  let verifyGoogleBearerTokenMock: MockInstance;

  const httpHeaders = {
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,GET",
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  beforeEach(() => {
    verifyGoogleBearerTokenMock = vi.mocked(verifyGoogleBearerToken);
  });

  afterEach(vi.resetAllMocks);

  it("should return 401 when token is invalid", async () => {
    verifyGoogleBearerTokenMock.mockRejectedValue(new UnauthorizedError());

    const response = await handler({
      headers: {
        authorization: "Bearer invalid-token"
      }
    } as unknown as APIGatewayProxyEventV2);

    expect(response).toEqual({
      body: JSON.stringify({
        message: "Unauthorized"
      }),
      headers: httpHeaders,
      statusCode: 401
    });
    expect(verifyGoogleBearerTokenMock).toHaveBeenCalledWith("Bearer invalid-token");
  });

  it("should return user claims when token is valid", async () => {
    verifyGoogleBearerTokenMock.mockResolvedValue({
      sub: "__GOOGLE_SUB__",
      email: "user@example.com",
      name: "User Name",
      picture: "https://example.com/photo.jpg"
    });

    const response = await handler({
      headers: {
        Authorization: "Bearer valid-token"
      }
    } as unknown as APIGatewayProxyEventV2);

    expect(response).toEqual({
      body: JSON.stringify({
        sub: "__GOOGLE_SUB__",
        email: "user@example.com",
        name: "User Name",
        picture: "https://example.com/photo.jpg"
      }),
      headers: httpHeaders,
      statusCode: 200
    });
    expect(verifyGoogleBearerTokenMock).toHaveBeenCalledWith("Bearer valid-token");
  });
});
