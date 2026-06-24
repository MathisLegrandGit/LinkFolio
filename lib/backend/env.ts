type RequiredEnvKey =
  | "AWS_ACCESS_KEY_ID"
  | "AWS_SECRET_ACCESS_KEY"
  | "AWS_REGION"
  | "DYNAMODB_TABLE_NAME";

export type BackendEnv = Record<RequiredEnvKey, string> & {
  AWS_SESSION_TOKEN?: string;
};

let cachedEnv: BackendEnv | null = null;

function readRequiredEnv(key: RequiredEnvKey): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function getBackendEnv(): BackendEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = {
    AWS_ACCESS_KEY_ID: readRequiredEnv("AWS_ACCESS_KEY_ID"),
    AWS_SECRET_ACCESS_KEY: readRequiredEnv("AWS_SECRET_ACCESS_KEY"),
    AWS_REGION: readRequiredEnv("AWS_REGION"),
    DYNAMODB_TABLE_NAME: readRequiredEnv("DYNAMODB_TABLE_NAME"),
    AWS_SESSION_TOKEN: process.env.AWS_SESSION_TOKEN,
  };

  return cachedEnv;
}
