import type { Categories } from "../../companiesTable/types";
import { EXACT_CAE_REV3_MAP, PREFIX_CAE_REV3_MAP } from "./constants";

export const mapCaeToCategory = (cae: number | string): Categories | undefined => {
  const caeStr = cae.toString().padStart(5, "0");

  // Check for an exact 5-digit match
  if (EXACT_CAE_REV3_MAP[caeStr] !== undefined) {
    return EXACT_CAE_REV3_MAP[caeStr];
  }

  // Check for prefix matches (ordered from longest prefix to shortest)
  // Longest -> more granular so closer to a match
  const prefixes = Object.keys(PREFIX_CAE_REV3_MAP).sort((a, b) => b.length - a.length);
  for (const prefix of prefixes) {
    if (caeStr.startsWith(prefix)) {
      return PREFIX_CAE_REV3_MAP[prefix];
    }
  }

  return undefined;
};
