import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { MockInstance } from "vitest";

import { batchWrite } from "../../utils/aws/dynamo/batchWrite";
import { describeTable } from "../../utils/aws/dynamo/describeTable";
import { putItem } from "../../utils/aws/dynamo/putItem";
import { getDynamoInstance } from "../../utils/aws/dynamo/utils";
import {
  addCompanyToProcess,
  deleteBatch,
  getUnprocessedCompanies,
  getUnprocessedCompaniesTableMetadata
} from "../index";
import type { UnprocessedCompany } from "../types";

vi.mock("../../utils/aws/dynamo/utils");
vi.mock("../../utils/aws/dynamo/putItem");
vi.mock("../../utils/aws/dynamo/batchWrite");
vi.mock("../../utils/aws/dynamo/describeTable");

describe("unprocessedCompaniesTable", () => {
  let sendMock: MockInstance;
  let putItemMock: MockInstance;
  let batchWriteMock: MockInstance;
  let describeTableMock: MockInstance;

  beforeEach(() => {
    sendMock = vi.fn();

    vi.mocked(getDynamoInstance).mockReturnValue({
      send: sendMock
    } as unknown as DynamoDBDocumentClient);

    putItemMock = vi.mocked(putItem);
    batchWriteMock = vi.mocked(batchWrite);
    describeTableMock = vi.mocked(describeTable);

    vi.useFakeTimers();
    const date = new Date(2000, 1, 1, 13);
    vi.setSystemTime(date);
  });

  afterEach(vi.resetAllMocks);

  describe("getUnprocessedCompanies", () => {
    it("should return an array of unprocessedCompanies", async () => {
      sendMock
        .mockResolvedValueOnce({
          Items: [
            {
              nif: 123456789,
              timestamp: 1769709458097
            }
          ] as UnprocessedCompany[],
          LastEvaluatedKey: "__LastEvaluatedKey__"
        })
        .mockResolvedValue({
          Items: [
            {
              nif: 123456711,
              timestamp: 1769709458097
            }
          ] as UnprocessedCompany[]
        });

      const companies = await getUnprocessedCompanies(2);

      expect(companies).toEqual([
        {
          nif: 123456789,
          timestamp: 1769709458097
        },
        {
          nif: 123456711,
          timestamp: 1769709458097
        }
      ]);
      expect(sendMock.mock.calls[0][0]).instanceof(ScanCommand);
      expect(sendMock.mock.calls[0][0].input).toEqual({
        ExclusiveStartKey: undefined,
        Limit: 2,
        TableName: "__UNPROCESSED_COMPANIES_TABLE__"
      });
    });

    it("should return only one unprocessedCompany", async () => {
      sendMock.mockResolvedValueOnce({
        Items: [
          {
            nif: 123456789,
            timestamp: 1769709458097
          }
        ] as UnprocessedCompany[],
        LastEvaluatedKey: "__LastEvaluatedKey__"
      });

      const companies = await getUnprocessedCompanies(1);

      expect(companies).toEqual([
        {
          nif: 123456789,
          timestamp: 1769709458097
        }
      ]);
      expect(sendMock.mock.calls[0][0]).instanceof(ScanCommand);
      expect(sendMock.mock.calls[0][0].input).toEqual({
        ExclusiveStartKey: undefined,
        Limit: 1,
        TableName: "__UNPROCESSED_COMPANIES_TABLE__"
      });
    });
  });

  describe("deleteBatch", () => {
    it("should a batch of already processed nifs", async () => {
      await deleteBatch([123456789]);

      expect(batchWriteMock).toHaveBeenCalledWith("__UNPROCESSED_COMPANIES_TABLE__", [
        {
          DeleteRequest: {
            Key: {
              nif: 123456789
            }
          }
        }
      ]);
    });
  });

  describe("addCompanyToProcess", () => {
    it("should add company to be processed", async () => {
      await addCompanyToProcess(123456789);

      expect(putItemMock).toHaveBeenCalledWith("__UNPROCESSED_COMPANIES_TABLE__", {
        nif: 123456789,
        timestamp: 949410000000
      });
    });
  });

  describe("getUnprocessedCompaniesTableMetadata", () => {
    it("should return table metadata", async () => {
      const metadata = {
        Table: {
          ItemCount: 7
        }
      };
      describeTableMock.mockResolvedValue(metadata);

      const result = await getUnprocessedCompaniesTableMetadata();

      expect(result).toEqual(metadata);
      expect(describeTableMock).toHaveBeenCalledWith("__UNPROCESSED_COMPANIES_TABLE__");
    });
  });
});
