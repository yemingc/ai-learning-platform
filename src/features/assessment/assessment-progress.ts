import type {
  FormativeAssessmentAttempt,
  FormativeAssessmentPhase,
  FormativeAssessmentProgress,
} from "@/features/assessment/types";

export function getLatestAssessmentAttempt(
  attempts: FormativeAssessmentAttempt[] | undefined,
  phase: FormativeAssessmentPhase,
) {
  return (attempts ?? [])
    .filter((attempt) => attempt.phase === phase)
    .slice()
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0];
}

export function getFormativeAssessmentProgress(
  attempts: FormativeAssessmentAttempt[] | undefined,
): FormativeAssessmentProgress {
  const diagnostic = getLatestAssessmentAttempt(attempts, "diagnostic");
  const exitTicket = getLatestAssessmentAttempt(attempts, "exit_ticket");

  return {
    diagnosticScore: diagnostic?.score,
    exitTicketScore: exitTicket?.score,
    learningGain:
      diagnostic && exitTicket ? exitTicket.score - diagnostic.score : undefined,
    evidenceLevel: exitTicket
      ? "pre_post"
      : diagnostic
        ? "diagnostic"
        : "none",
  };
}
