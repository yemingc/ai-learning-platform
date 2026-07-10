import type {
  LearnerMemoryPatch,
  NextStudyActionHint,
  TeacherModelTelemetry,
  TeacherWorkflowTraceEvent,
} from "@/features/ai-teacher/workflow/types";
import type {
  TeacherMemorySignals,
  TeachingMove,
} from "@/features/ai-teacher/types";

export type TeacherWorkflowInspectorRun = {
  id: string;
  conceptId: string;
  conceptTitle: string;
  section: string;
  locale: "en" | "zh";
  userMessage: string;
  selectedText?: string;
  assistantMessage: string;
  workflowEngine: string;
  modelTelemetry?: TeacherModelTelemetry;
  durationMs: number;
  teachingMove: TeachingMove;
  detectedMisconception?: string;
  memorySignals: TeacherMemorySignals;
  memoryPatch?: LearnerMemoryPatch;
  nextStudyAction?: NextStudyActionHint;
  trace: TeacherWorkflowTraceEvent[];
  createdAt: string;
};
