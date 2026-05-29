import type {
  Concept,
  ConceptDependency,
  Course,
  KnowledgeGraph,
  Topic,
  Unit,
} from "@/features/knowledge/types";

export const AP_CALCULUS_AB_COURSE_ID = "ap-calculus-ab";
export const AP_CALCULUS_AB_UNIT_1_ID =
  "ap-calculus-ab-unit-1-limits-continuity";

export const apCalculusABCourse: Course = {
  id: AP_CALCULUS_AB_COURSE_ID,
  title: "AP Calculus AB",
  shortTitle: "AP Calc AB",
  subject: "Calculus",
  description:
    "A learning path for building concept mastery across the AP Calculus AB curriculum.",
  unitIds: [AP_CALCULUS_AB_UNIT_1_ID],
};

export const apCalculusABUnit1Topics: Topic[] = [
  {
    id: "unit-1-topic-limit-foundations",
    unitId: AP_CALCULUS_AB_UNIT_1_ID,
    sequence: 1,
    title: "Limit foundations",
    description:
      "Core meaning and notation students need before analyzing limits from representations.",
    conceptIds: ["what-is-a-limit", "limit-notation"],
  },
  {
    id: "unit-1-topic-graphical-limits",
    unitId: AP_CALCULUS_AB_UNIT_1_ID,
    sequence: 2,
    title: "Graphical limit reasoning",
    description:
      "Estimating limit behavior from graphs and separating approaching behavior from function value.",
    conceptIds: ["estimating-limits-from-graphs"],
  },
  {
    id: "unit-1-topic-one-sided-and-infinite-limits",
    unitId: AP_CALCULUS_AB_UNIT_1_ID,
    sequence: 3,
    title: "Directional and unbounded behavior",
    description:
      "Reasoning about one-sided approaches and limits that grow without bound.",
    conceptIds: ["one-sided-limits", "infinite-limits"],
  },
];

export const apCalculusABUnit1: Unit = {
  id: AP_CALCULUS_AB_UNIT_1_ID,
  courseId: AP_CALCULUS_AB_COURSE_ID,
  sequence: 1,
  title: "Limits and Continuity",
  description:
    "Unit 1 introduces the language and representations students use to describe function behavior near an input.",
  topicIds: apCalculusABUnit1Topics.map((topic) => topic.id),
  conceptIds: apCalculusABUnit1Topics.flatMap((topic) => topic.conceptIds),
  estimatedMinutes: 92,
};

export const apCalculusABUnit1Concepts: Concept[] = [
  {
    id: "what-is-a-limit",
    unitId: AP_CALCULUS_AB_UNIT_1_ID,
    topicId: "unit-1-topic-limit-foundations",
    title: "What is a limit?",
    description:
      "Understand a limit as the value a function approaches as the input gets close to a target, even when the function value at the target is different or undefined.",
    prerequisiteConceptIds: [],
    learningObjectives: [
      {
        id: "lo-what-is-a-limit-meaning",
        conceptId: "what-is-a-limit",
        title: "Explain approaching behavior",
        description:
          "Describe a limit in terms of nearby input values and the output values they approach.",
        successCriteria: [
          "Distinguishes approach behavior from substitution",
          "Uses language about inputs getting close to a target",
          "Explains why a limit can exist even when a function value does not",
        ],
      },
      {
        id: "lo-what-is-a-limit-value-vs-function-value",
        conceptId: "what-is-a-limit",
        title: "Separate limit value from function value",
        description:
          "Recognize that the limit and the function value at the same input can be equal, different, or not both defined.",
        successCriteria: [
          "Identifies removable holes as possible limit locations",
          "Avoids treating f(a) as automatically equal to the limit",
          "Explains the difference using a graph or table",
        ],
      },
    ],
    commonMisconceptions: [
      "The limit is always the same as the function value.",
      "A limit cannot exist if the graph has a hole.",
      "The input must actually equal the target value to discuss the limit.",
    ],
    examples: [
      {
        id: "example-limit-hole",
        title: "A hole with a clear approach value",
        description:
          "A graph approaches y = 4 from both sides near x = 2, but the point at x = 2 is open.",
      },
      {
        id: "example-limit-table",
        title: "A table approaching a number",
        description:
          "Output values 2.9, 2.99, 3.01, and 3.1 suggest the function approaches 3 near the target input.",
      },
    ],
    difficulty: "foundational",
    estimatedMinutes: 18,
  },
  {
    id: "limit-notation",
    unitId: AP_CALCULUS_AB_UNIT_1_ID,
    topicId: "unit-1-topic-limit-foundations",
    title: "Limit notation",
    description:
      "Interpret and communicate limit statements such as lim as x approaches a of f(x) = L using precise mathematical language.",
    prerequisiteConceptIds: ["what-is-a-limit"],
    learningObjectives: [
      {
        id: "lo-limit-notation-read",
        conceptId: "limit-notation",
        title: "Read limit notation fluently",
        description:
          "Translate symbolic limit notation into a sentence about input and output behavior.",
        successCriteria: [
          "Identifies the approaching input value",
          "Identifies the function being analyzed",
          "Identifies the output value being approached",
        ],
      },
      {
        id: "lo-limit-notation-write",
        conceptId: "limit-notation",
        title: "Write limit notation from words",
        description:
          "Represent a verbal or graphical limit statement using conventional limit notation.",
        successCriteria: [
          "Uses lim notation with the correct approaching input",
          "Places the function expression correctly",
          "States the approached output value after the equals sign",
        ],
      },
    ],
    commonMisconceptions: [
      "The arrow in limit notation means the input equals the target.",
      "The notation only works when the function has a defined value at the target.",
      "The approached output belongs in the subscript instead of after the equals sign.",
    ],
    examples: [
      {
        id: "example-limit-notation-sentence",
        title: "Symbol to sentence",
        description:
          "lim as x approaches 5 of f(x) = 7 means f(x) approaches 7 when x gets close to 5.",
      },
      {
        id: "example-limit-notation-graph",
        title: "Graph to symbol",
        description:
          "A graph approaching y = -2 near x = 1 can be represented as a limit statement.",
      },
    ],
    difficulty: "foundational",
    estimatedMinutes: 14,
  },
  {
    id: "estimating-limits-from-graphs",
    unitId: AP_CALCULUS_AB_UNIT_1_ID,
    topicId: "unit-1-topic-graphical-limits",
    title: "Estimating limits from graphs",
    description:
      "Use visual behavior on both sides of a target input to estimate the limit value from a graph.",
    prerequisiteConceptIds: ["what-is-a-limit", "limit-notation"],
    learningObjectives: [
      {
        id: "lo-estimating-graphs-two-sided",
        conceptId: "estimating-limits-from-graphs",
        title: "Estimate a two-sided limit",
        description:
          "Determine whether the left and right graph behavior approach the same output value.",
        successCriteria: [
          "Traces the graph from both sides of the target input",
          "Compares approached y-values instead of plotted point style alone",
          "States when the two-sided limit exists or does not exist",
        ],
      },
      {
        id: "lo-estimating-graphs-function-value",
        conceptId: "estimating-limits-from-graphs",
        title: "Ignore distracting function values",
        description:
          "Use nearby graph behavior rather than a filled point at the target to determine the limit.",
        successCriteria: [
          "Identifies filled and open points correctly",
          "Explains why a filled point can differ from the limit",
          "Uses the graph's approach behavior as evidence",
        ],
      },
    ],
    commonMisconceptions: [
      "A filled point always determines the limit.",
      "Only the right side of the graph matters unless told otherwise.",
      "A jump at the target can still have a two-sided limit.",
    ],
    examples: [
      {
        id: "example-graph-open-filled-points",
        title: "Open point and filled point",
        description:
          "The graph approaches an open point at y = 3 while a filled point sits at y = 1 for the same x-value.",
      },
      {
        id: "example-graph-jump",
        title: "Jump behavior",
        description:
          "The left side approaches y = 2 and the right side approaches y = 5 near the same input.",
      },
    ],
    difficulty: "developing",
    estimatedMinutes: 20,
  },
  {
    id: "one-sided-limits",
    unitId: AP_CALCULUS_AB_UNIT_1_ID,
    topicId: "unit-1-topic-one-sided-and-infinite-limits",
    title: "One-sided limits",
    description:
      "Analyze function behavior as the input approaches a target from only the left or only the right.",
    prerequisiteConceptIds: [
      "what-is-a-limit",
      "limit-notation",
      "estimating-limits-from-graphs",
    ],
    learningObjectives: [
      {
        id: "lo-one-sided-left-right",
        conceptId: "one-sided-limits",
        title: "Distinguish left and right approaches",
        description:
          "Explain the difference between approaching a target input from values less than or greater than the target.",
        successCriteria: [
          "Interprets minus and plus superscripts in limit notation",
          "Uses graph direction to identify left-hand and right-hand behavior",
          "Avoids mixing the side of approach with the sign of the output",
        ],
      },
      {
        id: "lo-one-sided-two-sided-connection",
        conceptId: "one-sided-limits",
        title: "Connect one-sided and two-sided limits",
        description:
          "Determine that a two-sided limit exists only when both one-sided limits approach the same value.",
        successCriteria: [
          "Compares left-hand and right-hand limits",
          "States when disagreement causes the two-sided limit to not exist",
          "Uses one-sided evidence to justify a two-sided conclusion",
        ],
      },
    ],
    commonMisconceptions: [
      "The plus sign means the limit value must be positive.",
      "The minus sign means the output must be negative.",
      "A two-sided limit can exist when the one-sided limits are different.",
    ],
    examples: [
      {
        id: "example-one-sided-piecewise",
        title: "Piecewise graph near a boundary",
        description:
          "A graph follows one rule to the left of x = 0 and another rule to the right of x = 0.",
      },
      {
        id: "example-one-sided-table",
        title: "Directional table values",
        description:
          "Inputs slightly less than 4 approach one output while inputs slightly greater than 4 approach another.",
      },
    ],
    difficulty: "developing",
    estimatedMinutes: 22,
  },
  {
    id: "infinite-limits",
    unitId: AP_CALCULUS_AB_UNIT_1_ID,
    topicId: "unit-1-topic-one-sided-and-infinite-limits",
    title: "Infinite limits",
    description:
      "Recognize when function values grow without bound as the input approaches a target, often indicating vertical asymptote behavior.",
    prerequisiteConceptIds: [
      "what-is-a-limit",
      "limit-notation",
      "one-sided-limits",
    ],
    learningObjectives: [
      {
        id: "lo-infinite-limits-unbounded",
        conceptId: "infinite-limits",
        title: "Describe unbounded behavior",
        description:
          "Explain what it means for outputs to increase or decrease without bound near a target input.",
        successCriteria: [
          "Uses unbounded language instead of treating infinity as a normal number",
          "Identifies vertical asymptote behavior from a graph",
          "Describes whether behavior goes toward positive or negative infinity",
        ],
      },
      {
        id: "lo-infinite-limits-one-sided",
        conceptId: "infinite-limits",
        title: "Interpret directional infinite limits",
        description:
          "Analyze whether unbounded behavior happens from the left, the right, or both sides.",
        successCriteria: [
          "Combines one-sided notation with positive or negative infinity",
          "Recognizes when the two sides diverge in different directions",
          "States the limit behavior using evidence from the representation",
        ],
      },
    ],
    commonMisconceptions: [
      "Infinity is a number the function reaches.",
      "Any vertical asymptote means both sides go to positive infinity.",
      "Infinite limits are the same as limits at infinity.",
    ],
    examples: [
      {
        id: "example-infinite-vertical-asymptote",
        title: "Vertical asymptote behavior",
        description:
          "As x approaches 2, the graph rises sharply without bound on one or both sides.",
      },
      {
        id: "example-infinite-opposite-directions",
        title: "Opposite directional behavior",
        description:
          "The left side falls without bound while the right side rises without bound near the same x-value.",
      },
    ],
    difficulty: "advanced",
    estimatedMinutes: 18,
  },
];

export const apCalculusABUnit1ConceptDependencies: ConceptDependency[] = [
  {
    id: "dependency-limit-meaning-to-notation",
    prerequisiteConceptId: "what-is-a-limit",
    dependentConceptId: "limit-notation",
    relationship: "prerequisite",
    rationale:
      "Students need the meaning of approaching behavior before the notation can be interpreted precisely.",
  },
  {
    id: "dependency-limit-meaning-to-graphs",
    prerequisiteConceptId: "what-is-a-limit",
    dependentConceptId: "estimating-limits-from-graphs",
    relationship: "prerequisite",
    rationale:
      "Graphical estimation depends on separating approach behavior from the function value at the target.",
  },
  {
    id: "dependency-notation-to-graphs",
    prerequisiteConceptId: "limit-notation",
    dependentConceptId: "estimating-limits-from-graphs",
    relationship: "supports",
    rationale:
      "Students use notation to communicate the limit values they infer from graphs.",
  },
  {
    id: "dependency-graphs-to-one-sided",
    prerequisiteConceptId: "estimating-limits-from-graphs",
    dependentConceptId: "one-sided-limits",
    relationship: "extends",
    rationale:
      "One-sided reasoning extends graphical limit estimation by focusing on a single direction of approach.",
  },
  {
    id: "dependency-one-sided-to-infinite",
    prerequisiteConceptId: "one-sided-limits",
    dependentConceptId: "infinite-limits",
    relationship: "prerequisite",
    rationale:
      "Infinite limits often require directional analysis because each side of a vertical asymptote can behave differently.",
  },
];

export const apCalculusABKnowledgeGraph: KnowledgeGraph = {
  course: apCalculusABCourse,
  units: [apCalculusABUnit1],
  topics: apCalculusABUnit1Topics,
  concepts: apCalculusABUnit1Concepts,
  dependencies: apCalculusABUnit1ConceptDependencies,
};
