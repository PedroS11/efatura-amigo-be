import type { DescribeTableCommandOutput } from "@aws-sdk/client-dynamodb";
import type { MockInstance } from "vitest";
import { describeTable } from "../../utils/aws/dynamo/describeTable";
import { fullScanTable } from "../../utils/aws/dynamo/fullScanTable";
import { getItem } from "../../utils/aws/dynamo/getItem";
import { updateItem } from "../../utils/aws/dynamo/updateItem";
import { getCompaniesTableMetadata, getCompany, scanTable, updateCompany } from "../index";
import type { Company } from "../types";
import { getCompanyFixture } from "./__fixtures__/company";

vi.mock("../../utils/aws/dynamo/getItem");
vi.mock("../../utils/aws/dynamo/updateItem");
vi.mock("../../utils/aws/dynamo/describeTable");
vi.mock("../../utils/aws/dynamo/fullScanTable");

describe("companiesTable", () => {
  let getItemMock: MockInstance<typeof getItem>;
  let updateItemMock: MockInstance<typeof updateItem>;
  let describeTableMock: MockInstance<typeof describeTable>;
  let fullScanTableMock: MockInstance<typeof fullScanTable>;
  let companyFixture: Company;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2000, 1, 1, 13));

    companyFixture = getCompanyFixture();
    getItemMock = vi.mocked(getItem);
    updateItemMock = vi.mocked(updateItem);
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
      const metadata: DescribeTableCommandOutput = {
        Table: {
          ItemCount: 42
        },
        $metadata: {}
      };
      describeTableMock.mockResolvedValue(metadata);

      const result = await getCompaniesTableMetadata();

      expect(result).toEqual(metadata);
      expect(describeTableMock).toHaveBeenCalledWith("__COMPANIES_TABLE__");
    });
  });

  describe("updateCompany", () => {
    it("should update company", async () => {
      await updateCompany(companyFixture);

      expect(updateItemMock).toHaveBeenNthCalledWith(1, {
        ExpressionAttributeNames: {
          "#category": "category",
          "#name": "name",
          "#updatedAt": "updatedAt"
        },
        ExpressionAttributeValues: {
          ":category": 2,
          ":name": "Company name",
          ":updatedAt": 949410000000
        },
        Key: {
          nif: 123456789
        },
        TableName: "__COMPANIES_TABLE__",
        UpdateExpression: "SET #name = :name, #category = :category, #updatedAt = :updatedAt"
      });
    });
  });
});
