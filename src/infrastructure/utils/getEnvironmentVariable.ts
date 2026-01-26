/**
 * Extracts an environment variable from process.env
 * @param {string} variableName - The variable to get
 * @returns {string} - The environment variable's value
 * @throws {Error} - If the variable does not exist in process.env
 */
export const getEnvironmentVariable = (variableName: string): string => {
  const envVar = process.env[variableName];
  if (!envVar) throw new Error(`Missing environment variable ${variableName}`);

  return envVar;
};
