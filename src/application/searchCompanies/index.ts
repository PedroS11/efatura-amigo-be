import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { searchCompanies } from "../../infrastructure/companiesIndex";
import type { Company } from "../../infrastructure/companiesTable/types";
import { createHttpResponse } from "../../infrastructure/utils/createHttpResponse";
import { type SearchCompaniesQueryParams, SearchCompaniesQueryParamsSchema } from "./types";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const result = SearchCompaniesQueryParamsSchema.safeParse(event.queryStringParameters);

  if (!result.success) {
    return createHttpResponse(400, {
      message: result.error.message,
      issues: result.error.issues
    });
  }

  const { query, page }: SearchCompaniesQueryParams = result.data;

  const companies: Company[] = await searchCompanies(query, page);

  return createHttpResponse(200, JSON.stringify(companies));
};
