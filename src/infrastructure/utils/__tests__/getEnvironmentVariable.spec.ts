import { getEnvironmentVariable } from "../getEnvironmentVariable";

describe("getEnvironmentVariable", () => {
  it("should get a env var", () => {
    expect(getEnvironmentVariable("NIF_PT_API_KEY")).toEqual("__API_KEY__");
  });

  it("should throw if env var doesn't exist", () => {
    expect(() => getEnvironmentVariable("NO_ENV")).toThrowError("Missing environment variable NO_ENV");
  });
});
