import { isNifValid } from "../nifValidator";

describe("nifValidator", () => {
  it("should return true if a valid nif", async () => {
    expect(isNifValid("502258241")).toBeTruthy();
  });

  it("should return false if nif fails one of the conditions", () => {
    expect(isNifValid("")).toBeFalsy();
    expect(isNifValid("1")).toBeFalsy();
    expect(isNifValid("123456788")).toBeFalsy();
    expect(isNifValid("923156789")).toBeFalsy();
  });
});
