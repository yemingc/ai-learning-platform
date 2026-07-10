import type {
  LessonApplicationPrompt,
  LessonGuidedQuestion,
  LessonMisconceptionCheck,
  LessonObjective,
  LessonPrerequisiteConnection,
  LessonReflectionPrompt,
  LessonWorkedExample,
} from "@/features/lessons/types";

type Unit1LessonDraft = {
  conceptId: string;
  title: string;
  objective: LessonObjective;
  hook: string;
  intuition: string;
  formalExplanation: string;
  prerequisiteConnections: LessonPrerequisiteConnection[];
  workedExamples: LessonWorkedExample[];
  guidedQuestions: LessonGuidedQuestion[];
  misconceptionChecks: LessonMisconceptionCheck[];
  reflectionPrompt: LessonReflectionPrompt;
  applicationPrompt: LessonApplicationPrompt;
  keyTakeaways: string[];
};

export const unit1ExtensionLessonMetadata = {
  "evaluating-limits-with-limit-laws": {
    retrievalTags: [
      "limit laws",
      "direct substitution",
      "sum product quotient limits",
    ],
    glossaryTerms: [
      {
        term: "limit laws",
        definition:
          "Rules that combine known limits through sums, differences, constant multiples, products, quotients, and powers.",
      },
      {
        term: "direct substitution",
        definition:
          "Evaluating a limit by replacing x with the target when the function is continuous there.",
      },
    ],
  },
  "squeeze-theorem": {
    retrievalTags: ["Squeeze Theorem", "bounds", "oscillation"],
    glossaryTerms: [
      {
        term: "Squeeze Theorem",
        definition:
          "If a function stays between two functions with the same limit, its limit must be that shared value.",
      },
      {
        term: "bounding functions",
        definition:
          "Lower and upper functions that trap another function near a target input.",
      },
    ],
  },
  "continuity-at-a-point": {
    retrievalTags: [
      "continuity",
      "continuity at a point",
      "removable discontinuity",
    ],
    glossaryTerms: [
      {
        term: "continuous at a point",
        definition:
          "A function is continuous at x = c when f(c) exists, the limit as x approaches c exists, and the two values are equal.",
      },
      {
        term: "discontinuity",
        definition:
          "A point where at least one condition required for continuity fails.",
      },
    ],
  },
  "intermediate-value-theorem": {
    retrievalTags: [
      "Intermediate Value Theorem",
      "continuity on an interval",
      "existence guarantee",
    ],
    glossaryTerms: [
      {
        term: "Intermediate Value Theorem",
        definition:
          "A continuous function on a closed interval takes every output value between its endpoint outputs.",
      },
      {
        term: "existence guarantee",
        definition:
          "A conclusion that at least one input has a property without identifying the exact input.",
      },
    ],
  },
  "limits-at-infinity": {
    retrievalTags: [
      "limits at infinity",
      "end behavior",
      "horizontal asymptotes",
    ],
    glossaryTerms: [
      {
        term: "limit at infinity",
        definition:
          "The output behavior of a function as the input increases or decreases without bound.",
      },
      {
        term: "horizontal asymptote",
        definition:
          "A horizontal line that describes a function's end behavior in at least one direction.",
      },
    ],
  },
} satisfies Record<
  string,
  {
    retrievalTags: string[];
    glossaryTerms: Array<{
      term: string;
      definition: string;
      aliases?: string[];
    }>;
  }
>;

export const apCalculusABUnit1ExtensionLessons: Unit1LessonDraft[] = [
  {
    conceptId: "evaluating-limits-with-limit-laws",
    title: "Evaluating limits with limit laws",
    objective: {
      title: "Combine known limits with justified operations",
      description:
        "Use limit laws and direct substitution to evaluate limits while recognizing when a quotient or indeterminate form needs more analysis.",
      successCriteria: [
        "Select a valid sum, product, quotient, power, or constant-multiple law.",
        "Use direct substitution only when continuity justifies it.",
        "Treat 0/0 as a signal for more work rather than as a final value.",
      ],
    },
    hook:
      "Once you know the limits of simpler pieces, you should not have to rebuild every combined limit from a graph or table. Limit laws let reliable local behavior travel through algebra.",
    intuition:
      "If f(x) stays close to 3 and g(x) stays close to 4 near the same input, then f(x) + 2g(x) stays close to 3 + 2(4) = 11. The algebra of nearby values predicts the algebra of their limits, provided the operation itself does not create a forbidden situation such as division by a value approaching zero.",
    formalExplanation:
      "Suppose lim f(x) = L and lim g(x) = M as x approaches c. Then the limits of f + g, f - g, kf, fg, and integer powers can be found by applying the same operation to L and M. For f/g, the quotient law requires M ≠ 0. Polynomials are continuous everywhere, and rational functions are continuous wherever their denominators are nonzero, so direct substitution is justified at those inputs.",
    prerequisiteConnections: [
      {
        conceptId: "limit-notation",
        title: "Limit notation",
        connection:
          "Limit laws operate on complete limit statements, so the approaching input and approached output must be read accurately.",
      },
      {
        conceptId: "one-sided-limits",
        title: "One-sided limits",
        connection:
          "The same laws apply directionally when all required one-sided limits exist.",
      },
    ],
    workedExamples: [
      {
        title: "Combine two known local behaviors",
        setup:
          "As x approaches 2, suppose f(x) approaches 3 and g(x) approaches 4. Evaluate the limit of f(x) + 2g(x).",
        walkthrough: [
          "Use the sum law to separate the two terms.",
          "Use the constant-multiple law on 2g(x).",
          "Replace the component limits with 3 and 4.",
          "Compute 3 + 2(4) = 11.",
        ],
        takeaway:
          "Limit laws preserve the structure of a valid algebraic combination of known limits.",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "If the denominator of a quotient approaches 5, what condition of the quotient law has been checked?",
        hint: "Ask whether the approached denominator is zero.",
        targetInsight:
          "The denominator limit is nonzero, so the quotient law may be applied.",
      },
      {
        prompt:
          "If direct substitution produces 0/0, why is 0 not the limit?",
        hint: "0/0 is not a defined quotient.",
        targetInsight:
          "The form is indeterminate and does not determine the nearby behavior; algebraic simplification or another method is needed.",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "Every limit can be found by direct substitution.",
        checkPrompt:
          "What happens when substitution makes a rational expression's denominator zero?",
        correction:
          "Substitution is justified by continuity. A zero denominator means the expression needs further analysis.",
      },
      {
        misconception: "A 0/0 result means the limit is zero or does not exist.",
        checkPrompt:
          "Could two factors cancel for every nearby x even though both are zero at the target?",
        correction:
          "Yes. The nearby expression may simplify to a function with a finite limit, so 0/0 is only a diagnostic signal.",
      },
    ],
    reflectionPrompt: {
      prompt:
        "How do you decide whether a limit law finishes the problem or only begins the analysis?",
      sentenceStarter:
        "I can finish with limit laws when ____, but I need another step when ____.",
    },
    applicationPrompt: {
      title: "Audit a substitution strategy",
      prompt:
        "For a polynomial, a rational function with nonzero denominator, and a rational expression producing 0/0, explain which can be evaluated immediately and why.",
      whyItTransfers:
        "AP limit problems reward choosing a justified method before doing algebra.",
    },
    keyTakeaways: [
      "Limit laws combine known local behaviors through valid algebraic operations.",
      "Direct substitution is a consequence of continuity, not a universal trick.",
      "The form 0/0 is indeterminate and calls for more analysis.",
    ],
  },
  {
    conceptId: "squeeze-theorem",
    title: "The Squeeze Theorem",
    objective: {
      title: "Determine a difficult limit from matching bounds",
      description:
        "Use lower and upper bounding functions with the same limit to determine the limit of a trapped function.",
      successCriteria: [
        "Identify an inequality that holds near the target input.",
        "Verify that both bounding functions approach the same value.",
        "Conclude only the trapped function's limit, not its point value.",
      ],
    },
    hook:
      "A function can oscillate too wildly to read directly and still have a completely predictable limit. Instead of chasing the oscillation, trap it between two simpler behaviors.",
    intuition:
      "Imagine a moving point confined inside a narrowing hallway. If the floor and ceiling both close toward height 0, the point has nowhere else to go. For x²sin(1/x), the sine factor oscillates, but multiplying by x² shrinks the entire oscillation between -x² and x².",
    formalExplanation:
      "If g(x) ≤ f(x) ≤ h(x) for all x sufficiently close to c, and both lim g(x) and lim h(x) equal L as x approaches c, then lim f(x) also equals L. The inequalities need only hold in a deleted neighborhood of c; the value at c is irrelevant to the limit conclusion.",
    prerequisiteConnections: [
      {
        conceptId: "evaluating-limits-with-limit-laws",
        title: "Evaluating limits with limit laws",
        connection:
          "Limit laws make the limits of the simpler bounding functions quick to verify.",
      },
      {
        conceptId: "what-is-a-limit",
        title: "What is a limit?",
        connection:
          "The theorem depends entirely on nearby behavior, not the value at the target.",
      },
    ],
    workedExamples: [
      {
        title: "Shrink an oscillation",
        setup:
          "Evaluate lim x→0 x²sin(1/x), knowing that -1 ≤ sin(1/x) ≤ 1.",
        walkthrough: [
          "Because x² ≥ 0, multiply the inequality by x² to get -x² ≤ x²sin(1/x) ≤ x².",
          "Use limit laws to show both -x² and x² approach 0.",
          "The middle function remains trapped between bounds approaching the same value.",
          "Conclude that x²sin(1/x) approaches 0.",
        ],
        takeaway:
          "The oscillation does not need its own limit once its amplitude is squeezed to zero.",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "Why is knowing only an upper bound that approaches 0 not enough?",
        hint: "The function might still fall far below that bound.",
        targetInsight:
          "A matching lower bound is needed to prevent escape in the other direction.",
      },
      {
        prompt:
          "Does x²sin(1/x) need to be defined at x = 0 for this limit?",
        hint: "Recall what a deleted neighborhood excludes.",
        targetInsight:
          "No. The theorem uses inequalities for nearby nonzero x-values.",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "Any two bounds prove the limit.",
        checkPrompt:
          "What if the lower bound approaches -1 and the upper bound approaches 1?",
        correction:
          "The bounds must approach the same value; otherwise the trapped function still has room for multiple behaviors.",
      },
      {
        misconception: "The inequality must hold at the target input.",
        checkPrompt:
          "Can a limit theorem use nearby x-values when the middle function is undefined at c?",
        correction:
          "Yes. It is enough for the inequality to hold sufficiently close to c, excluding c itself.",
      },
    ],
    reflectionPrompt: {
      prompt:
        "Explain why narrowing amplitude can produce a limit even when oscillation never slows down.",
      sentenceStarter:
        "The function may keep oscillating, but its possible outputs are trapped between ____ and ____.",
    },
    applicationPrompt: {
      title: "Build a squeeze argument",
      prompt:
        "Given |q(x)| ≤ 3x² near x = 0, construct two bounds and justify the limit of q(x).",
      whyItTransfers:
        "Absolute-value bounds are a common route to Squeeze Theorem arguments in calculus.",
    },
    keyTakeaways: [
      "A trapped function inherits the shared limit of its lower and upper bounds.",
      "Both bounds must approach the same value.",
      "The inequality only needs to hold near the target input.",
    ],
  },
  {
    conceptId: "continuity-at-a-point",
    title: "Continuity at a point",
    objective: {
      title: "Check the three conditions for continuity",
      description:
        "Determine whether a function is continuous at an input by checking its value, its two-sided limit, and equality between them.",
      successCriteria: [
        "Verify that f(c) is defined.",
        "Verify that the two-sided limit at c exists.",
        "Compare the limit with f(c) and identify which condition fails at a discontinuity.",
      ],
    },
    hook:
      "The phrase 'draw it without lifting your pencil' is a useful picture, but calculus needs a test precise enough for formulas, tables, and piecewise definitions.",
    intuition:
      "Continuity means the function's nearby destination agrees with the value assigned at the point. A graph can approach the right height and still be discontinuous if the point is missing or placed somewhere else.",
    formalExplanation:
      "A function f is continuous at x = c exactly when three conditions hold: f(c) is defined; lim x→c f(x) exists; and lim x→c f(x) = f(c). Failure of any condition creates a discontinuity at c. A removable discontinuity has an existing finite limit but a missing or mismatched function value.",
    prerequisiteConnections: [
      {
        conceptId: "estimating-limits-from-graphs",
        title: "Estimating limits from graphs",
        connection:
          "Graphical limit reasoning supplies the second continuity condition.",
      },
      {
        conceptId: "evaluating-limits-with-limit-laws",
        title: "Evaluating limits with limit laws",
        connection:
          "Limit laws and substitution often verify continuity for algebraic functions.",
      },
    ],
    workedExamples: [
      {
        title: "Repair a removable discontinuity",
        setup:
          "For x ≠ 1, let f(x) = (x² - 1)/(x - 1), and let f(1) = 5. Is f continuous at 1?",
        walkthrough: [
          "The function value f(1) is defined and equals 5.",
          "For nearby x ≠ 1, simplify the expression to x + 1.",
          "The two-sided limit as x approaches 1 is 2.",
          "Because the limit 2 does not equal f(1) = 5, the function is not continuous at 1. Defining f(1) = 2 would repair it.",
        ],
        takeaway:
          "An existing limit is necessary but not sufficient; the assigned point value must agree with it.",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "If f(c) is undefined but the two-sided limit exists, which continuity condition fails?",
        hint: "Start with the point value condition.",
        targetInsight:
          "The first condition fails, so the function is not continuous even though the limit exists.",
      },
      {
        prompt:
          "If left- and right-hand limits disagree, do you need to compare anything with f(c)?",
        hint: "The two-sided limit condition has already failed.",
        targetInsight:
          "No. Without an existing two-sided limit, continuity is impossible regardless of the point value.",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "If f(c) exists, the function is continuous at c.",
        checkPrompt:
          "Could a filled point sit away from the height approached by the graph?",
        correction:
          "Yes. The function value must also equal an existing two-sided limit.",
      },
      {
        misconception: "If the limit exists, the function is continuous.",
        checkPrompt:
          "What if the graph approaches 2 but f(c) is missing or equals 5?",
        correction:
          "The limit condition holds, but equality with the defined point value fails.",
      },
    ],
    reflectionPrompt: {
      prompt:
        "Describe continuity as an agreement between two kinds of information.",
      sentenceStarter:
        "Continuity at c requires the nearby behavior ____ to agree with the point value ____.",
    },
    applicationPrompt: {
      title: "Choose a parameter for continuity",
      prompt:
        "For a piecewise function with a boundary at x = 2, describe how you would choose a missing parameter so the left limit, right limit, and function value agree.",
      whyItTransfers:
        "Parameter-for-continuity problems directly assess the three-condition framework.",
    },
    keyTakeaways: [
      "Continuity at c requires a defined point value, an existing two-sided limit, and equality between them.",
      "A limit can exist while continuity fails.",
      "Removable discontinuities can be repaired by assigning the limit value.",
    ],
  },
  {
    conceptId: "intermediate-value-theorem",
    title: "The Intermediate Value Theorem",
    objective: {
      title: "Use continuity to guarantee an output",
      description:
        "Apply the Intermediate Value Theorem to determine when a continuous function must attain a value between two endpoint outputs.",
      successCriteria: [
        "Verify continuity on a closed interval.",
        "Check that the target output lies between the endpoint outputs.",
        "State an existence conclusion without claiming uniqueness or an exact input.",
      ],
    },
    hook:
      "If a continuous road starts below sea level and ends above it, the road must cross sea level somewhere. Continuity turns that visual certainty into a theorem.",
    intuition:
      "A continuous graph cannot teleport over an intermediate height. As it travels from f(a) to f(b), it must pass through every y-value between them, although it may pass through a value more than once.",
    formalExplanation:
      "If f is continuous on the closed interval [a, b] and N lies between f(a) and f(b), then there is at least one number c in [a, b] such that f(c) = N. If N is strictly between the endpoint outputs, c can be chosen in (a, b). The theorem guarantees existence, not the location or uniqueness of c.",
    prerequisiteConnections: [
      {
        conceptId: "continuity-at-a-point",
        title: "Continuity at a point",
        connection:
          "The theorem requires continuity throughout an interval, extending the local condition from one point.",
      },
      {
        conceptId: "estimating-limits-from-graphs",
        title: "Estimating limits from graphs",
        connection:
          "Graph tracing provides the visual model that a continuous curve cannot skip a height.",
      },
    ],
    workedExamples: [
      {
        title: "Guarantee a root without finding it",
        setup:
          "A polynomial p satisfies p(1) = -2 and p(3) = 5. Show that p(c) = 0 for some c between 1 and 3.",
        walkthrough: [
          "Polynomials are continuous, so p is continuous on [1, 3].",
          "The target output 0 lies between -2 and 5.",
          "Apply the Intermediate Value Theorem.",
          "Conclude that at least one c in (1, 3) satisfies p(c) = 0.",
        ],
        takeaway:
          "The theorem proves a root exists without calculating the root itself.",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "Why are endpoint values on opposite sides of 0 not enough without continuity?",
        hint: "Imagine a graph with a jump.",
        targetInsight:
          "A discontinuous function could jump from negative to positive values without ever equaling 0.",
      },
      {
        prompt:
          "If the theorem guarantees f(c) = 2, can you conclude there is exactly one such c?",
        hint: "A continuous curve can cross the same height repeatedly.",
        targetInsight:
          "No. The theorem guarantees at least one input, not uniqueness.",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "The theorem finds the exact input c.",
        checkPrompt:
          "What numerical equation has actually been solved when only endpoint signs are known?",
        correction:
          "None. The theorem proves at least one input exists but does not locate it.",
      },
      {
        misconception: "Endpoint outputs surrounding N always guarantee f(c) = N.",
        checkPrompt:
          "Could a jump discontinuity skip directly over N?",
        correction:
          "Yes. Continuity on the entire closed interval is an essential hypothesis.",
      },
    ],
    reflectionPrompt: {
      prompt:
        "How is an existence proof different from solving for an exact input?",
      sentenceStarter:
        "The theorem tells me that ____ exists, but it does not tell me ____.",
    },
    applicationPrompt: {
      title: "Verify an IVT claim",
      prompt:
        "Given a function, an interval, and a target output, list the two hypotheses you must verify and write the precise existence conclusion.",
      whyItTransfers:
        "AP free-response questions award separate reasoning for continuity, bracketing, and conclusion.",
    },
    keyTakeaways: [
      "Continuity prevents a function from skipping intermediate outputs.",
      "The target output must lie between the endpoint outputs.",
      "The theorem guarantees existence, not an exact location or uniqueness.",
    ],
  },
  {
    conceptId: "limits-at-infinity",
    title: "Limits at infinity and end behavior",
    objective: {
      title: "Describe function behavior for unbounded inputs",
      description:
        "Analyze limits as x approaches positive or negative infinity and connect finite limiting values to horizontal asymptotes.",
      successCriteria: [
        "Distinguish a limit at infinity from an infinite limit.",
        "Compare dominant terms of a rational function.",
        "Interpret horizontal asymptotes as directional end behavior that a graph may cross.",
      ],
    },
    hook:
      "Limits also describe what a function does far beyond any fixed input. Instead of zooming into one x-value, we zoom out and ask what pattern survives at the ends of the graph.",
    intuition:
      "For very large |x|, lower-degree terms become small compared with the highest powers. In (2x² + 1)/(x² + 3), dividing by x² reveals a ratio that gets closer to 2 as 1/x² fades toward 0.",
    formalExplanation:
      "A limit as x approaches positive or negative infinity describes end behavior, not behavior near a finite input. For rational functions, divide numerator and denominator by the highest power appearing in the denominator. Terms containing 1/xᵏ approach 0. Equal degrees lead to the ratio of leading coefficients; a lower numerator degree leads to 0. A finite end-behavior limit y = L gives a horizontal asymptote in that direction.",
    prerequisiteConnections: [
      {
        conceptId: "infinite-limits",
        title: "Infinite limits",
        connection:
          "Infinite limits use a finite input and unbounded outputs; limits at infinity reverse that focus to unbounded inputs.",
      },
      {
        conceptId: "evaluating-limits-with-limit-laws",
        title: "Evaluating limits with limit laws",
        connection:
          "After normalizing dominant powers, limit laws evaluate the remaining constant and vanishing terms.",
      },
    ],
    workedExamples: [
      {
        title: "Compare leading terms",
        setup:
          "Evaluate lim x→∞ (2x² + 1)/(x² + 3).",
        walkthrough: [
          "Divide every term in numerator and denominator by x².",
          "Rewrite the expression as (2 + 1/x²)/(1 + 3/x²).",
          "As x grows without bound, both 1/x² and 3/x² approach 0.",
          "Use the quotient law to obtain 2/1 = 2.",
        ],
        takeaway:
          "The ratio of leading coefficients controls the end behavior when numerator and denominator have equal degree.",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "What changes in the notation between an infinite limit and a limit at infinity?",
        hint: "Look at whether infinity describes x or f(x).",
        targetInsight:
          "In a limit at infinity, x becomes unbounded; in an infinite limit, x approaches a finite input while f(x) becomes unbounded.",
      },
      {
        prompt:
          "Can a graph cross a horizontal asymptote and still approach it as x→∞?",
        hint: "A limit constrains eventual behavior, not every finite input.",
        targetInsight:
          "Yes. The graph may cross the line and still settle toward it in the long run.",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "A horizontal asymptote is a line the graph cannot cross.",
        checkPrompt:
          "Does end behavior say what happens at every finite x-value?",
        correction:
          "No. A horizontal asymptote describes a long-run trend, and the graph may cross it at finite inputs.",
      },
      {
        misconception: "Limits at infinity and infinite limits are the same.",
        checkPrompt:
          "Which quantity is unbounded in each phrase: the input or the output?",
        correction:
          "A limit at infinity has unbounded input; an infinite limit has unbounded output near a finite input.",
      },
    ],
    reflectionPrompt: {
      prompt:
        "Explain how dividing by the dominant power exposes end behavior.",
      sentenceStarter:
        "After dividing by ____, the terms ____ vanish and the surviving ratio is ____.",
    },
    applicationPrompt: {
      title: "Classify rational end behavior",
      prompt:
        "Compare numerator and denominator degrees in three rational functions and predict whether the limit at infinity is 0, a leading-coefficient ratio, or unbounded.",
      whyItTransfers:
        "Dominant-term reasoning supports later analysis of asymptotes and function behavior.",
    },
    keyTakeaways: [
      "Limits at infinity describe output behavior as the input becomes unbounded.",
      "Dominant powers determine rational-function end behavior.",
      "Horizontal asymptotes describe long-run trends and may be crossed.",
    ],
  },
];
