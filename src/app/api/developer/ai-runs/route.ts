import { NextResponse } from "next/server";
import { getAiTeacherRunDashboard } from "@/lib/ai-run-db";
import { hasDeveloperApiAccess } from "@/lib/developer-api-access";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await hasDeveloperApiAccess(request))) {
    return NextResponse.json(
      { error: "Developer AI run access is disabled." },
      { status: 403 },
    );
  }

  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? 50);

  return NextResponse.json(
    {
      ok: true,
      ...getAiTeacherRunDashboard(limit),
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}
