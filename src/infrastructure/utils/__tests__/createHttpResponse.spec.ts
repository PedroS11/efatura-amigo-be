import { createHttpResponse } from "../createHttpResponse";
import { expectedHttpHeaders } from "./expectedHttpHeaders";

describe("createHttpResponse", () => {
  it("should create a 200 response", () => {
    const body = { test: "yes" };
    expect(createHttpResponse(200, JSON.stringify(body))).toEqual({
      body: '{"test":"yes"}',
      headers: expectedHttpHeaders,
      statusCode: 200
    });
  });
});
