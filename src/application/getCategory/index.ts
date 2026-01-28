import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { getCategory } from "../../infrastructure/companiesTable";
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

  const categoryId = await getCategory(nif);

  let body: GetCategoryResponse = {};

  if (categoryId === undefined) {
    await addCompany(nif);
  } else {
    body = {
      id: categoryId,
      name: Categories[categoryId]
    };
  }

  return createHttpResponse(200, JSON.stringify(body));
};
