import type { APIGatewayEvent, APIGatewayProxyEventHeaders, APIGatewayProxyResult } from "aws-lambda";

import { getCategory } from "../../infrastructure/companiesTable";
import { Categories } from "../../infrastructure/companiesTable/types";
import { addCompany } from "../../infrastructure/unprocessedCompaniesTable";
import type { GetCategoryResponse } from "./types";

const corsHeaders: APIGatewayProxyEventHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,GET"
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const nifPath = event.pathParameters?.nif;

  if (!nifPath || !Number.isInteger(Number.parseInt(nifPath)) || nifPath.length !== 9) {
    return {
      body: "Nif is missing or invalid number",
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
      id: categoryId,
      name: Categories[categoryId]
    } as GetCategoryResponse),
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    },
    statusCode: 200
  };
};
