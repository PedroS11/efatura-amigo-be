import { createHttpResponse } from "../createHttpResponse";

describe("createHttpResponse", () => {
  it("should create a 200 response", () => {
    const body = { test: "yes" };
    expect(createHttpResponse(200, JSON.stringify(body))).toEqual({
      body: '{"test":"yes"}',
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,GET",
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      statusCode: 200
    });
  });
});
