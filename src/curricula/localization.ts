import type { Language } from "@/components/i18n/language-provider";
import type { CurriculumPack } from "@/curricula/types";
import type {
  Concept,
  Course,
  Topic,
  Unit,
} from "@/features/knowledge/types";
import type { LessonContent } from "@/features/lessons/types";

function getLocalization(curriculum: CurriculumPack, language: Language) {
  return curriculum.localizations?.[language];
}

export function localizeCourse(
  curriculum: CurriculumPack,
  language: Language,
): Course {
  return {
    ...curriculum.course,
    ...getLocalization(curriculum, language)?.course,
  };
}

export function localizeUnit(
  curriculum: CurriculumPack,
  unit: Unit,
  language: Language,
): Unit {
  return {
    ...unit,
    ...getLocalization(curriculum, language)?.units?.[unit.id],
  };
}

export function localizeTopic(
  curriculum: CurriculumPack,
  topic: Topic,
  language: Language,
): Topic {
  return {
    ...topic,
    ...getLocalization(curriculum, language)?.topics?.[topic.id],
  };
}

export function localizeConcept(
  curriculum: CurriculumPack,
  concept: Concept,
  language: Language,
): Concept {
  const localizedConcept = getLocalization(curriculum, language)?.concepts?.[
    concept.id
  ];

  return {
    ...concept,
    ...localizedConcept,
    learningObjectives: localizedConcept?.learningObjectives
      ? concept.learningObjectives.map((objective, index) => ({
          ...objective,
          ...localizedConcept.learningObjectives?.[index],
        }))
      : concept.learningObjectives,
  };
}

export function localizeLesson(
  curriculum: CurriculumPack,
  lesson: LessonContent,
  language: Language,
): LessonContent {
  return {
    ...lesson,
    ...getLocalization(curriculum, language)?.lessons?.[lesson.conceptId],
  };
}
