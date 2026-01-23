import { Categories } from "../nifCategoryTable/types";

export const mapCaeToCategory = (cae: string): Categories => {
  if (cae === "") {
    return Categories.Saude;
  }

  return Categories.Saude;
};
