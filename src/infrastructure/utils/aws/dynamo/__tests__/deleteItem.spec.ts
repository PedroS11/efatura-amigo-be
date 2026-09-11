import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import type { MockInstance } from "vitest";

import { deleteItem } from "../deleteItem";
import { getDynamoInstance } from "../utils";

vi.mock("../utils");

describe("deleteItem", () => {
  let sendMock: MockInstance;

  beforeEach(() => {
    sendMock = vi.fn();

    vi.mocked(getDynamoInstance).mockReturnValue({
      send: sendMock
    } as unknown as DynamoDBDocumentClient);
  });

  afterEach(vi.resetAllMocks);

  it("should delete an item from the table", async () => {
    await deleteItem("__TABLE__", { id: "123" });

    expect(sendMock.mock.calls[0][0]).instanceof(DeleteCommand);
    expect(sendMock.mock.calls[0][0].input).toEqual({
      Key: { id: "123" },
      TableName: "__TABLE__"
    });
  });
});
