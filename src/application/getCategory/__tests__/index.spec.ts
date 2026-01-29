import type { APIGatewayEvent } from "aws-lambda";
import type { MockInstance } from "vitest";
import { expect } from "vitest";

import { getCategory } from "../../../infrastructure/companiesTable";
import { Categories } from "../../../infrastructure/companiesTable/types";
import { addCompany } from "../../../infrastructure/unprocessedCompaniesTable";
import { handler } from "../index";

vi.mock("../../../infrastructure/companiesTable");
vi.mock("../../../infrastructure/unprocessedCompaniesTable");

describe("handler", () => {
  let getCategoryMock: MockInstance;
  let addCompanyMock: MockInstance;

  beforeEach(() => {
    getCategoryMock = vi.mocked(getCategory);
    addCompanyMock = vi.mocked(addCompany);
  });

  afterEach(vi.resetAllMocks);

  it("should return 400 if nif isn't valid", async () => {
    const response = await handler({
      pathParameters: {
        nif: ""
      }
    } as unknown as APIGatewayEvent);

    expect(response).toEqual({
      body: "Nif is missing or invalid number",
      statusCode: 400
    });
  });

  it("should the category if nif exists in the database", async () => {
    getCategoryMock.mockResolvedValue(Categories.Educacao);
    const response = await handler({
      pathParameters: {
        nif: "123456789"
      }
    } as unknown as APIGatewayEvent);

    expect(response).toEqual({
      body: '{"id":2,"name":"Educacao"}',
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,GET",
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      statusCode: 200
    });
    expect(getCategoryMock).toHaveBeenCalledWith(123456789);
    expect(addCompanyMock).not.toHaveBeenCalled();
  });

  it("should return empty object if nif doesn't exist in the database", async () => {
    getCategoryMock.mockResolvedValue(undefined);

    const response = await handler({
      pathParameters: {
        nif: "123456789"
      }
    } as unknown as APIGatewayEvent);

    expect(response).toEqual({
      body: "{}",
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,GET",
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      statusCode: 200
    });
    expect(getCategoryMock).toHaveBeenCalledWith(123456789);
    expect(addCompanyMock).toHaveBeenCalledWith(123456789);
  });
});
