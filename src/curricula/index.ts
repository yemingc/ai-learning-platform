import { apCalculusABCurriculum } from "@/curricula/ap-calculus-ab";
import type { CurriculumPack } from "@/curricula/types";
import type { CourseId } from "@/features/knowledge/types";

export const DEFAULT_COURSE_ID = apCalculusABCurriculum.course.id;

export const curriculumPacks = [apCalculusABCurriculum] satisfies CurriculumPack[];

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
