import { NextResponse } from "next/server";
import { getCurriculumPacks } from "@/curricula";
import type { LessonSectionType } from "@/features/lessons/types";
import { getRetrievalMode, searchCurriculumWithMode } from "@/features/rag/retrieval-service";
import type { CurriculumRetrievalLocale } from "@/features/rag/retrieval-types";
import { hasDeveloperApiAccess } from "@/lib/developer-api-access";

export const dynamic = "force-dynamic";

const sectionTypes: LessonSectionType[] = [
  "why_this_matters",
  "intuition",
  "formal_idea",
  "worked_example",
  "think_with_me",
  "common_trap",
  "reflection",
  "try_applying_it",
  "key_takeaways",
];

function getRetrievalLocale(value: string | null): CurriculumRetrievalLocale {
  if (value === "en" || value === "zh" || value === "all") {
    return value;
  }

  return "zh";
}

function getSectionType(value: string | null) {
  return value && sectionTypes.includes(value as LessonSectionType)
    ? (value as LessonSectionType)
    : undefined;
}

export async function GET(request: Request) {
  if (!(await hasDeveloperApiAccess(request))) {
    return NextResponse.json(
      {
        error: "Developer retrieval preview API is disabled.",
      },
      { status: 403 },
    );
  }

  const url = new URL(request.url);
  const curricula = getCurriculumPacks();
  const mode = getRetrievalMode(url.searchParams.get("mode") ?? undefined);
  const query = url.searchParams.get("query")?.trim() || "limit";
  const locale = getRetrievalLocale(url.searchParams.get("locale"));
  const preview = await searchCurriculumWithMode({
    curricula,
    mode,
    query: {
      conceptId: url.searchParams.get("conceptId") || undefined,
      courseId: url.searchParams.get("courseId") || curricula[0]?.course.id,
      limit: Number(url.searchParams.get("limit") || 8),
      locale,
      query,
      sectionType: getSectionType(url.searchParams.get("sectionType")),
      unitId: url.searchParams.get("unitId") || undefined,
    },
  });

  return NextResponse.json({
    ok: true,
    mode,
    preview,
  });
}
