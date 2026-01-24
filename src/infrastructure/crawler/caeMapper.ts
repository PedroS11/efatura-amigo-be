import { Categories } from "../nifCategoryTable/types";

export const mapCaeToCategory = (cae: number): Categories | undefined => {
  if (cae === 56303) {
    return Categories["Alimentacao/Hotelaria"];
  }

  return undefined;
};
