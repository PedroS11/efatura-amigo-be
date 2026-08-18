import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { searchCompanies } from "../../infrastructure/companiesIndex";
import type { SearchCompaniesResponse } from "../../infrastructure/companiesIndex/types";
import { createHttpResponse } from "../../infrastructure/utils/createHttpResponse";
import { type SearchCompaniesQueryParams, SearchCompaniesQueryParamsSchema } from "./types";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const result = SearchCompaniesQueryParamsSchema.safeParse(event.queryStringParameters);

  if (!result.success) {
    return createHttpResponse(400, {
      message: "Invalid query string",
      issues: result.error.issues
    });
  }

  const { query, page }: SearchCompaniesQueryParams = result.data;

  const searchResults: SearchCompaniesResponse = await searchCompanies(query, page);

  return createHttpResponse(200, JSON.stringify(searchResults));
};
