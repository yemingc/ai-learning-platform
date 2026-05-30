"use client";

import type { TeacherWorkflowInspectorRun } from "@/features/ai-teacher/workflow/inspector-types";

export const WORKFLOW_INSPECTOR_STORAGE_KEY =
  "ai-learning-platform:teacher-workflow-inspector:v1";
export const WORKFLOW_INSPECTOR_UPDATED_EVENT =
  "ai-teacher:workflow-inspector-updated";

const MAX_STORED_RUNS = 30;

function dispatchWorkflowInspectorUpdated() {
  window.dispatchEvent(new CustomEvent(WORKFLOW_INSPECTOR_UPDATED_EVENT));
}

export function getWorkflowInspectorRuns(): TeacherWorkflowInspectorRun[] {
  const rawRuns = window.localStorage.getItem(WORKFLOW_INSPECTOR_STORAGE_KEY);

  if (!rawRuns) {
    return [];
  }

  try {
    const parsedRuns = JSON.parse(rawRuns);

    return Array.isArray(parsedRuns)
      ? (parsedRuns as TeacherWorkflowInspectorRun[])
      : [];
  } catch {
    return [];
  }
}

export function saveWorkflowInspectorRun(run: TeacherWorkflowInspectorRun) {
  const existingRuns = getWorkflowInspectorRuns();
  const nextRuns = [
    run,
    ...existingRuns.filter((existingRun) => existingRun.id !== run.id),
  ].slice(0, MAX_STORED_RUNS);

  window.localStorage.setItem(
    WORKFLOW_INSPECTOR_STORAGE_KEY,
    JSON.stringify(nextRuns),
  );
  dispatchWorkflowInspectorUpdated();
}

export function clearWorkflowInspectorRuns() {
  window.localStorage.removeItem(WORKFLOW_INSPECTOR_STORAGE_KEY);
  dispatchWorkflowInspectorUpdated();
}
