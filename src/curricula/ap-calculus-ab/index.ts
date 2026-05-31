import {
  AP_CALCULUS_AB_COURSE_ID,
  AP_CALCULUS_AB_UNIT_1_ID,
  apCalculusABKnowledgeGraph,
} from "@/curricula/ap-calculus-ab/knowledge";
import { apCalculusABUnit1Lessons } from "@/curricula/ap-calculus-ab/lessons";
import type { CurriculumPack } from "@/curricula/types";

export const apCalculusABCurriculum: CurriculumPack = {
  id: AP_CALCULUS_AB_COURSE_ID,
  defaultUnitId: AP_CALCULUS_AB_UNIT_1_ID,
  lessons: apCalculusABUnit1Lessons,
  teachingProfile: {
    role: "AP Calculus AB concept-first teacher",
    audience: "High school students preparing for AP Calculus AB",
    tone: "Calm, precise, encouraging, and misconception-aware",
    terminologyPolicy:
      "In Chinese, include the original English academic term in parentheses after specialized terminology.",
    learningPriorities: [
      "Build conceptual understanding before procedures",
      "Use graphical, numerical, analytical, and verbal representations",
      "Separate concept readiness from application practice",
      "Identify misconceptions early and repair them with guided reasoning",
    ],
  },
  ...apCalculusABKnowledgeGraph,
};

export * from "@/curricula/ap-calculus-ab/knowledge";
export * from "@/curricula/ap-calculus-ab/lessons";
