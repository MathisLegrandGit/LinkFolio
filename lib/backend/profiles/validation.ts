import type { ProfileInput, ProfileLink } from "@/lib/backend/profiles/types";

const profileRules = {
  name: {
    minLength: 1,
    maxLength: 80,
  },
  title: {
    maxLength: 120,
  },
  bio: {
    maxLength: 280,
  },
  photoUrl: {
    maxLength: 2048,
  },
  links: {
    minItems: 1,
    maxItems: 10,
  },
  linkLabel: {
    minLength: 1,
    maxLength: 40,
  },
  linkUrl: {
    maxLength: 2048,
  },
} as const;

export class ProfileValidationError extends Error {
  constructor(public readonly issues: string[]) {
    super("Profile validation failed");
    this.name = "ProfileValidationError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function ensureTrimmedString(
  value: unknown,
  fieldName: string,
  options: {
    required?: boolean;
    minLength?: number;
    maxLength: number;
  }
) {
  if (typeof value !== "string") {
    if (options.required) {
      throw new ProfileValidationError([`${fieldName} must be a string.`]);
    }

    return "";
  }

  const normalizedValue = value.trim();

  if (options.required && normalizedValue.length === 0) {
    throw new ProfileValidationError([`${fieldName} is required.`]);
  }

  if (options.minLength && normalizedValue.length < options.minLength) {
    throw new ProfileValidationError([
      `${fieldName} must contain at least ${options.minLength} character(s).`,
    ]);
  }

  if (normalizedValue.length > options.maxLength) {
    throw new ProfileValidationError([
      `${fieldName} must contain at most ${options.maxLength} character(s).`,
    ]);
  }

  return normalizedValue;
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function parseLinks(value: unknown) {
  if (!Array.isArray(value)) {
    throw new ProfileValidationError(["links must be an array."]);
  }

  if (value.length < profileRules.links.minItems) {
    throw new ProfileValidationError([
      `links must contain at least ${profileRules.links.minItems} item(s).`,
    ]);
  }

  if (value.length > profileRules.links.maxItems) {
    throw new ProfileValidationError([
      `links must contain at most ${profileRules.links.maxItems} item(s).`,
    ]);
  }

  return value.map((item, index) => parseLink(item, index));
}

function parseLink(value: unknown, index: number): ProfileLink {
  if (!isRecord(value)) {
    throw new ProfileValidationError([
      `links[${index}] must be an object with label and url.`,
    ]);
  }

  const label = ensureTrimmedString(value.label, `links[${index}].label`, {
    required: true,
    minLength: profileRules.linkLabel.minLength,
    maxLength: profileRules.linkLabel.maxLength,
  });

  const url = ensureTrimmedString(value.url, `links[${index}].url`, {
    required: true,
    maxLength: profileRules.linkUrl.maxLength,
  });

  if (!isHttpUrl(url)) {
    throw new ProfileValidationError([
      `links[${index}].url must be a valid http or https URL.`,
    ]);
  }

  return { label, url };
}

export function parseProfileInput(value: unknown): ProfileInput {
  if (!isRecord(value)) {
    throw new ProfileValidationError([
      "Request body must be a JSON object.",
    ]);
  }

  const name = ensureTrimmedString(value.name, "name", {
    required: true,
    minLength: profileRules.name.minLength,
    maxLength: profileRules.name.maxLength,
  });

  const title = ensureTrimmedString(value.title, "title", {
    maxLength: profileRules.title.maxLength,
  });

  const bio = ensureTrimmedString(value.bio, "bio", {
    maxLength: profileRules.bio.maxLength,
  });

  const photoUrl = ensureTrimmedString(value.photoUrl, "photoUrl", {
    maxLength: profileRules.photoUrl.maxLength,
  });

  if (photoUrl.length > 0 && !isHttpUrl(photoUrl)) {
    throw new ProfileValidationError([
      "photoUrl must be a valid http or https URL.",
    ]);
  }

  const links = parseLinks(value.links);

  return {
    name,
    title,
    bio,
    photoUrl,
    links,
  };
}

export function parseEditToken(value: unknown) {
  return ensureTrimmedString(value, "editToken", {
    required: true,
    minLength: 1,
    maxLength: 512,
  });
}

export function parseProfileId(value: unknown) {
  return ensureTrimmedString(value, "id", {
    required: true,
    minLength: 1,
    maxLength: 128,
  });
}

export { profileRules };
