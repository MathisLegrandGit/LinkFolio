import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import { getBackendEnv } from "@/lib/backend/env";

const globalForDynamoDb = globalThis as typeof globalThis & {
  dynamoDbDocumentClient?: DynamoDBDocumentClient;
};

function createDynamoDbDocumentClient() {
  const env = getBackendEnv();

  const client = new DynamoDBClient({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      sessionToken: env.AWS_SESSION_TOKEN,
    },
  });

  return DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true,
    },
  });
}

export const dynamoDbDocumentClient =
  globalForDynamoDb.dynamoDbDocumentClient ?? createDynamoDbDocumentClient();

if (process.env.NODE_ENV !== "production") {
  globalForDynamoDb.dynamoDbDocumentClient = dynamoDbDocumentClient;
}

export function getProfilesTableName() {
  return getBackendEnv().DYNAMODB_TABLE_NAME;
}
