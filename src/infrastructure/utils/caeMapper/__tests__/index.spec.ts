import { Categories } from "../../../companiesTable/types";
import { mapCaeRev3ToCategory, mapCaeRev4ToCategory } from "../index";

describe("caeMapper", () => {
  describe("mapCaeRev3ToCategory", () => {
    it("should return a category when it fully maps to CAE", () => {
      expect(mapCaeRev3ToCategory("47730")).toEqual(Categories.Saude);
    });

    it("should return a category when it partially maps to CAE", () => {
      expect(mapCaeRev3ToCategory("56303")).toEqual(Categories["Alimentacao/Hotelaria"]);
      expect(mapCaeRev3ToCategory("563")).toEqual(Categories["Alimentacao/Hotelaria"]);
    });

    it("should return undefined if no condition is matched", () => {
      expect(mapCaeRev3ToCategory("12303")).toEqual(undefined);
    });
  });

  describe("mapCaeRev4ToCategory", () => {
    it("should return a category when it fully maps to CAE", () => {
      expect(mapCaeRev4ToCategory("47740")).toEqual(Categories.Saude);
    });

    it("should return a category when it partially maps to CAE", () => {
      expect(mapCaeRev4ToCategory("9622")).toEqual(Categories.Cabeleireiro);
    });

    it("should return undefined if no condition is matched", () => {
      expect(mapCaeRev4ToCategory("12303")).toEqual(undefined);
    });
  });
});
