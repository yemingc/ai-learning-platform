"use client";

import { AP_CALCULUS_AB_COURSE_ID } from "@/features/knowledge/ap-calculus-ab";
import {
  calculateReadiness,
  getConceptMemoryStatus,
} from "@/features/memory/memory-scoring";
import {
  LOCAL_DEMO_LEARNER_ID,
  type ConceptMemory,
  type LearnerMemory,
  type RecordTeacherInteractionInput,
  type TeacherInteractionMemory,
} from "@/features/memory/types";

export const LOCAL_DEMO_MEMORY_STORAGE_KEY =
  "ai-learning-platform:learner-memory:local-demo";
export const MEMORY_UPDATED_EVENT = "learner-memory:updated";

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createEmptyMemory(now = new Date().toISOString()): LearnerMemory {
  return {
    learnerId: LOCAL_DEMO_LEARNER_ID,
    courseId: AP_CALCULUS_AB_COURSE_ID,
    source: "local_demo",
    conceptMemories: {},
    createdAt: now,
    updatedAt: now,
  };
}

function createConceptMemory(
  input: RecordTeacherInteractionInput,
): ConceptMemory {
  return {
    conceptId: input.conceptId,
    conceptTitle: input.conceptTitle,
    status: "learning",
    readiness: 18,
    interactionCount: 0,
    misconceptions: [],
    confusionSignals: [],
    memorySignalHistory: [],
    recentInteractions: [],
  };
}

function dispatchMemoryUpdated() {
  window.dispatchEvent(new CustomEvent(MEMORY_UPDATED_EVENT));
}

export function getLocalLearnerMemory(): LearnerMemory {
  const rawMemory = window.localStorage.getItem(LOCAL_DEMO_MEMORY_STORAGE_KEY);

  if (!rawMemory) {
    return createEmptyMemory();
  }

  try {
    return JSON.parse(rawMemory) as LearnerMemory;
  } catch {
    return createEmptyMemory();
  }
}

export function saveLocalLearnerMemory(memory: LearnerMemory) {
  window.localStorage.setItem(
    LOCAL_DEMO_MEMORY_STORAGE_KEY,
    JSON.stringify(memory),
  );
  dispatchMemoryUpdated();
}

export function resetLocalLearnerMemory() {
  window.localStorage.removeItem(LOCAL_DEMO_MEMORY_STORAGE_KEY);
  dispatchMemoryUpdated();
}

export function recordTeacherInteraction(input: RecordTeacherInteractionInput) {
  const now = new Date().toISOString();
  const memory = getLocalLearnerMemory();
  const existingConceptMemory =
    memory.conceptMemories[input.conceptId] ?? createConceptMemory(input);

  const interaction: TeacherInteractionMemory = {
    id: createId("interaction"),
    conceptId: input.conceptId,
    conceptTitle: input.conceptTitle,
    source: input.source ?? "direct_chat",
    section: input.section,
    userMessage: input.userMessage,
    selectedText: input.selectedText,
    teachingMove: input.teachingMove,
    detectedMisconception: input.detectedMisconception,
    memorySignals: input.memorySignals,
    locale: input.locale,
    createdAt: now,
  };

  const matchingConfusionSignal = existingConceptMemory.confusionSignals.find(
    (signal) =>
      signal.section === input.section &&
      (signal.selectedText ?? "") === (input.selectedText ?? ""),
  );
  const confusionSignals = matchingConfusionSignal
    ? existingConceptMemory.confusionSignals.map((signal) =>
        signal.id === matchingConfusionSignal.id
          ? {
              ...signal,
              count: signal.count + 1,
              lastSeenAt: now,
            }
          : signal,
      )
    : [
        ...existingConceptMemory.confusionSignals,
        {
          id: createId("confusion"),
          conceptId: input.conceptId,
          section: input.section,
          selectedText: input.selectedText,
          count: 1,
          firstSeenAt: now,
          lastSeenAt: now,
        },
      ];

  const normalizedMisconception = input.detectedMisconception?.trim();
  const matchingMisconception = normalizedMisconception
    ? existingConceptMemory.misconceptions.find(
        (misconception) =>
          misconception.text.toLowerCase() ===
          normalizedMisconception.toLowerCase(),
      )
    : undefined;
  const misconceptions = normalizedMisconception
    ? matchingMisconception
      ? existingConceptMemory.misconceptions.map((misconception) =>
          misconception.id === matchingMisconception.id
            ? {
                ...misconception,
                count: misconception.count + 1,
                lastSeenAt: now,
              }
            : misconception,
        )
      : [
          ...existingConceptMemory.misconceptions,
          {
            id: createId("misconception"),
            conceptId: input.conceptId,
            text: normalizedMisconception,
            sourceSection: input.section,
            count: 1,
            firstSeenAt: now,
            lastSeenAt: now,
          },
        ]
    : existingConceptMemory.misconceptions;

  const nextConceptMemoryBase: ConceptMemory = {
    ...existingConceptMemory,
    conceptTitle: input.conceptTitle,
    interactionCount: existingConceptMemory.interactionCount + 1,
    lastStudiedAt: now,
    confusionSignals,
    misconceptions,
    memorySignalHistory: [
      input.memorySignals,
      ...(existingConceptMemory.memorySignalHistory ?? []),
    ].slice(0, 12),
    recentInteractions: [
      interaction,
      ...existingConceptMemory.recentInteractions,
    ].slice(0, 8),
  };
  const readiness = calculateReadiness(nextConceptMemoryBase);
  const nextConceptMemory: ConceptMemory = {
    ...nextConceptMemoryBase,
    readiness,
    status: getConceptMemoryStatus(readiness),
  };
  const nextMemory: LearnerMemory = {
    ...memory,
    conceptMemories: {
      ...memory.conceptMemories,
      [input.conceptId]: nextConceptMemory,
    },
    updatedAt: now,
  };

  saveLocalLearnerMemory(nextMemory);

  return nextConceptMemory;
}
