export const wait = (time: number) => new Promise(resolve => setTimeout(resolve, time));

export const calculateExpiresAtInSecs = (offsetInSeconds: number = 0): number =>
  Math.floor((Date.now() + offsetInSeconds * 1000) / 1000);
