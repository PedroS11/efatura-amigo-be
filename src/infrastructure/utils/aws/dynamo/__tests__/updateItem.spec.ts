import { type DynamoDBDocumentClient, UpdateCommand, type UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import type { MockInstance } from "vitest";

import { updateItem } from "../updateItem";
import { getDynamoInstance } from "../utils";

vi.mock("../utils");

describe("updateItem", () => {
  let sendMock: MockInstance;

  beforeEach(() => {
    sendMock = vi.fn();

    vi.mocked(getDynamoInstance).mockReturnValue({
      send: sendMock
    } as unknown as DynamoDBDocumentClient);
  });

  afterEach(vi.resetAllMocks);

  it("should update an item in the table", async () => {
    const item: UpdateCommandInput = {
      UpdateExpression: "SET #name = :name, #category = :category, #updatedAt = :updatedAt",
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
      TableName: "__COMPANIES_TABLE__"
    };

    await updateItem(item);

    expect(sendMock.mock.calls[0][0]).instanceof(UpdateCommand);
    expect(sendMock.mock.calls[0][0].input).toEqual({
      UpdateExpression: "SET #name = :name, #category = :category, #updatedAt = :updatedAt",
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
      TableName: "__COMPANIES_TABLE__"
    });
  });
});
