import { errors, jwtVerify } from "jose";
import type { MockInstance } from "vitest";

import { getAuthorizationHeader, UnauthorizedError, verifyGoogleBearerToken } from "../verifyGoogleBearerToken";

const { mockJwks } = vi.hoisted(() => ({
  mockJwks: {}
}));

vi.mock("jose", async importOriginal => {
  const actual = await importOriginal<typeof import("jose")>();

  return {
    ...actual,
    createRemoteJWKSet: vi.fn(() => mockJwks),
    jwtVerify: vi.fn()
  };
});

describe("verifyGoogleBearerToken", () => {
  let jwtVerifyMock: MockInstance;

  beforeEach(() => {
    jwtVerifyMock = vi.mocked(jwtVerify);
  });

  afterEach(vi.resetAllMocks);

  describe("getAuthorizationHeader", () => {
    it("should return lowercase authorization header", () => {
      expect(getAuthorizationHeader({ authorization: "Bearer token" })).toBe("Bearer token");
    });

    it("should return capitalized Authorization header", () => {
      expect(getAuthorizationHeader({ Authorization: "Bearer token" })).toBe("Bearer token");
    });

    it("should return undefined when header is missing", () => {
      expect(getAuthorizationHeader({})).toBeUndefined();
    });
  });

  describe("verifyGoogleBearerToken", () => {
    it("should throw UnauthorizedError when header is missing", async () => {
      await expect(verifyGoogleBearerToken(undefined)).rejects.toThrow(UnauthorizedError);
      expect(jwtVerifyMock).not.toHaveBeenCalled();
    });

    it("should verify token and return user claims", async () => {
      jwtVerifyMock.mockResolvedValue({
        payload: {
          sub: "__GOOGLE_SUB__",
          email: "user@example.com",
          name: "User Name"
        },
        protectedHeader: {
          alg: "RS256"
        }
      });

      await expect(verifyGoogleBearerToken("Bearer valid-token")).resolves.toEqual({
        sub: "__GOOGLE_SUB__",
        email: "user@example.com",
        name: "User Name"
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

      await verifyGoogleBearerToken("Bearer valid-token");

      expect(jwtVerifyMock).toHaveBeenCalledWith("valid-token", mockJwks, {
        audience: "__GOOGLE_CLIENT_ID__",
        issuer: ["https://accounts.google.com", "https://accounts.google.com"]
      });
    });

    it("should throw UnauthorizedError when sub does not match", async () => {
      jwtVerifyMock.mockResolvedValue({
        payload: {
          sub: "another-user"
        },
        protectedHeader: {
          alg: "RS256"
        }
      });

      await expect(verifyGoogleBearerToken("Bearer valid-token")).rejects.toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError when token verification fails", async () => {
      jwtVerifyMock.mockRejectedValue(new errors.JWTInvalid("Invalid token"));

      await expect(verifyGoogleBearerToken("Bearer valid-token")).rejects.toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError when token is expired", async () => {
      jwtVerifyMock.mockRejectedValue(new errors.JWTExpired("expired", {}));

      await expect(verifyGoogleBearerToken("Bearer expired-token")).rejects.toThrow(UnauthorizedError);
    });

    it("should rethrow unexpected errors", async () => {
      jwtVerifyMock.mockRejectedValue(new Error("Network error"));

      await expect(verifyGoogleBearerToken("Bearer valid-token")).rejects.toThrow("Network error");
    });
  });
});
