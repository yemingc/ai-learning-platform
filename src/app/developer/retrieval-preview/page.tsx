import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BookOpenText, Search } from "lucide-react";
import { auth } from "@/auth";
import { getCurriculumPacks } from "@/curricula";
import { RetrievalPreviewSearchForm } from "@/components/developer/retrieval-preview-search-form";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { LessonSectionType } from "@/features/lessons/types";
import type { CurriculumRetrievalLocale } from "@/features/rag/retrieval-types";
import {
  getCurriculumRetrievalChunks,
  searchCurriculumChunks,
} from "@/features/rag/curriculum-retriever";
import {
  hasDeveloperModeAccess,
  isDeveloperToolsEnabled,
} from "@/lib/developer-mode";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RetrievalPreviewPageProps = {
  searchParams: Promise<{
    conceptId?: string;
    courseId?: string;
    locale?: string;
    query?: string;
    sectionType?: string;
    tag?: string;
    unitId?: string;
  }>;
};

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

function isLessonSectionType(value?: string): value is LessonSectionType {
  return Boolean(value && sectionTypes.includes(value as LessonSectionType));
}

function getRetrievalLocale(value?: string): CurriculumRetrievalLocale {
  if (value === "en" || value === "zh" || value === "all") {
    return value;
  }

  return "zh";
}

export default async function RetrievalPreviewPage({
  searchParams,
}: RetrievalPreviewPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/developer/retrieval-preview");
  }

  if (!isDeveloperToolsEnabled() || !(await hasDeveloperModeAccess())) {
    redirect("/developer?callbackUrl=/developer/retrieval-preview");
  }

  const params = await searchParams;
  const curricula = getCurriculumPacks();
  const defaultCourseId = curricula[0]?.course.id;
  const courseId = params.courseId || defaultCourseId;
  const activeCurriculum = curricula.find(
    (curriculum) => curriculum.course.id === courseId,
  );
  const query = params.query?.trim() || "limit function value misconception";
  const locale = getRetrievalLocale(params.locale);
  const tag = params.tag?.trim();
  const preview = searchCurriculumChunks({
    curricula,
    query: {
      conceptId: params.conceptId || undefined,
      courseId,
      limit: 8,
      locale,
      query,
      sectionType: isLessonSectionType(params.sectionType)
        ? params.sectionType
        : undefined,
      tags: tag ? [tag] : undefined,
      unitId: params.unitId || undefined,
    },
  });
  const allChunks = getCurriculumRetrievalChunks(curricula, "all");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Link
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-8")}
        href="/developer"
      >
        <ArrowLeft className="size-4" />
        Back to Developer Mode
      </Link>

      <section className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-end">
        <div>
          <Badge variant="outline">RAG Phase 1</Badge>
          <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
            Curriculum Retrieval Preview
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
            Preview how static lessons become retrieval-ready curriculum chunks
            before adding embeddings or a vector database. This keeps the RAG
            layer grounded in authored lesson content and future citation IDs.
          </p>
        </div>

        <Card>
          <CardHeader>
            <Badge className="w-fit" variant="secondary">
              Index snapshot
            </Badge>
            <CardTitle className="flex items-center gap-2">
              <BookOpenText className="size-5" />
              {allChunks.length} chunks
            </CardTitle>
            <CardDescription>
              {curricula.length} course pack indexed from structured lesson
              sections. No vector database is used in this phase.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="size-5" />
            Search curriculum chunks
          </CardTitle>
          <CardDescription>
            Deterministic keyword, tag, and section-type search. This is the
            replaceable retrieval contract that future embeddings can implement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RetrievalPreviewSearchForm
            concepts={
              activeCurriculum?.concepts.map((concept) => ({
                id: concept.id,
                title: concept.title,
              })) ?? []
            }
            initialConceptId={params.conceptId}
            initialLocale={locale}
            initialQuery={query}
            initialSectionType={params.sectionType}
            initialUnitId={params.unitId}
            sectionTypes={sectionTypes}
            units={
              activeCurriculum?.units.map((unit) => ({
                id: unit.id,
                sequence: unit.sequence,
                title: unit.title,
              })) ?? []
            }
          />
        </CardContent>
      </Card>

      <section className="mt-8 grid gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge variant="secondary">
              Showing {preview.results.length} of {preview.totalMatches} matches
            </Badge>
            <p className="mt-2 text-sm text-muted-foreground">
              Searching for{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
                {query}
              </code>{" "}
              in <span className="font-semibold text-foreground">{locale}</span>{" "}
              mode within {preview.totalChunks} scoped chunks. Results show
              stable IDs and source labels for future citation.
            </p>
          </div>
        </div>

        {preview.results.map((result) => (
          <Card key={result.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">score {result.score}</Badge>
                <Badge variant="outline">{result.locale}</Badge>
                <Badge variant="outline">{result.sectionType}</Badge>
                {result.matchedReasons.map((reason) => (
                  <Badge key={reason} variant="outline">
                    {reason}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-xl leading-7">{result.title}</CardTitle>
              <CardDescription>{result.sourceLabel}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="rounded-lg border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
                {result.previewText}
              </p>
              <div className="grid gap-3 text-xs text-muted-foreground lg:grid-cols-[1.2fr_1fr]">
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="font-semibold text-foreground">Stable chunk id</p>
                  <p className="mt-1 break-all">{result.id}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="font-semibold text-foreground">Retrieval tags</p>
                  <p className="mt-1">
                    {result.retrievalTags.length
                      ? result.retrievalTags.join(", ")
                      : "No tags"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {!preview.results.length && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>No chunks matched this query</CardTitle>
              <CardDescription>
                Try a concept term like limit, notation, graph, one-sided, or
                misconception.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </section>
    </div>
  );
}
