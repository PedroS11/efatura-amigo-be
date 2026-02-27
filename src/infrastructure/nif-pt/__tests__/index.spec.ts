import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { AxiosError } from "axios";
import type { MockInstance } from "vitest";
import { logError } from "../../utils/logger";
import { getCredits, searchNif } from "../index";
import { getAxiosInstance, parseSearchNifResponse } from "../service";
import type { Credit, SearchNifPtResponse } from "../types";
import {
  getNoCreditsResponseFixture,
  getNoRecordFoundResponseFixture,
  getSearchNifPtResponseFixture,
  getUnexpectedErrorResponseFixture
} from "./__fixtures__/searchNifPtResponse";

vi.mock("../service");

vi.mock("../../utils/logger");

describe("NifPt", () => {
  let axiosGetMock: MockInstance;
  let logErrorMock: MockInstance;
  let parseSearchNifResponseMock: MockInstance;

  beforeEach(() => {
    axiosGetMock = vi.fn();
    vi.mocked(getAxiosInstance).mockReturnValue({
      get: axiosGetMock
    } as unknown as AxiosInstance);
    logErrorMock = vi.mocked(logError);
    parseSearchNifResponseMock = vi.mocked(parseSearchNifResponse);
  });

  afterEach(vi.resetAllMocks);

  describe("searchNif", () => {
    it("should return a valid company if it exists", async () => {
      const searchNifResponse: SearchNifPtResponse = getSearchNifPtResponseFixture();

      parseSearchNifResponseMock.mockReturnValue({
        error: false,
        company: searchNifResponse?.records?.["515198374"]
      });

      axiosGetMock.mockResolvedValue({
        data: searchNifResponse
      });

      const response = await searchNif(515198374);

      expect(response).toEqual({
        error: false,
        company: searchNifResponse.records!["515198374"]
      });
      expect(axiosGetMock).toHaveBeenCalledWith("http://www.nif.pt/", {
        params: {
          json: "1",
          key: "__API_KEY__",
          q: "515198374"
        }
      });
    });

    it("should return undefined if the company doesn't exist", async () => {
      const searchNifResponse: SearchNifPtResponse = getNoRecordFoundResponseFixture();

      parseSearchNifResponseMock.mockReturnValue({
        company: undefined,
        error: false,
        message: "Could not find any record for nif 515198374"
      });

      axiosGetMock.mockResolvedValue({
        data: searchNifResponse
      });

      const response = await searchNif(515198374);

      expect(response).toEqual({
        company: undefined,
        error: false,
        message: "Could not find any record for nif 515198374"
      });
      expect(axiosGetMock).toHaveBeenCalledWith("http://www.nif.pt/", {
        params: {
          json: "1",
          key: "__API_KEY__",
          q: "515198374"
        }
      });
    });

    it("should return an error if the credits were exceeded", async () => {
      const searchNifResponse: SearchNifPtResponse = getNoCreditsResponseFixture();

      parseSearchNifResponseMock.mockReturnValue({
        company: undefined,
        error: true,
        message: "Limit per minute reached. Please, try again later or buy credits."
      });

      axiosGetMock.mockResolvedValue({
        data: searchNifResponse
      });

      const response = await searchNif(515198374);

      expect(response).toEqual({
        company: undefined,
        error: true,
        message: "Limit per minute reached. Please, try again later or buy credits."
      });
      expect(axiosGetMock).toHaveBeenCalledWith("http://www.nif.pt/", {
        params: {
          json: "1",
          key: "__API_KEY__",
          q: "515198374"
        }
      });
    });

    it("should throw if nif returns an expected error", async () => {
      const searchNifResponse: SearchNifPtResponse = getUnexpectedErrorResponseFixture();

      axiosGetMock.mockResolvedValue({
        data: searchNifResponse
      });

      await expect(searchNif(515198374)).rejects.toThrowError(
        'NIF.pt returned unexpected error {"result":"error","message":"Key is not valid.","nif_validation":false,"is_nif":true,"credits":{"used":"free","left":{"month":963,"day":96,"hour":6,"minute":0,"paid":0}}}'
      );

      expect(axiosGetMock).toHaveBeenCalledWith("http://www.nif.pt/", {
        params: {
          json: "1",
          key: "__API_KEY__",
          q: "515198374"
        }
      });
    });

    it("should throw when axios errors", async () => {
      const error = new AxiosError(
        "Unauthorized",
        "ERR_BAD_REQUEST",
        {} as InternalAxiosRequestConfig, // config
        {}, // request
        {
          status: 401,
          data: { msg: "Invalid token" },
          statusText: "Unauthorized",
          headers: {},
          config: {} as InternalAxiosRequestConfig
        }
      );

      axiosGetMock.mockRejectedValue(error);

      await expect(searchNif(515198374)).rejects.toThrow(error.message);
      expect(logErrorMock).not.toHaveBeenCalled();
    });

    it("should throw when an unexpected error occurs", async () => {
      const error = new Error("Unexpected error occured");

      axiosGetMock.mockRejectedValue(error);

      await expect(searchNif(515198374)).rejects.toThrow(error.message);
      expect(logErrorMock).toHaveBeenCalledWith("Unexpected error calling NIF.PT", {
        errorMessage: "Unexpected error occured",
        nif: 515198374
      });
    });
  });

  describe("getCredits", () => {
    it("should return credits", async () => {
      const creditsResponse: Credit = {
        month: 969,
        day: 69,
        hour: 0,
        minute: 0,
        paid: 0
      };
      axiosGetMock.mockResolvedValue({
        data: {
          credits: creditsResponse
        }
      });

      const credits = await getCredits();

      expect(credits).toEqual(creditsResponse);
      expect(axiosGetMock).toHaveBeenCalledWith("http://www.nif.pt/", {
        params: {
          credits: "1",
          json: "1",
          key: "__API_KEY__"
        }
      });
    });
  });
});
