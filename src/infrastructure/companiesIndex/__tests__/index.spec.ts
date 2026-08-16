import type { MockInstance } from "vitest";

import { Categories, type Company } from "../../companiesTable/types";
import { saveObject, searchObjects } from "../../utils/algolia";
import { saveCompanyInAlgolia, searchCompanies } from "../index";

vi.mock("../../utils/algolia");

describe("companiesIndex", () => {
  let searchObjectsMock: MockInstance;
  let saveObjectMock: MockInstance;

  beforeEach(() => {
    searchObjectsMock = vi.mocked(searchObjects);
    saveObjectMock = vi.mocked(saveObject);
  });

  afterEach(vi.resetAllMocks);

  describe("searchCompanies", () => {
    it("should return companies without Algolia metadata", async () => {
      searchObjectsMock.mockResolvedValue({
        hits: [
          {
            nif: 123456789,
            name: "Company name",
            category: Categories.Educacao,
            updatedAt: 949410000000,
            _highlightResult: {
              name: {
                value: "Company name"
              }
            }
          }
        ]
      });

      const companies = await searchCompanies("company", 0);

      expect(companies).toEqual([
        {
          nif: 123456789,
          name: "Company name",
          category: Categories.Educacao,
          updatedAt: 949410000000
        }
      ]);
      expect(searchObjectsMock).toHaveBeenCalledWith("__COMPANIES_INDEX__", "company", 0);
    });
  });

  describe("saveCompanyInAlgolia", () => {
    it("should save company using nif as object id", async () => {
      const company: Company = {
        nif: 123456789,
        name: "Company name",
        category: Categories.Educacao,
        updatedAt: 949410000000
      };

      await saveCompanyInAlgolia(company);

      expect(saveObjectMock).toHaveBeenCalledWith("__COMPANIES_INDEX__", "123456789", company);
    });
  });
});
