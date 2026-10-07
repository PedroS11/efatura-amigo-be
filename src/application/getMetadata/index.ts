import type { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { getCompaniesTableMetadata } from "../../infrastructure/companiesTable";
import { getCredits } from "../../infrastructure/nif-pt";
import { getUnprocessedCompaniesTableMetadata } from "../../infrastructure/unprocessedCompaniesTable";
import type { APIGatewayProxyEventV2WithContext } from "../../infrastructure/utils/aws/apiGateway/types";
import { getQueueAttributes } from "../../infrastructure/utils/aws/sqs/getQueueAttributes";
import { createHttpResponse } from "../../infrastructure/utils/createHttpResponse";
import { getEnvironmentVariable } from "../../infrastructure/utils/getEnvironmentVariable";
import { logError } from "../../infrastructure/utils/logger";
import type { GetMetadataResponse } from "./types";

export const handler = async (event: APIGatewayProxyEventV2WithContext): Promise<APIGatewayProxyStructuredResultV2> => {
  const [companiesTableMetadata, unprocessedCompaniesTableMetadata, credits, updateToAlgoliaDLQMetadata] =
    await Promise.all([
      getCompaniesTableMetadata(),
      getUnprocessedCompaniesTableMetadata(),
      getCredits().catch((error: unknown) => {
        logError("Failed to fetch NIF.pt credits", error);
        return null;
      }),
      getQueueAttributes(getEnvironmentVariable("UPDATE_TO_ALGOLIA_DLQ"), ["ApproximateNumberOfMessages"])
    ]);

  const metadata: GetMetadataResponse = {
    companiesTable: {
      itemCount: companiesTableMetadata.Table?.ItemCount ?? 0
    },
    unprocessedCompaniesTable: {
      itemCount: unprocessedCompaniesTableMetadata.Table?.ItemCount ?? 0
    },
    nifPt: {
      credits
    },
    updateToAlgoliaDLQ: {
      messagesCount: Number(updateToAlgoliaDLQMetadata?.Attributes?.ApproximateNumberOfMessages ?? 0)
    }
  };

  return createHttpResponse(200, JSON.stringify(metadata), event.headers?.origin);
};
