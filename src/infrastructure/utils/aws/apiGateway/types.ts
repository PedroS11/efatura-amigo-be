import type { APIGatewayProxyEventV2 } from "aws-lambda";
import type { VerifiedGoogleUser } from "../../../auth/types";

export type APIGatewayProxyEventV2WithContext = Omit<APIGatewayProxyEventV2, "requestContext"> & {
  requestContext: Omit<APIGatewayProxyEventV2["requestContext"], "authorizer"> & {
    authorizer: {
      lambda: VerifiedGoogleUser;
    };
  };
};
