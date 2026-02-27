import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { BatchGetCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import type { MockInstance } from "vitest";

import { getDynamoInstance } from "../../utils/aws/dynamo";
import { getCompany, getExistingNifsFromList, saveCompany } from "../index";
import type { Company } from "../types";
import { Categories } from "../types";
import { getCompanyFixture } from "./__fixtures__/company";

vi.mock("../../utils/aws/dynamo");

describe("companiesTable", () => {
  let sendMock: MockInstance;
  let companyFixture: Company;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2000, 1, 1, 13));

    companyFixture = getCompanyFixture();

    sendMock = vi.fn();

    vi.mocked(getDynamoInstance).mockReturnValue({
      send: sendMock
    } as unknown as DynamoDBDocumentClient);
  });

  afterEach(vi.resetAllMocks);

  describe("getCompany", () => {
    it("should return company if it exists in the database", async () => {
      sendMock.mockResolvedValue({
        Item: companyFixture
      });

      const company = await getCompany(123456789);

      expect(company).toEqual({
        category: 2,
        name: "Company name",
        nif: 123456789,
        updatedAt: 949410000000
      });
      expect(sendMock.mock.calls[0][0]).instanceof(GetCommand);
      expect(sendMock.mock.calls[0][0].input).toEqual({
        Key: {
          nif: 123456789
        },
        TableName: "__COMPANIES_TABLE__"
      });
    });

    it("should return undefined if company doesn't exist in the database", async () => {
      sendMock.mockResolvedValue({
        Item: undefined
      });

      const company = await getCompany(123456789);

      expect(company).toEqual(undefined);
      expect(sendMock.mock.calls[0][0]).instanceof(GetCommand);
      expect(sendMock.mock.calls[0][0].input).toEqual({
        Key: {
          nif: 123456789
        },
        TableName: "__COMPANIES_TABLE__"
      });
    });
  });

  describe("saveCompany", () => {
    it("should save company information", async () => {
      await saveCompany(123456789, "Company name", Categories.Educacao);

      expect(sendMock.mock.calls[0][0]).instanceof(PutCommand);
      expect(sendMock.mock.calls[0][0].input).toEqual({
        Item: {
          nif: 123456789,
          name: "Company name",
          category: Categories.Educacao,
          updatedAt: 949410000000
        },
        TableName: "__COMPANIES_TABLE__"
      });
    });
  });

  describe("getExistingNifsFromList", () => {
    it("should return existing nifs in the database from list", async () => {
      sendMock.mockResolvedValueOnce({
        Responses: {
          __COMPANIES_TABLE__: [companyFixture]
        }
      });

      const result = await getExistingNifsFromList([123456789, 987654321]);

      expect(result).toEqual([123456789]);
      expect(sendMock.mock.calls[0][0]).instanceof(BatchGetCommand);
      expect(sendMock.mock.calls[0][0].input).toEqual({
        RequestItems: {
          __COMPANIES_TABLE__: {
            Keys: [
              {
                nif: 123456789
              },
              {
                nif: 987654321
              }
            ],
            ProjectionExpression: "nif"
          }
        }
      });
    });
  });
});
