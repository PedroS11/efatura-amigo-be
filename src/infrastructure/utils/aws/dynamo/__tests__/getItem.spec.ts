import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import type { MockInstance } from "vitest";

import { getItem } from "../getItem";
import { getDynamoInstance } from "../utils";

vi.mock("../utils");

describe("getItem", () => {
  let sendMock: MockInstance;

  beforeEach(() => {
    sendMock = vi.fn();

    vi.mocked(getDynamoInstance).mockReturnValue({
      send: sendMock
    } as unknown as DynamoDBDocumentClient);
  });

  afterEach(vi.resetAllMocks);

  it("should return the item when it exists", async () => {
    sendMock.mockResolvedValue({
      Item: {
        id: "123",
        name: "test"
      }
    });

    const item = await getItem("__TABLE__", { id: "123" });

    expect(item).toEqual({
      id: "123",
      name: "test"
    });
    expect(sendMock.mock.calls[0][0]).instanceof(GetCommand);
    expect(sendMock.mock.calls[0][0].input).toEqual({
      Key: { id: "123" },
      TableName: "__TABLE__"
    });
  });

  it("should return undefined when the item does not exist", async () => {
    sendMock.mockResolvedValue({
      Item: undefined
    });

    const item = await getItem("__TABLE__", { id: "123" });

    expect(item).toEqual(undefined);
    expect(sendMock.mock.calls[0][0]).instanceof(GetCommand);
    expect(sendMock.mock.calls[0][0].input).toEqual({
      Key: { id: "123" },
      TableName: "__TABLE__"
    });
  });
});
