import type {
  Concept,
  ConceptDependency,
  Topic,
} from "@/features/knowledge/types";

const COURSE_ID = "ap-calculus-ab";
const UNIT_ID = "ap-calculus-ab-unit-1-limits-continuity";

export const AP_CALCULUS_AB_UNIT_1_ALIGNMENT_CONCEPT_IDS = [
  "instantaneous-change-motivation",
  "estimating-limits-from-tables",
  "algebraic-limit-techniques",
  "selecting-limit-procedures",
  "connecting-limit-representations",
  "classifying-discontinuities",
  "continuity-over-intervals",
] as const;

export const AP_CALCULUS_AB_UNIT_1_CONCEPT_IDS = [
  "instantaneous-change-motivation",
  "what-is-a-limit",
  "limit-notation",
  "estimating-limits-from-graphs",
  "one-sided-limits",
  "estimating-limits-from-tables",
  "evaluating-limits-with-limit-laws",
  "algebraic-limit-techniques",
  "selecting-limit-procedures",
  "squeeze-theorem",
  "connecting-limit-representations",
  "classifying-discontinuities",
  "continuity-at-a-point",
  "continuity-over-intervals",
  "infinite-limits",
  "limits-at-infinity",
  "intermediate-value-theorem",
] as const;

export const apCalculusABUnit1AlignmentTopics: Topic[] = [
  {
    id: "unit-1-topic-intermediate-value-theorem",
    unitId: UNIT_ID,
    sequence: 7,
    title: "Continuity and the Intermediate Value Theorem",
    description:
      "Use continuity on a closed interval to guarantee that intermediate outputs occur.",
    conceptIds: ["intermediate-value-theorem"],
  },
];

export const apCalculusABUnit1AlignmentConcepts: Concept[] = [
  {
    id: "instantaneous-change-motivation",
    courseId: COURSE_ID,
    unitId: UNIT_ID,
    topicId: "unit-1-topic-limit-foundations",
    title: "Can change occur at an instant?",
    description:
      "Use average rates over shrinking time intervals to motivate how limits can describe change at one instant without dividing by a zero-length interval.",
    prerequisiteConceptIds: [],
    learningObjectives: [
      {
        id: "lo-instantaneous-change-compare-rates",
        conceptId: "instantaneous-change-motivation",
        title: "Compare interval and instant change",
        description:
          "Distinguish an average rate measured over an interval from a rate associated with one instant.",
        successCriteria: [
          "Identifies the input and output changes in an average rate",
          "Includes contextual units in a rate interpretation",
          "Explains why a zero-length interval cannot be used directly",
        ],
      },
      {
        id: "lo-instantaneous-change-shrinking-intervals",
        conceptId: "instantaneous-change-motivation",
        title: "Use shrinking intervals as evidence",
        description:
          "Interpret a stable trend in average rates over shorter intervals as evidence for instantaneous behavior.",
        successCriteria: [
          "Compares rates from successively shorter intervals",
          "Looks for a stable approached value rather than one exact interval",
          "Connects the pattern to the need for limits",
        ],
      },
    ],
    commonMisconceptions: [
      "An instantaneous rate is found by dividing by a time interval of exactly zero.",
      "One average rate over a long interval determines what happens at every instant.",
      "A rate without contextual units is a complete interpretation.",
    ],
    examples: [
      {
        id: "example-instantaneous-speed",
        title: "From trip speed to speedometer reading",
        description:
          "Average speeds over intervals around t = 5 become more stable as the intervals shrink, motivating a speed at t = 5.",
      },
      {
        id: "example-cooling-rate",
        title: "Temperature change near one minute",
        description:
          "Shorter temperature-measurement intervals reveal a local cooling trend that a whole-hour average hides.",
      },
    ],
    difficulty: "foundational",
    estimatedMinutes: 20,
  },
  {
    id: "estimating-limits-from-tables",
    courseId: COURSE_ID,
    unitId: UNIT_ID,
    topicId: "unit-1-topic-graphical-limits",
    title: "Estimating limit values from tables",
    description:
      "Select input values approaching a target from both sides and use the corresponding outputs to estimate a limit or determine that the evidence does not support one value.",
    prerequisiteConceptIds: [
      "estimating-limits-from-graphs",
      "one-sided-limits",
    ],
    learningObjectives: [
      {
        id: "lo-table-limits-select-values",
        conceptId: "estimating-limits-from-tables",
        title: "Select useful table evidence",
        description:
          "Choose nearby inputs on both sides of a target rather than relying on distant rows or the target row alone.",
        successCriteria: [
          "Uses inputs less than and greater than the target",
          "Prioritizes rows closest to the target",
          "Separates the target function value from nearby evidence",
        ],
      },
      {
        id: "lo-table-limits-estimate",
        conceptId: "estimating-limits-from-tables",
        title: "Estimate or reject a two-sided limit",
        description:
          "Compare directional output patterns and state an appropriately precise estimate.",
        successCriteria: [
          "Describes the left-hand and right-hand trends",
          "Reports a common approached value only when both sides agree",
          "Avoids claiming more precision than the table supports",
        ],
      },
    ],
    commonMisconceptions: [
      "The table row at the target input determines the limit.",
      "Inputs from only one side are enough for every two-sided limit.",
      "More decimal places in the output automatically make an estimate accurate.",
    ],
    examples: [
      {
        id: "example-table-two-sided",
        title: "Approach 2 from both sides",
        description:
          "Values at 1.9, 1.99, 2.01, and 2.1 support an estimate when both directional outputs settle near the same number.",
      },
      {
        id: "example-table-disagreement",
        title: "Directional table disagreement",
        description:
          "Rows below the target approach 1 while rows above approach 4, so the two-sided limit is not supported.",
      },
    ],
    difficulty: "developing",
    estimatedMinutes: 22,
  },
  {
    id: "algebraic-limit-techniques",
    courseId: COURSE_ID,
    unitId: UNIT_ID,
    topicId: "unit-1-topic-limit-laws-and-squeeze",
    title: "Determining limits using algebraic manipulation",
    description:
      "Resolve indeterminate forms by factoring and canceling only for nearby inputs, rationalizing with a conjugate, or rewriting trigonometric expressions.",
    prerequisiteConceptIds: ["evaluating-limits-with-limit-laws"],
    learningObjectives: [
      {
        id: "lo-algebraic-limits-transform",
        conceptId: "algebraic-limit-techniques",
        title: "Choose a valid algebraic transformation",
        description:
          "Match polynomial, radical, or trigonometric structure to a useful equivalent form.",
        successCriteria: [
          "Factors and cancels a common nonzero nearby factor",
          "Uses a conjugate to remove a radical difference",
          "Uses identities or standard trigonometric limits with stated conditions",
        ],
      },
      {
        id: "lo-algebraic-limits-preserve-behavior",
        conceptId: "algebraic-limit-techniques",
        title: "Preserve deleted-neighborhood behavior",
        description:
          "Explain why an equivalent expression for nearby inputs may be used even when the original expression is undefined at the target.",
        successCriteria: [
          "States the restriction under which cancellation is valid",
          "Distinguishes simplifying nearby behavior from redefining the function",
          "Substitutes only after the indeterminate structure is removed",
        ],
      },
    ],
    commonMisconceptions: [
      "Canceling a factor proves the original function is defined at the target.",
      "A conjugate changes only the numerator and does not need to multiply the denominator.",
      "Every 0/0 limit should be solved by the same algebraic technique.",
    ],
    examples: [
      {
        id: "example-factor-limit",
        title: "Factor a difference of squares",
        description:
          "For (x²-9)/(x-3), factor and cancel for x not equal to 3 before taking the limit.",
      },
      {
        id: "example-conjugate-limit",
        title: "Rationalize a radical difference",
        description:
          "Multiply by the conjugate to transform (sqrt(x+4)-2)/x into a form that can be evaluated near zero.",
      },
    ],
    difficulty: "developing",
    estimatedMinutes: 26,
  },
  {
    id: "selecting-limit-procedures",
    courseId: COURSE_ID,
    unitId: UNIT_ID,
    topicId: "unit-1-topic-limit-laws-and-squeeze",
    title: "Selecting procedures for determining limits",
    description:
      "Classify the available representation and substitution result, then choose direct evaluation, graphical or numerical estimation, or an appropriate algebraic technique.",
    prerequisiteConceptIds: [
      "evaluating-limits-with-limit-laws",
      "algebraic-limit-techniques",
      "estimating-limits-from-tables",
    ],
    learningObjectives: [
      {
        id: "lo-limit-procedure-classify",
        conceptId: "selecting-limit-procedures",
        title: "Classify the evidence and expression",
        description:
          "Use representation type, domain, and substitution form to narrow the valid procedures.",
        successCriteria: [
          "Checks direct substitution before doing unnecessary algebra",
          "Recognizes 0/0 as a signal to inspect expression structure",
          "Uses graph or table evidence when an analytical expression is unavailable",
        ],
      },
      {
        id: "lo-limit-procedure-justify",
        conceptId: "selecting-limit-procedures",
        title: "Justify a procedure choice",
        description:
          "Explain why a selected method fits the mathematical structure and why common alternatives do not.",
        successCriteria: [
          "Names the structural cue for the chosen method",
          "Carries domain restrictions through the work",
          "Checks the result against graphical, numerical, or sign evidence when available",
        ],
      },
    ],
    commonMisconceptions: [
      "A familiar procedure should be applied before inspecting the expression.",
      "Any method producing a number is an acceptable limit procedure.",
      "Graphical and numerical evidence are exact even when the scale or table spacing is coarse.",
    ],
    examples: [
      {
        id: "example-procedure-decision-tree",
        title: "Choose among substitution, factoring, and conjugates",
        description:
          "Three expressions produce different substitution results and structural cues, so each requires a different first step.",
      },
      {
        id: "example-procedure-representation",
        title: "Use the evidence actually provided",
        description:
          "When only a graph or table is available, estimate from both sides and state the limitation of the representation.",
      },
    ],
    difficulty: "advanced",
    estimatedMinutes: 24,
  },
  {
    id: "connecting-limit-representations",
    courseId: COURSE_ID,
    unitId: UNIT_ID,
    topicId: "unit-1-topic-limit-laws-and-squeeze",
    title: "Connecting multiple representations of limits",
    description:
      "Translate a single limit behavior among graphical, numerical, analytical, and verbal forms while recognizing what each representation can and cannot establish.",
    prerequisiteConceptIds: [
      "estimating-limits-from-graphs",
      "estimating-limits-from-tables",
      "selecting-limit-procedures",
      "squeeze-theorem",
    ],
    learningObjectives: [
      {
        id: "lo-limit-representations-translate",
        conceptId: "connecting-limit-representations",
        title: "Translate among representations",
        description:
          "Express the same directional or two-sided limit using words, notation, a table pattern, and graph behavior.",
        successCriteria: [
          "Keeps the target input and approached output consistent",
          "Represents both sides when claiming a two-sided limit",
          "Separates the function value from the limit in every form",
        ],
      },
      {
        id: "lo-limit-representations-evaluate-evidence",
        conceptId: "connecting-limit-representations",
        title: "Evaluate representation evidence",
        description:
          "Use a second representation to confirm, qualify, or challenge a limit claim.",
        successCriteria: [
          "Identifies resolution or sampling limitations",
          "Uses analytical reasoning for exact justification when possible",
          "Explains consistent and inconsistent evidence explicitly",
        ],
      },
    ],
    commonMisconceptions: [
      "A coarse graph or table proves an exact limit value by itself.",
      "Equivalent representations may use different target inputs or approached outputs.",
      "The plotted point must match the nearby pattern in every representation.",
    ],
    examples: [
      {
        id: "example-representation-hole",
        title: "One removable-hole limit in four forms",
        description:
          "A factored formula, a graph with a hole, a two-sided table, and a verbal statement all describe approach to the same output.",
      },
      {
        id: "example-representation-oscillation",
        title: "Evidence hidden by graph scale",
        description:
          "A graph may appear settled while an analytical form reveals oscillation, so representation limits matter.",
      },
    ],
    difficulty: "advanced",
    estimatedMinutes: 24,
  },
  {
    id: "classifying-discontinuities",
    courseId: COURSE_ID,
    unitId: UNIT_ID,
    topicId: "unit-1-topic-continuity-and-ivt",
    title: "Exploring types of discontinuities",
    description:
      "Classify removable, jump, and infinite discontinuities by comparing function values with left-hand and right-hand behavior.",
    prerequisiteConceptIds: [
      "connecting-limit-representations",
      "one-sided-limits",
    ],
    learningObjectives: [
      {
        id: "lo-discontinuities-classify",
        conceptId: "classifying-discontinuities",
        title: "Classify a discontinuity from evidence",
        description:
          "Use directional limits and point values to distinguish the three major discontinuity types.",
        successCriteria: [
          "Recognizes a finite shared limit with a missing or mismatched point as removable",
          "Recognizes unequal finite one-sided limits as a jump",
          "Recognizes unbounded directional behavior as an infinite discontinuity",
        ],
      },
      {
        id: "lo-discontinuities-repair",
        conceptId: "classifying-discontinuities",
        title: "Determine whether one point can repair continuity",
        description:
          "Decide whether redefining a single function value can remove the discontinuity.",
        successCriteria: [
          "Uses existence of a finite two-sided limit as the repair criterion",
          "Selects the shared limit as the repaired value",
          "Explains why jumps and infinite discontinuities are not repaired at one point",
        ],
      },
    ],
    commonMisconceptions: [
      "Every hole, jump, and vertical asymptote can be repaired by changing f(c).",
      "A jump discontinuity has a two-sided limit halfway between the one-sided limits.",
      "A filled point makes a function continuous regardless of nearby behavior.",
    ],
    examples: [
      {
        id: "example-discontinuity-classification",
        title: "Three graphs, three failures",
        description:
          "A hole, a jump, and unbounded behavior fail continuity for different reasons and require different explanations.",
      },
      {
        id: "example-removable-repair",
        title: "Choose a repair value",
        description:
          "When both sides approach 6 but f(c) is missing, defining f(c)=6 repairs the discontinuity.",
      },
    ],
    difficulty: "developing",
    estimatedMinutes: 24,
  },
  {
    id: "continuity-over-intervals",
    courseId: COURSE_ID,
    unitId: UNIT_ID,
    topicId: "unit-1-topic-continuity-and-ivt",
    title: "Confirming continuity over an interval",
    description:
      "Determine where familiar function families are continuous, account for domain restrictions and endpoints, and justify continuity on open or closed intervals.",
    prerequisiteConceptIds: ["continuity-at-a-point"],
    learningObjectives: [
      {
        id: "lo-interval-continuity-domain",
        conceptId: "continuity-over-intervals",
        title: "Use domains to find continuity intervals",
        description:
          "Apply continuity of familiar function families on their domains and identify excluded inputs.",
        successCriteria: [
          "Treats polynomials as continuous for all real inputs",
          "Excludes rational-function denominator zeros and invalid radical or logarithm inputs",
          "Splits the domain into correctly stated intervals",
        ],
      },
      {
        id: "lo-interval-continuity-endpoints",
        conceptId: "continuity-over-intervals",
        title: "Check continuity at interval endpoints",
        description:
          "Use one-sided continuity conditions at the endpoints of a closed interval.",
        successCriteria: [
          "Uses right-hand continuity at a left endpoint",
          "Uses left-hand continuity at a right endpoint",
          "Checks all interior points with the two-sided condition",
        ],
      },
    ],
    commonMisconceptions: [
      "A formula is continuous on every real input simply because it looks familiar.",
      "Closed-interval continuity requires a two-sided limit beyond each endpoint.",
      "Checking a few points proves continuity everywhere on an interval.",
    ],
    examples: [
      {
        id: "example-rational-continuity-intervals",
        title: "Split at denominator zeros",
        description:
          "A rational function with denominator (x-2)(x+1) is continuous on the three intervals separated by -1 and 2.",
      },
      {
        id: "example-closed-interval-continuity",
        title: "Check endpoints one-sidedly",
        description:
          "Continuity on [a,b] uses right-hand continuity at a, left-hand continuity at b, and continuity throughout the interior.",
      },
    ],
    difficulty: "advanced",
    estimatedMinutes: 24,
  },
];

export const apCalculusABUnit1AlignmentDependencies: ConceptDependency[] = [
  {
    id: "dependency-instantaneous-change-to-limit-meaning",
    prerequisiteConceptId: "instantaneous-change-motivation",
    dependentConceptId: "what-is-a-limit",
    relationship: "supports",
    rationale:
      "Shrinking-interval rates give learners a concrete reason to study approached behavior before formalizing limits.",
  },
  {
    id: "dependency-one-sided-to-table-limits",
    prerequisiteConceptId: "one-sided-limits",
    dependentConceptId: "estimating-limits-from-tables",
    relationship: "prerequisite",
    rationale:
      "A useful limit table must be read directionally from inputs below and above the target.",
  },
  {
    id: "dependency-limit-laws-to-algebraic-techniques",
    prerequisiteConceptId: "evaluating-limits-with-limit-laws",
    dependentConceptId: "algebraic-limit-techniques",
    relationship: "prerequisite",
    rationale:
      "Algebraic manipulation is needed only after substitution and limit laws reveal an indeterminate structure.",
  },
  {
    id: "dependency-algebraic-techniques-to-procedure-selection",
    prerequisiteConceptId: "algebraic-limit-techniques",
    dependentConceptId: "selecting-limit-procedures",
    relationship: "prerequisite",
    rationale:
      "Learners can choose among procedures only after they understand the structural cues for each technique.",
  },
  {
    id: "dependency-procedure-selection-to-squeeze",
    prerequisiteConceptId: "selecting-limit-procedures",
    dependentConceptId: "squeeze-theorem",
    relationship: "supports",
    rationale:
      "Procedure selection prepares learners to recognize when direct algebra is insufficient and bounding is appropriate.",
  },
  {
    id: "dependency-squeeze-to-limit-representations",
    prerequisiteConceptId: "squeeze-theorem",
    dependentConceptId: "connecting-limit-representations",
    relationship: "supports",
    rationale:
      "The Squeeze Theorem adds exact analytical evidence that can confirm patterns suggested by graphs or tables.",
  },
  {
    id: "dependency-representations-to-discontinuities",
    prerequisiteConceptId: "connecting-limit-representations",
    dependentConceptId: "classifying-discontinuities",
    relationship: "prerequisite",
    rationale:
      "Discontinuity classification requires coordinating graph behavior, directional limits, and function values.",
  },
  {
    id: "dependency-discontinuities-to-continuity",
    prerequisiteConceptId: "classifying-discontinuities",
    dependentConceptId: "continuity-at-a-point",
    relationship: "supports",
    rationale:
      "Classifying failures makes each of the three point-continuity conditions observable.",
  },
  {
    id: "dependency-point-to-interval-continuity",
    prerequisiteConceptId: "continuity-at-a-point",
    dependentConceptId: "continuity-over-intervals",
    relationship: "extends",
    rationale:
      "Continuity over an interval applies the local definition to all interior points and appropriate one-sided endpoint behavior.",
  },
  {
    id: "dependency-interval-continuity-to-ivt",
    prerequisiteConceptId: "continuity-over-intervals",
    dependentConceptId: "intermediate-value-theorem",
    relationship: "prerequisite",
    rationale:
      "The Intermediate Value Theorem requires continuity on an entire closed interval, not just at isolated points.",
  },
  {
    id: "dependency-discontinuities-to-infinite-limits",
    prerequisiteConceptId: "classifying-discontinuities",
    dependentConceptId: "infinite-limits",
    relationship: "supports",
    rationale:
      "Infinite limits provide the formal directional language for the infinite-discontinuity behavior classified earlier.",
  },
];
