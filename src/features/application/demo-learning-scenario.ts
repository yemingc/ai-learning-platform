type DemoAssessmentQuestion = {
  id: string;
  options: Array<{ id: string }>;
};

type DemoAnswerKey = Array<{
  questionId: string;
  correctOptionId: string;
}>;

export type DemoScenarioStep = {
  conceptId: string;
  phase: "diagnostic" | "exit_ticket";
  correctAnswerCount: number;
};

export const DEMO_LEARNING_SCENARIO: DemoScenarioStep[] = [
  {
    conceptId: "what-is-a-limit",
    phase: "diagnostic",
    correctAnswerCount: 0,
  },
  {
    conceptId: "what-is-a-limit",
    phase: "exit_ticket",
    correctAnswerCount: 2,
  },
  {
    conceptId: "limit-notation",
    phase: "diagnostic",
    correctAnswerCount: 1,
  },
  {
    conceptId: "limit-notation",
    phase: "exit_ticket",
    correctAnswerCount: 1,
  },
  {
    conceptId: "estimating-limits-from-graphs",
    phase: "diagnostic",
    correctAnswerCount: 0,
  },
];

export function buildDemoAssessmentAnswers({
  answerKey,
  correctAnswerCount,
  questions,
}: {
  answerKey: DemoAnswerKey;
  correctAnswerCount: number;
  questions: DemoAssessmentQuestion[];
}) {
  if (
    !Number.isInteger(correctAnswerCount) ||
    correctAnswerCount < 0 ||
    correctAnswerCount > questions.length ||
    answerKey.length !== questions.length
  ) {
    throw new Error("Demo assessment target does not match the assessment.");
  }

  const keyByQuestion = new Map(
    answerKey.map((item) => [item.questionId, item.correctOptionId]),
  );

  return questions.map((question, index) => {
    const correctOptionId = keyByQuestion.get(question.id);

    if (!correctOptionId) {
      throw new Error(`Demo answer key is missing question ${question.id}.`);
    }

    const selectedOptionId =
      index < correctAnswerCount
        ? correctOptionId
        : question.options.find((option) => option.id !== correctOptionId)?.id;

    if (!selectedOptionId) {
      throw new Error(`Question ${question.id} has no usable demo answer.`);
    }

    return {
      questionId: question.id,
      selectedOptionId,
    };
  });
}
