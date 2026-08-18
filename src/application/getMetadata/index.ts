import type { APIGatewayProxyResult } from "aws-lambda";
import { getCompaniesTableMetadata } from "../../infrastructure/companiesTable";
import { getCredits } from "../../infrastructure/nif-pt";
import { getUnprocessedCompaniesTableMetadata } from "../../infrastructure/unprocessedCompaniesTable";
import { createHttpResponse } from "../../infrastructure/utils/createHttpResponse";
import type { GetMetadataResponse } from "./types";

export const handler = async (): Promise<APIGatewayProxyResult> => {
  const companiesTableMetadata = await getCompaniesTableMetadata();
  const unprocessedCompaniesTableMetadata = await getUnprocessedCompaniesTableMetadata();
  const credits = await getCredits();

  const metadata: GetMetadataResponse = {
    companiesTable: {
      itemCount: companiesTableMetadata.Table?.ItemCount ?? 0
    },
    unprocessedCompaniesTable: {
      itemCount: unprocessedCompaniesTableMetadata.Table?.ItemCount ?? 0
    },
    nifPt: {
      credits
    }
  };

  return createHttpResponse(200, JSON.stringify(metadata));
};
