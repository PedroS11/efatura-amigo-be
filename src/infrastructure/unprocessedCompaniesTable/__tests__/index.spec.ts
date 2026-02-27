import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { BatchWriteCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from "vitest";

import { getDynamoInstance } from "../../utils/aws/dynamo";
import { addCompany, deleteBatch, getUnprocessedCompanies } from "../index";
import type { UnprocessedCompany } from "../types";

vi.mock("../../utils/aws/dynamo");

describe("unprocessedCompaniesTable", () => {
  let sendMock: MockInstance;

  beforeEach(() => {
    sendMock = vi.fn();

    vi.mocked(getDynamoInstance).mockReturnValue({
      send: sendMock
    } as unknown as DynamoDBDocumentClient);

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

      expect(sendMock.mock.calls[0][0]).instanceof(BatchWriteCommand);
      expect(sendMock.mock.calls[0][0].input).toEqual({
        RequestItems: {
          __UNPROCESSED_COMPANIES_TABLE__: [
            {
              DeleteRequest: {
                Key: {
                  nif: 123456789
                }
              }
            }
          ]
        }
      });
    });
  });

  describe("addCompany", () => {
    it("should add company to be processed", async () => {
      await addCompany(123456789);

      expect(sendMock.mock.calls[0][0]).instanceof(PutCommand);
      expect(sendMock.mock.calls[0][0].input).toEqual({
        Item: {
          nif: 123456789,
          timestamp: 949410000000
        },
        TableName: "__UNPROCESSED_COMPANIES_TABLE__"
      });
    });
  });
});
