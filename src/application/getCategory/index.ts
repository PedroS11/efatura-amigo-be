import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { getCategory } from "../../infrastructure/nifCategoryTable";
import { sendMessage } from "../../infrastructure/sqs/sqsService";
import type { ProcessNifMessage } from "../processNif";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const nifPath = event.pathParameters?.nif;

  if (!nifPath) {
    return {
      body: "",
      statusCode: 400
    };
  }

  const nif = Number(nifPath);

  const category = await getCategory(nif);

  if (category === undefined) {
    await sendMessage({ nif } as ProcessNifMessage, process.env.PROCESS_NIF_SQS!);
  }

  return {
    body: JSON.stringify({ category }),
    statusCode: 200
  };
};
