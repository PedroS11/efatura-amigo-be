import type { APIGatewayProxyEventV2 } from "aws-lambda";
import type { MockInstance } from "vitest";

import { UnauthorizedError, verifyGoogleBearerToken } from "../../../infrastructure/auth/verifyGoogleBearerToken";
import { expectedHttpHeaders } from "../../../infrastructure/utils/__tests__/expectedHttpHeaders";
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
      headers: expectedHttpHeaders,
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
      headers: expectedHttpHeaders,
      statusCode: 200
    });
    expect(verifyGoogleBearerTokenMock).toHaveBeenCalledWith("Bearer valid-token");
  });
});
