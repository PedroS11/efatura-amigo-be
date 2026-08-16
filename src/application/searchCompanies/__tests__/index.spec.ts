import type { APIGatewayEvent } from "aws-lambda";
import type { MockInstance } from "vitest";

import { searchCompanies } from "../../../infrastructure/companiesIndex";
import { Categories, type Company } from "../../../infrastructure/companiesTable/types";
import { handler } from "../index";

vi.mock("../../../infrastructure/companiesIndex");

describe("handler", () => {
  let searchCompaniesMock: MockInstance;

  const httpHeaders = {
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,GET",
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  beforeEach(() => {
    searchCompaniesMock = vi.mocked(searchCompanies);
  });

  afterEach(vi.resetAllMocks);

  it("should return 400 if query string parameters are invalid", async () => {
    const response = await handler({
      queryStringParameters: {
        page: "-1"
      }
    } as unknown as APIGatewayEvent);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toMatchObject({
      message: "Invalid query string"
    });
    expect(searchCompaniesMock).not.toHaveBeenCalled();
  });

  it("should return 400 if query is missing", async () => {
    const response = await handler({
      queryStringParameters: {}
    } as unknown as APIGatewayEvent);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toMatchObject({
      message: "Invalid query string"
    });
    expect(searchCompaniesMock).not.toHaveBeenCalled();
  });

  it("should return search results", async () => {
    const companies: Company[] = [
      {
        nif: 123456789,
        name: "Company name",
        category: Categories.Educacao,
        updatedAt: 949410000000
      }
    ];

    searchCompaniesMock.mockResolvedValue(companies);

    const response = await handler({
      queryStringParameters: {
        query: "company"
      }
    } as unknown as APIGatewayEvent);

    expect(response).toEqual({
      body: JSON.stringify(companies),
      headers: httpHeaders,
      statusCode: 200
    });
    expect(searchCompaniesMock).toHaveBeenCalledWith("company", undefined);
  });

  it("should pass page to searchCompanies when provided", async () => {
    searchCompaniesMock.mockResolvedValue([]);

    await handler({
      queryStringParameters: {
        query: "company",
        page: "2"
      }
    } as unknown as APIGatewayEvent);

    expect(searchCompaniesMock).toHaveBeenCalledWith("company", 2);
  });
});
