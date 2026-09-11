import type { MockInstance } from "vitest";

import { describeTable } from "../../utils/aws/dynamo/describeTable";
import { fullScanTable } from "../../utils/aws/dynamo/fullScanTable";
import { getItem } from "../../utils/aws/dynamo/getItem";
import { putItem } from "../../utils/aws/dynamo/putItem";
import { getCompaniesTableMetadata, getCompany, saveCompany, scanTable } from "../index";
import { Categories, type Company } from "../types";
import { getCompanyFixture } from "./__fixtures__/company";

vi.mock("../../utils/aws/dynamo/getItem");
vi.mock("../../utils/aws/dynamo/putItem");
vi.mock("../../utils/aws/dynamo/describeTable");
vi.mock("../../utils/aws/dynamo/fullScanTable");

describe("companiesTable", () => {
  let getItemMock: MockInstance;
  let putItemMock: MockInstance;
  let describeTableMock: MockInstance;
  let fullScanTableMock: MockInstance;
  let companyFixture: Company;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2000, 1, 1, 13));

    companyFixture = getCompanyFixture();
    getItemMock = vi.mocked(getItem);
    putItemMock = vi.mocked(putItem);
    describeTableMock = vi.mocked(describeTable);
    fullScanTableMock = vi.mocked(fullScanTable);
  });

  afterEach(vi.resetAllMocks);

  describe("getCompany", () => {
    it("should return company if it exists in the database", async () => {
      getItemMock.mockResolvedValue(companyFixture);

      const company = await getCompany(123456789);

      expect(company).toEqual({
        category: 2,
        name: "Company name",
        nif: 123456789,
        updatedAt: 949410000000
      });
      expect(getItemMock).toHaveBeenCalledWith("__COMPANIES_TABLE__", {
        nif: 123456789
      });
    });

    it("should return undefined if company doesn't exist in the database", async () => {
      getItemMock.mockResolvedValue(undefined);

      const company = await getCompany(123456789);

      expect(company).toEqual(undefined);
      expect(getItemMock).toHaveBeenCalledWith("__COMPANIES_TABLE__", {
        nif: 123456789
      });
    });
  });

  describe("saveCompany", () => {
    it("should save company information", async () => {
      const company: Company = {
        name: "Company name",
        nif: 123456789,
        updatedAt: 949410000000,
        caeRev3: "88910",
        category: Categories.Educacao
      };

      await saveCompany(company);

      expect(putItemMock).toHaveBeenCalledWith("__COMPANIES_TABLE__", {
        nif: 123456789,
        name: "Company name",
        category: Categories.Educacao,
        caeRev3: "88910",
        updatedAt: 949410000000
      });
    });
  });

  describe("scanTable", () => {
    it("should scan the table with the provided filters", async () => {
      const companies = [companyFixture];
      const filters = [
        {
          column: "category",
          comparator: "=" as const,
          value: 2
        }
      ];
      fullScanTableMock.mockResolvedValue(companies);

      const result = await scanTable(filters);

      expect(result).toEqual(companies);
      expect(fullScanTableMock).toHaveBeenCalledWith("__COMPANIES_TABLE__", filters);
    });
  });

  describe("getCompaniesTableMetadata", () => {
    it("should return table metadata", async () => {
      const metadata = {
        Table: {
          ItemCount: 42
        }
      };
      describeTableMock.mockResolvedValue(metadata);

      const result = await getCompaniesTableMetadata();

      expect(result).toEqual(metadata);
      expect(describeTableMock).toHaveBeenCalledWith("__COMPANIES_TABLE__");
    });
  });
});
