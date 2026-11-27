import type { MockInstance } from "vitest";

import { updateCompany } from "../../../infrastructure/companiesTable";
import { searchNifPtCompany } from "../../../infrastructure/nif-pt";
import { getSearchNifPtResponseFixture } from "../../../infrastructure/nif-pt/__tests__/__fixtures__/searchNifPtResponse";
import type { SearchNifPtCompanyResponse } from "../../../infrastructure/nif-pt/types";
import { searchSicaeCompany } from "../../../infrastructure/sicae";
import { logError, logMessage } from "../../../infrastructure/utils/logger";
import { processNifWithNifPt, processNifWithSicae } from "../service";

vi.mock("../../../infrastructure/companiesTable");
vi.mock("../../../infrastructure/nif-pt");
vi.mock("../../../infrastructure/utils/logger");
vi.mock("../../../infrastructure/sicae");

describe("service", () => {
  const nif = 1234556789;

  beforeEach(() => {
    vi.useFakeTimers({
      now: 1786835051652
    });
  });

  afterEach(vi.resetAllMocks);

  describe("processNifWithNifPt", () => {
    let searchNifMock: MockInstance<typeof searchNifPtCompany>;
    let logMessageMock: MockInstance<typeof logMessage>;
    let updateCompanyMock: MockInstance<typeof updateCompany>;
    let logErrorMock: MockInstance<typeof logError>;

    beforeEach(() => {
      searchNifMock = vi.mocked(searchNifPtCompany);
      logMessageMock = vi.mocked(logMessage);
      updateCompanyMock = vi.mocked(updateCompany);
      logErrorMock = vi.mocked(logError);
    });

    afterEach(vi.resetAllMocks);

    it("should return false if searchNif errors", async () => {
      searchNifMock.mockResolvedValue({
        error: true,
        message: "No credits left"
      } as SearchNifPtCompanyResponse);
      const response = await processNifWithNifPt(nif);

      expect(response).toBeFalsy();
      expect(logErrorMock).toHaveBeenCalledWith("Error searching NIF with NIF.pt: 1234556789", {
        error: true,
        message: "No credits left"
      });
    });

    it("should save a NOT_FOUND entry and return true if company not found", async () => {
      searchNifMock.mockResolvedValue({
        error: false,
        message: `Could not find any record for nif ${nif}`
      } as SearchNifPtCompanyResponse);
      const response = await processNifWithNifPt(nif);

      expect(response).toBeTruthy();
      expect(logMessageMock).toHaveBeenNthCalledWith(1, "Processing NIF with NIF.pt", 1234556789);
      expect(logMessageMock).toHaveBeenNthCalledWith(2, "Company 1234556789 not found", {
        error: false,
        message: "Could not find any record for nif 1234556789"
      });
      expect(updateCompanyMock).toHaveBeenCalledWith({
        caeRev3: undefined,
        category: undefined,
        name: "NOT_FOUND",
        nif: 1234556789,
        updatedAt: 1786835051652
      });
    });

    it("should return true if cae not found", async () => {
      const company = getSearchNifPtResponseFixture().records!["515198374"];
      company.cae = "";

      searchNifMock.mockResolvedValue({
        error: false,
        company
      } as SearchNifPtCompanyResponse);
      const response = await processNifWithNifPt(nif);

      expect(response).toBeTruthy();
      expect(logMessageMock).toHaveBeenNthCalledWith(2, "No valid cae found", {
        cae: "",
        nif: 1234556789
      });
    });

    it("should save the company category and return true if cae has a category", async () => {
      const company = getSearchNifPtResponseFixture().records!["515198374"];

      searchNifMock.mockResolvedValue({
        error: false,
        company
      } as SearchNifPtCompanyResponse);
      const response = await processNifWithNifPt(nif);

      expect(response).toBeTruthy();
      expect(updateCompanyMock).toHaveBeenCalledWith({
        caeRev3: "56303",
        category: 8,
        name: "The Lake Caffé, Lda",
        nif: 1234556789,
        updatedAt: 1786835051652
      });
      expect(logMessageMock).toHaveBeenNthCalledWith(2, "Finished processing NIF with NIF.pt", {
        cae: ["56303", "56101", "10712", "10711"],
        category: 8,
        nif: 1234556789
      });
    });

    it("should also save the company and return true despite cae not having a category match", async () => {
      const company = getSearchNifPtResponseFixture().records!["515198374"];
      company.cae = "11111";

      searchNifMock.mockResolvedValue({
        error: false,
        company
      } as SearchNifPtCompanyResponse);
      const response = await processNifWithNifPt(nif);

      expect(response).toBeTruthy();
      expect(updateCompanyMock).toHaveBeenCalledWith({
        caeRev3: "11111",
        category: undefined,
        name: "The Lake Caffé, Lda",
        nif: 1234556789,
        updatedAt: 1786835051652
      });
      expect(logMessageMock).toHaveBeenNthCalledWith(2, "Finished processing NIF with NIF.pt", {
        cae: "11111",
        nif: 1234556789
      });
    });
  });

  describe("processNifWithSicae", () => {
    let searchSicaeCompanyMock: MockInstance<typeof searchSicaeCompany>;
    let updateCompanyMock: MockInstance<typeof updateCompany>;

    beforeEach(() => {
      searchSicaeCompanyMock = vi.mocked(searchSicaeCompany);
      updateCompanyMock = vi.mocked(updateCompany);
    });

    afterEach(vi.resetAllMocks);

    it("should return false if company not found", async () => {
      const response = await processNifWithSicae(nif);

      expect(response).toBeFalsy();
      expect(searchSicaeCompanyMock).toHaveBeenNthCalledWith(1, nif);
      expect(updateCompanyMock).not.toHaveBeenCalled();
    });

    it("should return false if cae rev4 wasn't mapped to category", async () => {
      searchSicaeCompanyMock.mockResolvedValue({
        nome: "NOT_FOUND",
        nipc: nif.toString(),
        caesSecundarios: [],
        caePrincipal: undefined
      });

      const response = await processNifWithSicae(nif);

      expect(response).toBeFalsy();
      expect(searchSicaeCompanyMock).toHaveBeenNthCalledWith(1, nif);
      expect(updateCompanyMock).not.toHaveBeenCalled();
    });

    it("should true false if a category was found for the cae", async () => {
      searchSicaeCompanyMock.mockResolvedValue({
        nome: "Company name",
        nipc: nif.toString(),
        caesSecundarios: [],
        caePrincipal: {
          codigo: "49330",
          descricao: "49330"
        }
      });

      const response = await processNifWithSicae(nif);

      expect(response).toBeTruthy();
      expect(searchSicaeCompanyMock).toHaveBeenNthCalledWith(1, nif);
      expect(updateCompanyMock).toHaveBeenNthCalledWith(1, {
        caeRev4: "49330",
        category: 11,
        name: "Company name",
        nif: 1234556789,
        updatedAt: 1786835051652
      });
    });
  });
});

describe.skip("t", () => {
  it("aa", async () => {
    await processNifWithSicae(516600800);
  });
});
