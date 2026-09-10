import { generateCookie, generateDeleteCookie } from "../cookies";

describe("cookies", () => {
  describe("generateCookie", () => {
    it("should create a valid cookie", async () => {
      expect(generateCookie("123")).toEqual(
        "__Host-session=123; Max-Age=604800; Path=/; HttpOnly; Secure; SameSite=Lax"
      );
    });
  });

  describe(generateDeleteCookie, () => {
    it("should create a valid delete cookie", async () => {
      expect(generateDeleteCookie()).toEqual("__Host-session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax");
    });
  });
});
