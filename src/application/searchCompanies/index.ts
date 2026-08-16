import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import type { Company } from "../../infrastructure/companiesTable/types";
import { searchObjects } from "../../infrastructure/utils/algolia";
import { createHttpResponse } from "../../infrastructure/utils/createHttpResponse";
import { getEnvironmentVariable } from "../../infrastructure/utils/getEnvironmentVariable";

const companiesIndex = getEnvironmentVariable("ALGOLIA_COMPANIES_INDEX");

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const query = event.queryStringParameters?.query;

  if (!query || query === "") {
    return createHttpResponse(400, "No query send");
  }

  const pagePath = event.queryStringParameters?.page;

  let page: number | undefined;
  if (pagePath) {
    page = parseInt(pagePath, 10);

    if (page < 0) {
      return createHttpResponse(400, "Page must be greater or equal than 0");
    }
  }

  const companies = await searchObjects<Company>(companiesIndex, query, page);

  return createHttpResponse(200, JSON.stringify(companies));
};
