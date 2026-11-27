import type { Categories } from "../../companiesTable/types";
import { EXACT_CAE_REV3_MAP, PREFIX_CAE_REV3_MAP } from "./rev3/constants";

export const mapCaeRev3ToCategory = (cae: string): Categories | undefined => {
  const caeStr = cae.padStart(5, "0");

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

export const mapCaeRev4ToCategory = (cae: string): Categories | undefined => {
  const caePadded = cae.padStart(5, "0");

  // Check for an exact 5-digit match
  if (EXACT_CAE_REV3_MAP[caePadded] !== undefined) {
    return EXACT_CAE_REV3_MAP[caePadded];
  }

  // Check for prefix matches (ordered from longest prefix to shortest)
  // Longest -> more granular so closer to a match
  const prefixes = Object.keys(PREFIX_CAE_REV3_MAP).sort((a, b) => b.length - a.length);
  for (const prefix of prefixes) {
    if (caePadded.startsWith(prefix)) {
      return PREFIX_CAE_REV3_MAP[prefix];
    }
  }

  return undefined;
};
