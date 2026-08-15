import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import type { Company } from "../../infrastructure/companiesTable/types";
import { searchObjects } from "../../infrastructure/utils/algolia";
import { createHttpResponse } from "../../infrastructure/utils/createHttpResponse";
import { getEnvironmentVariable } from "../../infrastructure/utils/getEnvironmentVariable";

const companiesIndex = getEnvironmentVariable("ALGOLIA_COMPANIES_INDEX");

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const query = event.pathParameters?.query;

  if (!query || query === "") {
    return {
      body: "query is not valid",
      statusCode: 400
    };
  }

  const companies = await searchObjects<Company>(companiesIndex, query);

  return createHttpResponse(200, JSON.stringify(companies));
};
