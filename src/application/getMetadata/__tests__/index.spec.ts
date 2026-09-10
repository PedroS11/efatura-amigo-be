import type { MockInstance } from "vitest";

import { getCompaniesTableMetadata } from "../../../infrastructure/companiesTable";
import { getCredits } from "../../../infrastructure/nif-pt";
import type { Credit } from "../../../infrastructure/nif-pt/types";
import { getUnprocessedCompaniesTableMetadata } from "../../../infrastructure/unprocessedCompaniesTable";
import { expectedHttpHeaders } from "../../../infrastructure/utils/__tests__/__fixtures__/expectedHttpHeaders";
import type { APIGatewayProxyEventV2WithContext } from "../../../infrastructure/utils/aws/apiGateway/types";
import { handler } from "../index";

vi.mock("../../../infrastructure/companiesTable");
vi.mock("../../../infrastructure/unprocessedCompaniesTable");
vi.mock("../../../infrastructure/nif-pt");

describe("handler", () => {
  let getCompaniesTableMetadataMock: MockInstance;
  let getUnprocessedCompaniesTableMetadataMock: MockInstance;
  let getCreditsMock: MockInstance;

  const credits = {
    month: 963,
    day: 96,
    hour: 6,
    minute: 1,
    paid: 0
  } as Credit;

  beforeEach(() => {
    getCompaniesTableMetadataMock = vi.mocked(getCompaniesTableMetadata);
    getUnprocessedCompaniesTableMetadataMock = vi.mocked(getUnprocessedCompaniesTableMetadata);
    getCreditsMock = vi.mocked(getCredits);
  });

  afterEach(vi.resetAllMocks);

  it("should return metadata from all sources", async () => {
    getCompaniesTableMetadataMock.mockResolvedValue({
      Table: { ItemCount: 42 }
    });
    getUnprocessedCompaniesTableMetadataMock.mockResolvedValue({
      Table: { ItemCount: 7 }
    });
    getCreditsMock.mockResolvedValue(credits);

    const response = await handler({
      headers: {
        origin: "http://localhost:5173"
      }
    } as unknown as APIGatewayProxyEventV2WithContext);

    expect(response).toEqual({
      body: JSON.stringify({
        companiesTable: { itemCount: 42 },
        unprocessedCompaniesTable: { itemCount: 7 },
        nifPt: { credits }
      }),
      headers: expectedHttpHeaders,
      statusCode: 200
    });
  });

  it("should default item counts to zero when table metadata is missing", async () => {
    getCompaniesTableMetadataMock.mockResolvedValue({});
    getUnprocessedCompaniesTableMetadataMock.mockResolvedValue({});
    getCreditsMock.mockResolvedValue(credits);

    const response = await handler({
      headers: {
        origin: "http://localhost:5173"
      }
    } as unknown as APIGatewayProxyEventV2WithContext);

    expect(response).toEqual({
      body: JSON.stringify({
        companiesTable: { itemCount: 0 },
        unprocessedCompaniesTable: { itemCount: 0 },
        nifPt: { credits }
      }),
      headers: expectedHttpHeaders,
      statusCode: 200
    });
  });
});
