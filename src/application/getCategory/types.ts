import type { Categories } from "../../infrastructure/companiesTable/types";

export interface GetCategoryResponse {
  id?: Categories;
  name?: string;
}
