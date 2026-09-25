import type { SQSRecord } from "aws-lambda";
import type { MockInstance } from "vitest";
import { removeCompanyFromAlgolia, saveCompanyInAlgolia } from "../../../infrastructure/companiesIndex";
import { handler } from "../index";
import { getDynamoDBRecord } from "./fixtures/getDynamoDBRecord";

vi.mock("../../../infrastructure/companiesIndex");

describe("handler", () => {
  let saveCompanyInAlgoliaMock: MockInstance<typeof saveCompanyInAlgolia>;
  let removeCompanyFromAlgoliaMock: MockInstance<typeof removeCompanyFromAlgolia>;

  beforeEach(() => {
    saveCompanyInAlgoliaMock = vi.mocked(saveCompanyInAlgolia);
    removeCompanyFromAlgoliaMock = vi.mocked(removeCompanyFromAlgolia);
  });

  afterEach(vi.resetAllMocks);

  it("should process a dynamo db update and save in Algolia", async () => {
    await handler({
      Records: [
        {
          body: JSON.stringify(getDynamoDBRecord("MODIFY"))
        } as SQSRecord
      ]
    });

    expect(saveCompanyInAlgoliaMock).toHaveBeenNthCalledWith(1, {
      caeRev3: "49320",
      category: 11,
      name: "Distância Arrojada - Unipessoal Lda",
      nif: 516600800,
      updatedAt: 1785856882885
    });
  });

  it("should delete company from Algolia", async () => {
    await handler({
      Records: [
        {
          body: JSON.stringify(getDynamoDBRecord("REMOVE"))
        } as SQSRecord
      ]
    });

    expect(removeCompanyFromAlgoliaMock).toHaveBeenNthCalledWith(1, 516600800);
  });
});
