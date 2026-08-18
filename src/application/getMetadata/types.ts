import type { Credit } from "../../infrastructure/nif-pt/types";

export interface GetMetadataResponse {
  companiesTable: {
    itemCount: number;
  };
  unprocessedCompaniesTable: {
    itemCount: number;
  };
  nifPt: {
    credits: Credit;
  };
}
