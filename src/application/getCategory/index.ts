import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { getCompany } from "../../infrastructure/companiesTable";
import { Categories } from "../../infrastructure/companiesTable/types";
import { addCompany } from "../../infrastructure/unprocessedCompaniesTable";
import { createHttpResponse } from "../../infrastructure/utils/createHttpResponse";
import { isNifValid } from "../../infrastructure/utils/nifValidator";
import type { GetCategoryResponse } from "./types";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const nifPath = event.pathParameters?.nif;

  if (!isNifValid(nifPath)) {
    return {
      body: "Nif is missing or invalid number",
      statusCode: 400
    };
  }

  const nif = Number(nifPath);

  const company = await getCompany(nif);

  let body: GetCategoryResponse = {};

  // Category not in the DB
  if (company === undefined) {
    await addCompany(nif);
    // Category in the database with a valid category
  } else if (company.category !== undefined) {
    body = {
      id: company.category,
      name: Categories[company.category]
    };
  }

  return createHttpResponse(200, JSON.stringify(body));
};
