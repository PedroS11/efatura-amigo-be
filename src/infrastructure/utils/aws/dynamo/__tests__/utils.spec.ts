import { getDynamoInstance, mapFilterToFilterExpression } from "../utils";

describe("utils", () => {
  describe("getDynamoInstance", () => {
    it("should return the same DynamoDBDocumentClient instance", () => {
      const instance1 = getDynamoInstance();
      const instance2 = getDynamoInstance();

      expect(instance1).toEqual(instance2);
    });
  });

  describe("mapFilterToFilterExpression", () => {
    it("should map equality filters to a filter expression", () => {
      const result = mapFilterToFilterExpression([
        {
          column: "category",
          comparator: "=",
          value: 2
        }
      ]);

      expect(result).toEqual({
        expressionAttributeNames: {
          "#category": "category"
        },
        expressionAttributeValues: {
          ":category": 2
        },
        filterExpression: "#category = :category"
      });
    });

    it("should map attribute_not_exists filters without values", () => {
      const result = mapFilterToFilterExpression([
        {
          column: "caeRev3",
          comparator: "attribute_not_exists",
          value: undefined
        }
      ]);

      expect(result).toEqual({
        expressionAttributeNames: {
          "#caeRev3": "caeRev3"
        },
        expressionAttributeValues: {},
        filterExpression: "attribute_not_exists(#caeRev3)"
      });
    });

    it("should combine multiple filters with AND", () => {
      const result = mapFilterToFilterExpression([
        {
          column: "name",
          comparator: "<>",
          value: "NOT_FOUND"
        },
        {
          column: "category",
          comparator: ">=",
          value: 7
        }
      ]);

      expect(result).toEqual({
        expressionAttributeNames: {
          "#name": "name",
          "#category": "category"
        },
        expressionAttributeValues: {
          ":name": "NOT_FOUND",
          ":category": 7
        },
        filterExpression: "#name <> :name AND #category >= :category"
      });
    });
  });
});
