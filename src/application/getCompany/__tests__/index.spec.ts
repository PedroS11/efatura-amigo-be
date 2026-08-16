import type { APIGatewayEvent } from "aws-lambda";
import type { MockInstance } from "vitest";

import { getCompany } from "../../../infrastructure/companiesTable";
import { Categories, type Company } from "../../../infrastructure/companiesTable/types";
import { handler } from "../index";

vi.mock("../../../infrastructure/companiesTable");

describe("handler", () => {
  let getCompanyMock: MockInstance;

  const httpHeaders = {
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,GET",
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  beforeEach(() => {
    getCompanyMock = vi.mocked(getCompany);
  });

  afterEach(vi.resetAllMocks);

  it("should return 400 if nif is invalid", async () => {
    const response = await handler({
      pathParameters: {
        nif: ""
      }
    } as unknown as APIGatewayEvent);

    expect(response).toEqual({
      body: JSON.stringify({
        message: "Nif is missing or invalid number"
      }),
      headers: httpHeaders,
      statusCode: 400
    });
    expect(getCompanyMock).not.toHaveBeenCalled();
  });

  it("should return 404 if company is not found", async () => {
    getCompanyMock.mockResolvedValue(undefined);

    const response = await handler({
      pathParameters: {
        nif: "502258241"
      }
    } as unknown as APIGatewayEvent);

    expect(response).toEqual({
      body: "Not Found",
      headers: httpHeaders,
      statusCode: 404
    });
    expect(getCompanyMock).toHaveBeenCalledWith(502258241);
  });

  it("should return company when it exists", async () => {
    const company: Company = {
      nif: 502258241,
      name: "Company name",
      category: Categories.Educacao,
      caeRev3: "88910",
      updatedAt: 949410000000
    };

    getCompanyMock.mockResolvedValue(company);

    const response = await handler({
      pathParameters: {
        nif: "502258241"
      }
    } as unknown as APIGatewayEvent);

    expect(response).toEqual({
      body: JSON.stringify(company),
      headers: httpHeaders,
      statusCode: 200
    });
    expect(getCompanyMock).toHaveBeenCalledWith(502258241);
  });
});
