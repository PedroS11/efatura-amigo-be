import { describe, expect, it } from "vitest";

import { Categories } from "../../../companiesTable/types";
import { mapCaeToCategory } from "../index";

describe("caeMapper", () => {
  it("should return a category when it fully maps to CAE", () => {
    expect(mapCaeToCategory("47730")).toEqual(Categories.Saude);
  });

  it("should return a category when it partially maps to CAE", () => {
    expect(mapCaeToCategory("56303")).toEqual(Categories["Alimentacao/Hotelaria"]);
  });

  it("should return undefined if no condition is matched", () => {
    expect(mapCaeToCategory("12303")).toEqual(undefined);
  });
});
