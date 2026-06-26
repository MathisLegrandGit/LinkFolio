import { NextResponse } from "next/server";

import {
  getProfileById,
  InvalidEditTokenError,
  ProfileNotFoundError,
  updateProfile,
} from "@/lib/backend/profiles/repository";
import { toPublicProfile } from "@/lib/backend/profiles/serializers";
import {
  parseProfileId,
  parseProfileUpdatePayload,
  ProfileValidationError,
} from "@/lib/backend/profiles/validation";

export const runtime = "nodejs";

type GetProfileSuccessResponse = {
  profile: ReturnType<typeof toPublicProfile>;
  isEditable: boolean;
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
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await context.params;
    const id = parseProfileId(rawId);
    const profile = await getProfileById(id);

    if (!profile) {
      return jsonErrorResponse({ error: "Profile not found." }, 404);
    }

    const token = new URL(request.url).searchParams.get("token");
    const isEditable = token !== null && token === profile.editToken;

    return NextResponse.json<GetProfileSuccessResponse>({
      profile: toPublicProfile(profile),
      isEditable,
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

type UpdateProfileSuccessResponse = {
  profile: ReturnType<typeof toPublicProfile>;
};

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return jsonErrorResponse(
      { error: "Request body must be valid JSON." },
      400
    );
  }

  try {
    const { id: rawId } = await context.params;
    const id = parseProfileId(rawId);
    const { editToken, profile } = parseProfileUpdatePayload(payload);
    const updatedProfile = await updateProfile(id, editToken, profile);

    return NextResponse.json<UpdateProfileSuccessResponse>({
      profile: toPublicProfile(updatedProfile),
    });
  } catch (error) {
    if (error instanceof ProfileValidationError) {
      return jsonErrorResponse(
        {
          error: "Invalid update payload.",
          issues: error.issues,
        },
        400
      );
    }

    if (error instanceof ProfileNotFoundError) {
      return jsonErrorResponse({ error: "Profile not found." }, 404);
    }

    if (error instanceof InvalidEditTokenError) {
      return jsonErrorResponse({ error: "Invalid edit token." }, 403);
    }

    console.error("Failed to update profile", error);

    return jsonErrorResponse({ error: "Failed to update profile." }, 500);
  }
}
