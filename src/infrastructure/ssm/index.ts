import { GetParameterCommand, PutParameterCommand, SSMClient } from "@aws-sdk/client-ssm"; // ES Modules import

export const updateSSM = async (key: string, value: string) => {
  const client = new SSMClient();
  await client.send(
    new PutParameterCommand({
      Name: key,
      Value: value,
      Type: "String"
    })
  );
};

export const getSSM = async (key: string): Promise<string> => {
  const client = new SSMClient();
  const response = await client.send(
    new GetParameterCommand({
      Name: key
    })
  );

  return response.Parameter?.Value ?? "";
};
