import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { registrationInputSchema } from "@/features/application/auth-input";
import { createUser, getUserByEmail } from "@/lib/user-db";

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ code, error: message }, { status });
}

function isUniqueConstraint(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string" &&
    error.code.startsWith("SQLITE_CONSTRAINT")
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined);
  const parsed = registrationInputSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(
      "invalid_request",
      "Enter a valid email, an optional name up to 64 characters, and a password between 8 and 128 characters.",
      400,
    );
  }

  const { email, name, password } = parsed.data;

  try {
    if (getUserByEmail(email)) {
      return errorResponse(
        "email_exists",
        "This email is already registered.",
        409,
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = createUser({
      email,
      name,
      passwordHash,
    });

    if (!user) {
      throw new Error("Created user could not be read back.");
    }

    return NextResponse.json(
      {
        user: {
          email: user.email,
          id: user.id,
          name: user.name,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (isUniqueConstraint(error)) {
      return errorResponse(
        "email_exists",
        "This email is already registered.",
        409,
      );
    }

    console.error("Registration persistence failed.", error);
    return errorResponse(
      "registration_unavailable",
      "Registration is temporarily unavailable. Please try again.",
      500,
    );
  }
}
