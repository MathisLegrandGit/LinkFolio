import { NextResponse } from "next/server";

import { getProfileById } from "@/lib/backend/profiles/repository";
import { toPublicProfile } from "@/lib/backend/profiles/serializers";
import {
  parseProfileId,
  ProfileValidationError,
} from "@/lib/backend/profiles/validation";

export const runtime = "nodejs";

type GetProfileSuccessResponse = {
  profile: ReturnType<typeof toPublicProfile>;
};

type ErrorResponse = {
  error: string;
  issues?: string[];
};

function jsonErrorResponse(
  body: ErrorResponse,
  status: number
): NextResponse<ErrorResponse> {
  return NextResponse.json(body, { status });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await context.params;
    const id = parseProfileId(rawId);
    const profile = await getProfileById(id);

    if (!profile) {
      return jsonErrorResponse({ error: "Profile not found." }, 404);
    }

    return NextResponse.json<GetProfileSuccessResponse>({
      profile: toPublicProfile(profile),
    });
  } catch (error) {
    if (error instanceof ProfileValidationError) {
      return jsonErrorResponse(
        {
          error: "Invalid profile identifier.",
          issues: error.issues,
        },
        400
      );
    }

    console.error("Failed to read profile", error);

    return jsonErrorResponse({ error: "Failed to read profile." }, 500);
  }
}
