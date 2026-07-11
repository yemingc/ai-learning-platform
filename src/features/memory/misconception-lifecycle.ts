import type { FormativeAssessmentPhase } from "../assessment/types.ts";
import type { MisconceptionMemory } from "./types.ts";

export const MISCONCEPTION_RESOLUTION_EXIT_SCORE = 75;

export function getActiveMisconceptions(
  misconceptions: MisconceptionMemory[] | undefined,
) {
  return (misconceptions ?? []).filter(
    (misconception) => !misconception.resolvedAt,
  );
}

export function getResolvedMisconceptions(
  misconceptions: MisconceptionMemory[] | undefined,
) {
  return (misconceptions ?? []).filter(
    (misconception) => Boolean(misconception.resolvedAt),
  );
}

export function resolveMisconceptionsFromAssessment({
  assessmentId,
  misconceptions,
  phase,
  resolvedAt,
  score,
}: {
  assessmentId: string;
  misconceptions: MisconceptionMemory[];
  phase: FormativeAssessmentPhase;
  resolvedAt: string;
  score: number;
}) {
  if (
    phase !== "exit_ticket" ||
    score < MISCONCEPTION_RESOLUTION_EXIT_SCORE
  ) {
    return misconceptions;
  }

  return misconceptions.map((misconception) =>
    misconception.resolvedAt
      ? misconception
      : {
          ...misconception,
          resolutionEvidenceId: assessmentId,
          resolutionSource: "exit_ticket" as const,
          resolvedAt,
        },
  );
}
