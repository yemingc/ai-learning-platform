import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { CurriculumPack } from "../src/curricula/types.ts";
import {
  AP_CALCULUS_AB_COURSE_ID,
  AP_CALCULUS_AB_UNIT_1_ID,
  apCalculusABKnowledgeGraph,
  apCalculusABUnit1,
  apCalculusABUnit1Concepts,
  apCalculusABUnit1Topics,
} from "../src/curricula/ap-calculus-ab/knowledge.ts";
import { apCalculusABUnit1Lessons } from "../src/curricula/ap-calculus-ab/lessons.ts";
import {
  AP_CALCULUS_AB_UNIT_1_ALIGNMENT_CONCEPT_IDS,
  AP_CALCULUS_AB_UNIT_1_CONCEPT_IDS,
  apCalculusABUnit1AlignmentConcepts,
  apCalculusABUnit1AlignmentDependencies,
} from "../src/curricula/ap-calculus-ab/unit-1-alignment-knowledge.ts";
import {
  apCalculusABUnit1AlignmentLessons,
  unit1AlignmentLessonMetadata,
} from "../src/curricula/ap-calculus-ab/unit-1-alignment-lessons.ts";
import {
  unit1AlignmentLocalizedConcepts,
  unit1AlignmentLocalizedTopics,
  unit1AlignmentLocalizedUnits,
} from "../src/curricula/ap-calculus-ab/unit-1-alignment-localization.ts";
import { unit1AlignmentZhLessons } from "../src/curricula/ap-calculus-ab/unit-1-alignment-lesson-localization.ts";
import {
  AP_CALCULUS_AB_UNIT_2_CONCEPT_IDS,
  AP_CALCULUS_AB_UNIT_2_ID,
  apCalculusABUnit2Concepts,
  apCalculusABUnit2Dependencies,
  apCalculusABUnit2Topics,
} from "../src/curricula/ap-calculus-ab/unit-2-knowledge.ts";
import { apCalculusABUnit2Lessons } from "../src/curricula/ap-calculus-ab/unit-2-lessons.ts";
import {
  unit2LocalizedConcepts,
  unit2LocalizedTopics,
  unit2LocalizedUnits,
} from "../src/curricula/ap-calculus-ab/unit-2-localization.ts";
import { unit2ZhLessons } from "../src/curricula/ap-calculus-ab/unit-2-lesson-localization.ts";
import { getCurriculumIntegrityIssues } from "../src/curricula/integrity.ts";
import { localizeLesson } from "../src/curricula/localization.ts";
import { getLessonPath } from "../src/curricula/routing.ts";
import { unit1ExtensionZhLessons } from "../src/curricula/ap-calculus-ab/unit-1-extension-lesson-localization.ts";
import {
  apCalculusABUnit1ExtensionConcepts,
  apCalculusABUnit1ExtensionDependencies,
  apCalculusABUnit1ExtensionTopics,
} from "../src/curricula/ap-calculus-ab/unit-1-extension-knowledge.ts";
import {
  unit1ExtensionLocalizedConcepts,
  unit1ExtensionLocalizedTopics,
} from "../src/curricula/ap-calculus-ab/unit-1-extension-localization.ts";
import {
  apCalculusABUnit1ExtensionLessons,
  unit1ExtensionLessonMetadata,
} from "../src/curricula/ap-calculus-ab/unit-1-extension-lessons.ts";
import { getLessonVisualization } from "../src/features/lessons/lesson-visualizations.ts";
import { teacherEvaluationCases } from "../src/features/ai-teacher/evaluation/eval-cases.ts";
import { avoidsEvaluationPatterns } from "../src/features/ai-teacher/evaluation/evaluation-text-matching.ts";

const foundationConceptIds = [
  "what-is-a-limit",
  "limit-notation",
  "estimating-limits-from-graphs",
  "one-sided-limits",
  "infinite-limits",
];

const extensionConceptIds = [
  "evaluating-limits-with-limit-laws",
  "squeeze-theorem",
  "continuity-at-a-point",
  "intermediate-value-theorem",
  "limits-at-infinity",
];

const alignmentConceptIds = [
  ...AP_CALCULUS_AB_UNIT_1_ALIGNMENT_CONCEPT_IDS,
];

const unit2ConceptIds = [...AP_CALCULUS_AB_UNIT_2_CONCEPT_IDS];

const apCalculusABTestCurriculum: CurriculumPack = {
  id: AP_CALCULUS_AB_COURSE_ID,
  defaultUnitId: AP_CALCULUS_AB_UNIT_1_ID,
  lessons: [...apCalculusABUnit1Lessons, ...apCalculusABUnit2Lessons],
  catalog: {
    status: "preview",
    level: "Advanced high school",
    tags: ["mathematics", "calculus", "AP"],
  },
  capabilities: {
    formativeAssessments: true,
    conceptVisualizations: false,
  },
  localizations: {
    zh: {
      units: { ...unit1AlignmentLocalizedUnits, ...unit2LocalizedUnits },
      topics: { ...unit1AlignmentLocalizedTopics, ...unit2LocalizedTopics },
      concepts: {
        ...unit1AlignmentLocalizedConcepts,
        ...unit2LocalizedConcepts,
      },
      lessons: { ...unit1AlignmentZhLessons, ...unit2ZhLessons },
    },
  },
  teachingProfile: {
    role: "AP Calculus AB concept-first teacher",
    audience: "High school students preparing for AP Calculus AB",
    tone: "Calm, precise, encouraging, and misconception-aware",
    terminologyPolicy:
      "In Chinese, include the original English academic term after specialized terminology.",
    learningPriorities: ["concepts", "representations", "misconceptions"],
  },
  ...apCalculusABKnowledgeGraph,
};

test("the complete AP Calculus AB pack satisfies the shared curriculum contract", () => {
  assert.deepEqual(getCurriculumIntegrityIssues([apCalculusABTestCurriculum]), []);
  assert.deepEqual(apCalculusABTestCurriculum.course.unitIds, [
    "ap-calculus-ab-unit-1-limits-continuity",
    AP_CALCULUS_AB_UNIT_2_ID,
  ]);
  assert.equal(apCalculusABTestCurriculum.catalog.status, "preview");

  const curriculumSource = readFileSync(
    new URL("../src/curricula/ap-calculus-ab/index.ts", import.meta.url),
    "utf8",
  );
  assert.match(curriculumSource, /status: "preview"/u);
});

test("Unit 2 graph and lessons cover all official 2.1 through 2.10 concepts", () => {
  const conceptIds = apCalculusABUnit2Concepts.map((concept) => concept.id);
  const topicConceptIds = apCalculusABUnit2Topics.flatMap(
    (topic) => topic.conceptIds,
  );
  const lessonConceptIds = apCalculusABUnit2Lessons.map(
    (lesson) => lesson.conceptId,
  );

  assert.equal(apCalculusABUnit2Topics.length, 4);
  assert.deepEqual(conceptIds, unit2ConceptIds);
  assert.deepEqual(topicConceptIds, unit2ConceptIds);
  assert.deepEqual(lessonConceptIds, unit2ConceptIds);
});

test("Unit 1 concepts and lessons follow the official 1.1 through 1.16 teaching sequence", () => {
  const expectedOrder = [...AP_CALCULUS_AB_UNIT_1_CONCEPT_IDS];

  assert.deepEqual(
    apCalculusABUnit1Concepts.map((concept) => concept.id),
    expectedOrder,
  );
  assert.deepEqual(apCalculusABUnit1.conceptIds, expectedOrder);
  assert.deepEqual(
    apCalculusABUnit1Lessons.map((lesson) => lesson.conceptId),
    expectedOrder,
  );
  assert.deepEqual(
    apCalculusABUnit1Topics.map((topic) => topic.sequence),
    [1, 2, 3, 4, 5, 6, 7],
  );
  assert.equal(expectedOrder[0], "instantaneous-change-motivation");
  assert.equal(expectedOrder.at(-1), "intermediate-value-theorem");
});

test("Unit 1 alignment additions provide complete graph, lesson, and Chinese coverage", () => {
  assert.deepEqual(
    apCalculusABUnit1AlignmentConcepts.map((concept) => concept.id),
    alignmentConceptIds,
  );
  assert.deepEqual(
    apCalculusABUnit1AlignmentLessons.map((lesson) => lesson.conceptId),
    alignmentConceptIds,
  );
  assert.deepEqual(
    new Set(Object.keys(unit1AlignmentLessonMetadata)),
    new Set(alignmentConceptIds),
  );

  const allConceptIds = new Set(AP_CALCULUS_AB_UNIT_1_CONCEPT_IDS);
  for (const dependency of apCalculusABUnit1AlignmentDependencies) {
    assert.ok(allConceptIds.has(dependency.prerequisiteConceptId as never));
    assert.ok(allConceptIds.has(dependency.dependentConceptId as never));
  }

  for (const conceptId of alignmentConceptIds) {
    const canonicalLesson = apCalculusABUnit1Lessons.find(
      (lesson) => lesson.conceptId === conceptId,
    );
    const localizedConcept = unit1AlignmentLocalizedConcepts[conceptId];
    const localizedLesson = unit1AlignmentZhLessons[conceptId];

    assert.ok(canonicalLesson);
    assert.ok(localizedConcept);
    assert.ok(localizedLesson);
    assert.equal(canonicalLesson.sections.length, 9);
    assert.ok(canonicalLesson.objective.successCriteria.length >= 3);
    assert.ok(canonicalLesson.workedExamples[0].walkthrough.length >= 4);
    assert.ok(canonicalLesson.guidedQuestions.length >= 2);
    assert.ok(canonicalLesson.misconceptionChecks.length >= 2);
    assert.match(localizedConcept.title ?? "", /[\u3400-\u9fff]/u);
    assert.match(localizedLesson.hook ?? "", /[\u3400-\u9fff]/u);

    const localized = localizeLesson(
      apCalculusABTestCurriculum,
      canonicalLesson,
      "zh",
    );
    assert.equal(localized.title, localizedLesson.title);
  }
});

test("Unit 1.1 Chinese is a complete adaptive teaching rewrite with stable semantics", () => {
  const canonicalLesson = apCalculusABUnit1Lessons.find(
    (lesson) => lesson.conceptId === "instantaneous-change-motivation",
  );
  assert.ok(canonicalLesson);

  const localizedLesson = localizeLesson(
    apCalculusABTestCurriculum,
    canonicalLesson,
    "zh",
  );

  assert.equal(localizedLesson.conceptId, canonicalLesson.conceptId);
  assert.equal(
    localizedLesson.objective.successCriteria.length,
    canonicalLesson.objective.successCriteria.length,
  );
  assert.equal(
    localizedLesson.workedExamples[0]?.walkthrough.length,
    canonicalLesson.workedExamples[0]?.walkthrough.length,
  );
  assert.equal(
    localizedLesson.guidedQuestions.length,
    canonicalLesson.guidedQuestions.length,
  );
  assert.equal(
    localizedLesson.misconceptionChecks.length,
    canonicalLesson.misconceptionChecks.length,
  );
  assert.deepEqual(
    localizedLesson.sections.map(({ id, sectionId, type }) => ({
      id,
      sectionId,
      type,
    })),
    canonicalLesson.sections.map(({ id, sectionId, type }) => ({
      id,
      sectionId,
      type,
    })),
  );
  assert.equal(
    localizedLesson.applicationTasks[0]?.id,
    canonicalLesson.applicationTasks[0]?.id,
  );
  assert.equal(
    localizedLesson.practiceReadinessTasks[0]?.id,
    canonicalLesson.practiceReadinessTasks[0]?.id,
  );

  assert.match(localizedLesson.hook, /导航/u);
  assert.match(localizedLesson.hook, /仪表盘/u);
  assert.doesNotMatch(localizedLesson.hook, /全程平均速度说明整段旅程有多快/u);
  assert.match(localizedLesson.workedExamples[0]?.setup ?? "", /长途客车/u);
  assert.match(localizedLesson.formalExplanation, /h≠0/u);
  assert.match(localizedLesson.formalExplanation, /h→0/u);
  assert.match(localizedLesson.formalExplanation, /\[s\(a\+h\)-s\(a\)\]\/h/u);
  assert.match(localizedLesson.glossaryTerms[0]?.term ?? "", /平均变化率/u);
  assert.ok(
    localizedLesson.sections.every(
      (section) =>
        /[\u3400-\u9fff]/u.test(section.title) &&
        /[\u3400-\u9fff]/u.test(section.body),
    ),
  );
});

test("Unit 2 prerequisites and dependencies preserve Unit 1 continuity", () => {
  const allConceptIds = new Set(
    apCalculusABTestCurriculum.concepts.map((concept) => concept.id),
  );
  const crossUnitPrerequisites = new Set<string>();

  for (const concept of apCalculusABUnit2Concepts) {
    for (const prerequisiteId of concept.prerequisiteConceptIds) {
      assert.ok(
        allConceptIds.has(prerequisiteId),
        `${concept.id} has missing prerequisite ${prerequisiteId}`,
      );
      if (!unit2ConceptIds.includes(prerequisiteId as never)) {
        crossUnitPrerequisites.add(prerequisiteId);
      }
    }
  }

  for (const dependency of apCalculusABUnit2Dependencies) {
    assert.ok(allConceptIds.has(dependency.prerequisiteConceptId));
    assert.ok(allConceptIds.has(dependency.dependentConceptId));
  }

  assert.ok(crossUnitPrerequisites.has("evaluating-limits-with-limit-laws"));
  assert.ok(crossUnitPrerequisites.has("continuity-at-a-point"));
  assert.ok(crossUnitPrerequisites.has("one-sided-limits"));
  assert.ok(crossUnitPrerequisites.has("limit-notation"));
});

test("the expanded AP Calculus AB prerequisite graph is acyclic", () => {
  const graph = new Map(
    apCalculusABTestCurriculum.concepts.map((concept) => [
      concept.id,
      concept.prerequisiteConceptIds,
    ]),
  );
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(conceptId: string) {
    if (visiting.has(conceptId)) {
      assert.fail(`Cycle detected at ${conceptId}`);
    }
    if (visited.has(conceptId)) {
      return;
    }

    visiting.add(conceptId);
    for (const prerequisiteId of graph.get(conceptId) ?? []) {
      visit(prerequisiteId);
    }
    visiting.delete(conceptId);
    visited.add(conceptId);
  }

  for (const conceptId of graph.keys()) {
    visit(conceptId);
  }
});

test("every Unit 2 lesson has substantive teaching and transfer content", () => {
  for (const lesson of apCalculusABUnit2Lessons) {
    assert.ok(lesson.objective.successCriteria.length >= 3);
    assert.ok(lesson.prerequisiteConnections.length >= 1);
    assert.ok(lesson.workedExamples.length >= 1);
    assert.ok(lesson.workedExamples[0].walkthrough.length >= 4);
    assert.ok(lesson.guidedQuestions.length >= 2);
    assert.ok(lesson.misconceptionChecks.length >= 2);
    assert.ok(lesson.keyTakeaways.length >= 3);
    assert.ok(lesson.retrievalTags.length >= 3);
    assert.ok(lesson.glossaryTerms.length >= 2);
    assert.equal(lesson.sections.length, 9);
  }
});

test("Unit 2 provides complete Chinese teaching overlays", () => {
  assert.ok(unit2LocalizedUnits[AP_CALCULUS_AB_UNIT_2_ID]);
  assert.deepEqual(
    new Set(Object.keys(unit2LocalizedTopics)),
    new Set(apCalculusABUnit2Topics.map((topic) => topic.id)),
  );

  for (const conceptId of unit2ConceptIds) {
    const canonicalLesson = apCalculusABUnit2Lessons.find(
      (lesson) => lesson.conceptId === conceptId,
    );
    const localizedConcept = unit2LocalizedConcepts[conceptId];
    const localizedLesson = unit2ZhLessons[conceptId];

    assert.ok(canonicalLesson);
    assert.ok(localizedConcept);
    assert.ok(localizedLesson);
    assert.match(localizedConcept.title ?? "", /[\u3400-\u9fff]/u);
    assert.match(localizedLesson.hook ?? "", /[\u3400-\u9fff]/u);
    assert.notEqual(localizedLesson.title, canonicalLesson.title);
    assert.equal(localizedLesson.workedExamples?.length, 1);
    assert.equal(localizedLesson.guidedQuestions?.length, 2);
    assert.equal(localizedLesson.misconceptionChecks?.length, 2);

    const localized = localizeLesson(
      apCalculusABTestCurriculum,
      canonicalLesson,
      "zh",
    );
    assert.equal(localized.title, localizedLesson.title);
  }
});

test("Unit 1 and Unit 2 concepts keep course-scoped lesson routes", () => {
  const unit1Concept = apCalculusABTestCurriculum.concepts.find(
    (concept) => concept.id === "continuity-at-a-point",
  );
  const unit2Concept = apCalculusABTestCurriculum.concepts.find(
    (concept) => concept.id === "derivative-as-a-limit-and-tangent-slope",
  );

  assert.ok(unit1Concept);
  assert.ok(unit2Concept);
  assert.equal(
    getLessonPath(unit1Concept),
    "/courses/ap-calculus-ab/learn/ap-calculus-ab-unit-1-limits-continuity/continuity-at-a-point",
  );
  assert.equal(
    getLessonPath(unit2Concept),
    "/courses/ap-calculus-ab/learn/ap-calculus-ab-unit-2-differentiation-fundamentals/derivative-as-a-limit-and-tangent-slope",
  );
});

test("Unit 1 extension graph, lessons, metadata, and visualizations stay aligned", () => {
  const conceptIds = apCalculusABUnit1ExtensionConcepts.map(
    (concept) => concept.id,
  );
  const lessonIds = apCalculusABUnit1ExtensionLessons.map(
    (lesson) => lesson.conceptId,
  );
  const topicIds = apCalculusABUnit1Topics.flatMap((topic) => topic.conceptIds);

  assert.deepEqual(new Set(conceptIds), new Set(extensionConceptIds));
  assert.deepEqual(new Set(lessonIds), new Set(extensionConceptIds));
  assert.ok(extensionConceptIds.every((conceptId) => topicIds.includes(conceptId)));
  assert.deepEqual(
    new Set(Object.keys(unit1ExtensionLessonMetadata)),
    new Set(extensionConceptIds),
  );

  for (const conceptId of extensionConceptIds) {
    assert.ok(getLessonVisualization(conceptId));
  }
});

test("extension prerequisites and dependency edges reference registered concepts", () => {
  const allConceptIds = new Set([
    ...foundationConceptIds,
    ...extensionConceptIds,
    ...alignmentConceptIds,
  ]);

  for (const concept of apCalculusABUnit1ExtensionConcepts) {
    for (const prerequisiteId of concept.prerequisiteConceptIds) {
      assert.ok(
        allConceptIds.has(prerequisiteId),
        `${concept.id} has missing prerequisite ${prerequisiteId}`,
      );
    }
  }

  for (const dependency of apCalculusABUnit1ExtensionDependencies) {
    assert.ok(allConceptIds.has(dependency.prerequisiteConceptId));
    assert.ok(allConceptIds.has(dependency.dependentConceptId));
  }
});

test("every extension lesson carries substantive teaching and retrieval content", () => {
  for (const lesson of apCalculusABUnit1ExtensionLessons) {
    const metadata =
      unit1ExtensionLessonMetadata[
        lesson.conceptId as keyof typeof unit1ExtensionLessonMetadata
      ];

    assert.ok(lesson.objective.successCriteria.length >= 3);
    assert.ok(lesson.prerequisiteConnections.length >= 1);
    assert.ok(lesson.workedExamples.length >= 1);
    assert.ok(lesson.workedExamples[0].walkthrough.length >= 4);
    assert.ok(lesson.guidedQuestions.length >= 2);
    assert.ok(lesson.misconceptionChecks.length >= 2);
    assert.ok(lesson.keyTakeaways.length >= 3);
    assert.ok(metadata.retrievalTags.length >= 3);
    assert.ok(metadata.glossaryTerms.length >= 2);
  }
});

test("new concepts, topics, and lessons provide substantive Chinese localization", () => {
  assert.deepEqual(
    new Set(Object.keys(unit1ExtensionLocalizedTopics)),
    new Set(apCalculusABUnit1ExtensionTopics.map((topic) => topic.id)),
  );

  for (const conceptId of extensionConceptIds) {
    const concept = apCalculusABUnit1ExtensionConcepts.find(
      (candidate) => candidate.id === conceptId,
    );
    const lesson = apCalculusABUnit1ExtensionLessons.find(
      (candidate) => candidate.conceptId === conceptId,
    );
    const localizedConcept = unit1ExtensionLocalizedConcepts[conceptId];
    const localizedLesson = unit1ExtensionZhLessons[conceptId];

    assert.ok(concept);
    assert.ok(lesson);
    assert.ok(localizedConcept);
    assert.ok(localizedLesson);
    assert.notEqual(localizedConcept.title, concept.title);
    assert.notEqual(localizedConcept.description, concept.description);
    assert.notEqual(localizedLesson.title, lesson.title);
    assert.notEqual(localizedLesson.hook, lesson.hook);
    assert.notEqual(localizedLesson.formalExplanation, lesson.formalExplanation);
    assert.notEqual(
      localizedLesson.workedExamples?.[0].title,
      lesson.workedExamples[0].title,
    );
    assert.ok(/[\u3400-\u9fff]/u.test(localizedLesson.hook ?? ""));
  }
});

test("foundation lesson reflection prompts use natural Chinese instructions", () => {
  const lessonLocalizationSource = readFileSync(
    new URL(
      "../src/features/lessons/lesson-localization.ts",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(
    lessonLocalizationSource,
    /prompt: "你会怎样用一句话解释极限（limit）？"/u,
  );
  assert.doesNotMatch(lessonLocalizationSource, /不用“答案”这个词/u);
});

test("AI Teacher evaluation cases cover every Unit 1 concept", () => {
  const allConceptIds = [...AP_CALCULUS_AB_UNIT_1_CONCEPT_IDS];
  const evaluatedConceptIds = new Set(
    teacherEvaluationCases.map((testCase) => testCase.conceptId),
  );

  assert.ok(
    teacherEvaluationCases.length >= allConceptIds.length,
    "The evaluation suite must cover every concept and may add adversarial cases.",
  );

  for (const conceptId of allConceptIds) {
    assert.ok(
      evaluatedConceptIds.has(conceptId),
      `Missing teacher evaluation case for ${conceptId}`,
    );
  }

  for (const testCase of teacherEvaluationCases) {
    const referenceText = [
      testCase.referenceResponse.assistantMessage,
      ...testCase.referenceResponse.suggestedFollowUps,
      testCase.referenceResponse.detectedMisconception ?? "",
      testCase.referenceResponse.memorySignals.evidenceNote,
    ]
      .join(" ")
      .toLowerCase();

    for (const requiredTerm of testCase.requiredTerms ?? []) {
      assert.ok(
        referenceText.includes(requiredTerm.toLowerCase()),
        `${testCase.id} reference response is missing ${requiredTerm}`,
      );
    }

    assert.ok(
      avoidsEvaluationPatterns(referenceText, testCase.forbiddenPatterns),
      `${testCase.id} reference response contains a forbidden pattern`,
    );
  }
});

test("AI Teacher evaluation suite includes adversarial safety coverage", () => {
  const riskCategories = new Set(
    teacherEvaluationCases.map((testCase) => testCase.riskCategory),
  );

  for (const category of [
    "prompt_injection",
    "privacy_exfiltration",
    "false_premise",
    "citation_hallucination",
  ]) {
    assert.ok(riskCategories.has(category as never), `Missing ${category} case`);
  }

  const privacyCase = teacherEvaluationCases.find(
    (testCase) => testCase.riskCategory === "privacy_exfiltration",
  );

  assert.equal(privacyCase?.learnerMemorySnapshot?.source, "server_persistent");
  assert.ok(privacyCase?.forbiddenPatterns?.some((pattern) => pattern.includes("CANARY")));
});
