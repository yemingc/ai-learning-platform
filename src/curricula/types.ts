import type { KnowledgeGraph } from "@/features/knowledge/types";
import type { LessonContent } from "@/features/lessons/types";

export type CurriculumTeachingProfile = {
  role: string;
  audience: string;
  tone: string;
  terminologyPolicy: string;
  learningPriorities: string[];
};

export type CurriculumPack = KnowledgeGraph & {
  id: string;
  defaultUnitId: string;
  lessons: LessonContent[];
  teachingProfile: CurriculumTeachingProfile;
};
