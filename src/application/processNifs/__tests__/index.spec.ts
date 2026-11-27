import type { MockInstance } from "vitest";
import { getCredits } from "../../../infrastructure/nif-pt";
import type { Credit } from "../../../infrastructure/nif-pt/types";
import { sendMessage } from "../../../infrastructure/telegramBot";
import { deleteBatch, getUnprocessedCompanies } from "../../../infrastructure/unprocessedCompaniesTable";
import type { UnprocessedCompany } from "../../../infrastructure/unprocessedCompaniesTable/types";
import { logMessage } from "../../../infrastructure/utils/logger";
import { handler } from "../index";
import { processNifWithNifPt, processNifWithSicae } from "../service";

vi.mock("../../../infrastructure/nif-pt");
vi.mock("../../../infrastructure/unprocessedCompaniesTable");
vi.mock("../../../infrastructure/companiesTable");
vi.mock("../service");
vi.mock("../../../infrastructure/utils/logger");
vi.mock("../../../infrastructure/telegramBot");

describe("handler", () => {
  let getCreditsMock: MockInstance<typeof getCredits>;
  let processNifWithNifPtMock: MockInstance<typeof processNifWithNifPt>;
  let processNifWithSicaeMock: MockInstance<typeof processNifWithSicae>;
  let getUnprocessedCompaniesMock: MockInstance<typeof getUnprocessedCompanies>;
  let deleteBatchMock: MockInstance<typeof deleteBatch>;
  let logMessageMock: MockInstance<typeof logMessage>;
  let sendMessageMock: MockInstance<typeof sendMessage>;

  beforeEach(() => {
    getCreditsMock = vi.mocked(getCredits);
    processNifWithNifPtMock = vi.mocked(processNifWithNifPt);
    processNifWithSicaeMock = vi.mocked(processNifWithSicae).mockResolvedValue(false);
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
    expect(getUnprocessedCompaniesMock).toHaveBeenCalledWith(5);
    expect(processNifWithSicaeMock).not.toHaveBeenCalled();
    expect(processNifWithNifPtMock).not.toHaveBeenCalled();
  });

  it("should remove nif from unprocessedCompanies if sicae proccessed it", async () => {
    getUnprocessedCompaniesMock.mockResolvedValue([
      {
        nif: 123456789,
        timestamp: 1769720041556
      }
    ] as UnprocessedCompany[]);

    processNifWithSicaeMock.mockResolvedValue(true);

    await handler();

    expect(processNifWithSicaeMock).toHaveBeenNthCalledWith(1, 123456789);
    expect(deleteBatchMock).toHaveBeenNthCalledWith(1, [123456789]);
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

  it("should handle an unprocessed nif with nif.pt if sicae didn't", async () => {
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
      minute: 1,
      paid: 0
    } as Credit);

    processNifWithNifPtMock.mockResolvedValue(true);

    const response = await handler();

    expect(response).toEqual(undefined);
    expect(processNifWithNifPtMock).toHaveBeenCalledWith(123456789);
    expect(deleteBatchMock).toHaveBeenNthCalledWith(1, [123456789]);
  });

  it("should handle an unprocessed nif with nif.pt if sicae threw", async () => {
    getUnprocessedCompaniesMock.mockResolvedValue([
      {
        nif: 123456789,
        timestamp: 1769720041556
      }
    ] as UnprocessedCompany[]);

    const error = new Error("An error occurred.");

    processNifWithSicaeMock.mockRejectedValue(error);

    getCreditsMock.mockResolvedValue({
      month: 963,
      day: 96,
      hour: 6,
      minute: 1,
      paid: 0
    } as Credit);

    processNifWithNifPtMock.mockResolvedValue(true);

    const response = await handler();

    expect(response).toEqual(undefined);
    expect(logMessageMock).toHaveBeenNthCalledWith(
      1,
      "Error thrown processing nif 123456789 with SICAE, error: An error occurred., retrying with NIF.pt"
    );
    expect(sendMessageMock).toHaveBeenNthCalledWith(
      1,
      "Error thrown processing nif 123456789 with SICAE, error: An error occurred., retrying with NIF.pt"
    );
    expect(processNifWithNifPtMock).toHaveBeenCalledWith(123456789);
    expect(deleteBatchMock).toHaveBeenNthCalledWith(1, [123456789]);
  });

  it("should handle as many nifs as there are available credits ", async () => {
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

    getCreditsMock.mockResolvedValue({
      month: 963,
      day: 96,
      hour: 6,
      minute: 2,
      paid: 0
    } as Credit);

    processNifWithNifPtMock.mockResolvedValue(true);

    const response = await handler();

    expect(response).toEqual(undefined);
    expect(processNifWithNifPtMock).toHaveBeenNthCalledWith(1, 123456789);
    expect(processNifWithNifPtMock).toHaveBeenNthCalledWith(2, 987654321);
    expect(deleteBatchMock).toHaveBeenCalledWith([123456789, 987654321]);
  });

  it("should not remove nifs that failed the processing", async () => {
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

    getCreditsMock.mockResolvedValue({
      month: 963,
      day: 96,
      hour: 6,
      minute: 2,
      paid: 0
    } as Credit);

    processNifWithNifPtMock.mockResolvedValue(false);

    const response = await handler();

    expect(response).toEqual(undefined);
    expect(processNifWithNifPtMock).toHaveBeenNthCalledWith(1, 123456789);
    expect(processNifWithNifPtMock).toHaveBeenNthCalledWith(2, 987654321);
    expect(deleteBatchMock).not.toHaveBeenCalled();
    expect(sendMessageMock).toHaveBeenCalledWith("Failed to process nif 123456789 with NIF.pt");
  });

  it("should not remove nifs that throw an error while processing", async () => {
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

    getCreditsMock.mockResolvedValue({
      month: 963,
      day: 96,
      hour: 6,
      minute: 2,
      paid: 0
    } as Credit);

    processNifWithNifPtMock.mockRejectedValue(new Error("An error occurred."));

    const response = await handler();

    expect(response).toEqual(undefined);
    expect(processNifWithNifPtMock).toHaveBeenNthCalledWith(1, 123456789);
    expect(processNifWithNifPtMock).toHaveBeenNthCalledWith(2, 987654321);
    expect(deleteBatchMock).not.toHaveBeenCalled();
    expect(sendMessageMock).toHaveBeenCalledWith(
      "Error thrown processing nif 123456789 with NIF.pt, error: An error occurred."
    );
  });
});
