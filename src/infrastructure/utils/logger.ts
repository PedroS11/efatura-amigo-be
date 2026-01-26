export const logMessage = (message: string, data: unknown = {}) =>
  console.log({
    message,
    data: JSON.stringify(data)
  });

export const logError = (message: string, data: unknown = {}) =>
  console.log({
    message,
    data: JSON.stringify(data)
  });
