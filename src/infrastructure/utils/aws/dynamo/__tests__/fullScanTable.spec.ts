import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { MockInstance } from "vitest";

import { fullScanTable } from "../fullScanTable";
import type { DynamoDBFilter } from "../utils";

vi.mock("../utils", async importOriginal => {
  const actual = await importOriginal<typeof import("../utils")>();

  return {
    ...actual,
    getDynamoInstance: vi.fn()
  };
});

import { getDynamoInstance } from "../utils";

describe("fullScanTable", () => {
  let sendMock: MockInstance;

  beforeEach(() => {
    sendMock = vi.fn();

    vi.mocked(getDynamoInstance).mockReturnValue({
      send: sendMock
    } as unknown as DynamoDBDocumentClient);
  });

  afterEach(vi.resetAllMocks);

  it("should return all items from a single scan page", async () => {
    sendMock.mockResolvedValue({
      Items: [{ nif: 123456789 }]
    });

    const items = await fullScanTable("__TABLE__", []);

    expect(items).toEqual([{ nif: 123456789 }]);
    expect(sendMock).toHaveBeenCalledOnce();
    expect(sendMock.mock.calls[0][0]).instanceof(ScanCommand);
    expect(sendMock.mock.calls[0][0].input).toEqual({
      TableName: "__TABLE__"
    });
  });

  it("should paginate until all items are collected", async () => {
    sendMock
      .mockResolvedValueOnce({
        Items: [{ nif: 123456789 }],
        LastEvaluatedKey: { nif: 123456789 }
      })
      .mockResolvedValueOnce({
        Items: [{ nif: 987654321 }]
      });

    const items = await fullScanTable("__TABLE__", []);

    expect(items).toEqual([{ nif: 123456789 }, { nif: 987654321 }]);
    expect(sendMock).toHaveBeenCalledTimes(2);
    expect(sendMock.mock.calls[1][0].input).toEqual({
      ExclusiveStartKey: { nif: 123456789 },
      TableName: "__TABLE__"
    });
  });

  it("should apply filter expressions when filters are provided", async () => {
    sendMock.mockResolvedValue({
      Items: [{ nif: 123456789, category: 2 }]
    });

    const filters: DynamoDBFilter[] = [
      {
        column: "category",
        comparator: "=",
        value: 2
      },
      {
        column: "caeRev3",
        comparator: "attribute_not_exists",
        value: undefined
      }
    ];

    const items = await fullScanTable("__TABLE__", filters);

    expect(items).toEqual([{ nif: 123456789, category: 2 }]);
    expect(sendMock.mock.calls[0][0].input).toEqual({
      ExpressionAttributeNames: {
        "#category": "category",
        "#caeRev3": "caeRev3"
      },
      ExpressionAttributeValues: {
        ":category": 2
      },
      FilterExpression: "#category = :category AND attribute_not_exists(#caeRev3)",
      TableName: "__TABLE__"
    });
  });
});
