import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCurriculumPack } from "@/curricula";
import {
  FormativeAssessmentError,
  getFormativeAssessment,
  gradeFormativeAssessment,
} from "@/features/assessment/formative-assessments";
import {
  getFormativeAssessmentProgress,
  getLatestAssessmentAttempt,
} from "@/features/assessment/assessment-progress";
import {
  formativeAssessmentQuerySchema,
  formativeAssessmentSubmissionSchema,
  type FormativeAssessmentAttempt,
  type FormativeAssessmentAttemptSummary,
} from "@/features/assessment/types";
import type { CourseId } from "@/features/knowledge/types";
import {
  getLearnerMemory,
  recordFormativeAssessmentInDb,
} from "@/lib/learner-memory-db";

function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: unknown,
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        details,
      },
    },
    { status },
  );
}

function toAttemptSummary(
  attempt: FormativeAssessmentAttempt | undefined,
): FormativeAssessmentAttemptSummary | undefined {
  if (!attempt) {
    return undefined;
  }

  return {
    id: attempt.id,
    assessmentId: attempt.assessmentId,
    assessmentVersion: attempt.assessmentVersion,
    phase: attempt.phase,
    score: attempt.score,
    correctCount: attempt.correctCount,
    questionCount: attempt.questionCount,
    submittedAt: attempt.submittedAt,
  };
}

function resolveConcept(courseId: string, conceptId: string) {
  const curriculum = getCurriculumPack(courseId as CourseId);
  const concept = curriculum?.concepts.find(
    (candidate) => candidate.id === conceptId,
  );

  return { concept, curriculum };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsedQuery = formativeAssessmentQuerySchema.safeParse(
    Object.fromEntries(url.searchParams.entries()),
  );

  if (!parsedQuery.success) {
    return errorResponse(
      "invalid_request",
      "Assessment query parameters are invalid.",
      400,
      parsedQuery.error.flatten(),
    );
  }

  const { conceptId, courseId, locale, phase } = parsedQuery.data;
  const { concept, curriculum } = resolveConcept(courseId, conceptId);

  if (!curriculum || !concept) {
    return errorResponse(
      "concept_not_found",
      "The requested curriculum concept was not found.",
      404,
    );
  }

  try {
    const assessment = getFormativeAssessment({ conceptId, locale, phase });
    const session = await auth();
    const conceptMemory = session?.user?.id
      ? getLearnerMemory(session.user.id, curriculum.course.id)
          .conceptMemories[conceptId]
      : undefined;

    return NextResponse.json({
      assessment,
      latestAttempt: toAttemptSummary(
        getLatestAssessmentAttempt(conceptMemory?.assessmentAttempts, phase),
      ),
      progress: getFormativeAssessmentProgress(
        conceptMemory?.assessmentAttempts,
      ),
    });
  } catch (error) {
    if (error instanceof FormativeAssessmentError) {
      return errorResponse(error.code, error.message, 404);
    }

    throw error;
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return errorResponse(
      "unauthorized",
      "Please log in to save formative assessment evidence.",
      401,
    );
  }

  const body = await request.json().catch(() => undefined);
  const parsedSubmission = formativeAssessmentSubmissionSchema.safeParse(body);

  if (!parsedSubmission.success) {
    return errorResponse(
      "invalid_request",
      "Assessment submission is invalid.",
      400,
      parsedSubmission.error.flatten(),
    );
  }

  const { answers, conceptId, courseId, locale, phase } =
    parsedSubmission.data;
  const { concept, curriculum } = resolveConcept(courseId, conceptId);

  if (!curriculum || !concept) {
    return errorResponse(
      "concept_not_found",
      "The requested curriculum concept was not found.",
      404,
    );
  }

  try {
    const graded = gradeFormativeAssessment({
      answers,
      conceptId,
      locale,
      phase,
    });
    const { attempt, conceptMemory } = recordFormativeAssessmentInDb({
      learnerId: session.user.id,
      courseId: curriculum.course.id,
      conceptId: concept.id,
      conceptTitle: concept.title,
      assessmentId: graded.assessment.id,
      assessmentVersion: graded.assessment.version,
      phase,
      score: graded.score,
      correctCount: graded.correctCount,
      questionCount: graded.questionCount,
      feedback: graded.feedback,
    });

    return NextResponse.json({
      attempt: toAttemptSummary(attempt),
      feedback: graded.feedback,
      progress: getFormativeAssessmentProgress(
        conceptMemory.assessmentAttempts,
      ),
      readiness: conceptMemory.readiness,
      status: conceptMemory.status,
    });
  } catch (error) {
    if (error instanceof FormativeAssessmentError) {
      return errorResponse(error.code, error.message, 400);
    }

    throw error;
  }
}
