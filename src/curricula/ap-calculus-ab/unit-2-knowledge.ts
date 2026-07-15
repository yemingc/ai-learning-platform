import type {
  Concept,
  ConceptDependency,
  Topic,
  Unit,
} from "@/features/knowledge/types";

export const AP_CALCULUS_AB_UNIT_2_ID =
  "ap-calculus-ab-unit-2-differentiation-fundamentals";

const COURSE_ID = "ap-calculus-ab";

export const AP_CALCULUS_AB_UNIT_2_CONCEPT_IDS = [
  "average-and-instantaneous-rates-of-change",
  "derivative-as-a-limit-and-tangent-slope",
  "estimating-derivatives-at-a-point",
  "differentiability-and-continuity",
  "power-rule",
  "linearity-rules-for-derivatives",
  "basic-transcendental-derivatives",
  "product-rule",
  "quotient-rule",
  "remaining-trigonometric-derivatives",
] as const;

export const apCalculusABUnit2Topics: Topic[] = [
  {
    id: "unit-2-topic-rates-and-derivative-definition",
    unitId: AP_CALCULUS_AB_UNIT_2_ID,
    sequence: 1,
    title: "Rates of change and the derivative definition",
    description:
      "Move from secant slopes over intervals to tangent slopes and derivative functions defined by limits.",
    conceptIds: [
      "average-and-instantaneous-rates-of-change",
      "derivative-as-a-limit-and-tangent-slope",
    ],
  },
  {
    id: "unit-2-topic-estimation-and-differentiability",
    unitId: AP_CALCULUS_AB_UNIT_2_ID,
    sequence: 2,
    title: "Estimating derivatives and differentiability",
    description:
      "Estimate derivative values from representations and determine where continuity does or does not support differentiability.",
    conceptIds: [
      "estimating-derivatives-at-a-point",
      "differentiability-and-continuity",
    ],
  },
  {
    id: "unit-2-topic-fundamental-derivative-rules",
    unitId: AP_CALCULUS_AB_UNIT_2_ID,
    sequence: 3,
    title: "Fundamental derivatives and linear rules",
    description:
      "Build efficient differentiation from the power rule, linearity, and familiar elementary functions.",
    conceptIds: [
      "power-rule",
      "linearity-rules-for-derivatives",
      "basic-transcendental-derivatives",
    ],
  },
  {
    id: "unit-2-topic-product-quotient-and-trig-rules",
    unitId: AP_CALCULUS_AB_UNIT_2_ID,
    sequence: 4,
    title: "Products, quotients, and remaining trigonometric functions",
    description:
      "Differentiate multiplied and divided functions and derive the remaining trigonometric rules from known identities.",
    conceptIds: ["product-rule", "quotient-rule", "remaining-trigonometric-derivatives"],
  },
];

export const apCalculusABUnit2: Unit = {
  id: AP_CALCULUS_AB_UNIT_2_ID,
  courseId: COURSE_ID,
  sequence: 2,
  title: "Differentiation: Definition and Fundamental Properties (Unit 2)",
  description:
    "A limit-first Unit 2 sequence connecting average and instantaneous rates, derivative representations, differentiability, and foundational differentiation rules.",
  topicIds: apCalculusABUnit2Topics.map((topic) => topic.id),
  conceptIds: apCalculusABUnit2Topics.flatMap((topic) => topic.conceptIds),
  estimatedMinutes: 250,
};

export const apCalculusABUnit2Concepts: Concept[] = [
  {
    id: "average-and-instantaneous-rates-of-change",
    courseId: COURSE_ID,
    unitId: AP_CALCULUS_AB_UNIT_2_ID,
    topicId: "unit-2-topic-rates-and-derivative-definition",
    title: "Average and instantaneous rates of change",
    description:
      "Interpret a difference quotient as average rate over an interval and use shrinking intervals to motivate instantaneous rate at a point.",
    prerequisiteConceptIds: [
      "instantaneous-change-motivation",
      "evaluating-limits-with-limit-laws",
    ],
    learningObjectives: [
      {
        id: "lo-rate-change-average",
        conceptId: "average-and-instantaneous-rates-of-change",
        title: "Determine an average rate of change",
        description:
          "Calculate and interpret a difference quotient from formulas, tables, graphs, or verbal information.",
        successCriteria: [
          "Uses change in output divided by change in input",
          "Keeps numerator and denominator endpoint order consistent",
          "Interprets the result with contextual units when units are provided",
        ],
      },
      {
        id: "lo-rate-change-instantaneous",
        conceptId: "average-and-instantaneous-rates-of-change",
        title: "Connect average and instantaneous rates",
        description:
          "Explain how average rates over shrinking intervals can approach a stable instantaneous rate.",
        successCriteria: [
          "Describes secant slopes over nonzero intervals",
          "Uses a limiting process rather than a zero-width quotient",
          "Connects the limiting slope to local change at one input",
        ],
      },
    ],
    commonMisconceptions: [
      "An instantaneous rate can be calculated by substituting a zero-width interval directly into a difference quotient.",
      "Average rate of change is the average of the two endpoint outputs.",
      "A negative rate means the input values are decreasing.",
    ],
    examples: [
      {
        id: "example-average-rate-temperature",
        title: "Temperature change over an interval",
        description:
          "A temperature rises from 18°C to 24°C over three hours, giving an average rate of 2°C per hour.",
      },
      {
        id: "example-shrinking-secant-parabola",
        title: "Secants approaching a tangent",
        description:
          "For f(x)=x² near x=2, secant slopes over shorter intervals approach 4.",
      },
    ],
    difficulty: "developing",
    estimatedMinutes: 26,
  },
  {
    id: "derivative-as-a-limit-and-tangent-slope",
    courseId: COURSE_ID,
    unitId: AP_CALCULUS_AB_UNIT_2_ID,
    topicId: "unit-2-topic-rates-and-derivative-definition",
    title: "The derivative as a limit and tangent slope",
    description:
      "Represent a derivative value and derivative function with equivalent difference-quotient limits and use a derivative value as a tangent-line slope.",
    prerequisiteConceptIds: [
      "average-and-instantaneous-rates-of-change",
      "limit-notation",
    ],
    learningObjectives: [
      {
        id: "lo-derivative-definition-represent",
        conceptId: "derivative-as-a-limit-and-tangent-slope",
        title: "Represent derivatives with limits",
        description:
          "Write and recognize point-based and function-based definitions of a derivative.",
        successCriteria: [
          "Identifies the changing input and nonzero difference quotient",
          "Places the limiting variable and target correctly",
          "Distinguishes f'(a), f'(x), dy/dx, and y' by context",
        ],
      },
      {
        id: "lo-derivative-tangent-line",
        conceptId: "derivative-as-a-limit-and-tangent-slope",
        title: "Connect a derivative to a tangent line",
        description:
          "Use f'(a) as the slope of the tangent line through (a,f(a)).",
        successCriteria: [
          "Separates the tangent slope from the tangent-line equation",
          "Uses the correct point on the original function",
          "Writes a valid point-slope equation",
        ],
      },
    ],
    commonMisconceptions: [
      "The derivative at a point is the tangent line rather than the tangent line's slope.",
      "The limit definition allows h=0 inside the quotient.",
      "f'(a) and f(a) refer to the same function value.",
    ],
    examples: [
      {
        id: "example-derivative-definition-square",
        title: "Differentiate x² from the definition",
        description:
          "The limit of ((x+h)²-x²)/h as h approaches zero simplifies to 2x.",
      },
      {
        id: "example-tangent-line-square",
        title: "A tangent line at x=2",
        description:
          "For f(x)=x², f(2)=4 and f'(2)=4 give y-4=4(x-2).",
      },
    ],
    difficulty: "advanced",
    estimatedMinutes: 28,
  },
  {
    id: "estimating-derivatives-at-a-point",
    courseId: COURSE_ID,
    unitId: AP_CALCULUS_AB_UNIT_2_ID,
    topicId: "unit-2-topic-estimation-and-differentiability",
    title: "Estimating derivatives at a point",
    description:
      "Approximate a derivative from nearby table values, a graph's local slope, or technology while making the approximation method explicit.",
    prerequisiteConceptIds: ["average-and-instantaneous-rates-of-change"],
    learningObjectives: [
      {
        id: "lo-estimate-derivative-table",
        conceptId: "estimating-derivatives-at-a-point",
        title: "Estimate from tabular data",
        description:
          "Choose nearby input values and construct a difference quotient that approximates the derivative.",
        successCriteria: [
          "Uses points close to the target input",
          "Prefers a symmetric estimate when suitable values exist on both sides",
          "Displays the difference-quotient structure before reporting the estimate",
        ],
      },
      {
        id: "lo-estimate-derivative-graph",
        conceptId: "estimating-derivatives-at-a-point",
        title: "Estimate from graphical behavior",
        description:
          "Estimate the slope of a tangent line using rise over run on a locally representative line.",
        successCriteria: [
          "Uses points on the tangent estimate rather than arbitrary curve points",
          "Tracks the sign and relative steepness of the slope",
          "Labels the result as an estimate when exact information is unavailable",
        ],
      },
    ],
    commonMisconceptions: [
      "Any pair of table values gives an equally accurate derivative estimate.",
      "The derivative at a point is the y-coordinate of that point.",
      "A graph that is increasing must have derivative exactly 1.",
    ],
    examples: [
      {
        id: "example-centered-difference-table",
        title: "Centered difference from a table",
        description:
          "Values at x=1.9 and x=2.1 estimate f'(2) through a secant centered at 2.",
      },
      {
        id: "example-graph-negative-slope",
        title: "Estimate a decreasing tangent",
        description:
          "A tangent that falls about 3 units while moving 2 units right has slope near -1.5.",
      },
    ],
    difficulty: "developing",
    estimatedMinutes: 24,
  },
  {
    id: "differentiability-and-continuity",
    courseId: COURSE_ID,
    unitId: AP_CALCULUS_AB_UNIT_2_ID,
    topicId: "unit-2-topic-estimation-and-differentiability",
    title: "Differentiability and continuity",
    description:
      "Explain why differentiability at a point guarantees continuity there and diagnose continuous points where a finite derivative does not exist.",
    prerequisiteConceptIds: [
      "derivative-as-a-limit-and-tangent-slope",
      "continuity-at-a-point",
      "one-sided-limits",
    ],
    learningObjectives: [
      {
        id: "lo-differentiability-implies-continuity",
        conceptId: "differentiability-and-continuity",
        title: "Use the differentiability implication",
        description:
          "Reason correctly from differentiability to continuity without reversing the implication.",
        successCriteria: [
          "States that differentiability implies continuity",
          "Uses discontinuity to rule out differentiability",
          "Does not claim continuity is sufficient for differentiability",
        ],
      },
      {
        id: "lo-differentiability-failure",
        conceptId: "differentiability-and-continuity",
        title: "Diagnose nondifferentiable behavior",
        description:
          "Identify corners, cusps, vertical tangents, and discontinuities through one-sided difference-quotient behavior.",
        successCriteria: [
          "Compares left- and right-hand derivative behavior",
          "Distinguishes unequal finite slopes from unbounded slopes",
          "Connects the graph feature to failure of a finite derivative",
        ],
      },
    ],
    commonMisconceptions: [
      "Every continuous function is differentiable.",
      "A vertical tangent has derivative zero because the line does not move horizontally.",
      "A corner is differentiable because both one-sided slopes exist separately.",
    ],
    examples: [
      {
        id: "example-absolute-value-corner",
        title: "A continuous corner",
        description:
          "The function |x| is continuous at zero, but its one-sided slopes -1 and 1 disagree.",
      },
      {
        id: "example-cube-root-vertical-tangent",
        title: "A vertical tangent",
        description:
          "The function cube-root x is continuous at zero while its tangent slope becomes unbounded.",
      },
    ],
    difficulty: "advanced",
    estimatedMinutes: 26,
  },
  {
    id: "power-rule",
    courseId: COURSE_ID,
    unitId: AP_CALCULUS_AB_UNIT_2_ID,
    topicId: "unit-2-topic-fundamental-derivative-rules",
    title: "The power rule",
    description:
      "Differentiate powers of x efficiently and connect the rule's coefficient and exponent changes to the derivative definition.",
    prerequisiteConceptIds: ["derivative-as-a-limit-and-tangent-slope"],
    learningObjectives: [
      {
        id: "lo-power-rule-apply",
        conceptId: "power-rule",
        title: "Apply the power rule",
        description:
          "Use d/dx(x^r)=r x^(r-1) where the function and derivative are defined.",
        successCriteria: [
          "Moves the original exponent to the coefficient",
          "Subtracts one from the exponent",
          "Handles zero, negative, and fractional exponents with domain awareness",
        ],
      },
      {
        id: "lo-power-rule-verify",
        conceptId: "power-rule",
        title: "Connect rule and definition",
        description:
          "Verify a simple power-rule result with a difference quotient or local slope check.",
        successCriteria: [
          "Builds the correct difference quotient",
          "Simplifies before taking the limit",
          "Checks that the resulting slope behavior is plausible",
        ],
      },
    ],
    commonMisconceptions: [
      "The exponent decreases by one without first becoming the coefficient.",
      "The derivative of x is zero because its exponent is not visibly written.",
      "The power rule has no domain restrictions for fractional or negative powers.",
    ],
    examples: [
      {
        id: "example-power-rule-polynomial-term",
        title: "A positive integer power",
        description: "The derivative of x^5 is 5x^4.",
      },
      {
        id: "example-power-rule-negative-power",
        title: "A reciprocal power",
        description: "Writing 1/x² as x^-2 gives derivative -2x^-3 for x not equal to zero.",
      },
    ],
    difficulty: "developing",
    estimatedMinutes: 22,
  },
  {
    id: "linearity-rules-for-derivatives",
    courseId: COURSE_ID,
    unitId: AP_CALCULUS_AB_UNIT_2_ID,
    topicId: "unit-2-topic-fundamental-derivative-rules",
    title: "Constant, sum, difference, and constant-multiple rules",
    description:
      "Differentiate constants and linear combinations term by term while preserving coefficients and subtraction structure.",
    prerequisiteConceptIds: ["power-rule"],
    learningObjectives: [
      {
        id: "lo-linearity-rules-apply",
        conceptId: "linearity-rules-for-derivatives",
        title: "Differentiate linear combinations",
        description:
          "Apply constant, sum, difference, and constant-multiple rules to familiar functions.",
        successCriteria: [
          "Differentiates a constant to zero",
          "Preserves scalar coefficients",
          "Differentiates each summed or subtracted term with correct signs",
        ],
      },
      {
        id: "lo-linearity-polynomials",
        conceptId: "linearity-rules-for-derivatives",
        title: "Differentiate polynomials efficiently",
        description:
          "Combine the power rule and linearity to produce a simplified polynomial derivative.",
        successCriteria: [
          "Classifies the expression as a linear combination of powers",
          "Applies the power rule to every nonconstant term",
          "Checks the derivative's degree against the original polynomial",
        ],
      },
    ],
    commonMisconceptions: [
      "A constant term differentiates to itself.",
      "The derivative of f+g requires the product rule.",
      "A negative sign can be dropped after differentiating the following term.",
    ],
    examples: [
      {
        id: "example-linearity-polynomial",
        title: "Differentiate a polynomial",
        description: "The derivative of 3x^4-2x+7 is 12x^3-2.",
      },
      {
        id: "example-linearity-function-values",
        title: "Combine derivative values",
        description: "If f'(a)=2 and g'(a)=-1, then (3f-4g)'(a)=10.",
      },
    ],
    difficulty: "developing",
    estimatedMinutes: 22,
  },
  {
    id: "basic-transcendental-derivatives",
    courseId: COURSE_ID,
    unitId: AP_CALCULUS_AB_UNIT_2_ID,
    topicId: "unit-2-topic-fundamental-derivative-rules",
    title: "Derivatives of sine, cosine, exponential, and logarithmic functions",
    description:
      "Differentiate sin x, cos x, e^x, and ln x, and recognize limits that encode their known derivative values.",
    prerequisiteConceptIds: [
      "derivative-as-a-limit-and-tangent-slope",
      "linearity-rules-for-derivatives",
    ],
    learningObjectives: [
      {
        id: "lo-basic-transcendental-rules",
        conceptId: "basic-transcendental-derivatives",
        title: "Apply familiar-function derivative rules",
        description:
          "Calculate derivatives of sin x, cos x, e^x, and ln x in their valid domains.",
        successCriteria: [
          "Uses cos x for the derivative of sin x",
          "Includes the negative sign in the derivative of cos x",
          "Uses e^x and 1/x correctly for exponential and logarithmic derivatives",
        ],
      },
      {
        id: "lo-basic-transcendental-limit-recognition",
        conceptId: "basic-transcendental-derivatives",
        title: "Recognize derivative-definition limits",
        description:
          "Interpret a suitable limit as a derivative value of a familiar function.",
        successCriteria: [
          "Matches the numerator to f(a+h)-f(a)",
          "Identifies the point a and function f",
          "Evaluates the limit through the known derivative value",
        ],
      },
    ],
    commonMisconceptions: [
      "The derivative of cos x is sin x without a negative sign.",
      "The derivative of ln x is ln x.",
      "The standard trigonometric derivative rules work the same way when angles are measured in degrees.",
    ],
    examples: [
      {
        id: "example-basic-transcendental-linear-combination",
        title: "A mixed familiar-function derivative",
        description: "The derivative of 2sin x-3e^x+ln x is 2cos x-3e^x+1/x.",
      },
      {
        id: "example-sine-derivative-limit",
        title: "A limit that is a derivative value",
        description: "The limit of sin(h)/h as h approaches zero is the derivative of sin x at x=0, which equals 1.",
      },
    ],
    difficulty: "developing",
    estimatedMinutes: 26,
  },
  {
    id: "product-rule",
    courseId: COURSE_ID,
    unitId: AP_CALCULUS_AB_UNIT_2_ID,
    topicId: "unit-2-topic-product-quotient-and-trig-rules",
    title: "The product rule",
    description:
      "Differentiate a product through the two contributions that arise when each factor changes.",
    prerequisiteConceptIds: [
      "linearity-rules-for-derivatives",
      "basic-transcendental-derivatives",
    ],
    learningObjectives: [
      {
        id: "lo-product-rule-apply",
        conceptId: "product-rule",
        title: "Apply the product rule",
        description:
          "Calculate (fg)' as f'g+fg' from formulas or tabular values.",
        successCriteria: [
          "Keeps one undifferentiated factor in each term",
          "Includes both product-rule terms",
          "Substitutes function and derivative values into the correct positions",
        ],
      },
      {
        id: "lo-product-rule-select",
        conceptId: "product-rule",
        title: "Decide when the product rule is needed",
        description:
          "Distinguish a product of changing functions from a constant multiple or an expression better simplified first.",
        successCriteria: [
          "Identifies two variable-dependent factors",
          "Uses the constant-multiple rule when one factor is constant",
          "Checks whether algebraic expansion offers a valid simpler route",
        ],
      },
    ],
    commonMisconceptions: [
      "The derivative of a product is the product of the derivatives.",
      "The first factor should be differentiated in both product-rule terms.",
      "Every multiplication symbol requires the product rule, including multiplication by a constant.",
    ],
    examples: [
      {
        id: "example-product-polynomial-exponential",
        title: "Polynomial times exponential",
        description: "For h(x)=x²e^x, h'(x)=2xe^x+x²e^x.",
      },
      {
        id: "example-product-rule-table",
        title: "Use tabular function data",
        description: "Values of f, g, f', and g' at one input determine (fg)' there without formulas.",
      },
    ],
    difficulty: "advanced",
    estimatedMinutes: 26,
  },
  {
    id: "quotient-rule",
    courseId: COURSE_ID,
    unitId: AP_CALCULUS_AB_UNIT_2_ID,
    topicId: "unit-2-topic-product-quotient-and-trig-rules",
    title: "The quotient rule",
    description:
      "Differentiate a quotient with an ordered numerator difference over the square of the original denominator.",
    prerequisiteConceptIds: ["product-rule"],
    learningObjectives: [
      {
        id: "lo-quotient-rule-apply",
        conceptId: "quotient-rule",
        title: "Apply the quotient rule",
        description:
          "Calculate (f/g)'=(f'g-fg')/g² where the original denominator is nonzero.",
        successCriteria: [
          "Preserves the order f'g-fg'",
          "Squares the original denominator function",
          "States or respects points excluded from the original quotient's domain",
        ],
      },
      {
        id: "lo-quotient-rule-select",
        conceptId: "quotient-rule",
        title: "Choose between quotient rule and simplification",
        description:
          "Recognize when rewriting a quotient as a power or simplifying common structure is valid and efficient.",
        successCriteria: [
          "Identifies the numerator and denominator before differentiating",
          "Uses a power rewrite only when algebraically equivalent on the relevant domain",
          "Checks the result against a plausible sign or simple value",
        ],
      },
    ],
    commonMisconceptions: [
      "The derivative of a quotient is the quotient of the derivatives.",
      "The quotient-rule numerator can be reversed without changing the result.",
      "The denominator is squared after it has been differentiated.",
    ],
    examples: [
      {
        id: "example-quotient-sine-polynomial",
        title: "Trigonometric numerator over a polynomial",
        description: "For q(x)=sin x/x², the quotient rule gives (x²cos x-2x sin x)/x^4 for x not equal to zero.",
      },
      {
        id: "example-quotient-table",
        title: "A quotient derivative from a table",
        description: "Function and derivative values at x=a determine (f/g)'(a), provided g(a) is nonzero.",
      },
    ],
    difficulty: "advanced",
    estimatedMinutes: 26,
  },
  {
    id: "remaining-trigonometric-derivatives",
    courseId: COURSE_ID,
    unitId: AP_CALCULUS_AB_UNIT_2_ID,
    topicId: "unit-2-topic-product-quotient-and-trig-rules",
    title: "Derivatives of tangent, cotangent, secant, and cosecant",
    description:
      "Derive and apply the remaining trigonometric derivative rules using quotient and reciprocal identities.",
    prerequisiteConceptIds: ["quotient-rule", "basic-transcendental-derivatives"],
    learningObjectives: [
      {
        id: "lo-remaining-trig-derive",
        conceptId: "remaining-trigonometric-derivatives",
        title: "Derive trigonometric rules from identities",
        description:
          "Use tan x=sin x/cos x and reciprocal identities to justify derivative formulas.",
        successCriteria: [
          "Applies the quotient or product rule to an equivalent identity",
          "Simplifies with a valid Pythagorean or reciprocal identity",
          "Tracks the negative signs for cotangent and cosecant",
        ],
      },
      {
        id: "lo-remaining-trig-apply",
        conceptId: "remaining-trigonometric-derivatives",
        title: "Apply the remaining trigonometric rules",
        description:
          "Differentiate tan, cot, sec, and csc terms in linear combinations.",
        successCriteria: [
          "Uses sec²x for the derivative of tan x",
          "Uses -csc²x for the derivative of cot x",
          "Preserves sec x tan x and -csc x cot x as paired factors",
        ],
      },
    ],
    commonMisconceptions: [
      "The derivatives of tangent and cotangent have the same sign.",
      "The derivative of sec x is tan x without the sec x factor.",
      "Trigonometric derivative identities remain valid at inputs where the original function is undefined.",
    ],
    examples: [
      {
        id: "example-derive-tangent-rule",
        title: "Derive the tangent rule",
        description: "Differentiating sin x/cos x gives (cos²x+sin²x)/cos²x=sec²x.",
      },
      {
        id: "example-remaining-trig-linear-combination",
        title: "Differentiate mixed trigonometric terms",
        description: "The derivative of 2tan x-3csc x is 2sec²x+3csc x cot x.",
      },
    ],
    difficulty: "advanced",
    estimatedMinutes: 24,
  },
];

export const apCalculusABUnit2Dependencies: ConceptDependency[] = [
  {
    id: "dependency-instantaneous-change-to-average-rate",
    prerequisiteConceptId: "instantaneous-change-motivation",
    dependentConceptId: "average-and-instantaneous-rates-of-change",
    relationship: "extends",
    rationale:
      "Unit 2 formalizes the shrinking-interval motivation introduced at the beginning of Unit 1.",
  },
  {
    id: "dependency-limit-laws-to-average-rate",
    prerequisiteConceptId: "evaluating-limits-with-limit-laws",
    dependentConceptId: "average-and-instantaneous-rates-of-change",
    relationship: "supports",
    rationale:
      "Difference quotients require reliable algebra and limit evaluation as intervals shrink.",
  },
  {
    id: "dependency-average-rate-to-derivative-definition",
    prerequisiteConceptId: "average-and-instantaneous-rates-of-change",
    dependentConceptId: "derivative-as-a-limit-and-tangent-slope",
    relationship: "prerequisite",
    rationale:
      "The derivative definition is a limit of average rates of change over nonzero intervals.",
  },
  {
    id: "dependency-limit-notation-to-derivative-definition",
    prerequisiteConceptId: "limit-notation",
    dependentConceptId: "derivative-as-a-limit-and-tangent-slope",
    relationship: "prerequisite",
    rationale:
      "Students must interpret the approaching variable and target before reading a derivative limit.",
  },
  {
    id: "dependency-average-rate-to-derivative-estimation",
    prerequisiteConceptId: "average-and-instantaneous-rates-of-change",
    dependentConceptId: "estimating-derivatives-at-a-point",
    relationship: "extends",
    rationale:
      "A nearby secant slope provides a numerical approximation of the tangent slope.",
  },
  {
    id: "dependency-derivative-definition-to-differentiability",
    prerequisiteConceptId: "derivative-as-a-limit-and-tangent-slope",
    dependentConceptId: "differentiability-and-continuity",
    relationship: "prerequisite",
    rationale:
      "Differentiability is determined by whether the relevant difference-quotient limit exists as a finite value.",
  },
  {
    id: "dependency-continuity-to-differentiability",
    prerequisiteConceptId: "continuity-at-a-point",
    dependentConceptId: "differentiability-and-continuity",
    relationship: "extends",
    rationale:
      "The new implication distinguishes differentiability as stronger than continuity at a point.",
  },
  {
    id: "dependency-one-sided-limits-to-differentiability",
    prerequisiteConceptId: "one-sided-limits",
    dependentConceptId: "differentiability-and-continuity",
    relationship: "supports",
    rationale:
      "Corners and cusps are diagnosed by comparing one-sided difference-quotient limits.",
  },
  {
    id: "dependency-derivative-definition-to-power-rule",
    prerequisiteConceptId: "derivative-as-a-limit-and-tangent-slope",
    dependentConceptId: "power-rule",
    relationship: "extends",
    rationale:
      "The power rule compresses a repeated difference-quotient derivation into a reusable procedure.",
  },
  {
    id: "dependency-power-rule-to-linearity",
    prerequisiteConceptId: "power-rule",
    dependentConceptId: "linearity-rules-for-derivatives",
    relationship: "prerequisite",
    rationale:
      "Polynomial differentiation combines the power rule with constant, sum, difference, and scalar properties.",
  },
  {
    id: "dependency-linearity-to-transcendental",
    prerequisiteConceptId: "linearity-rules-for-derivatives",
    dependentConceptId: "basic-transcendental-derivatives",
    relationship: "supports",
    rationale:
      "Known elementary derivatives become useful in expressions when learners can combine terms linearly.",
  },
  {
    id: "dependency-linearity-to-product-rule",
    prerequisiteConceptId: "linearity-rules-for-derivatives",
    dependentConceptId: "product-rule",
    relationship: "prerequisite",
    rationale:
      "The product rule produces a sum of two derivative contributions that must be combined accurately.",
  },
  {
    id: "dependency-transcendental-to-product-rule",
    prerequisiteConceptId: "basic-transcendental-derivatives",
    dependentConceptId: "product-rule",
    relationship: "supports",
    rationale:
      "Products commonly include trigonometric, exponential, or logarithmic factors whose derivatives must already be known.",
  },
  {
    id: "dependency-product-to-quotient-rule",
    prerequisiteConceptId: "product-rule",
    dependentConceptId: "quotient-rule",
    relationship: "extends",
    rationale:
      "The quotient rule adds denominator structure to the same principle that both changing factors contribute.",
  },
  {
    id: "dependency-quotient-to-remaining-trig",
    prerequisiteConceptId: "quotient-rule",
    dependentConceptId: "remaining-trigonometric-derivatives",
    relationship: "prerequisite",
    rationale:
      "Tangent and cotangent derivative rules can be derived from sine and cosine quotient identities.",
  },
  {
    id: "dependency-transcendental-to-remaining-trig",
    prerequisiteConceptId: "basic-transcendental-derivatives",
    dependentConceptId: "remaining-trigonometric-derivatives",
    relationship: "prerequisite",
    rationale:
      "The remaining trigonometric derivatives depend on the known derivatives of sine and cosine.",
  },
];
