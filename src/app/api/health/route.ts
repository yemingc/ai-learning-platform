import { NextResponse } from "next/server";
import { getAiDatabaseHealth } from "@/lib/ai-run-db";

export const dynamic = "force-dynamic";

export function GET() {
  const databaseReady = getAiDatabaseHealth();

  return NextResponse.json(
    {
      status: databaseReady ? "ok" : "unavailable",
      checks: {
        database: databaseReady ? "ok" : "unavailable",
      },
      timestamp: new Date().toISOString(),
    },
    {
      status: databaseReady ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
