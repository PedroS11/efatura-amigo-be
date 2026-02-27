import axios, { type AxiosInstance } from "axios";
import type { MockInstance } from "vitest";
import { axiosLoggerInterceptor } from "../axiosLoggerInterceptor";
import { logError } from "../logger";

vi.mock("../logger");

describe("axiosLoggerInterceptor", () => {
  let logErrorMock: MockInstance;

  beforeEach(() => {
    logErrorMock = vi.mocked(logError);
  });

  afterEach(vi.resetAllMocks);

  it("should return a parsed error", async () => {
    const axiosInstance: AxiosInstance = axiosLoggerInterceptor(axios.create({}));

    await expect(
      axiosInstance.post("http://local:3111", {
        key: "value"
      })
    ).rejects.toThrowError('Error "getaddrinfo ENOTFOUND local" calling http://local:3111');

    expect(logErrorMock).toHaveBeenCalledWith('Error "getaddrinfo ENOTFOUND local" calling http://local:3111', {
      message: 'Error "getaddrinfo ENOTFOUND local" calling http://local:3111',
      request: {
        baseURL: undefined,
        data: {
          key: "value"
        },
        method: "post",
        url: "http://local:3111"
      },
      response: {
        code: "ENOTFOUND",
        message: "getaddrinfo ENOTFOUND local",
        status: undefined
      }
    });
  });
});
