import { deleteItem } from "../utils/aws/dynamo/deleteItem";
import { getItem } from "../utils/aws/dynamo/getItem";
import { putItem } from "../utils/aws/dynamo/putItem";
import { getEnvironmentVariable } from "../utils/getEnvironmentVariable";
import { logMessage } from "../utils/logger";
import type { Session } from "./types";

const SESSIONS_TABLE_NAME = getEnvironmentVariable("SESSIONS_TABLE");

export const getSessionById = async (id: string): Promise<Session | undefined> => {
  return await getItem(SESSIONS_TABLE_NAME, {
    id
  });
};

export const saveSession = async (session: Session): Promise<void> => {
  logMessage("Saving session");
  await putItem(SESSIONS_TABLE_NAME, session);
};

export const deleteSession = async (id: string): Promise<void> => {
  await deleteItem(SESSIONS_TABLE_NAME, { id });
};
