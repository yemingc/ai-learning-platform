import { lessonContentArraySchema } from "../../features/lessons/lesson-schema.ts";
import { validateRetrievalReadyLessons } from "../../features/lessons/retrieval-validation.ts";
import type {
  LessonApplicationPrompt,
  LessonContent,
  LessonGuidedQuestion,
  LessonMisconceptionCheck,
  LessonObjective,
  LessonPrerequisiteConnection,
  LessonReflectionPrompt,
  LessonWorkedExample,
} from "@/features/lessons/types";
import { AP_CALCULUS_AB_UNIT_2_ID } from "./unit-2-knowledge.ts";

const COURSE_ID = "ap-calculus-ab";

type Unit2LessonDraft = {
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

type Unit2LessonMetadata = {
  retrievalTags: string[];
  glossaryTerms: Array<{
    term: string;
    definition: string;
    aliases?: string[];
  }>;
};

export const unit2LessonMetadata: Record<string, Unit2LessonMetadata> = {
  "average-and-instantaneous-rates-of-change": {
    retrievalTags: [
      "average rate of change",
      "instantaneous rate of change",
      "difference quotient",
      "secant slope",
    ],
    glossaryTerms: [
      {
        term: "average rate of change",
        definition:
          "The change in a function's output divided by the corresponding nonzero change in input over an interval.",
        aliases: ["secant slope"],
      },
      {
        term: "instantaneous rate of change",
        definition:
          "The limiting value of average rates over intervals that shrink toward one input.",
        aliases: ["rate at a point"],
      },
    ],
  },
  "derivative-as-a-limit-and-tangent-slope": {
    retrievalTags: [
      "derivative definition",
      "difference quotient limit",
      "tangent slope",
      "derivative notation",
    ],
    glossaryTerms: [
      {
        term: "derivative",
        definition:
          "A function or value that gives instantaneous rate of change where the defining limit exists.",
        aliases: ["instantaneous rate", "tangent slope"],
      },
      {
        term: "tangent line",
        definition:
          "The line through a point on a curve whose slope equals the derivative at that point.",
      },
    ],
  },
  "estimating-derivatives-at-a-point": {
    retrievalTags: [
      "estimate derivative",
      "centered difference",
      "table",
      "graph tangent slope",
    ],
    glossaryTerms: [
      {
        term: "centered difference",
        definition:
          "A secant slope using one input on each side of the target, often producing a strong derivative estimate.",
        aliases: ["symmetric difference"],
      },
      {
        term: "local slope",
        definition:
          "The slope behavior of a graph in a small neighborhood of a point.",
      },
    ],
  },
  "differentiability-and-continuity": {
    retrievalTags: [
      "differentiability",
      "continuity",
      "corner",
      "cusp",
      "vertical tangent",
    ],
    glossaryTerms: [
      {
        term: "differentiable at a point",
        definition:
          "Having a finite derivative at that point because the relevant difference-quotient limit exists.",
      },
      {
        term: "nondifferentiable point",
        definition:
          "A point where a finite derivative fails to exist, such as a discontinuity, corner, cusp, or vertical tangent.",
      },
    ],
  },
  "power-rule": {
    retrievalTags: [
      "power rule",
      "derivative of x power",
      "negative exponent",
      "fractional exponent",
    ],
    glossaryTerms: [
      {
        term: "power rule",
        definition:
          "The rule d/dx(x^r)=r x^(r-1), used where the original expression and derivative are defined.",
      },
      {
        term: "domain restriction",
        definition:
          "An input excluded because the original function or its derivative is not defined there.",
      },
    ],
  },
  "linearity-rules-for-derivatives": {
    retrievalTags: [
      "constant rule",
      "sum rule",
      "difference rule",
      "constant multiple rule",
      "polynomial derivative",
    ],
    glossaryTerms: [
      {
        term: "linearity of differentiation",
        definition:
          "Differentiation preserves sums and scalar multiples: (af+bg)'=af'+bg'.",
        aliases: ["linearity rules"],
      },
      {
        term: "constant rule",
        definition:
          "The derivative of a constant function is zero.",
      },
    ],
  },
  "basic-transcendental-derivatives": {
    retrievalTags: [
      "derivative of sine",
      "derivative of cosine",
      "derivative of e^x",
      "derivative of ln x",
    ],
    glossaryTerms: [
      {
        term: "transcendental function",
        definition:
          "A nonalgebraic function such as a trigonometric, exponential, or logarithmic function.",
      },
      {
        term: "radian measure",
        definition:
          "The angle measure required for the standard calculus derivatives of trigonometric functions.",
      },
    ],
  },
  "product-rule": {
    retrievalTags: [
      "product rule",
      "derivative of product",
      "f prime g plus f g prime",
      "tabular derivative values",
    ],
    glossaryTerms: [
      {
        term: "product rule",
        definition:
          "The rule (fg)'=f'g+fg' for differentiable functions f and g.",
      },
      {
        term: "factor",
        definition:
          "One of the functions multiplied together in a product.",
      },
    ],
  },
  "quotient-rule": {
    retrievalTags: [
      "quotient rule",
      "derivative of quotient",
      "denominator squared",
      "domain restriction",
    ],
    glossaryTerms: [
      {
        term: "quotient rule",
        definition:
          "The rule (f/g)'=(f'g-fg')/g² at inputs where g is nonzero.",
      },
      {
        term: "original domain",
        definition:
          "The inputs allowed by the function before any algebraic or derivative simplification.",
      },
    ],
  },
  "remaining-trigonometric-derivatives": {
    retrievalTags: [
      "derivative of tangent",
      "derivative of cotangent",
      "derivative of secant",
      "derivative of cosecant",
    ],
    glossaryTerms: [
      {
        term: "reciprocal identity",
        definition:
          "An identity such as sec x=1/cos x or csc x=1/sin x.",
      },
      {
        term: "Pythagorean identity",
        definition:
          "An identity derived from sin²x+cos²x=1, including 1+tan²x=sec²x.",
      },
    ],
  },
};

function sectionId(conceptId: string, name: string) {
  return [COURSE_ID, AP_CALCULUS_AB_UNIT_2_ID, conceptId, name].join("/");
}

function formatWorkedExamples(examples: LessonWorkedExample[]) {
  return examples
    .map((example) =>
      [
        example.title,
        example.setup,
        ...example.walkthrough.map(
          (step, index) => String(index + 1) + ". " + step,
        ),
        "Takeaway: " + example.takeaway,
      ].join("\n"),
    )
    .join("\n\n");
}

function formatGuidedQuestions(questions: LessonGuidedQuestion[]) {
  return questions
    .map((question) =>
      [
        "Prompt: " + question.prompt,
        "Hint: " + question.hint,
        "Target insight: " + question.targetInsight,
      ].join("\n"),
    )
    .join("\n\n");
}

function formatMisconceptions(checks: LessonMisconceptionCheck[]) {
  return checks
    .map((check, index) =>
      [
        "Misconception " + String(index + 1) + ": " + check.misconception,
        "Check prompt: " + check.checkPrompt,
        "Correction: " + check.correction,
      ].join("\n"),
    )
    .join("\n\n");
}

function createUnit2Lesson(draft: Unit2LessonDraft): LessonContent {
  const metadata = unit2LessonMetadata[draft.conceptId];
  const prerequisiteConceptIds = draft.prerequisiteConnections.map(
    (connection) => connection.conceptId,
  );
  const misconceptionIds = draft.misconceptionChecks.map(
    (_, index) =>
      draft.conceptId + "-misconception-" + String(index + 1),
  );
  const applicationTask = {
    id: sectionId(draft.conceptId, "application-task-1"),
    title: draft.applicationPrompt.title,
    prompt: draft.applicationPrompt.prompt,
    readinessSignal: draft.applicationPrompt.whyItTransfers,
    sectionId: "application",
  };

  if (!metadata) {
    throw new Error("Missing Unit 2 lesson metadata for " + draft.conceptId);
  }

  return {
    ...draft,
    id: [COURSE_ID, AP_CALCULUS_AB_UNIT_2_ID, draft.conceptId].join("/"),
    lessonId: draft.conceptId + "-lesson",
    courseId: COURSE_ID,
    unitId: AP_CALCULUS_AB_UNIT_2_ID,
    learningObjectives: [
      draft.objective.description,
      ...draft.objective.successCriteria,
    ],
    prerequisiteConceptIds,
    retrievalTags: metadata.retrievalTags,
    glossaryTerms: metadata.glossaryTerms.map((term) => ({
      aliases: term.aliases ?? [],
      ...term,
    })),
    applicationTasks: [applicationTask],
    practiceReadinessTasks: [applicationTask],
    sections: [
      {
        id: sectionId(draft.conceptId, "why"),
        sectionId: "why",
        type: "why_this_matters",
        title: "Why this matters",
        body: draft.hook,
        teachingGoal:
          "Establish the purpose of the derivative idea before introducing procedure.",
        retrievalTags: ["purpose", "motivation"],
        misconceptionIds: [],
      },
      {
        id: sectionId(draft.conceptId, "intuition"),
        sectionId: "intuition",
        type: "intuition",
        title: "Intuition",
        body: [
          draft.intuition,
          ...draft.prerequisiteConnections.map(
            (connection) =>
              "Prerequisite connection - " +
              connection.title +
              ": " +
              connection.connection,
          ),
        ].join("\n\n"),
        teachingGoal:
          "Build a rate-and-slope mental model before formal rules.",
        retrievalTags: ["intuition", "mental model", ...prerequisiteConceptIds],
        misconceptionIds: [],
      },
      {
        id: sectionId(draft.conceptId, "formal"),
        sectionId: "formal",
        type: "formal_idea",
        title: "Formal idea",
        body: draft.formalExplanation,
        teachingGoal:
          "State the concept precisely with AP-appropriate notation and conditions.",
        retrievalTags: ["definition", "formal explanation"],
        misconceptionIds: [],
      },
      {
        id: sectionId(draft.conceptId, "worked"),
        sectionId: "worked",
        type: "worked_example",
        title: "Worked example",
        body: formatWorkedExamples(draft.workedExamples),
        teachingGoal:
          "Model method selection, execution, and interpretation step by step.",
        retrievalTags: ["worked example", "reasoning"],
        misconceptionIds: [],
      },
      {
        id: sectionId(draft.conceptId, "guided"),
        sectionId: "guided",
        type: "think_with_me",
        title: "Think with me",
        body: formatGuidedQuestions(draft.guidedQuestions),
        teachingGoal:
          "Expose the learner's current reasoning through discriminating prompts.",
        retrievalTags: ["guided question", "socratic"],
        misconceptionIds: [],
      },
      {
        id: sectionId(draft.conceptId, "trap"),
        sectionId: "trap",
        type: "common_trap",
        title: "Common trap",
        body: formatMisconceptions(draft.misconceptionChecks),
        teachingGoal:
          "Identify and repair observable derivative misconceptions.",
        retrievalTags: ["misconception", "common trap"],
        misconceptionIds,
      },
      {
        id: sectionId(draft.conceptId, "reflection"),
        sectionId: "reflection",
        type: "reflection",
        title: "Reflection",
        body: [
          draft.reflectionPrompt.prompt,
          "Sentence starter: " + draft.reflectionPrompt.sentenceStarter,
        ].join("\n"),
        teachingGoal:
          "Require the learner to articulate the durable idea.",
        retrievalTags: ["reflection", "metacognition"],
        misconceptionIds: [],
      },
      {
        id: sectionId(draft.conceptId, "application"),
        sectionId: "application",
        type: "try_applying_it",
        title: draft.applicationPrompt.title,
        body: [
          draft.applicationPrompt.prompt,
          "Why it transfers: " + draft.applicationPrompt.whyItTransfers,
        ].join("\n"),
        teachingGoal:
          "Test whether the concept transfers to a new representation or context.",
        retrievalTags: ["application", "transfer", "readiness"],
        misconceptionIds: [],
      },
      {
        id: sectionId(draft.conceptId, "takeaways"),
        sectionId: "takeaways",
        type: "key_takeaways",
        title: "Key takeaways",
        body: draft.keyTakeaways.map((item) => "- " + item).join("\n"),
        teachingGoal:
          "Summarize the ideas that should remain available for later units.",
        retrievalTags: ["summary", "takeaways"],
        misconceptionIds: [],
      },
    ],
  };
}

const unit2LessonDrafts: Unit2LessonDraft[] = [
  {
    conceptId: "average-and-instantaneous-rates-of-change",
    title: "From average change to change at an instant",
    objective: {
      title: "Interpret difference quotients as rates",
      description:
        "Calculate average rates of change and explain how their limiting behavior defines an instantaneous rate.",
      successCriteria: [
        "Construct a difference quotient with consistent endpoint order.",
        "Interpret its sign and units when context is provided.",
        "Explain why an instantaneous rate uses a limit instead of a zero-width quotient.",
      ],
    },
    hook:
      "A trip computer can report your average speed over ten minutes, while a speedometer reports what is happening now. Calculus connects those two claims without dividing by zero.",
    intuition:
      "Average rate of change is a secant slope: it compares two points separated by a nonzero horizontal interval. To describe one instant, keep one endpoint fixed and let the other move closer. If the secant slopes settle toward one value, that limiting value describes the local rate at the fixed point.",
    formalExplanation:
      "For inputs a and b with a≠b, the average rate of change of f is (f(b)-f(a))/(b-a). Equivalently, over [a,a+h] with h≠0 it is (f(a+h)-f(a))/h. The instantaneous rate at a is the limit of these difference quotients as b→a or h→0, provided the limit exists. The quotient is evaluated only for nonzero intervals; zero appears as the limit target, not as a denominator used directly.",
    prerequisiteConnections: [
      {
        conceptId: "evaluating-limits-with-limit-laws",
        title: "Evaluating limits with limit laws",
        connection:
          "Algebra and limit laws reveal the value approached by a simplified difference quotient.",
      },
    ],
    workedExamples: [
      {
        title: "Shrink secants around x=2",
        setup:
          "For f(x)=x², determine the average rate over [2,2+h] and its limiting value as h→0.",
        walkthrough: [
          "Write the difference quotient: ((2+h)²-2²)/h.",
          "Expand the numerator to get (4+4h+h²-4)/h.",
          "For h≠0, simplify to 4+h.",
          "As h→0, 4+h approaches 4, so the instantaneous rate at x=2 is 4.",
        ],
        takeaway:
          "The interval never has zero width during the calculation; its nonzero widths approach zero.",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "If distance is measured in meters and time in seconds, what units should an average rate of change have?",
        hint: "Read the quotient as change in output divided by change in input.",
        targetInsight: "The rate has units of meters per second.",
      },
      {
        prompt:
          "Why can we simplify a factor of h in a difference quotient even though h approaches zero?",
        hint: "A limit examines nearby h-values, not h=0 itself.",
        targetInsight:
          "Every quotient used before the limit has h≠0, so cancellation is valid on the deleted neighborhood.",
      },
    ],
    misconceptionChecks: [
      {
        misconception:
          "Average rate of change means average the two endpoint outputs.",
        checkPrompt:
          "Would (f(a)+f(b))/2 measure output change per unit input?",
        correction:
          "No. Average rate is Δoutput/Δinput, not the arithmetic mean of outputs.",
      },
      {
        misconception:
          "Instantaneous rate is found by setting h=0 in the difference quotient.",
        checkPrompt: "What happens to the denominator if h is set to zero?",
        correction:
          "The quotient becomes undefined. The instantaneous rate comes from the limit as nonzero h approaches zero.",
      },
    ],
    reflectionPrompt: {
      prompt:
        "How does a sequence of secant slopes provide evidence about one instantaneous rate?",
      sentenceStarter:
        "As the interval becomes smaller, the secant slopes ____; if they approach ____, then ____.",
    },
    applicationPrompt: {
      title: "Interpret a changing water level",
      prompt:
        "A table gives tank depth at times 4.9, 5.0, and 5.1 minutes. Build one average-rate estimate for the instantaneous depth change at 5.0 minutes and interpret its units.",
      whyItTransfers:
        "The task moves from a formula to numerical contextual data while preserving the same difference-quotient structure.",
    },
    keyTakeaways: [
      "Average rate of change is a secant slope over a nonzero interval.",
      "Instantaneous rate is a limit of average rates over shrinking intervals.",
      "Rate units are output units divided by input units.",
    ],
  },
  {
    conceptId: "derivative-as-a-limit-and-tangent-slope",
    title: "The derivative is a limit, a rate, and a slope",
    objective: {
      title: "Represent and use the derivative definition",
      description:
        "Write derivative limits, interpret derivative notation, and use a derivative value as a tangent-line slope.",
      successCriteria: [
        "Recognize both point-based forms of the derivative definition.",
        "Distinguish a derivative function from its value at one point.",
        "Write a tangent-line equation through the correct point with slope f'(a).",
      ],
    },
    hook:
      "The symbols f'(a), dy/dx, and the slope of a tangent line can look like separate ideas. The derivative definition shows that they describe the same local change from different viewpoints.",
    intuition:
      "A tangent line is the limiting position of secant lines through a fixed point and a nearby point. The derivative is not the line itself; it is the slope value that survives as the nearby point closes in. Letting the base point vary turns those slope values into a new function f'.",
    formalExplanation:
      "If the limits exist, f'(a)=lim as h→0 of (f(a+h)-f(a))/h and equivalently f'(a)=lim as x→a of (f(x)-f(a))/(x-a). The derivative function is f'(x)=lim as h→0 of (f(x+h)-f(x))/h. For y=f(x), common notation includes f'(x), y', and dy/dx. At x=a, f'(a) is the slope of the tangent line, so y-f(a)=f'(a)(x-a).",
    prerequisiteConnections: [
      {
        conceptId: "average-and-instantaneous-rates-of-change",
        title: "Average and instantaneous rates",
        connection:
          "The derivative definition takes the limit of the average-rate difference quotient.",
      },
      {
        conceptId: "limit-notation",
        title: "Limit notation",
        connection:
          "The approach variable and target must be read accurately to identify a valid derivative definition.",
      },
    ],
    workedExamples: [
      {
        title: "Find a derivative value and tangent line from the definition",
        setup:
          "For f(x)=x², use the h-definition to find f'(3), then write the tangent line at x=3.",
        walkthrough: [
          "Write f'(3)=lim as h→0 of ((3+h)²-9)/h.",
          "Expand and simplify for h≠0: (6h+h²)/h=6+h.",
          "Take the limit to obtain f'(3)=6.",
          "Use the point (3,9): y-9=6(x-3).",
        ],
        takeaway:
          "The derivative value supplies the slope; the original function supplies the point.",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "In lim as x→4 of (f(x)-f(4))/(x-4), which derivative value is represented?",
        hint: "Match the fixed input in f(4) and the denominator.",
        targetInsight: "The limit represents f'(4), provided it exists.",
      },
      {
        prompt:
          "If f'(2)=-3 and f(2)=5, what information belongs in the tangent-line equation?",
        hint: "Use slope -3 through point (2,5).",
        targetInsight: "The equation is y-5=-3(x-2).",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "The derivative at a point is the tangent line.",
        checkPrompt:
          "Can a single number f'(a) contain both the slope and the point needed to identify a line?",
        correction:
          "No. f'(a) is the slope; the tangent line also needs the point (a,f(a)).",
      },
      {
        misconception:
          "Any quotient with f(x)-f(a) in the numerator is a derivative definition.",
        checkPrompt:
          "What denominator and limit target must accompany f(x)-f(a)?",
        correction:
          "The denominator must be x-a and the limit must take x→a, or an equivalent h-form must be used.",
      },
    ],
    reflectionPrompt: {
      prompt:
        "How are the derivative definition, instantaneous rate, and tangent slope connected?",
      sentenceStarter:
        "The difference quotient measures ____; its limit is ____, which is also ____.",
    },
    applicationPrompt: {
      title: "Recognize a disguised derivative limit",
      prompt:
        "Identify the function and base point represented by lim as h→0 of ((1+h)^5-1)/h, then evaluate the limit using the corresponding derivative value.",
      whyItTransfers:
        "AP problems often present a limit without naming it as a derivative.",
    },
    keyTakeaways: [
      "A derivative is defined by a limit of difference quotients.",
      "f'(a) is an instantaneous rate and tangent-line slope at x=a.",
      "The tangent line uses both f'(a) and the point (a,f(a)).",
    ],
  },
  {
    conceptId: "estimating-derivatives-at-a-point",
    title: "Estimate a tangent slope from nearby evidence",
    objective: {
      title: "Estimate derivatives from tables and graphs",
      description:
        "Choose nearby evidence, display a difference quotient, and report a reasonable derivative estimate.",
      successCriteria: [
        "Uses table entries close to the target input.",
        "Prefers values on both sides when a centered estimate is available.",
        "Connects graphical rise over run to the local tangent slope.",
      ],
    },
    hook:
      "Real data rarely arrives as a convenient formula. A derivative can still be estimated from nearby measurements or a carefully read graph.",
    intuition:
      "A derivative estimate asks for a secant that behaves as much like the tangent as the available evidence allows. Points close to the target reduce the interval, and points on opposite sides keep the estimate centered rather than leaning entirely left or right.",
    formalExplanation:
      "From a table, f'(a) may be estimated by (f(a+h)-f(a-h))/(2h) when symmetric values are available, or by a nearby one-sided difference quotient otherwise. From a graph, estimate the tangent line at the point and compute its rise over run using well-separated points on that line. Technology may calculate a numerical derivative, but the reported value remains tied to an approximation method and scale.",
    prerequisiteConnections: [
      {
        conceptId: "average-and-instantaneous-rates-of-change",
        title: "Average and instantaneous rates",
        connection:
          "A secant slope over a small interval is the observable approximation to a tangent slope.",
      },
    ],
    workedExamples: [
      {
        title: "Use a centered table estimate",
        setup:
          "A table for f near x=2 gives f(1.9)=3.61 and f(2.1)=4.41. Estimate f'(2).",
        walkthrough: [
          "Choose the entries equally spaced on opposite sides of 2.",
          "Write the centered quotient (4.41-3.61)/(2.1-1.9).",
          "Compute 0.80/0.20=4.",
          "Report f'(2)≈4 and note that this is a numerical estimate.",
        ],
        takeaway:
          "A centered secant often balances left- and right-side behavior near the target.",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "To estimate f'(5), would values at 4.9 and 5.1 usually be more useful than values at 1 and 9?",
        hint: "Compare how local each secant is to x=5.",
        targetInsight:
          "The nearby centered values usually better represent the local tangent behavior.",
      },
      {
        prompt:
          "On a graph, why should rise over run use points on the drawn tangent estimate rather than arbitrary points on the curve?",
        hint: "A curved graph does not have one constant secant slope.",
        targetInsight:
          "The target derivative is the tangent line's slope; arbitrary curve points define a different secant.",
      },
    ],
    misconceptionChecks: [
      {
        misconception:
          "Any two data points produce an equally good derivative estimate.",
        checkPrompt:
          "What happens if the chosen points are far from the target or both lie on the same side?",
        correction:
          "The secant may reflect nonlocal behavior or one-sided bias. Closer, balanced points are generally stronger evidence.",
      },
      {
        misconception: "The derivative is the y-value read from the graph.",
        checkPrompt:
          "Could two curves pass through the same point with different steepness?",
        correction:
          "Yes. The derivative measures slope, not height.",
      },
    ],
    reflectionPrompt: {
      prompt:
        "What makes one numerical derivative estimate more defensible than another?",
      sentenceStarter:
        "A stronger estimate uses points that are ____ and preferably ____ because ____.",
    },
    applicationPrompt: {
      title: "Compare two derivative estimates",
      prompt:
        "Given a nonuniform table around x=3, calculate two plausible secant estimates, decide which is stronger, and justify the choice.",
      whyItTransfers:
        "The task requires evaluating evidence quality instead of mechanically using the first available pair.",
    },
    keyTakeaways: [
      "Derivative estimates come from local secant or tangent evidence.",
      "Nearby points on both sides often support a strong centered estimate.",
      "A numerical or graphical result should be labeled and justified as an estimate.",
    ],
  },
  {
    conceptId: "differentiability-and-continuity",
    title: "Continuity is necessary, but smoothness asks for more",
    objective: {
      title: "Determine where a derivative exists",
      description:
        "Use continuity and one-sided slope behavior to classify differentiable and nondifferentiable points.",
      successCriteria: [
        "Uses differentiability to conclude continuity, not the reverse.",
        "Rules out differentiability at discontinuities.",
        "Identifies corners, cusps, and vertical tangents from derivative behavior.",
      ],
    },
    hook:
      "A road can have no break and still contain a sharp corner. Continuity prevents gaps; differentiability also demands one finite local direction.",
    intuition:
      "For a finite tangent slope to settle, the graph must first meet at the point, so differentiability forces continuity. But a continuous graph can arrive from two sides with different directions, become infinitely steep, or form a cusp. In those cases the point is connected but not differentiable.",
    formalExplanation:
      "If f is differentiable at x=c, then f is continuous at c. The converse is false. A discontinuity prevents differentiability. At a continuous point, the derivative can also fail because the left- and right-hand difference-quotient limits are unequal, because the slopes become unbounded at a vertical tangent, or because a cusp approaches opposite unbounded directions. AP conclusions should identify the specific behavior rather than saying only that the graph is not smooth.",
    prerequisiteConnections: [
      {
        conceptId: "derivative-as-a-limit-and-tangent-slope",
        title: "Derivative as a limit",
        connection:
          "Differentiability asks whether the difference-quotient limit exists as one finite value.",
      },
      {
        conceptId: "continuity-at-a-point",
        title: "Continuity at a point",
        connection:
          "A missing or mismatched point value rules out differentiability immediately.",
      },
      {
        conceptId: "one-sided-limits",
        title: "One-sided limits",
        connection:
          "Left- and right-hand slope behavior must agree for a finite derivative to exist.",
      },
    ],
    workedExamples: [
      {
        title: "Classify the corner in |x|",
        setup:
          "Determine whether f(x)=|x| is continuous and differentiable at x=0.",
        walkthrough: [
          "The function value f(0)=0 exists.",
          "Both sides of the graph approach 0, so f is continuous at 0.",
          "The left-hand difference quotient approaches -1 while the right-hand quotient approaches 1.",
          "The one-sided derivative limits disagree, so f is not differentiable at 0.",
        ],
        takeaway:
          "Continuity survives the corner, but differentiability fails because there is no single tangent slope.",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "If a graph has a jump at x=2, do you need to calculate a difference quotient to know whether it is differentiable there?",
        hint: "Use the implication from differentiability to continuity.",
        targetInsight:
          "No. A discontinuity already rules out differentiability.",
      },
      {
        prompt:
          "Why does a vertical tangent not give an ordinary finite derivative?",
        hint: "Think about rise over a horizontal run approaching zero.",
        targetInsight:
          "The slope becomes unbounded rather than approaching one finite real number.",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "Every continuous function is differentiable.",
        checkPrompt: "Is |x| continuous at zero, and do its one-sided slopes agree?",
        correction:
          "|x| is continuous at zero but has slopes -1 and 1 from the two sides, so continuity is not sufficient.",
      },
      {
        misconception:
          "A vertical tangent has derivative zero because its horizontal change is zero.",
        checkPrompt:
          "Does a vertical line have slope zero, or does its rise/run ratio become undefined?",
        correction:
          "A vertical tangent has unbounded or undefined slope, not zero slope.",
      },
    ],
    reflectionPrompt: {
      prompt:
        "Explain the logical relationship between differentiability and continuity in both directions.",
      sentenceStarter:
        "If a function is differentiable, then ____; however, if it is only continuous, ____.",
    },
    applicationPrompt: {
      title: "Audit five graph features",
      prompt:
        "Classify a smooth point, a removable hole, a jump, a corner, and a vertical tangent as continuous and/or differentiable, giving one reason for each.",
      whyItTransfers:
        "The comparison requires a general decision framework rather than recognition of one memorized graph.",
    },
    keyTakeaways: [
      "Differentiability at a point implies continuity there.",
      "Continuity alone does not guarantee differentiability.",
      "Discontinuities, corners, cusps, and vertical tangents prevent a finite derivative.",
    ],
  },
  {
    conceptId: "power-rule",
    title: "The power rule compresses a limit pattern",
    objective: {
      title: "Differentiate powers accurately",
      description:
        "Apply d/dx(x^r)=r x^(r-1) and check domain and slope behavior.",
      successCriteria: [
        "Uses the original exponent as the coefficient.",
        "Subtracts one from the exponent without losing signs.",
        "Respects domain restrictions for negative and fractional powers.",
      ],
    },
    hook:
      "The derivative definition works for every power, but repeating its algebra term by term would hide the pattern. The power rule records that pattern in one reliable move.",
    intuition:
      "Increasing the exponent makes a power grow more steeply; differentiation brings that exponent forward as a scale factor and lowers the remaining power by one. The rule changes both coefficient and exponent, and the result still describes local slope rather than a purely symbolic trick.",
    formalExplanation:
      "For real powers r at inputs where the relevant expressions are defined, d/dx(x^r)=r x^(r-1). Thus d/dx(x)=1, d/dx(1)=0 through the constant rule, and negative or fractional powers can be differentiated after rewriting radicals or reciprocals as powers. The original function's domain remains important, and the derivative may have a smaller domain at endpoints.",
    prerequisiteConnections: [
      {
        conceptId: "derivative-as-a-limit-and-tangent-slope",
        title: "Derivative as a limit",
        connection:
          "The power rule is a reusable result obtained from difference-quotient patterns.",
      },
    ],
    workedExamples: [
      {
        title: "Differentiate a reciprocal power",
        setup: "Find the derivative of f(x)=x^-2 and state its domain.",
        walkthrough: [
          "Identify the exponent r=-2.",
          "Move -2 to the coefficient.",
          "Subtract one from the exponent: -2-1=-3.",
          "Therefore f'(x)=-2x^-3=-2/x³, with x≠0 as in the original function.",
        ],
        takeaway:
          "Negative exponents follow the same coefficient-and-decrease pattern, with the original domain preserved.",
      },
    ],
    guidedQuestions: [
      {
        prompt: "What is the hidden exponent in f(x)=x?",
        hint: "Rewrite x as x^1.",
        targetInsight: "The power rule gives 1·x^0=1.",
      },
      {
        prompt:
          "If f(x)=sqrt(x)=x^(1/2), why does f'(x)=1/(2sqrt(x)) require extra attention at x=0?",
        hint: "Check whether the derivative expression is finite there.",
        targetInsight:
          "The original function includes zero, but the derivative expression is undefined at zero.",
      },
    ],
    misconceptionChecks: [
      {
        misconception:
          "The power rule only lowers the exponent: d/dx(x^5)=x^4.",
        checkPrompt:
          "What scale factor records how strongly x^5 changes with x?",
        correction:
          "The original exponent becomes the coefficient, so the derivative is 5x^4.",
      },
      {
        misconception: "The derivative of x is zero.",
        checkPrompt: "What is the slope of the line y=x?",
        correction:
          "The line has constant slope 1, matching d/dx(x^1)=1x^0=1.",
      },
    ],
    reflectionPrompt: {
      prompt:
        "Describe the two changes the power rule makes and one domain check it does not make for you.",
      sentenceStarter:
        "The rule moves ____ and changes ____; I still must check ____.",
    },
    applicationPrompt: {
      title: "Compare original and derivative domains",
      prompt:
        "Differentiate x^(1/3), x^(-1/2), and x^(3/2), then compare where each original function and derivative are defined.",
      whyItTransfers:
        "The task combines procedural fluency with the domain reasoning needed for later differentiability analysis.",
    },
    keyTakeaways: [
      "The power rule produces both a coefficient and a new exponent.",
      "Negative and fractional powers can use the rule in valid domains.",
      "A derivative formula does not erase the original function's domain restrictions.",
    ],
  },
  {
    conceptId: "linearity-rules-for-derivatives",
    title: "Differentiate linear combinations term by term",
    objective: {
      title: "Use constant and linearity rules",
      description:
        "Differentiate constants, sums, differences, scalar multiples, and polynomials with preserved structure.",
      successCriteria: [
        "Differentiates constants to zero.",
        "Carries scalar coefficients and subtraction signs correctly.",
        "Combines linearity with the power rule for every polynomial term.",
      ],
    },
    hook:
      "Once basic derivatives are known, sums and scalar multiples should not require rebuilding a limit from scratch. Linearity lets each term contribute independently.",
    intuition:
      "If one quantity changes at one rate and another changes at a second rate, their sum changes at the sum of those rates. Multiplying a function by a fixed scale multiplies its rate by the same scale. A constant does not change at all, so its rate is zero.",
    formalExplanation:
      "For differentiable f and g and constant c, d/dx(c)=0, (f+g)'=f'+g', (f-g)'=f'-g', and (cf)'=cf'. Combining these properties with the power rule differentiates polynomial functions term by term. These are linearity rules; they do not justify distributing a derivative across products or quotients of changing functions.",
    prerequisiteConnections: [
      {
        conceptId: "power-rule",
        title: "The power rule",
        connection:
          "Each nonconstant polynomial term is differentiated by the power rule before the terms are recombined.",
      },
    ],
    workedExamples: [
      {
        title: "Differentiate a polynomial with signs",
        setup: "Find p'(x) for p(x)=3x^4-2x+7.",
        walkthrough: [
          "Treat the expression as a sum of 3x^4, -2x, and 7.",
          "Use the constant-multiple and power rules: d/dx(3x^4)=12x^3.",
          "Differentiate -2x to -2 and the constant 7 to 0.",
          "Combine the results: p'(x)=12x^3-2.",
        ],
        takeaway:
          "Linearity preserves the coefficients and signs while each term contributes its own derivative.",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "If f'(2)=3 and g'(2)=-1, what is the derivative of 4f-2g at x=2?",
        hint: "Apply the same scalar combination to the derivative values.",
        targetInsight: "4(3)-2(-1)=14.",
      },
      {
        prompt:
          "Why does a constant vertical shift change f(x) but not f'(x)?",
        hint: "A fixed height has no change as x changes.",
        targetInsight:
          "A constant shift changes every output equally, so it contributes zero slope.",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "The derivative of a constant is the same constant.",
        checkPrompt:
          "Does the graph y=7 rise or fall as x changes?",
        correction:
          "No. A horizontal constant function has slope and derivative zero.",
      },
      {
        misconception:
          "Because derivatives distribute over sums, they also distribute over products.",
        checkPrompt:
          "Would (x·x)' equal 1·1, or should it match the derivative of x²?",
        correction:
          "It must match 2x, so products require the product rule rather than simple distribution.",
      },
    ],
    reflectionPrompt: {
      prompt:
        "Why are the constant, sum, difference, and constant-multiple rules called linearity rules?",
      sentenceStarter:
        "They preserve ____ and ____ when moving from functions to their derivatives.",
    },
    applicationPrompt: {
      title: "Audit two solution paths",
      prompt:
        "Differentiate (2x-1)(x+3) once by expanding first and once using a future product-rule preview; compare the equivalent results and explain why simple linearity alone did not apply before expansion.",
      whyItTransfers:
        "The task builds procedure selection by separating algebraic equivalence from derivative-rule structure.",
    },
    keyTakeaways: [
      "Constants have zero derivative.",
      "Derivatives preserve sums, differences, and fixed scalar multiples.",
      "Polynomial derivatives combine linearity with the power rule term by term.",
    ],
  },
  {
    conceptId: "basic-transcendental-derivatives",
    title: "Four foundational transcendental derivatives",
    objective: {
      title: "Differentiate familiar nonalgebraic functions",
      description:
        "Apply derivatives of sin x, cos x, e^x, and ln x and recognize limits that encode their derivative values.",
      successCriteria: [
        "Uses cos x and -sin x with the correct trigonometric signs.",
        "Uses e^x and 1/x in their valid domains.",
        "Matches a difference-quotient limit to a familiar derivative value.",
      ],
    },
    hook:
      "Some functions reproduce a recognizable partner when differentiated: exponential growth keeps its shape, sine and cosine rotate through a cycle, and logarithmic growth turns into a reciprocal rate.",
    intuition:
      "The derivative rules reflect each function's local geometry. In radians, sine's slope follows cosine and cosine's slope follows negative sine. The natural exponential grows at a rate equal to its current value. The natural logarithm changes rapidly near zero and more slowly for large positive inputs, matching 1/x.",
    formalExplanation:
      "With angles measured in radians, d/dx(sin x)=cos x and d/dx(cos x)=-sin x. Also d/dx(e^x)=e^x and d/dx(ln x)=1/x for x>0. These rules combine with linearity. A limit in the form lim as h→0 of (f(a+h)-f(a))/h can be evaluated as f'(a) when f is one of these familiar functions and the derivative exists.",
    prerequisiteConnections: [
      {
        conceptId: "derivative-as-a-limit-and-tangent-slope",
        title: "Derivative as a limit",
        connection:
          "Recognizing a difference quotient allows a known derivative value to evaluate a limit.",
      },
      {
        conceptId: "linearity-rules-for-derivatives",
        title: "Linearity rules",
        connection:
          "Scalar multiples and sums combine the four rules into larger expressions.",
      },
    ],
    workedExamples: [
      {
        title: "Differentiate a mixed familiar expression",
        setup: "Find f'(x) for f(x)=2sin x-3e^x+ln x.",
        walkthrough: [
          "Differentiate 2sin x to 2cos x.",
          "Differentiate -3e^x to -3e^x.",
          "Differentiate ln x to 1/x, valid for x>0.",
          "Combine: f'(x)=2cos x-3e^x+1/x.",
        ],
        takeaway:
          "Known derivative pairs become useful through linearity, with signs and domains preserved.",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "What familiar derivative value is represented by lim as h→0 of sin(h)/h?",
        hint: "Write sin(h) as sin(0+h)-sin(0).",
        targetInsight:
          "It is the derivative of sin x at 0, so the limit is cos 0=1.",
      },
      {
        prompt:
          "Why is the derivative of cos x negative when x is just to the right of zero?",
        hint: "Look at whether cosine is rising or falling there.",
        targetInsight:
          "Cosine decreases just right of zero, so its slope is negative, matching -sin x.",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "The derivative of cos x is sin x.",
        checkPrompt:
          "Near x=π/2, is cosine increasing or decreasing?",
        correction:
          "Cosine is decreasing there, so the derivative is -sin x.",
      },
      {
        misconception: "The derivative of ln x is ln x.",
        checkPrompt:
          "Does logarithmic growth keep the same shape and rate the way e^x does?",
        correction:
          "No. The slope of ln x is reciprocal: 1/x for x>0.",
      },
    ],
    reflectionPrompt: {
      prompt:
        "Give one graphical reason for a sign or domain feature in these derivative rules.",
      sentenceStarter:
        "The rule ____ makes sense because the original graph ____.",
    },
    applicationPrompt: {
      title: "Evaluate limits as derivative values",
      prompt:
        "Evaluate two limits by identifying derivative definitions: lim h→0 (e^h-1)/h and lim x→1 (ln x-ln 1)/(x-1). Name the function and base point in each.",
      whyItTransfers:
        "This connects familiar derivative rules back to limit interpretation, a stated Unit 2 expectation.",
    },
    keyTakeaways: [
      "In radians, (sin x)'=cos x and (cos x)'=-sin x.",
      "(e^x)'=e^x, while (ln x)'=1/x for x>0.",
      "Known derivative values can evaluate limits that match a derivative definition.",
    ],
  },
  {
    conceptId: "product-rule",
    title: "Both changing factors contribute",
    objective: {
      title: "Differentiate products of functions",
      description:
        "Apply, interpret, and select the product rule for formulas and tabular function data.",
      successCriteria: [
        "Writes both terms f'g and fg'.",
        "Keeps one factor undifferentiated in each term.",
        "Distinguishes a product of functions from a constant multiple.",
      ],
    },
    hook:
      "If both the length and width of a rectangle change, its area changes for two reasons at once. The product rule records both contributions.",
    intuition:
      "For a small change, one contribution comes from changing the first factor while holding the second near its current value; the other comes from changing the second while holding the first near its current value. The tiny overlap of both changes disappears in the limiting process, leaving two terms.",
    formalExplanation:
      "If f and g are differentiable, then d/dx[f(x)g(x)]=f'(x)g(x)+f(x)g'(x). The rule can use formulas or values from a table. It is not needed when one factor is a constant, and algebraic simplification or expansion may sometimes offer an equivalent route. The product of derivatives f'g' is generally not the derivative of a product.",
    prerequisiteConnections: [
      {
        conceptId: "linearity-rules-for-derivatives",
        title: "Linearity rules",
        connection:
          "The two product-rule contributions are added and simplified using linearity.",
      },
      {
        conceptId: "basic-transcendental-derivatives",
        title: "Basic transcendental derivatives",
        connection:
          "Products often combine polynomial, trigonometric, exponential, or logarithmic factors.",
      },
    ],
    workedExamples: [
      {
        title: "Differentiate x²e^x",
        setup: "Let h(x)=x²e^x. Find h'(x).",
        walkthrough: [
          "Identify f(x)=x² and g(x)=e^x.",
          "Compute f'(x)=2x and g'(x)=e^x.",
          "Apply f'g+fg': h'(x)=2xe^x+x²e^x.",
          "Optionally factor the result as e^x(2x+x²).",
        ],
        takeaway:
          "Each term differentiates one factor and preserves the other.",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "If f(1)=2, f'(1)=3, g(1)=-1, and g'(1)=4, what is (fg)'(1)?",
        hint: "Use f'(1)g(1)+f(1)g'(1).",
        targetInsight: "3(-1)+2(4)=5.",
      },
      {
        prompt:
          "Why does d/dx[7f(x)] use the constant-multiple rule rather than the product rule?",
        hint: "Does the factor 7 have a changing derivative contribution?",
        targetInsight:
          "Seven is constant and has derivative zero, so the result is simply 7f'(x).",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "(fg)'=f'g'.",
        checkPrompt:
          "If f(x)=g(x)=x, would that rule give 1 or the known derivative 2x of x²?",
        correction:
          "It would give the wrong result 1. The correct rule is f'g+fg'.",
      },
      {
        misconception:
          "Both factors are differentiated in both product-rule terms.",
        checkPrompt:
          "Where does the original value of each factor appear in f'g+fg'?",
        correction:
          "Each term differentiates one factor while leaving the other in its original form.",
      },
    ],
    reflectionPrompt: {
      prompt:
        "Explain the two product-rule terms as two separate sources of change.",
      sentenceStarter:
        "The first term represents change in ____ while ____ stays at its current value; the second term ____.",
    },
    applicationPrompt: {
      title: "Model changing rectangular area",
      prompt:
        "A rectangle has length L(t) and width W(t). Write and interpret A'(t) using product-rule terms and attach units to each contribution.",
      whyItTransfers:
        "The task moves from symbolic rule use to a contextual explanation of why both terms are necessary.",
    },
    keyTakeaways: [
      "The derivative of a product is f'g+fg'.",
      "Each product-rule term differentiates exactly one factor.",
      "A constant multiple is a simpler special case, not a reason to invoke the full product rule.",
    ],
  },
  {
    conceptId: "quotient-rule",
    title: "Differentiate a ratio without losing its structure",
    objective: {
      title: "Differentiate quotients of functions",
      description:
        "Apply the quotient rule with correct order, denominator, and domain restrictions.",
      successCriteria: [
        "Uses f'g-fg' in the numerator in a consistent order.",
        "Squares the original denominator function.",
        "Checks that the original denominator is nonzero.",
      ],
    },
    hook:
      "A ratio changes because both its numerator and denominator can change. Their contributions oppose one another, so order and the denominator's scale matter.",
    intuition:
      "Increasing the numerator tends to increase a ratio, while increasing a positive denominator tends to decrease it. The quotient rule's subtraction reflects those competing effects, and the squared denominator rescales the combined change.",
    formalExplanation:
      "If f and g are differentiable and g(x)≠0, then d/dx[f(x)/g(x)]=(f'(x)g(x)-f(x)g'(x))/[g(x)]². A memory phrase can support order, but identifying numerator f and denominator g first is safer. Algebraic simplification or rewriting as a power may be more efficient when valid, but no rewrite restores points excluded from the original domain.",
    prerequisiteConnections: [
      {
        conceptId: "product-rule",
        title: "The product rule",
        connection:
          "The quotient rule also combines contributions from two changing functions, now with denominator scaling and subtraction.",
      },
    ],
    workedExamples: [
      {
        title: "Differentiate sin x over x²",
        setup: "For q(x)=sin x/x² with x≠0, find q'(x).",
        walkthrough: [
          "Set f(x)=sin x and g(x)=x².",
          "Compute f'(x)=cos x and g'(x)=2x.",
          "Apply the rule: q'(x)=(x²cos x-2x sin x)/x^4.",
          "Simplify if useful, while retaining x≠0 from the original domain.",
        ],
        takeaway:
          "The numerator order and the squared original denominator are both structural parts of the rule.",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "If f(a)=4, f'(a)=1, g(a)=2, and g'(a)=3, what is (f/g)'(a)?",
        hint: "Compute (1·2-4·3)/2².",
        targetInsight: "The derivative value is -10/4=-5/2.",
      },
      {
        prompt:
          "When might rewriting 1/x³ as x^-3 be simpler than using the quotient rule?",
        hint: "The numerator is constant and the expression is already a single power.",
        targetInsight:
          "The power rule gives -3x^-4 directly, while the original restriction x≠0 remains.",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "(f/g)'=f'/g'.",
        checkPrompt:
          "For x²/x=x on x≠0, would the quotient of derivatives 2x/1 match the derivative 1?",
        correction:
          "No. A quotient of functions requires the quotient rule or valid simplification first.",
      },
      {
        misconception:
          "The denominator is differentiated and then squared.",
        checkPrompt:
          "In the formula, is the denominator [g(x)]² or [g'(x)]²?",
        correction:
          "It is the square of the original denominator function g(x).",
      },
    ],
    reflectionPrompt: {
      prompt:
        "Name the three structural checks you make before simplifying a quotient-rule result.",
      sentenceStarter:
        "I check numerator order ____, denominator ____, and original-domain condition ____.",
    },
    applicationPrompt: {
      title: "Choose quotient rule or rewrite",
      prompt:
        "For each of (x²+1)/(x-2), 5/x³, and (sin x)/(cos x), choose a justified differentiation route, carry it out, and retain domain restrictions.",
      whyItTransfers:
        "The task tests procedure selection across rational, power, and trigonometric forms.",
    },
    keyTakeaways: [
      "The quotient rule is (f'g-fg')/g².",
      "Order in the numerator determines the sign.",
      "Simplification can shorten work but cannot erase the original domain.",
    ],
  },
  {
    conceptId: "remaining-trigonometric-derivatives",
    title: "Build the remaining trigonometric rules from identities",
    objective: {
      title: "Differentiate tan, cot, sec, and csc",
      description:
        "Derive and apply the remaining trigonometric derivative rules with correct factors, signs, and domains.",
      successCriteria: [
        "Derives tangent or cotangent from a quotient identity.",
        "Preserves the paired factors in secant and cosecant derivatives.",
        "Tracks negative signs and undefined inputs.",
      ],
    },
    hook:
      "Four more trigonometric rules may look like a new list to memorize, but they can be rebuilt from sine, cosine, products, quotients, and identities you already know.",
    intuition:
      "Tangent and cotangent are ratios, so their derivatives inherit quotient-rule structure. Secant and cosecant are reciprocals, so their rates include both the reciprocal function and its companion tangent or cotangent factor. Re-deriving a forgotten rule is safer than guessing its sign.",
    formalExplanation:
      "Where the original functions are defined, d/dx(tan x)=sec²x, d/dx(cot x)=-csc²x, d/dx(sec x)=sec x tan x, and d/dx(csc x)=-csc x cot x. For example, differentiating tan x=sin x/cos x gives (cos²x+sin²x)/cos²x=sec²x. Cotangent and cosecant carry negative signs. The identities and derivative rules use radian measure.",
    prerequisiteConnections: [
      {
        conceptId: "quotient-rule",
        title: "The quotient rule",
        connection:
          "Tangent and cotangent rules follow by differentiating sine/cosine or cosine/sine.",
      },
      {
        conceptId: "basic-transcendental-derivatives",
        title: "Basic trigonometric derivatives",
        connection:
          "The derivations begin with (sin x)'=cos x and (cos x)'=-sin x.",
      },
    ],
    workedExamples: [
      {
        title: "Derive the tangent rule",
        setup: "Use tan x=sin x/cos x to find d/dx(tan x).",
        walkthrough: [
          "Identify f(x)=sin x and g(x)=cos x.",
          "Apply the quotient rule: (cos x·cos x-sin x·(-sin x))/cos²x.",
          "Combine the numerator as cos²x+sin²x=1.",
          "The result is 1/cos²x=sec²x where cos x≠0.",
        ],
        takeaway:
          "The quotient rule and Pythagorean identity explain both the formula and its domain.",
      },
    ],
    guidedQuestions: [
      {
        prompt: "What is the derivative of 2tan x-3csc x?",
        hint: "Use (tan x)'=sec²x and (csc x)'=-csc x cot x.",
        targetInsight:
          "The derivative is 2sec²x+3csc x cot x.",
      },
      {
        prompt:
          "If you forget the sign of (cot x)', how can cot x=cos x/sin x recover it?",
        hint: "Apply the quotient rule and simplify the numerator.",
        targetInsight:
          "The numerator becomes -sin²x-cos²x=-1, giving -csc²x.",
      },
    ],
    misconceptionChecks: [
      {
        misconception:
          "Tangent and cotangent have derivative rules with the same positive sign.",
        checkPrompt:
          "What sign appears when differentiating cos x in the numerator of cot x=cos x/sin x?",
        correction:
          "The negative cosine derivative contribution leads to (cot x)'=-csc²x.",
      },
      {
        misconception: "The derivative of sec x is tan x.",
        checkPrompt:
          "Does differentiating a reciprocal 1/cos x leave the reciprocal factor out?",
        correction:
          "No. The derivative is sec x tan x, including both factors.",
      },
    ],
    reflectionPrompt: {
      prompt:
        "Which of the four rules carry negative signs, and how can identities help you recover them?",
      sentenceStarter:
        "The negative rules are ____ and ____; I can recover them by ____.",
    },
    applicationPrompt: {
      title: "Rebuild and audit a rule chart",
      prompt:
        "Create a four-row rule chart for tan, cot, sec, and csc. For each row, include an identity-based derivation cue, the derivative, its sign, and one domain reminder.",
      whyItTransfers:
        "The chart turns memorization into a recoverable procedure and highlights the exact distinctions AP questions exploit.",
    },
    keyTakeaways: [
      "(tan x)'=sec²x and (cot x)'=-csc²x.",
      "(sec x)'=sec x tan x and (csc x)'=-csc x cot x.",
      "Quotient and reciprocal identities can recover a forgotten rule and its sign.",
    ],
  },
];

export const apCalculusABUnit2Lessons = lessonContentArraySchema.parse(
  unit2LessonDrafts.map(createUnit2Lesson),
);

validateRetrievalReadyLessons(apCalculusABUnit2Lessons);
