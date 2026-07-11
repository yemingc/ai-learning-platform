import { apCalculusABCurriculum } from "@/curricula/ap-calculus-ab";
import { javascriptFoundationsCurriculum } from "@/curricula/javascript-foundations";
import { getCurriculumIntegrityIssues } from "@/curricula/integrity";
import type { CurriculumPack } from "@/curricula/types";
import type { CourseId } from "@/features/knowledge/types";

export const DEFAULT_COURSE_ID = apCalculusABCurriculum.course.id;

export const curriculumPacks = [
  apCalculusABCurriculum,
  javascriptFoundationsCurriculum,
] satisfies CurriculumPack[];

export const curriculumRegistryIssues =
  getCurriculumIntegrityIssues(curriculumPacks);

if (curriculumRegistryIssues.length > 0) {
  throw new Error(
    `Invalid curriculum registry:\n${curriculumRegistryIssues.join("\n")}`,
  );
}

export function getCurriculumPacks(): CurriculumPack[] {
  return curriculumPacks;
}

export function getCurriculumPack(
  courseId: CourseId = DEFAULT_COURSE_ID,
): CurriculumPack | undefined {
  return curriculumPacks.find((curriculum) => curriculum.course.id === courseId);
}

export function getDefaultCurriculumPack(): CurriculumPack {
  return apCalculusABCurriculum;
}

export function getCurriculumVisualization(
  courseId: CourseId,
  conceptId: string,
) {
  return getCurriculumPack(courseId)?.visualizations?.[conceptId];
}
