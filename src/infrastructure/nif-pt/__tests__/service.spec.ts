import { parseSearchNifResponse } from "../service";
import type { SearchNifPtResponse } from "../types";
import {
  getNoCreditsResponseFixture,
  getNoRecordFoundResponseFixture,
  getSearchNifPtResponseFixture,
  getUnexpectedErrorResponseFixture
} from "./__fixtures__/searchNifPtResponse";

describe("service", () => {
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
