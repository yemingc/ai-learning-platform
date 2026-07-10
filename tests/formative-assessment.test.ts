import assert from "node:assert/strict";
import test from "node:test";
import {
  FormativeAssessmentError,
  getFormativeAssessment,
  getFormativeAssessmentCoverage,
  getFormativeAssessmentIntegrityIssues,
  gradeFormativeAssessment,
} from "../src/features/assessment/formative-assessments.ts";
import { getFormativeAssessmentProgress } from "../src/features/assessment/assessment-progress.ts";
import { formativeAssessmentSubmissionSchema } from "../src/features/assessment/types.ts";
import {
  calculateReadiness,
  getConceptMemoryStatus,
} from "../src/features/memory/memory-scoring.ts";
import type { FormativeAssessmentAttempt } from "../src/features/assessment/types.ts";
import type { ConceptMemory } from "../src/features/memory/types.ts";

const unit1ConceptIds = [
  "what-is-a-limit",
  "limit-notation",
  "estimating-limits-from-graphs",
  "one-sided-limits",
  "infinite-limits",
  "evaluating-limits-with-limit-laws",
  "squeeze-theorem",
  "continuity-at-a-point",
  "intermediate-value-theorem",
  "limits-at-infinity",
];

function createAttempt({
  phase,
  score,
  submittedAt,
}: {
  phase: FormativeAssessmentAttempt["phase"];
  score: number;
  submittedAt: string;
}): FormativeAssessmentAttempt {
  return {
    id: `${phase}-${submittedAt}`,
    assessmentId: `what-is-a-limit-${phase}`,
    assessmentVersion: "unit-1-formative-v1",
    conceptId: "what-is-a-limit",
    phase,
    score,
    correctCount: score === 100 ? 2 : score === 50 ? 1 : 0,
    questionCount: 2,
    itemResults: [],
    submittedAt,
  };
}

function createMemory(
  assessmentAttempts: FormativeAssessmentAttempt[],
): ConceptMemory {
  return {
    conceptId: "what-is-a-limit",
    conceptTitle: "What is a limit?",
    status: "learning",
    readiness: 18,
    interactionCount: 100,
    misconceptions: [],
    confusionSignals: [],
    memorySignalHistory: [
      {
        confusionLevel: "low",
        needsReview: false,
        suggestedStudyAction: "ready_for_application",
        confidenceDelta: 20,
        evidenceNote: "The learner gave a clear explanation.",
      },
    ],
    recentInteractions: [],
    assessmentAttempts,
  };
}

test("every Unit 1 concept has two-item diagnostic and exit assessments", () => {
  const coverage = getFormativeAssessmentCoverage();

  assert.deepEqual(
    coverage.map((item) => item.conceptId).sort(),
    unit1ConceptIds.slice().sort(),
  );
  assert.ok(
    coverage.every(
      (item) =>
        item.diagnosticQuestionCount === 2 &&
        item.exitTicketQuestionCount === 2,
    ),
  );
});

test("assessment bank has unique ids, valid keys, and complete localization", () => {
  assert.deepEqual(getFormativeAssessmentIntegrityIssues(), []);
});

test("public assessment DTOs are bilingual and do not expose answer keys", () => {
  const english = getFormativeAssessment({
    conceptId: "what-is-a-limit",
    locale: "en",
    phase: "diagnostic",
  });
  const chinese = getFormativeAssessment({
    conceptId: "what-is-a-limit",
    locale: "zh",
    phase: "diagnostic",
  });

  assert.notEqual(english.title, chinese.title);
  assert.notEqual(english.questions[0]?.prompt, chinese.questions[0]?.prompt);
  assert.equal(JSON.stringify(english).includes("correctOptionId"), false);
  assert.equal(JSON.stringify(english).includes("explanation"), false);
});

test("server grader scores a complete submission and rejects tampered options", () => {
  const graded = gradeFormativeAssessment({
    conceptId: "what-is-a-limit",
    locale: "en",
    phase: "diagnostic",
    answers: [
      { questionId: "what-is-a-limit-d1", selectedOptionId: "b" },
      { questionId: "what-is-a-limit-d2", selectedOptionId: "c" },
    ],
  });

  assert.equal(graded.score, 100);
  assert.equal(graded.correctCount, 2);
  assert.ok(graded.feedback.every((item) => item.isCorrect));

  assert.throws(
    () =>
      gradeFormativeAssessment({
        conceptId: "what-is-a-limit",
        locale: "en",
        phase: "diagnostic",
        answers: [
          { questionId: "what-is-a-limit-d1", selectedOptionId: "tampered" },
          { questionId: "what-is-a-limit-d2", selectedOptionId: "c" },
        ],
      }),
    (error) =>
      error instanceof FormativeAssessmentError &&
      error.code === "invalid_answer",
  );
});

test("submission schema rejects duplicate question answers", () => {
  const parsed = formativeAssessmentSubmissionSchema.safeParse({
    courseId: "ap-calculus-ab",
    conceptId: "what-is-a-limit",
    locale: "en",
    phase: "diagnostic",
    answers: [
      { questionId: "what-is-a-limit-d1", selectedOptionId: "a" },
      { questionId: "what-is-a-limit-d1", selectedOptionId: "b" },
    ],
  });

  assert.equal(parsed.success, false);
});

test("learning progress uses the latest phase attempts and reports gain", () => {
  const progress = getFormativeAssessmentProgress([
    createAttempt({
      phase: "diagnostic",
      score: 0,
      submittedAt: "2026-01-01T00:00:00.000Z",
    }),
    createAttempt({
      phase: "diagnostic",
      score: 50,
      submittedAt: "2026-01-02T00:00:00.000Z",
    }),
    createAttempt({
      phase: "exit_ticket",
      score: 100,
      submittedAt: "2026-01-03T00:00:00.000Z",
    }),
  ]);

  assert.deepEqual(progress, {
    diagnosticScore: 50,
    exitTicketScore: 100,
    learningGain: 50,
    evidenceLevel: "pre_post",
  });
});

test("conversation signals cannot certify mastery without exit evidence", () => {
  const conversationOnly = calculateReadiness(createMemory([]));
  const diagnosticOnly = calculateReadiness(
    createMemory([
      createAttempt({
        phase: "diagnostic",
        score: 100,
        submittedAt: "2026-01-01T00:00:00.000Z",
      }),
    ]),
  );
  const prePost = calculateReadiness(
    createMemory([
      createAttempt({
        phase: "diagnostic",
        score: 0,
        submittedAt: "2026-01-01T00:00:00.000Z",
      }),
      createAttempt({
        phase: "exit_ticket",
        score: 100,
        submittedAt: "2026-01-02T00:00:00.000Z",
      }),
    ]),
  );

  assert.ok(conversationOnly <= 69);
  assert.ok(diagnosticOnly <= 69);
  assert.ok(prePost >= 75);
  assert.notEqual(getConceptMemoryStatus(conversationOnly), "familiar");
  assert.equal(getConceptMemoryStatus(prePost), "familiar");
});
