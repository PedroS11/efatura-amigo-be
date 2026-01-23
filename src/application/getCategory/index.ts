import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { getCategory } from "../../infrastructure/nifCategoryTable/nifCategoryTableRepository";
import { sendMessage } from "../../infrastructure/sqs/sqsService";
import type { ProcessNifMessage } from "../processNif";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const nif = event.pathParameters?.nif;

  if (!nif) {
    return {
      body: "",
      statusCode: 400
    };
  }

  const category = await getCategory(nif);

  if (category === undefined) {
    await sendMessage({ nif } as ProcessNifMessage, "");
  }

  return {
    body: JSON.stringify({ category }),
    statusCode: 200
  };
};
