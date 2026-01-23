import type { Categories } from "../nifCategoryTable/types";
import { findCategory } from "./einforma";

export const crawlCategory = async (nif: string): Promise<Categories | undefined> => {
  const category = await findCategory(nif);
  console.log(category);
  console.log(category);

  return category;
};

(async () => {
  await crawlCategory("515198374");
})();
