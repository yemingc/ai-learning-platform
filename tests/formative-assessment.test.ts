import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
import { AP_CALCULUS_AB_UNIT_1_CONCEPT_IDS } from "../src/curricula/ap-calculus-ab/unit-1-alignment-knowledge.ts";
import { AP_CALCULUS_AB_UNIT_2_CONCEPT_IDS } from "../src/curricula/ap-calculus-ab/unit-2-knowledge.ts";

const unit1ConceptIds = [...AP_CALCULUS_AB_UNIT_1_CONCEPT_IDS];

const apCalculusABConceptIds = [
  ...unit1ConceptIds,
  ...AP_CALCULUS_AB_UNIT_2_CONCEPT_IDS,
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

test("every implemented AP Calculus AB concept has two-item diagnostic and exit assessments", () => {
  const coverage = getFormativeAssessmentCoverage();

  assert.deepEqual(
    coverage.map((item) => item.conceptId).sort(),
    apCalculusABConceptIds.slice().sort(),
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

  const curriculumSource = readFileSync(
    new URL("../src/curricula/ap-calculus-ab/index.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(curriculumSource, /correctOptionId|unit-2-assessments/u);
});

test("Unit 1.1 Chinese assessments use natural contexts without changing grading", () => {
  const englishDiagnostic = getFormativeAssessment({
    conceptId: "instantaneous-change-motivation",
    locale: "en",
    phase: "diagnostic",
  });
  const chineseDiagnostic = getFormativeAssessment({
    conceptId: "instantaneous-change-motivation",
    locale: "zh",
    phase: "diagnostic",
  });
  const chineseExit = getFormativeAssessment({
    conceptId: "instantaneous-change-motivation",
    locale: "zh",
    phase: "exit_ticket",
  });

  assert.equal(
    englishDiagnostic.questions[0]?.prompt,
    "Which expression is an average rate of change of s over [a,b], with a≠b?",
  );
  assert.match(chineseDiagnostic.questions[0]?.prompt ?? "", /行程记录/u);
  assert.match(chineseDiagnostic.questions[1]?.prompt ?? "", /有同学说/u);
  assert.match(chineseExit.questions[0]?.prompt ?? "", /长途客车/u);
  assert.match(chineseExit.questions[1]?.prompt ?? "", /储水罐/u);

  const diagnosticResult = gradeFormativeAssessment({
    conceptId: "instantaneous-change-motivation",
    locale: "zh",
    phase: "diagnostic",
    answers: [
      { questionId: "instantaneous-change-motivation-d1", selectedOptionId: "a" },
      { questionId: "instantaneous-change-motivation-d2", selectedOptionId: "b" },
    ],
  });
  const exitResult = gradeFormativeAssessment({
    conceptId: "instantaneous-change-motivation",
    locale: "zh",
    phase: "exit_ticket",
    answers: [
      { questionId: "instantaneous-change-motivation-e1", selectedOptionId: "a" },
      { questionId: "instantaneous-change-motivation-e2", selectedOptionId: "a" },
    ],
  });

  assert.equal(diagnosticResult.score, 100);
  assert.equal(exitResult.score, 100);
});

test("Unit 2 assessments return the AP course identity and grade server-side", () => {
  const assessment = getFormativeAssessment({
    conceptId: "product-rule",
    locale: "zh",
    phase: "exit_ticket",
  });

  assert.equal(assessment.courseId, "ap-calculus-ab");
  assert.equal(assessment.conceptId, "product-rule");
  assert.equal(JSON.stringify(assessment).includes("correctOptionId"), false);

  const graded = gradeFormativeAssessment({
    conceptId: "product-rule",
    locale: "en",
    phase: "exit_ticket",
    answers: [
      { questionId: "product-rule-e1", selectedOptionId: "a" },
      { questionId: "product-rule-e2", selectedOptionId: "a" },
    ],
  });

  assert.equal(graded.score, 100);
  assert.equal(graded.assessment.courseId, "ap-calculus-ab");
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
