import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import type { MockInstance } from "vitest";

import { batchWrite } from "../batchWrite";
import { getDynamoInstance } from "../utils";

vi.mock("../utils");

describe("batchWrite", () => {
  let sendMock: MockInstance;

  beforeEach(() => {
    sendMock = vi.fn();

    vi.mocked(getDynamoInstance).mockReturnValue({
      send: sendMock
    } as unknown as DynamoDBDocumentClient);
  });

  afterEach(vi.resetAllMocks);

  it("should write a batch of requests to the table", async () => {
    const requests = [
      {
        DeleteRequest: {
          Key: {
            nif: 123456789
          }
        }
      }
    ];

    await batchWrite("__TABLE__", requests);

    expect(sendMock.mock.calls[0][0]).instanceof(BatchWriteCommand);
    expect(sendMock.mock.calls[0][0].input).toEqual({
      RequestItems: {
        __TABLE__: requests
      }
    });
  });
});
