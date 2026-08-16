import * as z from "zod";

export const SearchCompaniesQueryParamsSchema = z.object({
  query: z.string(),
  page: z.coerce.number().int().nonnegative().optional()
});

export type SearchCompaniesQueryParams = z.infer<typeof SearchCompaniesQueryParamsSchema>;
