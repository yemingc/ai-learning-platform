import assert from "node:assert/strict";
import test from "node:test";
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

test("Unit 1 extension graph, lessons, metadata, and visualizations stay aligned", () => {
  const conceptIds = apCalculusABUnit1ExtensionConcepts.map(
    (concept) => concept.id,
  );
  const lessonIds = apCalculusABUnit1ExtensionLessons.map(
    (lesson) => lesson.conceptId,
  );
  const topicIds = apCalculusABUnit1ExtensionTopics.flatMap(
    (topic) => topic.conceptIds,
  );

  assert.deepEqual(new Set(conceptIds), new Set(extensionConceptIds));
  assert.deepEqual(new Set(lessonIds), new Set(extensionConceptIds));
  assert.deepEqual(new Set(topicIds), new Set(extensionConceptIds));
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

test("AI Teacher evaluation cases cover every Unit 1 concept", () => {
  const allConceptIds = [...foundationConceptIds, ...extensionConceptIds];
  const evaluatedConceptIds = new Set(
    teacherEvaluationCases.map((testCase) => testCase.conceptId),
  );

  assert.equal(teacherEvaluationCases.length, allConceptIds.length);

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
  }
});
