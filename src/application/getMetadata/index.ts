import type { APIGatewayProxyResult } from "aws-lambda";
import { getCompaniesTableMetadata } from "../../infrastructure/companiesTable";
import { getUnprocessedCompaniesTableMetadata } from "../../infrastructure/unprocessedCompaniesTable";
import { createHttpResponse } from "../../infrastructure/utils/createHttpResponse";
import type { GetMetadataResponse } from "./types";

export const handler = async (): Promise<APIGatewayProxyResult> => {
  const companiesTableMetadata = await getCompaniesTableMetadata();
  const unprocessedCompaniesTableMetadata = await getUnprocessedCompaniesTableMetadata();

  const metadata: GetMetadataResponse = {
    companiesTable: {
      itemCount: companiesTableMetadata.Table?.ItemCount ?? 0
    },
    unprocessedCompaniesTable: {
      itemCount: unprocessedCompaniesTableMetadata.Table?.ItemCount ?? 0
    }
  };

  return createHttpResponse(200, JSON.stringify(metadata));
};
