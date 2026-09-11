import type { MockInstance } from "vitest";

import { deleteItem } from "../../utils/aws/dynamo/deleteItem";
import { getItem } from "../../utils/aws/dynamo/getItem";
import { putItem } from "../../utils/aws/dynamo/putItem";
import { deleteSession, getSessionById, saveSession } from "../index";
import type { Session } from "../types";

vi.mock("../../utils/aws/dynamo/getItem");
vi.mock("../../utils/aws/dynamo/putItem");
vi.mock("../../utils/aws/dynamo/deleteItem");

describe("sessionsTable", () => {
  let getItemMock: MockInstance;
  let putItemMock: MockInstance;
  let deleteItemMock: MockInstance;

  const session: Session = {
    id: "123",
    sub: "__GOOGLE_SUB__",
    name: "test",
    email: "a@a.com",
    expiresAt: 1767830400000
  };

  beforeEach(() => {
    getItemMock = vi.mocked(getItem);
    putItemMock = vi.mocked(putItem);
    deleteItemMock = vi.mocked(deleteItem);
  });

  afterEach(vi.resetAllMocks);

  describe("getSessionById", () => {
    it("should return the session when it exists", async () => {
      getItemMock.mockResolvedValue(session);

      const result = await getSessionById("123");

      expect(result).toEqual(session);
      expect(getItemMock).toHaveBeenCalledWith("__SESSIONS_TABLE__", { id: "123" });
    });

    it("should return undefined when the session does not exist", async () => {
      getItemMock.mockResolvedValue(undefined);

      const result = await getSessionById("123");

      expect(result).toEqual(undefined);
      expect(getItemMock).toHaveBeenCalledWith("__SESSIONS_TABLE__", { id: "123" });
    });
  });

  describe("saveSession", () => {
    it("should save the session", async () => {
      await saveSession(session);

      expect(putItemMock).toHaveBeenCalledWith("__SESSIONS_TABLE__", session);
    });
  });

  describe("deleteSession", () => {
    it("should delete the session", async () => {
      await deleteSession("123");

      expect(deleteItemMock).toHaveBeenCalledWith("__SESSIONS_TABLE__", { id: "123" });
    });
  });
});
