import type { MockInstance } from "vitest";
import { expect } from "vitest";
import { afterEach, beforeEach, describe } from "vitest";

import { saveCompany } from "../../../infrastructure/companiesTable";
import { searchNif } from "../../../infrastructure/nif-pt";
import { getSearchNifPtResponseFixture } from "../../../infrastructure/nif-pt/__tests__/__fixtures__/searchNifPtResponse";
import type { SearchNifResponse } from "../../../infrastructure/nif-pt/types";
import { logError, logMessage } from "../../../infrastructure/utils/logger";
import { processNif } from "../service";

vi.mock("../../../infrastructure/companiesTable");
vi.mock("../../../infrastructure/nif-pt");
vi.mock("../../../infrastructure/utils/logger");

describe("service", () => {
  describe("processNif", () => {
    let searchNifMock: MockInstance;
    let logMessageMock: MockInstance;
    let saveCompanyMock: MockInstance;
    let logErrorMock: MockInstance;

    const nif = 1234556789;

    beforeEach(() => {
      searchNifMock = vi.mocked(searchNif);
      logMessageMock = vi.mocked(logMessage);
      saveCompanyMock = vi.mocked(saveCompany);
      logErrorMock = vi.mocked(logError);
    });

    afterEach(vi.resetAllMocks);

    it("should return false if searchNif errors", async () => {
      searchNifMock.mockResolvedValue({
        error: true,
        message: "No credits left"
      } as SearchNifResponse);
      const response = await processNif(nif);

      expect(response).toBeFalsy();
      expect(logErrorMock).toHaveBeenCalledWith("Error searching NIF: 1234556789", {
        error: true,
        message: "No credits left"
      });
    });

    it("should return true if company not found", async () => {
      searchNifMock.mockResolvedValue({
        error: false,
        message: `Could not find any record for nif ${nif}`
      } as SearchNifResponse);
      const response = await processNif(nif);

      expect(response).toBeTruthy();
      expect(logMessageMock).toHaveBeenNthCalledWith(1, "Processing NIF", 1234556789);
      expect(logMessageMock).toHaveBeenNthCalledWith(2, "Company 1234556789 not found", {
        error: false,
        message: "Could not find any record for nif 1234556789"
      });
    });

    it("should return true if cae not found", async () => {
      const company = getSearchNifPtResponseFixture().records!["515198374"];
      company.cae = "";

      searchNifMock.mockResolvedValue({
        error: false,
        company
      } as SearchNifResponse);
      const response = await processNif(nif);

      expect(response).toBeTruthy();
      expect(logMessageMock).toHaveBeenNthCalledWith(2, "No valid cae found", {
        caeAsString: "",
        nif: 1234556789
      });
    });

    it("should save the company category and return true if cae has a category", async () => {
      const company = getSearchNifPtResponseFixture().records!["515198374"];

      searchNifMock.mockResolvedValue({
        error: false,
        company
      } as SearchNifResponse);
      const response = await processNif(nif);

      expect(response).toBeTruthy();
      expect(saveCompanyMock).toHaveBeenCalledWith(515198374, "The Lake Caffé, Lda", 9);
      expect(logMessageMock).toHaveBeenNthCalledWith(2, "Finished processing NIF", {
        cae: ["56303", "56101", "10712", "10711"],
        category: 9,
        nif: 1234556789
      });
    });

    it("should also save the company and return true despite cae not having a category match", async () => {
      const company = getSearchNifPtResponseFixture().records!["515198374"];
      company.cae = "11111";

      searchNifMock.mockResolvedValue({
        error: false,
        company
      } as SearchNifResponse);
      const response = await processNif(nif);

      expect(response).toBeTruthy();
      expect(saveCompanyMock).toHaveBeenCalledWith(515198374, "The Lake Caffé, Lda", undefined);
      expect(logMessageMock).toHaveBeenNthCalledWith(2, "Finished processing NIF", {
        cae: "11111",
        nif: 1234556789
      });
    });
  });
});
