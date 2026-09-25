const { mockAddOrUpdateObject, mockSearch, mockDeleteObject } = vi.hoisted(() => ({
  mockAddOrUpdateObject: vi.fn(),
  mockSearch: vi.fn(),
  mockDeleteObject: vi.fn()
}));

vi.mock("algoliasearch", () => ({
  algoliasearch: vi.fn(() => ({
    addOrUpdateObject: mockAddOrUpdateObject,
    deleteObject: mockDeleteObject,
    search: mockSearch
  }))
}));

import { deleteObject, saveObject, searchObjects } from "../index";

describe("algolia", () => {
  afterEach(vi.resetAllMocks);

  describe("saveObject", () => {
    it("should add or update an object in the index", async () => {
      const item = {
        nif: 123456789,
        name: "Company name"
      };
      const expectedResponse = {
        taskID: 1,
        updatedAt: "2026-01-01T00:00:00.000Z"
      };

      mockAddOrUpdateObject.mockResolvedValue(expectedResponse);

      const response = await saveObject("__COMPANIES_INDEX__", "123456789", item);
      expect(response).toEqual(expectedResponse);
      expect(mockAddOrUpdateObject).toHaveBeenCalledWith({
        body: item,
        objectID: "123456789",
        indexName: "__COMPANIES_INDEX__"
      });
    });
  });

  describe("searchObjects", () => {
    it("should search objects in the index", async () => {
      const searchResult = {
        hits: [],
        nbHits: 0,
        page: 0,
        nbPages: 0,
        hitsPerPage: 20,
        exhaustiveNbHits: true,
        exhaustiveTypo: true,
        query: "company",
        params: "query=company"
      };

      mockSearch.mockResolvedValue({
        results: [searchResult]
      });

      await expect(searchObjects("__COMPANIES_INDEX__", "company", 0)).resolves.toEqual(searchResult);
      expect(mockSearch).toHaveBeenCalledWith({
        requests: [
          {
            indexName: "__COMPANIES_INDEX__",
            query: "company",
            page: 0
          }
        ]
      });
    });
  });

  describe("deleteObject", () => {
    it("should delete an object from the index", async () => {
      const expectedResponse = {
        taskID: 1,
        deletedAt: "2026-01-01T00:00:00.000Z"
      };

      mockDeleteObject.mockResolvedValue(expectedResponse);

      const response = await deleteObject("__COMPANIES_INDEX__", "123456789");
      expect(response).toEqual(expectedResponse);
      expect(mockDeleteObject).toHaveBeenCalledWith({
        objectID: "123456789",
        indexName: "__COMPANIES_INDEX__"
      });
    });
  });
});
