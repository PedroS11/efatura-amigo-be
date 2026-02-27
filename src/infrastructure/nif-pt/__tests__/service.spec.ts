import axios, { type AxiosInstance } from "axios";
import type { MockInstance } from "vitest";
import { axiosLoggerInterceptor } from "../../utils/axiosLoggerInterceptor";
import { getAxiosInstance, parseSearchNifResponse } from "../service";
import type { SearchNifPtResponse } from "../types";
import {
  getNoCreditsResponseFixture,
  getNoRecordFoundResponseFixture,
  getSearchNifPtResponseFixture,
  getUnexpectedErrorResponseFixture
} from "./__fixtures__/searchNifPtResponse";

vi.mock("../../utils/axiosLoggerInterceptor");
vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({ some: "axios-instance" }))
  }
}));

describe("service", () => {
  describe("getAxiosInstance", () => {
    let _axiosLoggerInterceptorMock: MockInstance;

    beforeEach(() => {
      _axiosLoggerInterceptorMock = vi
        .mocked(axiosLoggerInterceptor)
        .mockReturnValue(vi.fn() as unknown as AxiosInstance);
    });

    afterEach(vi.resetAllMocks);

    it("should create a singleton of an axiosInstance with interceptor", () => {
      const instance1 = getAxiosInstance();
      const instance2 = getAxiosInstance();

      expect(instance1).toBe(instance2);
      expect(axios.create).toHaveBeenCalledTimes(1);
      expect(_axiosLoggerInterceptorMock).toHaveBeenCalledWith({ some: "axios-instance" });
    });
  });

  describe("parseSearchNifResponse", () => {
    it("should parse a success response", () => {
      const searchNifResponse: SearchNifPtResponse = getSearchNifPtResponseFixture();

      expect(parseSearchNifResponse(searchNifResponse, 515198374)).toEqual({
        company: searchNifResponse!.records!["515198374"],
        error: false
      });
    });

    it("should parse a company not found response", () => {
      const searchNifResponse: SearchNifPtResponse = getNoRecordFoundResponseFixture();

      expect(parseSearchNifResponse(searchNifResponse, 515198374)).toEqual({
        error: false,
        company: undefined,
        message: `Could not find any record for nif 515198374`
      });
    });

    it("should parse a credits exceed response", () => {
      const searchNifResponse: SearchNifPtResponse = getNoCreditsResponseFixture();

      expect(parseSearchNifResponse(searchNifResponse, 515198374)).toEqual({
        company: undefined,
        error: true,
        message: "Limit per minute reached. Please, try again later or buy credits."
      });
    });

    it("should return undefined if message type is unknown", () => {
      const searchNifResponse: SearchNifPtResponse = getUnexpectedErrorResponseFixture();

      expect(parseSearchNifResponse(searchNifResponse, 515198374)).toEqual(undefined);
    });
  });
});
