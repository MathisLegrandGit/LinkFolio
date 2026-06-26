import { NextResponse } from "next/server";

import { createProfile } from "@/lib/backend/profiles/repository";
import {
  parseProfileInput,
  ProfileValidationError,
} from "@/lib/backend/profiles/validation";

export const runtime = "nodejs";

type CreateProfileSuccessResponse = {
  id: string;
  editToken: string;
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

export async function POST(request: Request) {
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
    const input = parseProfileInput(payload);
    const profile = await createProfile(input);

    return NextResponse.json<CreateProfileSuccessResponse>(
      { id: profile.id, editToken: profile.editToken },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ProfileValidationError) {
      return jsonErrorResponse(
        {
          error: "Invalid profile payload.",
          issues: error.issues,
        },
        400
      );
    }

    console.error("Failed to create profile", error);

    return jsonErrorResponse(
      { error: "Failed to create profile." },
      500
    );
  }
}
