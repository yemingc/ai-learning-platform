import {
  DEFAULT_COURSE_ID,
  getCurriculumPack,
  getCurriculumPacks,
} from "@/curricula";
import type {
  Concept,
  ConceptDependency,
  ConceptId,
  Course,
  CourseId,
  Topic,
  TopicId,
  Unit,
  UnitId,
} from "@/features/knowledge/types";

function getRequiredCurriculum(courseId: CourseId = DEFAULT_COURSE_ID) {
  const curriculum = getCurriculumPack(courseId);

  if (!curriculum) {
    throw new Error(`Unknown curriculum pack: ${courseId}`);
  }

  return curriculum;
}

export function getCourses(): Course[] {
  return getCurriculumPacks().map((curriculum) => curriculum.course);
}

export function getCourseById(
  courseId: CourseId = DEFAULT_COURSE_ID,
): Course | undefined {
  return getCurriculumPack(courseId)?.course;
}

export function getDefaultCourse(): Course {
  return getRequiredCurriculum().course;
}

export function getUnitsByCourse(
  courseId: CourseId = DEFAULT_COURSE_ID,
): Unit[] {
  return getRequiredCurriculum(courseId).units;
}

export function getTopicsByUnit(
  unitId: UnitId,
  courseId: CourseId = DEFAULT_COURSE_ID,
): Topic[] {
  return getRequiredCurriculum(courseId).topics.filter(
    (topic) => topic.unitId === unitId,
  );
}

export function getConcepts(courseId: CourseId = DEFAULT_COURSE_ID): Concept[] {
  return getRequiredCurriculum(courseId).concepts;
}

export function getConceptById(
  conceptId: ConceptId,
  courseId: CourseId = DEFAULT_COURSE_ID,
): Concept | undefined {
  return getCurriculumPack(courseId)?.concepts.find(
    (concept) => concept.id === conceptId,
  );
}

export function getConceptsByUnit(
  unitId: UnitId,
  courseId: CourseId = DEFAULT_COURSE_ID,
): Concept[] {
  return getRequiredCurriculum(courseId).concepts.filter(
    (concept) => concept.unitId === unitId,
  );
}

export function getConceptsByTopic(
  topicId: TopicId,
  courseId: CourseId = DEFAULT_COURSE_ID,
): Concept[] {
  return getRequiredCurriculum(courseId).concepts.filter(
    (concept) => concept.topicId === topicId,
  );
}

export function getConceptDependencies(
  conceptId: ConceptId,
  courseId: CourseId = DEFAULT_COURSE_ID,
): ConceptDependency[] {
  return getRequiredCurriculum(courseId).dependencies.filter(
    (dependency) =>
      dependency.dependentConceptId === conceptId ||
      dependency.prerequisiteConceptId === conceptId,
  );
}

export function getNextConcepts(
  conceptId: ConceptId,
  courseId: CourseId = DEFAULT_COURSE_ID,
): Concept[] {
  return getRequiredCurriculum(courseId).dependencies
    .filter((dependency) => dependency.prerequisiteConceptId === conceptId)
    .map((dependency) => getConceptById(dependency.dependentConceptId, courseId))
    .filter((concept): concept is Concept => Boolean(concept));
}

export function getPrerequisiteConcepts(
  conceptId: ConceptId,
  courseId: CourseId = DEFAULT_COURSE_ID,
): Concept[] {
  const concept = getConceptById(conceptId, courseId);

  if (!concept) {
    return [];
  }

  return concept.prerequisiteConceptIds
    .map((prerequisiteId) => getConceptById(prerequisiteId, courseId))
    .filter((prerequisite): prerequisite is Concept => Boolean(prerequisite));
}
