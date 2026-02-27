import type { AxiosError, AxiosInstance } from "axios";
import type { MockInstance } from "vitest";

import { axiosLoggerInterceptor } from "../axiosLoggerInterceptor";
import { logError } from "../logger";

vi.mock("../logger");

describe("axiosLoggerInterceptor", () => {
  let _logErrorMock: MockInstance;
  let mockAxios: AxiosInstance;
  let errorHandler: (error: AxiosError) => Promise<never>;

  beforeEach(() => {
    _logErrorMock = vi.mocked(logError);

    mockAxios = {
      interceptors: {
        response: {
          use: vi.fn((_, onRejected) => {
            errorHandler = onRejected;
          })
        }
      }
    } as unknown as AxiosInstance;
  });

  afterEach(vi.resetAllMocks);

  it("should register an error interceptor and return the axios instance", () => {
    const result = axiosLoggerInterceptor(mockAxios);

    expect(mockAxios.interceptors.response.use).toHaveBeenCalledWith(undefined, expect.any(Function));
    expect(result).toBe(mockAxios);
  });

  describe("error handler", () => {
    beforeEach(() => {
      axiosLoggerInterceptor(mockAxios);
    });

    it("should parse and log error with full response data", async () => {
      const error = {
        config: {
          method: "post",
          url: "/api/test",
          baseURL: "https://example.com",
          data: JSON.stringify({ foo: "bar" })
        },
        response: {
          status: 500,
          data: "Internal Server Error"
        },
        message: "Request failed",
        code: "ERR_BAD_RESPONSE"
      } as AxiosError;

      await expect(errorHandler(error)).rejects.toEqual({
        request: {
          method: "post",
          url: "/api/test",
          baseURL: "https://example.com",
          data: { foo: "bar" }
        },
        response: {
          status: 500,
          message: "Internal Server Error",
          code: "ERR_BAD_RESPONSE"
        },
        message: 'Error "Internal Server Error" calling /api/test'
      });

      expect(_logErrorMock).toHaveBeenCalledWith('Error "Internal Server Error" calling /api/test', {
        request: {
          method: "post",
          url: "/api/test",
          baseURL: "https://example.com",
          data: { foo: "bar" }
        },
        response: {
          status: 500,
          message: "Internal Server Error",
          code: "ERR_BAD_RESPONSE"
        },
        message: 'Error "Internal Server Error" calling /api/test'
      });
    });

    it("should fallback to error.message when response.data is missing", async () => {
      const error = {
        config: {
          method: "get",
          url: "/api/test",
          baseURL: "https://example.com"
        },
        response: {
          status: 404
        },
        message: "Not Found",
        code: "ERR_BAD_REQUEST"
      } as AxiosError;

      await expect(errorHandler(error)).rejects.toMatchObject({
        response: {
          status: 404,
          message: "Not Found",
          code: "ERR_BAD_REQUEST"
        },
        message: 'Error "Not Found" calling /api/test'
      });
    });

    it("should handle missing response (network error)", async () => {
      const error = {
        config: {
          method: "get",
          url: "/api/test",
          baseURL: "https://example.com"
        },
        response: undefined,
        message: "Network Error",
        code: "ERR_NETWORK"
      } as AxiosError;

      await expect(errorHandler(error)).rejects.toMatchObject({
        response: {
          status: undefined,
          message: "Network Error",
          code: "ERR_NETWORK"
        },
        message: 'Error "Network Error" calling /api/test'
      });
    });
  });
});
