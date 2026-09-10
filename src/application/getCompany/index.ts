import type { APIGatewayProxyStructuredResultV2 } from "aws-lambda";

import { getCompany } from "../../infrastructure/companiesTable";
import type { APIGatewayProxyEventV2WithContext } from "../../infrastructure/utils/aws/apiGateway/types";
import { createHttpResponse } from "../../infrastructure/utils/createHttpResponse";
import { isNifValid } from "../../infrastructure/utils/nifValidator";

export const handler = async (event: APIGatewayProxyEventV2WithContext): Promise<APIGatewayProxyStructuredResultV2> => {
  const nifPath = event.pathParameters?.nif;

  if (!isNifValid(nifPath)) {
    return createHttpResponse(
      400,
      {
        message: "Nif is missing or invalid number"
      },
      event.headers?.origin
    );
  }

  const nif = Number(nifPath);

  const company = await getCompany(nif);

  if (!company) {
    return createHttpResponse(404, { message: "Not Found" }, event.headers?.origin);
  }

  return createHttpResponse(200, JSON.stringify(company), event.headers?.origin);
};
