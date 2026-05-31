import type { TeacherEvaluationCase } from "@/features/ai-teacher/evaluation/eval-types";

export const teacherEvaluationCases: TeacherEvaluationCase[] = [
  {
    id: "limit-function-value-misconception",
    title: "Corrects limit vs function value misconception",
    courseId: "ap-calculus-ab",
    conceptId: "what-is-a-limit",
    locale: "en",
    currentSection: "Common trap",
    userMessage: "I think the limit is always the same as the function value.",
    expectedIntent: "misconception",
    expectedTeachingMove: "correct_misconception",
    expectedStudyAction: "repair_misconception",
    requiredTerms: ["limit", "function value"],
    forbiddenPatterns: ["just memorize", "question bank", "practice set"],
    referenceResponse: {
      assistantMessage:
        "That is a common trap. A limit describes what nearby function values approach, while the function value is only what happens at the exact input. If a graph has a hole at x = 2 but approaches y = 4, the limit is 4 even if f(2) is missing or different.",
      suggestedFollowUps: [
        "Can you give me a graph example?",
        "Why does the exact point not decide the limit?",
      ],
      detectedMisconception:
        "The limit is always the same as the function value.",
      teachingMove: "correct_misconception",
      memorySignals: {
        confusionLevel: "medium",
        misconceptionType: "limit_vs_function_value",
        needsReview: true,
        suggestedStudyAction: "repair_misconception",
        confidenceDelta: -4,
        evidenceNote:
          "Student confused nearby behavior with the exact function value.",
      },
    },
  },
  {
    id: "notation-confusion",
    title: "Explains limit notation from symbols to meaning",
    courseId: "ap-calculus-ab",
    conceptId: "limit-notation",
    locale: "en",
    currentSection: "Formal idea",
    userMessage: "I do not understand what x approaches a means.",
    expectedIntent: "confusion",
    expectedTeachingMove: "explain",
    expectedStudyAction: "review_confusing_section",
    requiredTerms: ["approaches", "input", "output"],
    forbiddenPatterns: ["just plug in", "quiz"],
    referenceResponse: {
      assistantMessage:
        "Think of x approaches a as choosing inputs that get closer and closer to a, without needing to equal a. The notation asks what output value f(x) gets close to during that approach.",
      suggestedFollowUps: [
        "Can you explain the notation piece by piece?",
        "Give me a number-line example.",
      ],
      teachingMove: "explain",
      memorySignals: {
        confusionLevel: "medium",
        needsReview: true,
        suggestedStudyAction: "review_confusing_section",
        confidenceDelta: -2,
        evidenceNote:
          "Student asked for help interpreting the formal notation.",
      },
    },
  },
  {
    id: "graph-estimation-example",
    title: "Gives an alternate graph-reading example",
    courseId: "ap-calculus-ab",
    conceptId: "estimating-limits-from-graphs",
    locale: "en",
    currentSection: "Worked example",
    userMessage: "Can you give me another example from a graph?",
    expectedIntent: "example_request",
    expectedTeachingMove: "give_example",
    expectedStudyAction: "continue_learning",
    requiredTerms: ["graph", "left", "right"],
    forbiddenPatterns: ["answer key", "multiple choice"],
    referenceResponse: {
      assistantMessage:
        "Imagine a graph where, as x moves toward 3 from the left, the y-values approach 5, and as x moves toward 3 from the right, the y-values also approach 5. Even if the point at x = 3 is open, the graph suggests the limit is 5.",
      suggestedFollowUps: [
        "What if the left and right sides approach different values?",
        "How do I read this from a table?",
      ],
      teachingMove: "give_example",
      memorySignals: {
        confusionLevel: "low",
        needsReview: false,
        suggestedStudyAction: "continue_learning",
        confidenceDelta: 3,
        evidenceNote:
          "Student requested an alternate graph example, suggesting active learning.",
      },
    },
  },
  {
    id: "one-sided-limit-zh",
    title: "Chinese response keeps academic English terms",
    courseId: "ap-calculus-ab",
    conceptId: "one-sided-limits",
    locale: "zh",
    currentSection: "Intuition",
    userMessage: "我不懂左极限和右极限为什么要分开看。",
    expectedIntent: "confusion",
    expectedTeachingMove: "explain",
    expectedStudyAction: "review_confusing_section",
    requiredTerms: [
      "左极限（left-hand limit）",
      "右极限（right-hand limit）",
      "极限（limit）",
    ],
    forbiddenPatterns: ["题库", "刷题"],
    referenceResponse: {
      assistantMessage:
        "左极限（left-hand limit）看的是 x 从左边靠近目标点时，函数值（function value）靠近哪里；右极限（right-hand limit）看的是 x 从右边靠近时靠近哪里。只有两边靠近同一个值，整体极限（limit）才存在。",
      suggestedFollowUps: [
        "能给我一个左右不一样的例子吗？",
        "为什么两边必须相同？",
      ],
      teachingMove: "explain",
      memorySignals: {
        confusionLevel: "medium",
        needsReview: true,
        suggestedStudyAction: "review_confusing_section",
        confidenceDelta: -2,
        evidenceNote:
          "学生对单侧极限（one-sided limit）的左右方向含义感到困惑。",
      },
    },
  },
  {
    id: "infinite-limit-application",
    title: "Guides application without becoming quiz grading",
    courseId: "ap-calculus-ab",
    conceptId: "infinite-limits",
    locale: "en",
    currentSection: "Try applying it",
    userMessage: "How would I apply infinite limits to a vertical asymptote?",
    expectedIntent: "application",
    expectedTeachingMove: "ask_guiding_question",
    expectedStudyAction: "ready_for_application",
    requiredTerms: ["infinite limit", "vertical asymptote"],
    forbiddenPatterns: ["score", "grade", "correct answer is"],
    referenceResponse: {
      assistantMessage:
        "Use an infinite limit to describe outputs growing without bound near an input. For a vertical asymptote, ask: as x gets closer to the asymptote from each side, do the y-values rise toward infinity or fall toward negative infinity?",
      suggestedFollowUps: [
        "What does from each side change?",
        "Give me a quick asymptote example.",
      ],
      teachingMove: "ask_guiding_question",
      memorySignals: {
        confusionLevel: "low",
        needsReview: false,
        suggestedStudyAction: "ready_for_application",
        confidenceDelta: 5,
        evidenceNote:
          "Student is connecting the concept to application after the lesson.",
      },
    },
  },
];
