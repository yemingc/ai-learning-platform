import type {
  Concept,
  ConceptDependency,
  Topic,
} from "@/features/knowledge/types";

const COURSE_ID = "ap-calculus-ab";
const UNIT_ID = "ap-calculus-ab-unit-1-limits-continuity";

export const apCalculusABUnit1ExtensionTopics: Topic[] = [
  {
    id: "unit-1-topic-limit-laws-and-squeeze",
    unitId: UNIT_ID,
    sequence: 4,
    title: "Limit laws and bounding arguments",
    description:
      "Evaluating algebraic limits with justified laws and determining difficult limits by trapping behavior between simpler bounds.",
    conceptIds: ["evaluating-limits-with-limit-laws", "squeeze-theorem"],
  },
  {
    id: "unit-1-topic-continuity-and-ivt",
    unitId: UNIT_ID,
    sequence: 5,
    title: "Continuity and existence theorems",
    description:
      "Checking continuity precisely and using continuity on an interval to guarantee intermediate outputs.",
    conceptIds: ["continuity-at-a-point", "intermediate-value-theorem"],
  },
  {
    id: "unit-1-topic-end-behavior",
    unitId: UNIT_ID,
    sequence: 6,
    title: "Limits at infinity and end behavior",
    description:
      "Analyzing function behavior for unbounded inputs and connecting finite end behavior to horizontal asymptotes.",
    conceptIds: ["limits-at-infinity"],
  },
];

export const apCalculusABUnit1ExtensionConcepts: Concept[] = [
  {
    id: "evaluating-limits-with-limit-laws",
    courseId: COURSE_ID,
    unitId: UNIT_ID,
    topicId: "unit-1-topic-limit-laws-and-squeeze",
    title: "Evaluating limits with limit laws",
    description:
      "Combine known limits through valid algebraic operations, use direct substitution when continuity justifies it, and recognize indeterminate forms that require another method.",
    prerequisiteConceptIds: ["limit-notation", "one-sided-limits"],
    learningObjectives: [
      {
        id: "lo-limit-laws-combine",
        conceptId: "evaluating-limits-with-limit-laws",
        title: "Apply limit laws",
        description:
          "Evaluate sums, differences, constant multiples, products, quotients, and powers from known component limits.",
        successCriteria: [
          "Matches the algebraic structure to the correct law",
          "Checks that a quotient denominator limit is nonzero",
          "Shows the component limits before simplifying",
        ],
      },
      {
        id: "lo-limit-laws-substitution",
        conceptId: "evaluating-limits-with-limit-laws",
        title: "Use substitution with justification",
        description:
          "Distinguish immediately evaluable continuous expressions from indeterminate forms requiring more analysis.",
        successCriteria: [
          "Uses substitution for polynomials and valid rational inputs",
          "Recognizes 0/0 as indeterminate",
          "Does not treat undefined substitution as a final limit conclusion",
        ],
      },
    ],
    commonMisconceptions: [
      "Direct substitution works for every limit.",
      "The form 0/0 means the limit is zero.",
      "The quotient law can be used when the denominator approaches zero.",
    ],
    examples: [
      {
        id: "example-limit-laws-combination",
        title: "Combine two known limits",
        description:
          "If f approaches 3 and g approaches 4, then f + 2g approaches 11.",
      },
      {
        id: "example-limit-laws-indeterminate",
        title: "Diagnose 0/0",
        description:
          "Substitution in (x² - 1)/(x - 1) at x = 1 produces 0/0, but nearby algebra reveals a finite limit.",
      },
    ],
    difficulty: "developing",
    estimatedMinutes: 24,
  },
  {
    id: "squeeze-theorem",
    courseId: COURSE_ID,
    unitId: UNIT_ID,
    topicId: "unit-1-topic-limit-laws-and-squeeze",
    title: "The Squeeze Theorem",
    description:
      "Determine the limit of a difficult or oscillating function by trapping it between lower and upper functions that approach the same value.",
    prerequisiteConceptIds: [
      "what-is-a-limit",
      "evaluating-limits-with-limit-laws",
    ],
    learningObjectives: [
      {
        id: "lo-squeeze-identify-bounds",
        conceptId: "squeeze-theorem",
        title: "Build a valid squeeze",
        description:
          "Identify lower and upper bounds that hold sufficiently close to a target input.",
        successCriteria: [
          "Writes a three-part inequality",
          "Checks the inequality near the target",
          "Identifies the trapped function correctly",
        ],
      },
      {
        id: "lo-squeeze-shared-limit",
        conceptId: "squeeze-theorem",
        title: "Use matching boundary limits",
        description:
          "Conclude the trapped limit only after both boundary functions approach the same value.",
        successCriteria: [
          "Evaluates both boundary limits",
          "Verifies they are equal",
          "States the Squeeze Theorem conclusion precisely",
        ],
      },
    ],
    commonMisconceptions: [
      "One bound is enough to determine a squeezed limit.",
      "The lower and upper bounds may approach different values.",
      "The inequality must hold at the target input itself.",
    ],
    examples: [
      {
        id: "example-squeeze-oscillation",
        title: "A shrinking oscillation",
        description:
          "The function x²sin(1/x) stays between -x² and x², so it approaches 0 as x approaches 0.",
      },
      {
        id: "example-squeeze-absolute-bound",
        title: "An absolute-value bound",
        description:
          "If |q(x)| ≤ 3x² near zero, then -3x² ≤ q(x) ≤ 3x² determines the limit.",
      },
    ],
    difficulty: "advanced",
    estimatedMinutes: 22,
  },
  {
    id: "continuity-at-a-point",
    courseId: COURSE_ID,
    unitId: UNIT_ID,
    topicId: "unit-1-topic-continuity-and-ivt",
    title: "Continuity at a point",
    description:
      "Check whether a function value exists, whether the two-sided limit exists, and whether those two quantities agree.",
    prerequisiteConceptIds: [
      "estimating-limits-from-graphs",
      "evaluating-limits-with-limit-laws",
    ],
    learningObjectives: [
      {
        id: "lo-continuity-three-conditions",
        conceptId: "continuity-at-a-point",
        title: "Verify three continuity conditions",
        description:
          "Determine continuity at x = c by checking f(c), the two-sided limit, and equality between them.",
        successCriteria: [
          "Checks that f(c) is defined",
          "Checks that both one-sided limits agree",
          "Compares the limit with the point value",
        ],
      },
      {
        id: "lo-continuity-classify-failure",
        conceptId: "continuity-at-a-point",
        title: "Diagnose a discontinuity",
        description:
          "Identify which continuity condition fails and when a discontinuity is removable.",
        successCriteria: [
          "Separates missing values from missing limits",
          "Recognizes jumps as nonremovable",
          "Chooses the limit value to repair a removable discontinuity",
        ],
      },
    ],
    commonMisconceptions: [
      "A defined function value guarantees continuity.",
      "An existing limit guarantees continuity.",
      "Every discontinuity can be repaired by changing one point.",
    ],
    examples: [
      {
        id: "example-continuity-removable",
        title: "Repair a removable discontinuity",
        description:
          "A graph approaches y = 2 at x = 1 but assigns f(1) = 5; redefining f(1) as 2 restores continuity.",
      },
      {
        id: "example-continuity-jump",
        title: "A failed two-sided limit",
        description:
          "Different left- and right-hand limits prevent continuity regardless of the function value.",
      },
    ],
    difficulty: "developing",
    estimatedMinutes: 22,
  },
  {
    id: "intermediate-value-theorem",
    courseId: COURSE_ID,
    unitId: UNIT_ID,
    topicId: "unit-1-topic-continuity-and-ivt",
    title: "The Intermediate Value Theorem",
    description:
      "Use continuity on a closed interval to guarantee that a function attains every output between its endpoint outputs.",
    prerequisiteConceptIds: ["continuity-at-a-point"],
    learningObjectives: [
      {
        id: "lo-ivt-check-hypotheses",
        conceptId: "intermediate-value-theorem",
        title: "Verify IVT hypotheses",
        description:
          "Check continuity on a closed interval and verify that a target output is bracketed by endpoint outputs.",
        successCriteria: [
          "Names the closed interval",
          "Justifies continuity on the interval",
          "Shows that the target lies between endpoint outputs",
        ],
      },
      {
        id: "lo-ivt-existence-conclusion",
        conceptId: "intermediate-value-theorem",
        title: "State an existence conclusion",
        description:
          "Conclude that at least one input produces the target output without claiming an exact location or uniqueness.",
        successCriteria: [
          "Uses at-least-one language",
          "Places the guaranteed input in the correct interval",
          "Does not claim uniqueness without additional evidence",
        ],
      },
    ],
    commonMisconceptions: [
      "Endpoint outputs alone are enough even if the function is discontinuous.",
      "The theorem finds the exact input value.",
      "The theorem guarantees exactly one input.",
    ],
    examples: [
      {
        id: "example-ivt-root",
        title: "Guarantee a root",
        description:
          "A continuous function with f(1) = -2 and f(3) = 5 must equal 0 somewhere between 1 and 3.",
      },
      {
        id: "example-ivt-temperature",
        title: "A measured intermediate value",
        description:
          "A continuously changing temperature moving from 18°C to 24°C must equal 20°C at some intermediate time.",
      },
    ],
    difficulty: "advanced",
    estimatedMinutes: 20,
  },
  {
    id: "limits-at-infinity",
    courseId: COURSE_ID,
    unitId: UNIT_ID,
    topicId: "unit-1-topic-end-behavior",
    title: "Limits at infinity and end behavior",
    description:
      "Describe function behavior as inputs become unbounded, compare dominant terms, and interpret finite end-behavior limits as horizontal asymptotes.",
    prerequisiteConceptIds: [
      "infinite-limits",
      "evaluating-limits-with-limit-laws",
    ],
    learningObjectives: [
      {
        id: "lo-end-behavior-interpret",
        conceptId: "limits-at-infinity",
        title: "Interpret limits at infinity",
        description:
          "Distinguish unbounded-input end behavior from unbounded-output behavior near a finite input.",
        successCriteria: [
          "Identifies whether x or f(x) is unbounded",
          "Separates positive and negative end behavior",
          "Connects finite end limits to horizontal asymptotes",
        ],
      },
      {
        id: "lo-end-behavior-rational",
        conceptId: "limits-at-infinity",
        title: "Analyze rational end behavior",
        description:
          "Use dominant powers and leading coefficients to evaluate rational-function limits at infinity.",
        successCriteria: [
          "Divides by an appropriate dominant power",
          "Recognizes reciprocal powers approaching zero",
          "Classifies behavior from numerator and denominator degrees",
        ],
      },
    ],
    commonMisconceptions: [
      "Limits at infinity are the same as infinite limits.",
      "A graph can never cross a horizontal asymptote.",
      "All lower-degree terms can be deleted without a limiting argument.",
    ],
    examples: [
      {
        id: "example-end-behavior-equal-degree",
        title: "Equal-degree rational function",
        description:
          "The function (2x² + 1)/(x² + 3) approaches 2 as x approaches positive or negative infinity.",
      },
      {
        id: "example-end-behavior-lower-numerator",
        title: "Lower-degree numerator",
        description:
          "A rational function with a lower-degree numerator than denominator approaches 0 as |x| grows.",
      },
    ],
    difficulty: "advanced",
    estimatedMinutes: 24,
  },
];

export const apCalculusABUnit1ExtensionDependencies: ConceptDependency[] = [
  {
    id: "dependency-notation-to-limit-laws",
    prerequisiteConceptId: "limit-notation",
    dependentConceptId: "evaluating-limits-with-limit-laws",
    relationship: "prerequisite",
    rationale:
      "Students must read component limit statements accurately before combining them with limit laws.",
  },
  {
    id: "dependency-one-sided-to-limit-laws",
    prerequisiteConceptId: "one-sided-limits",
    dependentConceptId: "evaluating-limits-with-limit-laws",
    relationship: "supports",
    rationale:
      "Directional limit reasoning clarifies that laws require the relevant component limits to exist on the same approach.",
  },
  {
    id: "dependency-limit-laws-to-squeeze",
    prerequisiteConceptId: "evaluating-limits-with-limit-laws",
    dependentConceptId: "squeeze-theorem",
    relationship: "prerequisite",
    rationale:
      "The Squeeze Theorem requires evaluating the limits of the bounding functions.",
  },
  {
    id: "dependency-graphs-to-continuity",
    prerequisiteConceptId: "estimating-limits-from-graphs",
    dependentConceptId: "continuity-at-a-point",
    relationship: "prerequisite",
    rationale:
      "Continuity requires comparing the graph's two-sided approach behavior with its function value.",
  },
  {
    id: "dependency-limit-laws-to-continuity",
    prerequisiteConceptId: "evaluating-limits-with-limit-laws",
    dependentConceptId: "continuity-at-a-point",
    relationship: "supports",
    rationale:
      "Limit laws and substitution provide analytical evidence for continuity of algebraic functions.",
  },
  {
    id: "dependency-continuity-to-ivt",
    prerequisiteConceptId: "continuity-at-a-point",
    dependentConceptId: "intermediate-value-theorem",
    relationship: "extends",
    rationale:
      "The Intermediate Value Theorem extends local continuity into a guarantee across a closed interval.",
  },
  {
    id: "dependency-infinite-to-end-behavior",
    prerequisiteConceptId: "infinite-limits",
    dependentConceptId: "limits-at-infinity",
    relationship: "supports",
    rationale:
      "Contrasting infinite limits with limits at infinity prevents confusion about whether input or output is unbounded.",
  },
  {
    id: "dependency-limit-laws-to-end-behavior",
    prerequisiteConceptId: "evaluating-limits-with-limit-laws",
    dependentConceptId: "limits-at-infinity",
    relationship: "prerequisite",
    rationale:
      "Normalized rational expressions are evaluated using limit laws for constants and reciprocal powers.",
  },
];
