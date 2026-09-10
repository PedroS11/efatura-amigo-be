import { expectedHttpHeaders } from "../../../infrastructure/utils/__tests__/__fixtures__/expectedHttpHeaders";
import type { APIGatewayProxyEventV2WithContext } from "../../../infrastructure/utils/aws/apiGateway/types";
import { handler } from "../index";

describe("handler", () => {
  it("should return the verified google user data", async () => {
    const response = await handler({
      requestContext: {
        authorizer: {
          lambda: {
            sub: "__GOOGLE_SUB__",
            name: "test",
            email: "a@a.com"
          }
        }
      }
    } as unknown as APIGatewayProxyEventV2WithContext);

    expect(response).toEqual({
      body: JSON.stringify({
        sub: "__GOOGLE_SUB__",
        name: "test",
        email: "a@a.com"
      }),
      headers: expectedHttpHeaders,
      statusCode: 200
    });
  });
});
