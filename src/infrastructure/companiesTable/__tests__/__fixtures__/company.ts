import type { Company } from "../../types";
import { Categories } from "../../types";

export const getCompanyFixture = (): Company => ({
  nif: 123456789,
  name: "Company name",
  category: Categories.Educacao,
  updatedAt: Date.now()
});
