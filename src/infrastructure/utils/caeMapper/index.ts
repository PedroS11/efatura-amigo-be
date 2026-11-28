import type { Categories } from "../../companiesTable/types";
import { EXACT_CAE_REV3_MAP, PREFIX_CAE_REV3_MAP } from "./rev3/constants";
import { EXACT_CAE_REV4_MAP, PREFIX_CAE_REV4_MAP } from "./rev4/constants";

export type CAEMapper = Record<string, Categories>;

const mapCaeToCategory = (cae: string, exactMapper: CAEMapper, prefixMapper: CAEMapper): Categories | undefined => {
  // Check for an exact match
  if (exactMapper[cae] !== undefined) {
    return exactMapper[cae];
  }

  // Check for prefix matches (ordered from longest prefix to shortest)
  // Longest -> more granular so closer to a match
  const prefixes = Object.keys(prefixMapper).sort((a, b) => b.length - a.length);
  for (const prefix of prefixes) {
    if (cae.startsWith(prefix)) {
      return prefixMapper[prefix];
    }
  }

  return undefined;
};

export const mapCaeRev3ToCategory = (cae: string): Categories | undefined =>
  mapCaeToCategory(cae, EXACT_CAE_REV3_MAP, PREFIX_CAE_REV3_MAP);

export const mapCaeRev4ToCategory = (cae: string): Categories | undefined =>
  mapCaeToCategory(cae, EXACT_CAE_REV4_MAP, PREFIX_CAE_REV4_MAP);
