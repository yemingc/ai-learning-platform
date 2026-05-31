"use client";

import type { CourseId } from "@/features/knowledge/types";
import type {
  ConceptMemory,
  LearnerMemory,
  RecordTeacherInteractionInput,
} from "@/features/memory/types";

export const MEMORY_UPDATED_EVENT = "learner-memory:updated";

type MemoryApiResponse = {
  memory: LearnerMemory;
};

type RecordMemoryApiResponse = MemoryApiResponse & {
  conceptMemory: ConceptMemory;
};

export function notifyLearnerMemoryUpdated() {
  window.dispatchEvent(new CustomEvent(MEMORY_UPDATED_EVENT));
}

async function parseMemoryResponse(response: Response) {
  if (!response.ok) {
    throw new Error(`Memory request failed with status ${response.status}.`);
  }

  return (await response.json()) as MemoryApiResponse;
}

export async function fetchLearnerMemory(courseId: CourseId) {
  const response = await fetch(`/api/memory?courseId=${encodeURIComponent(courseId)}`, {
    method: "GET",
  });
  const data = await parseMemoryResponse(response);

  return data.memory;
}

export async function resetLearnerMemory(courseId: CourseId) {
  const response = await fetch(`/api/memory?courseId=${encodeURIComponent(courseId)}`, {
    method: "DELETE",
  });
  const data = await parseMemoryResponse(response);

  notifyLearnerMemoryUpdated();

  return data.memory;
}

export async function recordTeacherInteractionRemote(
  input: Omit<RecordTeacherInteractionInput, "learnerId">,
) {
  const response = await fetch("/api/memory", {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Memory update failed with status ${response.status}.`);
  }

  const data = (await response.json()) as RecordMemoryApiResponse;

  notifyLearnerMemoryUpdated();

  return data;
}
