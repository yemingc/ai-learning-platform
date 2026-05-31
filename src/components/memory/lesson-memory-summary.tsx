"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Brain, Clock, Sparkles, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Concept } from "@/features/knowledge/types";
import {
  fetchLearnerMemory,
  MEMORY_UPDATED_EVENT,
} from "@/features/memory/memory-api-client";
import type { ConceptMemory } from "@/features/memory/types";

type LessonMemorySummaryProps = {
  concept: Concept;
};

const statusLabels: Record<ConceptMemory["status"], string> = {
  familiar: "Familiar",
  learning: "Learning",
  needs_review: "Needs review",
  not_started: "Not started",
};

export function LessonMemorySummary({ concept }: LessonMemorySummaryProps) {
  const { data: session } = useSession();
  const [conceptMemory, setConceptMemory] = useState<
    ConceptMemory | undefined
  >();
  const [memoryError, setMemoryError] = useState<string | undefined>();

  useEffect(() => {
    async function syncMemory() {
      if (!session?.user?.id) {
        setConceptMemory(undefined);
        return;
      }

      try {
        const memory = await fetchLearnerMemory(concept.courseId);

        setConceptMemory(memory.conceptMemories[concept.id]);
        setMemoryError(undefined);
      } catch (error) {
        setMemoryError(
          error instanceof Error
            ? error.message
            : "Unable to load learner memory.",
        );
      }
    }

    void syncMemory();
    window.addEventListener(MEMORY_UPDATED_EVENT, syncMemory);

    return () => {
      window.removeEventListener(MEMORY_UPDATED_EVENT, syncMemory);
    };
  }, [concept.courseId, concept.id, session?.user?.id]);

  if (!conceptMemory) {
    return (
      <Card className="mt-6 border-dashed">
        <CardHeader>
          <Badge className="w-fit" variant="outline">
            Learner memory
          </Badge>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="size-5 text-primary" />
            No memory yet for this concept
          </CardTitle>
          <CardDescription>
            {memoryError
              ? memoryError
              : session?.user?.id
                ? `Ask the AI Teacher once and this account will start tracking learning signals for ${concept.title}.`
                : "Log in to save learner memory for this concept."}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="w-fit" variant="secondary">
            Account learner memory
          </Badge>
          <Badge variant="outline">{statusLabels[conceptMemory.status]}</Badge>
        </div>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="size-5 text-primary" />
          {conceptMemory.readiness}% readiness estimate
        </CardTitle>
        <CardDescription>
          Stored securely for the current signed-in account.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-background/70 p-3">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
            <Sparkles className="size-3.5" />
            Interactions
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {conceptMemory.interactionCount}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background/70 p-3">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
            <TriangleAlert className="size-3.5" />
            Misconceptions
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {conceptMemory.misconceptions.length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background/70 p-3">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
            <Clock className="size-3.5" />
            Last studied
          </p>
          <p className="mt-2 text-sm font-semibold">
            {conceptMemory.lastStudiedAt
              ? new Date(conceptMemory.lastStudiedAt).toLocaleDateString()
              : "Not yet"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
