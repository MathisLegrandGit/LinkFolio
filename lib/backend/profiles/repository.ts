import {
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

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

export class ProfileNotFoundError extends Error {
  constructor() {
    super("Profile not found");
    this.name = "ProfileNotFoundError";
  }
}

export class InvalidEditTokenError extends Error {
  constructor() {
    super("Invalid edit token");
    this.name = "InvalidEditTokenError";
  }
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

export async function getProfileById(id: string) {
  const result = await dynamoDbDocumentClient.send(
    new GetCommand({
      TableName: getProfilesTableName(),
      Key: { id },
    })
  );

  return (result.Item as ProfileRecord | undefined) ?? null;
}

export async function updateProfile(
  id: string,
  editToken: string,
  input: ProfileInput
) {
  try {
    const result = await dynamoDbDocumentClient.send(
      new UpdateCommand({
        TableName: getProfilesTableName(),
        Key: { id },
        ConditionExpression:
          "attribute_exists(id) AND editToken = :editToken",
        UpdateExpression:
          "SET #name = :name, title = :title, bio = :bio, photoUrl = :photoUrl, links = :links",
        ExpressionAttributeNames: {
          "#name": "name",
        },
        ExpressionAttributeValues: {
          ":editToken": editToken,
          ":name": input.name,
          ":title": input.title,
          ":bio": input.bio,
          ":photoUrl": input.photoUrl,
          ":links": input.links,
        },
        ReturnValues: "ALL_NEW",
      })
    );

    return result.Attributes as ProfileRecord;
  } catch (error) {
    if (!isConditionalCheckFailure(error)) {
      throw error;
    }

    const existingProfile = await getProfileById(id);

    if (!existingProfile) {
      throw new ProfileNotFoundError();
    }

    throw new InvalidEditTokenError();
  }
}
