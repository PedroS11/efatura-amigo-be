import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { getCompany } from "../../infrastructure/companiesTable";
import { createHttpResponse } from "../../infrastructure/utils/createHttpResponse";
import { isNifValid } from "../../infrastructure/utils/nifValidator";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const nifPath = event.pathParameters?.nif;

  if (!isNifValid(nifPath)) {
    return createHttpResponse(400, {
      message: "Nif is missing or invalid number"
    });
  }

  const nif = Number(nifPath);

  const company = await getCompany(nif);

  if (!company) {
    return createHttpResponse(404, "Not Found");
  }

  return createHttpResponse(200, JSON.stringify(company));
};
