import type { ConceptId, CourseId } from "@/features/knowledge/types";
import type {
  TeacherMemorySignals,
  TeachingMove,
} from "@/features/ai-teacher/types";

export const LOCAL_DEMO_LEARNER_ID = "local-demo";
export const LOCAL_DEMO_MEMORY_SOURCE = "local_demo";

export type LearnerMemorySource = "local_demo" | "authenticated";

export type ConceptMemoryStatus =
  | "not_started"
  | "learning"
  | "familiar"
  | "needs_review";

export type MisconceptionMemory = {
  id: string;
  conceptId: ConceptId;
  text: string;
  sourceSection: string;
  count: number;
  firstSeenAt: string;
  lastSeenAt: string;
};

export type ConfusionSignal = {
  id: string;
  conceptId: ConceptId;
  section: string;
  selectedText?: string;
  count: number;
  firstSeenAt: string;
  lastSeenAt: string;
};

export type TeacherInteractionMemory = {
  id: string;
  conceptId: ConceptId;
  conceptTitle: string;
  source:
    | "direct_chat"
    | "section_action"
    | "text_selection"
    | "memory_recommendation";
  section: string;
  userMessage: string;
  selectedText?: string;
  teachingMove: TeachingMove;
  detectedMisconception?: string;
  memorySignals: TeacherMemorySignals;
  locale: "en" | "zh";
  createdAt: string;
};

export type ConceptMemory = {
  conceptId: ConceptId;
  conceptTitle: string;
  status: ConceptMemoryStatus;
  readiness: number;
  interactionCount: number;
  lastStudiedAt?: string;
  misconceptions: MisconceptionMemory[];
  confusionSignals: ConfusionSignal[];
  memorySignalHistory: TeacherMemorySignals[];
  recentInteractions: TeacherInteractionMemory[];
};

export type LearnerMemory = {
  learnerId: string;
  courseId: CourseId;
  source: LearnerMemorySource;
  conceptMemories: Record<ConceptId, ConceptMemory>;
  createdAt: string;
  updatedAt: string;
};

export type RecordTeacherInteractionInput = {
  conceptId: ConceptId;
  conceptTitle: string;
  source?: TeacherInteractionMemory["source"];
  section: string;
  userMessage: string;
  selectedText?: string;
  teachingMove: TeachingMove;
  detectedMisconception?: string;
  memorySignals: TeacherMemorySignals;
  locale: "en" | "zh";
};
