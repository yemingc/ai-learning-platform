import type { KnowledgeGraph } from "@/features/knowledge/types";
import type {
  Concept,
  Course,
  LearningObjective,
  Topic,
  Unit,
} from "@/features/knowledge/types";
import type { Language } from "@/components/i18n/language-provider";
import type { LessonVisualization } from "@/features/lessons/lesson-visualizations";
import type { LessonContent } from "@/features/lessons/types";

export type CurriculumTeachingProfile = {
  role: string;
  audience: string;
  tone: string;
  terminologyPolicy: string;
  learningPriorities: string[];
};

export type CurriculumCatalogMetadata = {
  status: "available" | "preview" | "archived";
  level: string;
  tags: string[];
};

export type CurriculumCapabilities = {
  formativeAssessments: boolean;
  conceptVisualizations: boolean;
};

export type CurriculumLocalization = {
  course?: Partial<Course>;
  units?: Record<string, Partial<Unit>>;
  topics?: Record<string, Partial<Topic>>;
  concepts?: Record<
    string,
    Partial<Omit<Concept, "learningObjectives">> & {
      learningObjectives?: Array<Partial<LearningObjective>>;
    }
  >;
  lessons?: Record<string, Partial<LessonContent>>;
};

export type CurriculumPack = KnowledgeGraph & {
  id: string;
  defaultUnitId: string;
  lessons: LessonContent[];
  teachingProfile: CurriculumTeachingProfile;
  catalog: CurriculumCatalogMetadata;
  capabilities: CurriculumCapabilities;
  localizations?: Partial<Record<Language, CurriculumLocalization>>;
  visualizations?: Record<string, LessonVisualization>;
};
