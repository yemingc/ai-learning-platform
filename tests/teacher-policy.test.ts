import assert from "node:assert/strict";
import test from "node:test";
import {
  assessCurriculumRetrievalQuality,
  classifyTeacherIntent,
  createTeacherMemoryPatch,
  decideCurriculumRetrieval,
  decideTeacherMemoryUpdate,
  getTeacherRetrievalScope,
  selectTeachingStrategy,
} from "../src/features/ai-teacher/workflow/teacher-policy.ts";

test("classifies explicit English and Chinese learning intents", () => {
  assert.equal(
    classifyTeacherIntent({ userMessage: "Can you give me another example?" }),
    "example_request",
  );
  assert.equal(
    classifyTeacherIntent({ userMessage: "我不懂为什么两边要相等" }),
    "confusion",
  );
  assert.equal(
    classifyTeacherIntent({
      selectionAction: "check_misconception",
      userMessage: "Check this",
    }),
    "misconception",
  );
});

test("uses relevant persistent memory for substantive general support", () => {
  assert.equal(
    selectTeachingStrategy(
      "general_support",
      {
        source: "server_persistent",
        recentMisconceptions: [
          "The limit is always the same as the function value.",
        ],
      },
      "What should I focus on next?",
    ),
    "correct_misconception",
  );

  assert.equal(
    selectTeachingStrategy(
      "general_support",
      { source: "server_persistent", readiness: 82 },
      "What should I do next?",
    ),
    "reflect",
  );
});

test("current explicit intent and lightweight messages take priority over memory", () => {
  const memory = {
    source: "server_persistent" as const,
    readiness: 88,
    recentMisconceptions: ["A stale misconception hypothesis"],
  };

  assert.equal(
    selectTeachingStrategy("confusion", memory, "I am confused"),
    "explain",
  );
  assert.equal(
    selectTeachingStrategy("general_support", memory, "thanks"),
    "explain",
  );
});

test("marks authenticated workflow patches for server persistence", () => {
  const patch = createTeacherMemoryPatch({
    conceptId: "what-is-a-limit",
    memorySnapshot: { source: "server_persistent" },
    memorySignals: {
      confidenceDelta: 2,
      confusionLevel: "low",
      evidenceNote: "The learner explained nearby behavior clearly.",
      needsReview: false,
      suggestedStudyAction: "ready_for_application",
    },
  });

  assert.equal(patch.shouldPersistClientSide, false);
  assert.match(patch.rationale, /server-side learner memory/);
});

test("routes lightweight messages around retrieval and grounds substantive requests", () => {
  assert.equal(
    decideCurriculumRetrieval({
      input: { userMessage: "谢谢" },
      intent: "general_support",
    }),
    "skip",
  );
  assert.equal(
    decideCurriculumRetrieval({
      input: { userMessage: "Why can the limit differ from the value?" },
      intent: "general_support",
    }),
    "retrieve",
  );
  assert.equal(
    decideCurriculumRetrieval({
      input: {
        selectedText: "Nearby values approach 4.",
        userMessage: "Explain this",
      },
      intent: "confusion",
    }),
    "retrieve",
  );
});

test("searches the active concept before broadening to the course", () => {
  assert.equal(getTeacherRetrievalScope(0), "concept");
  assert.equal(getTeacherRetrievalScope(1), "course");
});

test("requires retrieval context from the active concept", () => {
  const createContext = (conceptId?: string) => ({
    actualMode: "keyword" as const,
    allowedCitations: [],
    contextText: "",
    minimumScore: 4,
    requestedMode: "keyword" as const,
    rejectedMatches: 0,
    retrievedChunks: conceptId
      ? [
          {
            conceptId,
            courseId: "ap-calculus-ab",
            id: `chunk-${conceptId}`,
            lessonId: `lesson-${conceptId}`,
            locale: "en" as const,
            matchedReasons: ["text" as const],
            previewText: "Lesson context",
            retrievalTags: [],
            score: 8,
            sectionId: "intuition",
            sectionType: "intuition" as const,
            sourceLabel: conceptId,
            text: "Lesson context",
            title: "Intuition",
            unitId: "unit-1",
            citation: {
              conceptTitle: conceptId,
              courseTitle: "AP Calculus AB",
              sectionTitle: "Intuition",
              sectionType: "intuition" as const,
              unitTitle: "Unit 1",
            },
          },
        ]
      : [],
    shouldRetrieve: true,
  });

  assert.equal(
    assessCurriculumRetrievalQuality({
      context: createContext("what-is-a-limit"),
      currentConceptId: "what-is-a-limit",
    }),
    "sufficient",
  );
  assert.equal(
    assessCurriculumRetrievalQuality({
      context: createContext("limit-notation"),
      currentConceptId: "what-is-a-limit",
    }),
    "insufficient",
  );
  const belowThresholdContext = createContext("what-is-a-limit");
  belowThresholdContext.retrievedChunks[0]!.score = 3;
  assert.equal(
    assessCurriculumRetrievalQuality({
      context: belowThresholdContext,
      currentConceptId: "what-is-a-limit",
    }),
    "insufficient",
  );
  assert.equal(
    assessCurriculumRetrievalQuality({
      context: createContext(),
      currentConceptId: "what-is-a-limit",
    }),
    "unavailable",
  );
});

test("gates learner-memory writes by evidence strength", () => {
  const baseResponse = {
    assistantMessage: "Nearby behavior determines the limit.",
    citationChunkIds: [],
    memorySignals: {
      confidenceDelta: 1,
      confusionLevel: "low" as const,
      evidenceNote: "A general informational turn.",
      needsReview: false,
      suggestedStudyAction: "continue_learning" as const,
    },
    suggestedFollowUps: ["Show me an example"],
    teachingMove: "explain" as const,
  };

  assert.equal(
    decideTeacherMemoryUpdate({
      input: { userMessage: "thanks" },
      intent: "general_support",
      response: baseResponse,
    }),
    "skip",
  );
  assert.equal(
    decideTeacherMemoryUpdate({
      input: { userMessage: "Tell me more about limits" },
      intent: "general_support",
      response: baseResponse,
    }),
    "record_interaction_only",
  );
  assert.equal(
    decideTeacherMemoryUpdate({
      input: { userMessage: "I do not understand this" },
      intent: "confusion",
      response: baseResponse,
    }),
    "persist",
  );
});
