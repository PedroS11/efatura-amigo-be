import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { getCategory } from "../../infrastructure/nifCategoryTable";
import { Categories } from "../../infrastructure/nifCategoryTable/types";
import { sendMessage } from "../../infrastructure/sqs/sqsService";
import type { ProcessNifMessage } from "../processNif";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const nifPath = event.pathParameters?.nif;

  // TODO: Add a better validator
  if (!nifPath) {
    return {
      body: "Nif is missing",
      statusCode: 400
    };
  }

  const nif = Number(nifPath);

  const categoryId = await getCategory(nif);

  if (categoryId === undefined) {
    await sendMessage({ nif } as ProcessNifMessage, process.env.PROCESS_NIF_SQS!, nif.toString());

    return {
      body: JSON.stringify({}),
      statusCode: 200
    };
  }

  return {
    body: JSON.stringify({
      category: {
        id: categoryId,
        name: Categories[categoryId]
      }
    }),
    statusCode: 200
  };
};

// (async () => {
//   // @ts-ignore
//   const x = await handler({
//     pathParameters: {
//       nif: "515198374"
//     }
//   });
//   console.log(x);
// })();
