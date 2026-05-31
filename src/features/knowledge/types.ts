export type CourseId = string;
export type UnitId = string;
export type TopicId = string;
export type ConceptId = string;
export type LearningObjectiveId = string;

export type ConceptDifficulty = "foundational" | "developing" | "advanced";

export type Course = {
  id: CourseId;
  title: string;
  shortTitle: string;
  subject: string;
  description: string;
  unitIds: UnitId[];
};

export type Unit = {
  id: UnitId;
  courseId: CourseId;
  sequence: number;
  title: string;
  description: string;
  topicIds: TopicId[];
  conceptIds: ConceptId[];
  estimatedMinutes: number;
};

export type Topic = {
  id: TopicId;
  unitId: UnitId;
  sequence: number;
  title: string;
  description: string;
  conceptIds: ConceptId[];
};

export type LearningObjective = {
  id: LearningObjectiveId;
  conceptId: ConceptId;
  title: string;
  description: string;
  successCriteria: string[];
};

export type ConceptExample = {
  id: string;
  title: string;
  description: string;
};

export type Concept = {
  id: ConceptId;
  courseId: CourseId;
  unitId: UnitId;
  topicId: TopicId;
  title: string;
  description: string;
  prerequisiteConceptIds: ConceptId[];
  learningObjectives: LearningObjective[];
  commonMisconceptions: string[];
  examples: ConceptExample[];
  difficulty: ConceptDifficulty;
  estimatedMinutes: number;
};

export type ConceptDependency = {
  id: string;
  prerequisiteConceptId: ConceptId;
  dependentConceptId: ConceptId;
  relationship: "prerequisite" | "supports" | "extends";
  rationale: string;
};

export type KnowledgeGraph = {
  course: Course;
  units: Unit[];
  topics: Topic[];
  concepts: Concept[];
  dependencies: ConceptDependency[];
};
