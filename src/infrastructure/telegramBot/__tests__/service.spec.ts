import { getBotInstance } from "../service";

describe("service", () => {
  describe("getBotInstance", () => {
    it("should return the same Telegram instance", () => {
      const instance1 = getBotInstance();
      const instance2 = getBotInstance();

      expect(instance1).toEqual(instance2);
    });
  });
});
