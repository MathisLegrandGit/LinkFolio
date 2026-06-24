import { randomBytes } from "node:crypto";

export function generateProfileId() {
  return randomBytes(9).toString("base64url");
}

export function generateEditToken() {
  return randomBytes(24).toString("base64url");
}
