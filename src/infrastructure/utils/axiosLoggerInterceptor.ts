import type { AxiosError, AxiosInstance } from "axios";
import { logError } from "./logger";

export const axiosLoggerInterceptor = (axios: AxiosInstance): AxiosInstance => {
  axios.interceptors.response.use(undefined, (error: AxiosError) => {
    const parsedError = {
      request: {
        method: error!.config!.method,
        url: error!.config!.url,
        baseURL: error!.config!.baseURL,
        data: error!.config?.data ? JSON.parse(error!.config!.data) : undefined
      },
      response: {
        status: error.response?.status,
        message: error.response?.data || error.message,
        code: error.code
      },
      message: `Error "${error.response?.data || error.message}" calling ${error!.config!.url}`
    };

    logError(`Error "${error.response?.data || error.message}" calling ${error!.config!.url}`, parsedError);

    return Promise.reject(parsedError);
  });

  return axios;
};
