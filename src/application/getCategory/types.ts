import type { Categories } from "../../infrastructure/companiesTable/types";

export interface GetCategoryResponse {
  category?: {
    id: Categories;
    name: string;
  };
}
