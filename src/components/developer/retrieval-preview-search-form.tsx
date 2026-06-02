"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useTransition } from "react";
import { buttonVariants } from "@/components/ui/button";
import type { LessonSectionType } from "@/features/lessons/types";
import type { CurriculumRetrievalLocale } from "@/features/rag/retrieval-types";
import { cn } from "@/lib/utils";

type RetrievalPreviewSearchFormProps = {
  concepts: Array<{
    id: string;
    title: string;
  }>;
  initialConceptId?: string;
  initialLocale: CurriculumRetrievalLocale;
  initialQuery: string;
  initialSectionType?: string;
  initialUnitId?: string;
  sectionTypes: LessonSectionType[];
  units: Array<{
    id: string;
    sequence: number;
    title: string;
  }>;
};

export function RetrievalPreviewSearchForm({
  concepts,
  initialConceptId,
  initialLocale,
  initialQuery,
  initialSectionType,
  initialUnitId,
  sectionTypes,
  units,
}: RetrievalPreviewSearchFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    const query = formData.get("query")?.toString().trim() ?? "";
    const unitId = formData.get("unitId")?.toString() ?? "";
    const conceptId = formData.get("conceptId")?.toString() ?? "";
    const locale = formData.get("locale")?.toString() ?? "zh";
    const sectionType = formData.get("sectionType")?.toString() ?? "";

    if (query) {
      params.set("query", query);
    }

    if (unitId) {
      params.set("unitId", unitId);
    }

    if (conceptId) {
      params.set("conceptId", conceptId);
    }

    if (locale) {
      params.set("locale", locale);
    }

    if (sectionType) {
      params.set("sectionType", sectionType);
    }

    startTransition(() => {
      router.push(`/developer/retrieval-preview?${params.toString()}`);
      router.refresh();
    });
  }

  return (
    <form
      className="grid gap-3 lg:grid-cols-[1.25fr_0.75fr_0.9fr_0.9fr_0.9fr_auto]"
      onSubmit={handleSubmit}
    >
      <label className="grid gap-2 text-sm font-medium">
        Query
        <input
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          defaultValue={initialQuery}
          name="query"
          placeholder="limit function value misconception"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Locale
        <select
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          defaultValue={initialLocale}
          name="locale"
        >
          <option value="zh">中文 chunks</option>
          <option value="en">English chunks</option>
          <option value="all">All chunks</option>
        </select>
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Unit
        <select
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          defaultValue={initialUnitId ?? ""}
          name="unitId"
        >
          <option value="">All units</option>
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              Unit {unit.sequence}: {unit.title}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Concept
        <select
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          defaultValue={initialConceptId ?? ""}
          name="conceptId"
        >
          <option value="">All concepts</option>
          {concepts.map((concept) => (
            <option key={concept.id} value={concept.id}>
              {concept.title}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Section type
        <select
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          defaultValue={initialSectionType ?? ""}
          name="sectionType"
        >
          <option value="">All sections</option>
          {sectionTypes.map((sectionType) => (
            <option key={sectionType} value={sectionType}>
              {sectionType}
            </option>
          ))}
        </select>
      </label>

      <button
        className={cn(buttonVariants({ variant: "outline" }), "mt-auto")}
        disabled={isPending}
        type="submit"
      >
        <Search className="size-4" />
        {isPending ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
