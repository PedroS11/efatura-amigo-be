import { getDynamoInstance } from "../utils";

describe("utils", () => {
  describe("getDynamoInstance", () => {
    it("should return the same DynamoDBDocumentClient instance", () => {
      const instance1 = getDynamoInstance();
      const instance2 = getDynamoInstance();

      expect(instance1).toEqual(instance2);
    });
  });
});
