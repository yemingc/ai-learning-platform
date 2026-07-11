import type { Concept } from "@/features/knowledge/types";

type LessonRouteIdentity = Pick<Concept, "courseId" | "unitId" | "id">;

export function getLessonPath(concept: LessonRouteIdentity) {
  return `/courses/${encodeURIComponent(concept.courseId)}/learn/${encodeURIComponent(concept.unitId)}/${encodeURIComponent(concept.id)}`;
}

export function getUnitLearningPath(courseId: string, unitId: string) {
  return `/courses/${encodeURIComponent(courseId)}/learn/${encodeURIComponent(unitId)}`;
}
