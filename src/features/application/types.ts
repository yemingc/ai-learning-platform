import type { ConceptId, CourseId, UnitId } from "@/features/knowledge/types";

export type ApplicationTaskId = string;

export type ApplicationTaskType =
  | "concept_transfer"
  | "graph_interpretation"
  | "modeling_prompt"
  | "free_response_readiness";

export type ApplicationTask = {
  id: ApplicationTaskId;
  courseId: CourseId;
  unitId: UnitId;
  conceptIds: ConceptId[];
  type: ApplicationTaskType;
  title: string;
  description: string;
  readinessRequirement: string;
  estimatedMinutes: number;
};
