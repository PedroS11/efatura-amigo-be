import { DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { MockInstance } from "vitest";

import { describeTable } from "../describeTable";
import { getDynamoInstance } from "../utils";

vi.mock("../utils");

describe("describeTable", () => {
  let sendMock: MockInstance;

  beforeEach(() => {
    sendMock = vi.fn();

    vi.mocked(getDynamoInstance).mockReturnValue({
      send: sendMock
    } as unknown as DynamoDBDocumentClient);
  });

  afterEach(vi.resetAllMocks);

  it("should return table metadata", async () => {
    const metadata = {
      Table: {
        ItemCount: 42
      }
    };
    sendMock.mockResolvedValue(metadata);

    const result = await describeTable("__TABLE__");

    expect(result).toEqual(metadata);
    expect(sendMock.mock.calls[0][0]).instanceof(DescribeTableCommand);
    expect(sendMock.mock.calls[0][0].input).toEqual({
      TableName: "__TABLE__"
    });
  });
});
