import { PutCommand } from "@aws-sdk/lib-dynamodb";

import {
  dynamoDbDocumentClient,
  getProfilesTableName,
} from "@/lib/backend/dynamodb";
import {
  generateEditToken,
  generateProfileId,
} from "@/lib/backend/profiles/ids";
import type {
  ProfileInput,
  ProfileRecord,
} from "@/lib/backend/profiles/types";

const MAX_CREATE_RETRIES = 3;

function buildProfileRecord(input: ProfileInput): ProfileRecord {
  return {
    id: generateProfileId(),
    editToken: generateEditToken(),
    createdAt: new Date().toISOString(),
    ...input,
  };
}

function isConditionalCheckFailure(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "ConditionalCheckFailedException"
  );
}

export async function createProfile(input: ProfileInput) {
  for (let attempt = 1; attempt <= MAX_CREATE_RETRIES; attempt += 1) {
    const profile = buildProfileRecord(input);

    try {
      await dynamoDbDocumentClient.send(
        new PutCommand({
          TableName: getProfilesTableName(),
          Item: profile,
          ConditionExpression: "attribute_not_exists(id)",
        })
      );

      return profile;
    } catch (error) {
      if (isConditionalCheckFailure(error) && attempt < MAX_CREATE_RETRIES) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("Failed to create a unique profile identifier.");
}
