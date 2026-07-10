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
      citationChunkIds: [],
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
      citationChunkIds: [],
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
      citationChunkIds: [],
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
      citationChunkIds: [],
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
      citationChunkIds: [],
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
  {
    id: "limit-laws-zero-over-zero",
    title: "Treats 0/0 as an indeterminate form",
    courseId: "ap-calculus-ab",
    conceptId: "evaluating-limits-with-limit-laws",
    locale: "en",
    currentSection: "Common trap",
    userMessage: "I got 0/0, so I think the limit must be zero.",
    expectedIntent: "misconception",
    expectedTeachingMove: "correct_misconception",
    expectedStudyAction: "repair_misconception",
    requiredTerms: ["0/0", "indeterminate", "limit"],
    forbiddenPatterns: ["just cancel", "answer key", "grade"],
    referenceResponse: {
      assistantMessage:
        "0/0 is an indeterminate form, not a limit value. It tells us direct substitution did not reveal the nearby behavior. The expression may simplify to a function with a finite limit, so the next step is to inspect its algebra rather than conclude the limit is zero.",
      suggestedFollowUps: [
        "Can you show me a factor-and-cancel example?",
        "When is direct substitution valid?",
      ],
      detectedMisconception: "The form 0/0 means the limit equals zero.",
      citationChunkIds: [],
      teachingMove: "correct_misconception",
      memorySignals: {
        confusionLevel: "medium",
        misconceptionType: "indeterminate_form_as_value",
        needsReview: true,
        suggestedStudyAction: "repair_misconception",
        confidenceDelta: -4,
        evidenceNote:
          "Student interpreted an indeterminate form as a final limit value.",
      },
    },
  },
  {
    id: "squeeze-theorem-bounds",
    title: "Explains why matching bounds determine a limit",
    courseId: "ap-calculus-ab",
    conceptId: "squeeze-theorem",
    locale: "en",
    currentSection: "Formal idea",
    userMessage: "I do not understand why both bounds have to approach the same value.",
    expectedIntent: "confusion",
    expectedTeachingMove: "explain",
    expectedStudyAction: "review_confusing_section",
    requiredTerms: ["lower bound", "upper bound", "same value"],
    forbiddenPatterns: ["memorize", "quiz"],
    referenceResponse: {
      assistantMessage:
        "The lower bound prevents the middle function from escaping downward, and the upper bound prevents it from escaping upward. When both bounds approach the same value, the vertical gap between them closes around that value, leaving the trapped function no other possible limit.",
      suggestedFollowUps: [
        "Can you show the x²sin(1/x) example?",
        "What if the bounds approach different values?",
      ],
      citationChunkIds: [],
      teachingMove: "explain",
      memorySignals: {
        confusionLevel: "medium",
        needsReview: true,
        suggestedStudyAction: "review_confusing_section",
        confidenceDelta: -2,
        evidenceNote:
          "Student needs a conceptual explanation of matching squeeze bounds.",
      },
    },
  },
  {
    id: "continuity-three-conditions",
    title: "Separates limit existence from continuity",
    courseId: "ap-calculus-ab",
    conceptId: "continuity-at-a-point",
    locale: "en",
    currentSection: "Common trap",
    userMessage: "If the limit exists, why is the function not automatically continuous?",
    expectedIntent: "confusion",
    expectedTeachingMove: "explain",
    expectedStudyAction: "review_confusing_section",
    requiredTerms: ["limit", "function value", "continuous"],
    forbiddenPatterns: ["just draw", "score"],
    referenceResponse: {
      assistantMessage:
        "An existing limit checks only the nearby destination. To be continuous at c, the function value f(c) must also be defined and equal that limit. A graph can approach 2 while f(c) is missing or equals 5, so the limit exists but the function is not continuous there.",
      suggestedFollowUps: [
        "What are the three conditions in order?",
        "How can a removable discontinuity be repaired?",
      ],
      citationChunkIds: [],
      teachingMove: "explain",
      memorySignals: {
        confusionLevel: "medium",
        needsReview: true,
        suggestedStudyAction: "review_confusing_section",
        confidenceDelta: -2,
        evidenceNote:
          "Student conflated limit existence with all continuity conditions.",
      },
    },
  },
  {
    id: "ivt-application",
    title: "Guides a precise Intermediate Value Theorem argument",
    courseId: "ap-calculus-ab",
    conceptId: "intermediate-value-theorem",
    locale: "en",
    currentSection: "Try applying it",
    userMessage: "How do I use IVT to show that a root exists?",
    expectedIntent: "application",
    expectedTeachingMove: "ask_guiding_question",
    expectedStudyAction: "ready_for_application",
    requiredTerms: ["continuous", "closed interval", "root"],
    forbiddenPatterns: ["the correct answer", "points", "grade"],
    referenceResponse: {
      assistantMessage:
        "Start with two checks: is the function continuous on the closed interval, and do the endpoint outputs lie on opposite sides of 0? If both are true, what does the Intermediate Value Theorem guarantee about at least one input between the endpoints where the function equals 0, a root?",
      suggestedFollowUps: [
        "Why does continuity matter?",
        "Does IVT prove the root is unique?",
      ],
      citationChunkIds: [],
      teachingMove: "ask_guiding_question",
      memorySignals: {
        confusionLevel: "low",
        needsReview: false,
        suggestedStudyAction: "ready_for_application",
        confidenceDelta: 5,
        evidenceNote:
          "Student is ready to structure an IVT existence argument.",
      },
    },
  },
  {
    id: "limits-at-infinity-zh",
    title: "Chinese response distinguishes unbounded inputs and outputs",
    courseId: "ap-calculus-ab",
    conceptId: "limits-at-infinity",
    locale: "zh",
    currentSection: "Common trap",
    userMessage: "无穷远处的极限和无穷极限到底有什么不同？",
    expectedIntent: "confusion",
    expectedTeachingMove: "explain",
    expectedStudyAction: "review_confusing_section",
    requiredTerms: [
      "无穷远处的极限（limit at infinity）",
      "无穷极限（infinite limit）",
      "输入（input）",
    ],
    forbiddenPatterns: ["刷题", "题库"],
    referenceResponse: {
      assistantMessage:
        "无穷远处的极限（limit at infinity）描述输入（input）x 无界增大或减小时，函数值的端行为；无穷极限（infinite limit）描述 x 靠近某个有限输入时，函数值变得无界。前者常联系水平渐近线（horizontal asymptote），后者常联系垂直渐近线（vertical asymptote）。",
      suggestedFollowUps: [
        "能用两个符号表达式对比吗？",
        "水平渐近线为什么可以被穿过？",
      ],
      citationChunkIds: [],
      teachingMove: "explain",
      memorySignals: {
        confusionLevel: "medium",
        needsReview: true,
        suggestedStudyAction: "review_confusing_section",
        confidenceDelta: -2,
        evidenceNote:
          "学生需要区分输入（input）无界与输出（output）无界。",
      },
    },
  },
];
