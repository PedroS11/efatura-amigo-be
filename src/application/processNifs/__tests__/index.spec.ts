import type { MockInstance } from "vitest";
import { getCredits } from "../../../infrastructure/nif-pt";
import type { Credit } from "../../../infrastructure/nif-pt/types";
import { sendMessage } from "../../../infrastructure/telegramBot";
import { deleteBatch, getUnprocessedCompanies } from "../../../infrastructure/unprocessedCompaniesTable";
import type { UnprocessedCompany } from "../../../infrastructure/unprocessedCompaniesTable/types";
import { logMessage } from "../../../infrastructure/utils/logger";
import { handler } from "../index";
import { processNif } from "../service";

vi.mock("../../../infrastructure/nif-pt");
vi.mock("../../../infrastructure/unprocessedCompaniesTable");
vi.mock("../../../infrastructure/companiesTable");
vi.mock("../service");
vi.mock("../../../infrastructure/utils/logger");
vi.mock("../../../infrastructure/telegramBot");

describe("handler", () => {
  let getCreditsMock: MockInstance;
  let processNifMock: MockInstance;
  let getUnprocessedCompaniesMock: MockInstance;
  let deleteBatchMock: MockInstance;
  let logMessageMock: MockInstance;
  let sendMessageMock: MockInstance;

  beforeEach(() => {
    getCreditsMock = vi.mocked(getCredits);
    processNifMock = vi.mocked(processNif);
    getUnprocessedCompaniesMock = vi.mocked(getUnprocessedCompanies);
    deleteBatchMock = vi.mocked(deleteBatch);
    logMessageMock = vi.mocked(logMessage);
    sendMessageMock = vi.mocked(sendMessage);
  });

  afterEach(vi.resetAllMocks);

  it("should return if no nifs to process", async () => {
    getCreditsMock.mockResolvedValue({
      month: 963,
      day: 96,
      hour: 6,
      minute: 1,
      paid: 0
    } as Credit);
    getUnprocessedCompaniesMock.mockResolvedValue([]);

    const response = await handler();

    expect(response).toEqual(undefined);
    expect(logMessageMock).toHaveBeenCalledWith("No rows to process");
    expect(getUnprocessedCompaniesMock).toHaveBeenCalledWith(1);
  });

  it("should return if no credits left", async () => {
    getUnprocessedCompaniesMock.mockResolvedValue([
      {
        nif: 123456789,
        timestamp: 1769720041556
      }
    ] as UnprocessedCompany[]);

    getCreditsMock.mockResolvedValue({
      month: 963,
      day: 96,
      hour: 6,
      minute: 0,
      paid: 0
    } as Credit);

    const response = await handler();

    expect(response).toEqual(undefined);
    expect(logMessageMock).toHaveBeenCalledWith("Nif.pt minute limits exceeded", {
      month: 963,
      day: 96,
      hour: 6,
      minute: 0,
      paid: 0
    });
  });

  it("should handle an unprocessed nif", async () => {
    getCreditsMock.mockResolvedValue({
      month: 963,
      day: 96,
      hour: 6,
      minute: 1,
      paid: 0
    } as Credit);
    getUnprocessedCompaniesMock.mockResolvedValue([
      {
        nif: 123456789,
        timestamp: 1769720041556
      }
    ] as UnprocessedCompany[]);
    processNifMock.mockResolvedValue(true);

    const response = await handler();

    expect(response).toEqual(undefined);
    expect(processNifMock).toHaveBeenCalledWith(123456789);
  });

  it("should handle as many nifs as there are available credits ", async () => {
    getCreditsMock.mockResolvedValue({
      month: 963,
      day: 96,
      hour: 6,
      minute: 2,
      paid: 0
    } as Credit);
    getUnprocessedCompaniesMock.mockResolvedValue([
      {
        nif: 123456789,
        timestamp: 1769720041556
      },
      {
        nif: 987654321,
        timestamp: 1769720041556
      },
      {
        nif: 987659999,
        timestamp: 1769720041556
      }
    ] as UnprocessedCompany[]);
    processNifMock.mockResolvedValue(true);

    const response = await handler();

    expect(response).toEqual(undefined);
    expect(processNifMock).toHaveBeenNthCalledWith(1, 123456789);
    expect(processNifMock).toHaveBeenNthCalledWith(2, 987654321);
    expect(deleteBatchMock).toHaveBeenCalledWith([123456789, 987654321]);
  });

  it("should not remove nifs that failed the processing", async () => {
    getCreditsMock.mockResolvedValue({
      month: 963,
      day: 96,
      hour: 6,
      minute: 2,
      paid: 0
    } as Credit);
    getUnprocessedCompaniesMock.mockResolvedValue([
      {
        nif: 123456789,
        timestamp: 1769720041556
      },
      {
        nif: 987654321,
        timestamp: 1769720041556
      }
    ] as UnprocessedCompany[]);
    processNifMock.mockResolvedValue(false);

    const response = await handler();

    expect(response).toEqual(undefined);
    expect(processNifMock).toHaveBeenNthCalledWith(1, 123456789);
    expect(processNifMock).toHaveBeenNthCalledWith(2, 987654321);
    expect(deleteBatchMock).not.toHaveBeenCalled();
    expect(sendMessageMock).toHaveBeenCalledWith("Failed to process nif 123456789");
  });

  it("should not remove nifs that throw an error while processing", async () => {
    getCreditsMock.mockResolvedValue({
      month: 963,
      day: 96,
      hour: 6,
      minute: 2,
      paid: 0
    } as Credit);
    getUnprocessedCompaniesMock.mockResolvedValue([
      {
        nif: 123456789,
        timestamp: 1769720041556
      },
      {
        nif: 987654321,
        timestamp: 1769720041556
      }
    ] as UnprocessedCompany[]);
    processNifMock.mockRejectedValue(new Error("An error occurred."));

    const response = await handler();

    expect(response).toEqual(undefined);
    expect(processNifMock).toHaveBeenNthCalledWith(1, 123456789);
    expect(processNifMock).toHaveBeenNthCalledWith(2, 987654321);
    expect(deleteBatchMock).not.toHaveBeenCalled();
    expect(sendMessageMock).toHaveBeenCalledWith("Error thrown processing nif 123456789, error: An error occurred.");
  });
});
