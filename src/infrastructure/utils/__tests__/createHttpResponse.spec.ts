import { createHttpResponse } from "../createHttpResponse";
import { expectedHttpHeaders } from "./__fixtures__/expectedHttpHeaders";

describe("createHttpResponse", () => {
  it("should create a 200 response", () => {
    const body = { test: "yes" };
    expect(createHttpResponse(200, JSON.stringify(body))).toEqual({
      body: '{"test":"yes"}',
      headers: {
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
        "Content-Type": "application/json"
      },
      statusCode: 200
    });
  });

  it("should create a response with passed origin", () => {
    const body = { test: "yes" };
    expect(createHttpResponse(200, JSON.stringify(body), "http://localhost:5173")).toEqual({
      body: '{"test":"yes"}',
      headers: {
        ...expectedHttpHeaders,
        "Access-Control-Allow-Origin": "http://localhost:5173"
      },
      statusCode: 200
    });
  });

  it("should create a response with passed origin and cookies", () => {
    const body = { test: "yes" };
    expect(
      createHttpResponse(200, JSON.stringify(body), "http://localhost:5173", undefined, [
        "__Host-session=123; Max-Age=604800; Path=/; HttpOnly; Secure; SameSite=Lax"
      ])
    ).toEqual({
      body: '{"test":"yes"}',
      headers: {
        ...expectedHttpHeaders,
        "Access-Control-Allow-Origin": "http://localhost:5173"
      },
      cookies: ["__Host-session=123; Max-Age=604800; Path=/; HttpOnly; Secure; SameSite=Lax"],
      statusCode: 200
    });
  });

  it("should create a response with passed origin, header and cookies", () => {
    const body = { test: "yes" };
    expect(
      createHttpResponse(
        200,
        JSON.stringify(body),
        "http://localhost:5173",
        {
          Authorization: `Bearer __TOKEN__`
        },
        ["__Host-session=123; Max-Age=604800; Path=/; HttpOnly; Secure; SameSite=Lax"]
      )
    ).toEqual({
      body: '{"test":"yes"}',
      headers: {
        ...expectedHttpHeaders,
        "Access-Control-Allow-Origin": "http://localhost:5173",
        Authorization: "Bearer __TOKEN__"
      },
      cookies: ["__Host-session=123; Max-Age=604800; Path=/; HttpOnly; Secure; SameSite=Lax"],
      statusCode: 200
    });
  });
});
