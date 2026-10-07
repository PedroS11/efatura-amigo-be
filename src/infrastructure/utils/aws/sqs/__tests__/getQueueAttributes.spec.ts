import { GetQueueAttributesCommand, type GetQueueAttributesCommandOutput } from "@aws-sdk/client-sqs";
import { getQueueAttributes } from "../getQueueAttributes";
import { getSQSClient } from "../utils";

vi.mock("../utils");

describe("getQueueAttributes", () => {
  const sendMock = vi.fn();
  const queueUrl = "https://sqs.eu-west-1.amazonaws.com/123456789012/my-queue";

  beforeEach(() => {
    vi.mocked(getSQSClient).mockReturnValue({ send: sendMock } as never);
  });

  afterEach(vi.resetAllMocks);

  it("sends a GetQueueAttributesCommand with the queue URL and attribute names", async () => {
    const output: GetQueueAttributesCommandOutput = {
      $metadata: { httpStatusCode: 200 },
      Attributes: { ApproximateNumberOfMessages: "5" }
    };
    sendMock.mockResolvedValue(output);

    const result = await getQueueAttributes(queueUrl, ["ApproximateNumberOfMessages"]);

    expect(getSQSClient).toHaveBeenCalledOnce();
    expect(sendMock).toHaveBeenCalledOnce();

    const command = sendMock.mock.calls[0][0];
    expect(command).toBeInstanceOf(GetQueueAttributesCommand);
    expect(command.input).toEqual({
      QueueUrl: queueUrl,
      AttributeNames: ["ApproximateNumberOfMessages"]
    });

    expect(result).toBe(output);
  });

  it("propagates errors from the SQS client", async () => {
    const error = new Error("QueueDoesNotExist");
    sendMock.mockRejectedValue(error);

    await expect(getQueueAttributes(queueUrl, ["All"])).rejects.toThrow("QueueDoesNotExist");
  });
});
