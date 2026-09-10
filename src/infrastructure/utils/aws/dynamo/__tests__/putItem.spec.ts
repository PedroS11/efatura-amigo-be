import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import type { MockInstance } from "vitest";

import { putItem } from "../putItem";
import { getDynamoInstance } from "../utils";

vi.mock("../utils");

describe("putItem", () => {
  let sendMock: MockInstance;

  beforeEach(() => {
    sendMock = vi.fn();

    vi.mocked(getDynamoInstance).mockReturnValue({
      send: sendMock
    } as unknown as DynamoDBDocumentClient);
  });

  afterEach(vi.resetAllMocks);

  it("should put an item in the table", async () => {
    const item = {
      id: "123",
      name: "test"
    };

    await putItem("__TABLE__", item);

    expect(sendMock.mock.calls[0][0]).instanceof(PutCommand);
    expect(sendMock.mock.calls[0][0].input).toEqual({
      Item: item,
      TableName: "__TABLE__"
    });
  });
});
