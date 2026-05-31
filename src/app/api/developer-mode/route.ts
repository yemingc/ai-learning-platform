import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { auth } from "@/auth";
import {
  DEVELOPER_MODE_COOKIE,
  isDeveloperToolsEnabled,
  isValidDeveloperModePassword,
} from "@/lib/developer-mode";

const developerModeSchema = z
  .object({
    password: z.string().optional().default(""),
  })
  .strict();

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error: {
          code: "unauthorized",
          message: "Please log in before enabling developer mode.",
        },
      },
      { status: 401 },
    );
  }

  if (!isDeveloperToolsEnabled()) {
    return NextResponse.json(
      {
        error: {
          code: "developer_tools_disabled",
          message: "Developer tools are disabled for this environment.",
        },
      },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => undefined);
  const parsedBody = developerModeSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_request",
          message: "Invalid developer mode request.",
        },
      },
      { status: 400 },
    );
  }

  if (!isValidDeveloperModePassword(parsedBody.data.password)) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_developer_password",
          message: "Developer mode password is incorrect.",
        },
      },
      { status: 401 },
    );
  }

  const cookieStore = await cookies();

  cookieStore.set(DEVELOPER_MODE_COOKIE, "enabled", {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return NextResponse.json({ enabled: true });
}

export async function DELETE() {
  const cookieStore = await cookies();

  cookieStore.delete(DEVELOPER_MODE_COOKIE);

  return NextResponse.json({ enabled: false });
}
