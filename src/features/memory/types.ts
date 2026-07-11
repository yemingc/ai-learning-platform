import type { ConceptId, CourseId } from "@/features/knowledge/types";
import type {
  TeacherMemorySignals,
  TeachingMove,
} from "@/features/ai-teacher/types";
import type {
  FormativeAssessmentAttempt,
  FormativeAssessmentFeedback,
  FormativeAssessmentPhase,
} from "@/features/assessment/types";

export type LearnerMemorySource = "authenticated";

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
  resolvedAt?: string;
  resolutionSource?: "exit_ticket";
  resolutionEvidenceId?: string;
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
  evidenceMode?: "learning_evidence" | "audit_only";
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
  assessmentAttempts: FormativeAssessmentAttempt[];
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
  learnerId?: string;
  courseId?: CourseId;
  conceptId: ConceptId;
  conceptTitle: string;
  source?: TeacherInteractionMemory["source"];
  section: string;
  userMessage: string;
  selectedText?: string;
  teachingMove: TeachingMove;
  detectedMisconception?: string;
  memorySignals: TeacherMemorySignals;
  evidenceMode?: "learning_evidence" | "audit_only";
  locale: "en" | "zh";
};

export type RecordFormativeAssessmentInput = {
  learnerId: string;
  courseId: CourseId;
  conceptId: ConceptId;
  conceptTitle: string;
  assessmentId: string;
  assessmentVersion: string;
  phase: FormativeAssessmentPhase;
  score: number;
  correctCount: number;
  questionCount: number;
  feedback: FormativeAssessmentFeedback[];
};
