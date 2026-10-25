/**
 * Resolves after the given delay.
 *
 * @param {number} time - Delay in milliseconds before the promise resolves.
 */
export const wait = (time: number) => new Promise(resolve => setTimeout(resolve, time));

/**
 * Unix epoch timestamp in whole seconds for the current instant, optionally shifted forward.
 *
 * @param {number} [offsetInSeconds=0] - Seconds to add to the current time before converting.
 * @returns {number} `Math.floor` of current Unix time plus the offset, in seconds.
 */
export const calculateExpiresAtInSecs = (offsetInSeconds: number = 0): number =>
  Math.floor((Date.now() + offsetInSeconds * 1000) / 1000);
