import type { MockInstance } from "vitest";
import { sendMessage } from "../../telegramBot";
import { logError } from "../../utils/logger";
import { searchSicaeCompany } from "../index";
import {
  COMPANY_NOT_FOUND_HTML,
  FORM_HTML,
  MISSING_CAE_HTML,
  MISSING_NAME_HTML,
  MULTIPLE_ROWS_HTML,
  VALID_RESULT_HTML
} from "./__fixtures__/htmlFixtures";

vi.mock("../../utils/logger");
vi.mock("../../telegramBot");

const SICAE_URL = "http://www.sicae.pt/Consulta.aspx";

const createMockResponse = (body: string, cookies: string[] = []) => ({
  text: vi.fn().mockResolvedValue(body),
  headers: {
    getSetCookie: vi.fn().mockReturnValue(cookies)
  }
});

describe("searchSicaeCompany", () => {
  const fetchMock = vi.fn();
  let logErrorMock: MockInstance<typeof logError>;
  let sendMessageMock: MockInstance<typeof sendMessage>;

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    logErrorMock = vi.mocked(logError);
    sendMessageMock = vi.mocked(sendMessage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetAllMocks();
  });

  it("fetches form tokens, posts the NIF, and parses the company and CAEs", async () => {
    fetchMock
      .mockResolvedValueOnce(
        createMockResponse(FORM_HTML, ["ASP.NET_SessionId=sess123; path=/; HttpOnly", "theme=default; path=/"])
      )
      .mockResolvedValueOnce(createMockResponse(VALID_RESULT_HTML));

    const result = await searchSicaeCompany(514852046);

    expect(result).toEqual({
      nipc: "514852046",
      nome: "Empresa Exemplo Lda",
      caePrincipal: {
        codigo: "62020",
        descricao: "Atividades de consultoria"
      },
      caesSecundarios: [
        { codigo: "49330", descricao: "Transporte ocasional" },
        { codigo: "70220", descricao: "" }
      ]
    });

    // Verify GET request
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      SICAE_URL,
      expect.objectContaining({
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: expect.any(AbortSignal)
      })
    );

    // Verify POST request headers and body
    const [postUrl, postInit] = fetchMock.mock.calls[1];
    expect(postUrl).toBe(SICAE_URL);
    expect(postInit.method).toBe("POST");
    expect(postInit.headers).toEqual({
      "User-Agent": "Mozilla/5.0",
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: "ASP.NET_SessionId=sess123; theme=default"
    });
    expect(postInit.signal).toBeInstanceOf(AbortSignal);

    const body = postInit.body as URLSearchParams;
    expect(body.get("__VIEWSTATE")).toBe("abc123");
    expect(body.get("__EVENTVALIDATION")).toBe("");
    expect(body.get("ctl00$MainContent$ipFirma")).toBe("");
    expect(body.get("ctl00$MainContent$ipNipc")).toBe("514852046");
    expect(body.get("ctl00$MainContent$ipCae")).toBe("");
    expect(body.get("ctl00$MainContent$btnPesquisa")).toBe("Pesquisar");

    expect(logErrorMock).not.toHaveBeenCalled();
    expect(sendMessageMock).not.toHaveBeenCalled();
  });

  it("returns only the first company when multiple rows are returned", async () => {
    fetchMock
      .mockResolvedValueOnce(createMockResponse(FORM_HTML))
      .mockResolvedValueOnce(createMockResponse(MULTIPLE_ROWS_HTML));

    const result = await searchSicaeCompany(111111111);

    expect(result).toEqual({
      nipc: "111111111",
      nome: "First Company",
      caePrincipal: { codigo: "10000", descricao: "Main 1" },
      caesSecundarios: []
    });
  });

  it("returns undefined without logging when no results are found", async () => {
    fetchMock
      .mockResolvedValueOnce(createMockResponse(FORM_HTML))
      .mockResolvedValueOnce(createMockResponse(COMPANY_NOT_FOUND_HTML));

    const result = await searchSicaeCompany(999999999);

    expect(result).toBeUndefined();
    expect(logErrorMock).not.toHaveBeenCalled();
    expect(sendMessageMock).not.toHaveBeenCalled();
  });

  it("logs and sends a Telegram alert when company name is missing", async () => {
    fetchMock
      .mockResolvedValueOnce(createMockResponse(FORM_HTML))
      .mockResolvedValueOnce(createMockResponse(MISSING_NAME_HTML));

    const result = await searchSicaeCompany(514852046);

    expect(result).toBeUndefined();
    expect(logErrorMock).toHaveBeenNthCalledWith(
      1,
      "Error parsing results from 514852046",
      expect.objectContaining({ nipc: "514852046", nome: "" })
    );
    expect(logErrorMock).toHaveBeenNthCalledWith(
      2,
      "Error calling SICAE with NIF: 514852046",
      "Error parsing results from 514852046"
    );
    expect(sendMessageMock).toHaveBeenCalledWith(
      "Error calling SICAE with NIF: 514852046, error: Error parsing results from 514852046"
    );
  });

  it("logs and sends a Telegram alert when caePrincipal is missing", async () => {
    fetchMock
      .mockResolvedValueOnce(createMockResponse(FORM_HTML))
      .mockResolvedValueOnce(createMockResponse(MISSING_CAE_HTML));

    const result = await searchSicaeCompany(514852046);

    expect(result).toBeUndefined();
    expect(logErrorMock).toHaveBeenCalledWith(
      "Error parsing results from 514852046",
      expect.objectContaining({ nome: "Empresa Sem CAE", caePrincipal: undefined })
    );
    expect(sendMessageMock).toHaveBeenCalledWith(
      "Error calling SICAE with NIF: 514852046, error: Error parsing results from 514852046"
    );
  });

  it("handles fetch failures on the initial GET request", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Network timeout"));

    const result = await searchSicaeCompany(514852046);

    expect(result).toBeUndefined();
    expect(logErrorMock).toHaveBeenCalledWith("Error calling SICAE with NIF: 514852046", "Network timeout");
    expect(sendMessageMock).toHaveBeenCalledWith("Error calling SICAE with NIF: 514852046, error: Network timeout");
  });

  it("handles fetch failures on the POST request", async () => {
    fetchMock
      .mockResolvedValueOnce(createMockResponse(FORM_HTML))
      .mockRejectedValueOnce(new Error("503 Service Unavailable"));

    const result = await searchSicaeCompany(514852046);

    expect(result).toBeUndefined();
    expect(logErrorMock).toHaveBeenCalledWith("Error calling SICAE with NIF: 514852046", "503 Service Unavailable");
    expect(sendMessageMock).toHaveBeenCalledWith(
      "Error calling SICAE with NIF: 514852046, error: 503 Service Unavailable"
    );
  });
});
