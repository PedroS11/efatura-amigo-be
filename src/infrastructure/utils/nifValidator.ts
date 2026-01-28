export const isNifValid = (nif: string | undefined): boolean => {
  if (!nif || nif.length !== 9) {
    return false;
  }

  const validationSets = {
    one: ["1", "2", "3", "5", "6", "8"],
    two: ["45", "70", "71", "72", "74", "75", "77", "79", "90", "91", "98", "99"]
  };

  if (!validationSets.one.includes(nif.substring(0, 1)) && !validationSets.two.includes(nif.substring(0, 2))) {
    return false;
  }

  const nifNumbers = nif.split("").map(c => Number.parseInt(c));

  const total =
    nifNumbers[0] * 9 +
    nifNumbers[1] * 8 +
    nifNumbers[2] * 7 +
    nifNumbers[3] * 6 +
    nifNumbers[4] * 5 +
    nifNumbers[5] * 4 +
    nifNumbers[6] * 3 +
    nifNumbers[7] * 2;

  const modulo11 = Number(total) % 11;
  const checkDigit = modulo11 < 2 ? 0 : 11 - modulo11;
  return checkDigit === Number(nif[8]);
};
