import type { CurriculumPack } from "@/curricula/types";
import { lessonContentSchema } from "../features/lessons/lesson-schema.ts";

export function getCurriculumIntegrityIssues(curricula: CurriculumPack[]) {
  const issues: string[] = [];
  const courseIds = new Set<string>();

  for (const curriculum of curricula) {
    const prefix = curriculum.id;

    if (courseIds.has(curriculum.course.id)) {
      issues.push(`Duplicate course id: ${curriculum.course.id}`);
    }
    courseIds.add(curriculum.course.id);

    if (curriculum.id !== curriculum.course.id) {
      issues.push(`${prefix}: pack id must match course id.`);
    }

    const unitIds = new Set(curriculum.units.map((unit) => unit.id));
    const topicIds = new Set(curriculum.topics.map((topic) => topic.id));
    const conceptIds = new Set(
      curriculum.concepts.map((concept) => concept.id),
    );
    const lessonConceptIds = new Set<string>();

    if (!unitIds.has(curriculum.defaultUnitId)) {
      issues.push(`${prefix}: default unit is not registered.`);
    }

    if (
      new Set(curriculum.course.unitIds).size !==
        curriculum.course.unitIds.length ||
      curriculum.course.unitIds.some((unitId) => !unitIds.has(unitId))
    ) {
      issues.push(`${prefix}: course unitIds do not match registered units.`);
    }

    for (const unit of curriculum.units) {
      if (unit.courseId !== curriculum.course.id) {
        issues.push(`${prefix}: unit ${unit.id} has the wrong course id.`);
      }
      if (unit.topicIds.some((topicId) => !topicIds.has(topicId))) {
        issues.push(`${prefix}: unit ${unit.id} references an unknown topic.`);
      }
      if (unit.conceptIds.some((conceptId) => !conceptIds.has(conceptId))) {
        issues.push(`${prefix}: unit ${unit.id} references an unknown concept.`);
      }
    }

    for (const topic of curriculum.topics) {
      if (!unitIds.has(topic.unitId)) {
        issues.push(`${prefix}: topic ${topic.id} has an unknown unit.`);
      }
      if (topic.conceptIds.some((conceptId) => !conceptIds.has(conceptId))) {
        issues.push(`${prefix}: topic ${topic.id} references an unknown concept.`);
      }
    }

    for (const concept of curriculum.concepts) {
      if (concept.courseId !== curriculum.course.id) {
        issues.push(`${prefix}: concept ${concept.id} has the wrong course id.`);
      }
      if (!unitIds.has(concept.unitId) || !topicIds.has(concept.topicId)) {
        issues.push(`${prefix}: concept ${concept.id} has an invalid parent.`);
      }
      if (
        concept.prerequisiteConceptIds.some(
          (conceptId) => !conceptIds.has(conceptId),
        )
      ) {
        issues.push(
          `${prefix}: concept ${concept.id} has an unknown prerequisite.`,
        );
      }
    }

    for (const dependency of curriculum.dependencies) {
      if (
        !conceptIds.has(dependency.prerequisiteConceptId) ||
        !conceptIds.has(dependency.dependentConceptId)
      ) {
        issues.push(`${prefix}: dependency ${dependency.id} is invalid.`);
      }
    }

    for (const lesson of curriculum.lessons) {
      const parsedLesson = lessonContentSchema.safeParse(lesson);
      const concept = curriculum.concepts.find(
        (candidate) => candidate.id === lesson.conceptId,
      );

      if (!parsedLesson.success) {
        issues.push(`${prefix}: lesson ${lesson.id} does not match the schema.`);
      }
      if (lessonConceptIds.has(lesson.conceptId)) {
        issues.push(`${prefix}: concept ${lesson.conceptId} has two lessons.`);
      }
      lessonConceptIds.add(lesson.conceptId);

      if (
        !concept ||
        lesson.courseId !== curriculum.course.id ||
        lesson.unitId !== concept.unitId
      ) {
        issues.push(`${prefix}: lesson ${lesson.id} is attached incorrectly.`);
      }
    }

    for (const conceptId of conceptIds) {
      if (!lessonConceptIds.has(conceptId)) {
        issues.push(`${prefix}: concept ${conceptId} has no lesson.`);
      }
    }

    for (const conceptId of Object.keys(curriculum.visualizations ?? {})) {
      if (!conceptIds.has(conceptId)) {
        issues.push(`${prefix}: visualization ${conceptId} has no concept.`);
      }
    }
  }

  return issues;
}
