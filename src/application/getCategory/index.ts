import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { getCategory } from "../../infrastructure/companiesTable";
import { Categories } from "../../infrastructure/companiesTable/types";
import { addCompany } from "../../infrastructure/unprocessedCompaniesTable";
import type { GetCategoryResponse } from "./types";

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
    await addCompany(nif);

    return {
      body: JSON.stringify({} as GetCategoryResponse),
      statusCode: 200
    };
  }

  return {
    body: JSON.stringify({
      category: {
        id: categoryId,
        name: Categories[categoryId]
      }
    } as GetCategoryResponse),
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
