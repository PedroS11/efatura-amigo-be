import type { DynamoDBRecord } from "aws-lambda";

const company = {
  nif: {
    N: "516600800"
  },
  caeRev3: {
    S: "49320"
  },
  category: {
    N: "11"
  },
  name: {
    S: "Distância Arrojada - Unipessoal Lda"
  },
  updatedAt: {
    N: "1785856882885"
  }
};

export const getDynamoDBRecord = (eventName: DynamoDBRecord["eventName"]): DynamoDBRecord => ({
  eventName,
  dynamodb: {
    ...(["INSERT", "MODIFY"].includes(eventName!) && {
      NewImage: company
    }),
    ...(["REMOVE", "MODIFY"].includes(eventName!) && {
      OldImage: company
    })
  }
});
