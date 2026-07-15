import type {
  LessonApplicationPrompt,
  LessonGuidedQuestion,
  LessonMisconceptionCheck,
  LessonObjective,
  LessonPrerequisiteConnection,
  LessonReflectionPrompt,
  LessonWorkedExample,
} from "@/features/lessons/types";

type Unit1AlignmentLessonDraft = {
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

export const unit1AlignmentLessonMetadata = {
  "instantaneous-change-motivation": {
    retrievalTags: [
      "instantaneous change",
      "average rate of change",
      "shrinking intervals",
      "secant slope motivation",
    ],
    glossaryTerms: [
      {
        term: "average rate of change",
        definition:
          "The change in output divided by the corresponding nonzero change in input over an interval.",
        aliases: ["interval rate"],
      },
      {
        term: "instantaneous change",
        definition:
          "Local change at one input, motivated by average rates over intervals that shrink toward that input.",
        aliases: ["instantaneous rate"],
      },
    ],
  },
  "estimating-limits-from-tables": {
    retrievalTags: [
      "limits from tables",
      "numerical limits",
      "two-sided table",
      "nearby values",
    ],
    glossaryTerms: [
      {
        term: "numerical estimate",
        definition:
          "An approximate conclusion supported by values sampled near a target input.",
        aliases: ["table estimate"],
      },
      {
        term: "directional data",
        definition:
          "Table values whose inputs approach a target from below or from above.",
        aliases: ["left-hand and right-hand data"],
      },
    ],
  },
  "algebraic-limit-techniques": {
    retrievalTags: [
      "algebraic limits",
      "factoring limits",
      "conjugate rationalization",
      "trigonometric rewrite",
    ],
    glossaryTerms: [
      {
        term: "deleted neighborhood",
        definition:
          "Inputs sufficiently close to a target while excluding the target input itself.",
        aliases: ["nearby non-target inputs"],
      },
      {
        term: "conjugate",
        definition:
          "An expression formed by changing the sign between two terms, used to simplify radical differences.",
        aliases: ["radical conjugate"],
      },
    ],
  },
  "selecting-limit-procedures": {
    retrievalTags: [
      "limit procedure selection",
      "limit strategy",
      "indeterminate form",
      "method choice",
    ],
    glossaryTerms: [
      {
        term: "procedure selection",
        definition:
          "Choosing a valid limit method from the representation and mathematical structure before calculating.",
        aliases: ["strategy selection"],
      },
      {
        term: "structural cue",
        definition:
          "A feature such as a common factor, radical difference, or nonzero denominator that indicates a useful method.",
        aliases: ["method cue"],
      },
    ],
  },
  "connecting-limit-representations": {
    retrievalTags: [
      "multiple representations of limits",
      "graph table formula words",
      "representation translation",
      "limit evidence",
    ],
    glossaryTerms: [
      {
        term: "representation",
        definition:
          "A graphical, numerical, analytical, symbolic, or verbal way to express mathematical information.",
        aliases: ["mathematical representation"],
      },
      {
        term: "resolution",
        definition:
          "The level of detail a graph scale or numerical sample provides near a target.",
        aliases: ["representation precision"],
      },
    ],
  },
  "classifying-discontinuities": {
    retrievalTags: [
      "types of discontinuities",
      "removable discontinuity",
      "jump discontinuity",
      "infinite discontinuity",
    ],
    glossaryTerms: [
      {
        term: "removable discontinuity",
        definition:
          "A discontinuity where a finite two-sided limit exists but the function value is missing or different.",
        aliases: ["hole"],
      },
      {
        term: "jump discontinuity",
        definition:
          "A discontinuity where finite left-hand and right-hand limits exist but are unequal.",
        aliases: ["jump"],
      },
      {
        term: "infinite discontinuity",
        definition:
          "A discontinuity involving unbounded one-sided behavior near the target.",
        aliases: ["vertical-asymptote discontinuity"],
      },
    ],
  },
  "continuity-over-intervals": {
    retrievalTags: [
      "continuity over an interval",
      "continuous on domain",
      "endpoint continuity",
      "continuity intervals",
    ],
    glossaryTerms: [
      {
        term: "continuous on an interval",
        definition:
          "Continuous at every interior point with the appropriate one-sided condition at included endpoints.",
        aliases: ["interval continuity"],
      },
      {
        term: "domain restriction",
        definition:
          "An input excluded because the function's defining expression is not real or not defined there.",
        aliases: ["excluded input"],
      },
    ],
  },
};

export const apCalculusABUnit1AlignmentLessons: Unit1AlignmentLessonDraft[] = [
  {
    conceptId: "instantaneous-change-motivation",
    title: "Can change occur at an instant?",
    objective: {
      title: "Motivate instantaneous change with shrinking intervals",
      description:
        "Compare average rates over shorter intervals and explain why their limiting trend can describe change at one instant.",
      successCriteria: [
        "Calculate and interpret an average rate with units.",
        "Compare average rates over successively shorter nonzero intervals.",
        "Explain why instantaneous change needs a limiting process rather than division by zero.",
      ],
    },
    hook:
      "A trip average tells how fast you traveled overall, while a speedometer describes what is happening now. Calculus begins by asking how interval evidence can support that instant-level statement.",
    intuition:
      "Keep one time fixed and measure average rates over intervals ending closer and closer to it. If those rates stabilize, the trend gives a candidate for local change at the instant. No interval has zero length; the idea comes from approaching zero length.",
    formalExplanation:
      "For outputs s(t), an average rate over [a,b] is [s(b)-s(a)]/(b-a), with b not equal to a. To investigate change at t=a, use nonzero h and study [s(a+h)-s(a)]/h as h approaches 0. Unit 1 uses this as motivation for limits; Unit 2 names the resulting derivative when the limit exists.",
    prerequisiteConnections: [],
    workedExamples: [
      {
        title: "Read shrinking-interval speed evidence",
        setup:
          "At t=5, average speeds over [5,6], [5,5.5], [5,5.1], and [5,5.01] are 42, 39, 37.4, and 37.04 km/h.",
        walkthrough: [
          "Each value is an interval rate, not yet an instantaneous rate.",
          "The interval lengths shrink from 1 to 0.01 hour while remaining nonzero.",
          "The rates move toward about 37 km/h.",
          "Interpret 37 km/h as supported local behavior at t=5, pending a precise limit definition.",
        ],
        takeaway:
          "Instantaneous change is motivated by a stable pattern across shrinking nonzero intervals.",
      },
    ],
    guidedQuestions: [
      {
        prompt: "Why can we not simply use an interval of length zero?",
        hint: "Look at the denominator of change in output over change in input.",
        targetInsight: "A zero input change would require division by zero.",
      },
      {
        prompt:
          "If shorter-interval rates alternate between 2 and 8 without settling, what evidence is missing?",
        hint: "An instantaneous-rate candidate needs one approached value.",
        targetInsight:
          "The averages do not support a single stable local rate at that instant.",
      },
    ],
    misconceptionChecks: [
      {
        misconception:
          "An instantaneous rate is found by substituting a zero-width interval.",
        checkPrompt: "What would appear in the denominator?",
        correction:
          "Zero would appear in the denominator. We instead use nonzero intervals whose lengths approach zero.",
      },
      {
        misconception:
          "The average rate for an entire trip is the speed at every instant.",
        checkPrompt:
          "Could a driver stop and accelerate while keeping the same overall trip average?",
        correction:
          "Yes. A long-interval average can hide local variation, so shorter intervals are needed for instant-level evidence.",
      },
    ],
    reflectionPrompt: {
      prompt:
        "Explain how shrinking intervals avoid division by zero while still describing one instant.",
      sentenceStarter:
        "Each interval remains ____, but its length approaches ____ and the rates approach ____.",
    },
    applicationPrompt: {
      title: "Interpret a local cooling rate",
      prompt:
        "A temperature table gives average changes over one minute, ten seconds, and one second around the same time. Decide whether the values support one instantaneous cooling rate and include units.",
      whyItTransfers:
        "The same shrinking-interval reasoning applies to motion, temperature, population, and other changing quantities.",
    },
    keyTakeaways: [
      "Average rates describe nonzero intervals.",
      "Shrinking intervals can reveal a stable local trend.",
      "Instantaneous change is approached through limits, not direct division by zero.",
    ],
  },
  {
    conceptId: "estimating-limits-from-tables",
    title: "Estimating limit values from tables",
    objective: {
      title: "Use two-sided numerical evidence",
      description:
        "Select nearby table values from both sides and estimate a limit without confusing the target row with approach behavior.",
      successCriteria: [
        "Choose inputs below and above the target.",
        "Give greater weight to the closest reliable rows.",
        "State when the data support one common value and when they do not.",
      ],
    },
    hook:
      "A table is a set of snapshots. The skill is not reading every row equally; it is selecting the snapshots that actually test nearby behavior from both directions.",
    intuition:
      "Imagine walking toward a doorway from the left and right. Rows with inputs closest to the target tell the most local story, but both directions must agree before a two-sided limit is claimed.",
    formalExplanation:
      "To estimate lim x→c f(x) numerically, inspect values at inputs less than c and greater than c that move closer to c. Compare the two directional trends. The value f(c), if included, does not determine the limit. A finite sample supports an estimate rather than an absolute proof, and reported precision should reflect the data spacing.",
    prerequisiteConnections: [
      {
        conceptId: "estimating-limits-from-graphs",
        title: "Estimating limits from graphs",
        connection:
          "Both representations focus on nearby behavior rather than the plotted or tabulated value at the target.",
      },
      {
        conceptId: "one-sided-limits",
        title: "One-sided limits",
        connection:
          "Rows below and above the target provide left-hand and right-hand evidence.",
      },
    ],
    workedExamples: [
      {
        title: "Estimate from a two-sided table",
        setup:
          "Near x=2, f(1.9)=3.81, f(1.99)=3.9801, f(2.01)=4.0201, and f(2.1)=4.41, while f(2) is missing.",
        walkthrough: [
          "Separate inputs less than 2 from inputs greater than 2.",
          "On the left, outputs move from 3.81 toward about 4.",
          "On the right, outputs move from 4.41 toward about 4.",
          "Estimate the two-sided limit as 4; the missing target row does not prevent the estimate.",
        ],
        takeaway:
          "The nearest rows on both sides support the common approached value.",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "Why are x=1.99 and x=2.01 usually more informative than x=1 and x=3 for a limit at 2?",
        hint: "A limit is local behavior near the target.",
        targetInsight:
          "The closer inputs provide more relevant evidence about behavior near 2.",
      },
      {
        prompt:
          "If left-side outputs approach 1 and right-side outputs approach 4, what can you conclude?",
        hint: "A two-sided limit requires one shared value.",
        targetInsight:
          "The two-sided limit does not exist even if f(c) is listed.",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "The row x=c gives the limit.",
        checkPrompt:
          "Could f(c)=9 while nearby rows on both sides approach 4?",
        correction:
          "Yes. The limit would be 4 because nearby behavior, not the target row, determines it.",
      },
      {
        misconception: "One-sided table values prove a two-sided limit.",
        checkPrompt: "What behavior remains unchecked?",
        correction:
          "The other approach direction remains unknown, so a two-sided conclusion is not justified.",
      },
    ],
    reflectionPrompt: {
      prompt:
        "Describe which rows you would choose first when estimating a limit and why.",
      sentenceStarter:
        "I would choose inputs ____ because they are ____ and include ____.",
    },
    applicationPrompt: {
      title: "Audit a measurement table",
      prompt:
        "A sensor table has uneven input spacing and a suspicious value at the target. Select the rows that support a two-sided estimate and state an appropriate level of precision.",
      whyItTransfers:
        "Real numerical data are uneven and noisy, so selecting relevant directional evidence matters beyond textbook tables.",
    },
    keyTakeaways: [
      "Useful limit tables approach the target from both sides.",
      "Nearby rows matter more than the target row.",
      "A table supports an estimate whose precision depends on the data.",
    ],
  },
  {
    conceptId: "algebraic-limit-techniques",
    title: "Determining limits using algebraic manipulation",
    objective: {
      title: "Transform indeterminate expressions without changing nearby behavior",
      description:
        "Use factoring, conjugates, or trigonometric rewrites to remove an indeterminate form before applying limit laws.",
      successCriteria: [
        "Match the expression structure to a valid algebraic technique.",
        "State restrictions when canceling a factor.",
        "Substitute only after the indeterminate form has been resolved.",
      ],
    },
    hook:
      "A 0/0 result is often a mask: the formula is undefined at the target, but its nearby behavior may simplify to something perfectly clear.",
    intuition:
      "Limits care about a deleted neighborhood. Two expressions may differ exactly at the target yet agree at every nearby input, which lets the simpler expression reveal the same limit.",
    formalExplanation:
      "After direct substitution produces 0/0, inspect structure. Factor and cancel a common factor for inputs where it is nonzero; multiply numerator and denominator by a conjugate for radical differences; or use identities and standard trigonometric limits. These transformations preserve equality on a deleted neighborhood, not necessarily at the target itself.",
    prerequisiteConnections: [
      {
        conceptId: "evaluating-limits-with-limit-laws",
        title: "Evaluating limits with limit laws",
        connection:
          "Substitution diagnoses whether the expression is already evaluable or needs transformation.",
      },
    ],
    workedExamples: [
      {
        title: "Factor before substituting again",
        setup: "Evaluate lim x→3 (x²-9)/(x-3).",
        walkthrough: [
          "Direct substitution gives 0/0, so the result is not final.",
          "Factor x²-9 as (x-3)(x+3).",
          "For nearby x not equal to 3, cancel the common factor x-3.",
          "Evaluate the remaining nearby expression x+3 at 3 to obtain 6.",
        ],
        takeaway:
          "Cancellation describes nearby equality and does not claim the original quotient is defined at x=3.",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "Why must a conjugate multiply both numerator and denominator?",
        hint: "The transformed expression must remain equivalent.",
        targetInsight:
          "Multiplying by a conjugate ratio equal to 1 preserves the expression where defined.",
      },
      {
        prompt:
          "After canceling x-3, have we redefined the original function at x=3?",
        hint: "Cancellation was valid only for x not equal to 3.",
        targetInsight:
          "No. We produced an equivalent nearby expression for evaluating the limit.",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "Canceling a factor fills the original hole.",
        checkPrompt: "Is the original denominator still zero at the target?",
        correction:
          "Yes. The original function remains undefined there; cancellation only reveals its nearby behavior.",
      },
      {
        misconception: "Every 0/0 limit should be factored.",
        checkPrompt:
          "What structural cue would suggest a conjugate instead?",
        correction:
          "A radical difference often calls for a conjugate, while trigonometric structure may call for an identity or standard limit.",
      },
    ],
    reflectionPrompt: {
      prompt:
        "Explain why nearby equivalence is enough for a limit even when point values differ.",
      sentenceStarter:
        "The limit ignores ____, so expressions that agree for ____ have the same ____.",
    },
    applicationPrompt: {
      title: "Choose and defend a transformation",
      prompt:
        "Compare a factorable quotient, a radical difference, and a trigonometric quotient. Choose the first algebraic step for each and justify it from structure.",
      whyItTransfers:
        "Recognizing structure is more durable than memorizing one technique for every indeterminate form.",
    },
    keyTakeaways: [
      "The form 0/0 calls for structural analysis.",
      "Valid transformations preserve nearby behavior with stated restrictions.",
      "Factoring, conjugates, and trigonometric rewrites solve different structures.",
    ],
  },
  {
    conceptId: "selecting-limit-procedures",
    title: "Selecting procedures for determining limits",
    objective: {
      title: "Choose a method before calculating",
      description:
        "Use the representation, substitution result, and expression structure to select and justify a limit procedure.",
      successCriteria: [
        "Check direct substitution before doing extra work.",
        "Match 0/0 structures to factoring, conjugates, or trigonometric rewrites.",
        "Use graphical or numerical estimation honestly when no formula is available.",
      ],
    },
    hook:
      "Limit mistakes often begin before the algebra: the learner starts a familiar procedure without asking whether the problem's evidence supports it.",
    intuition:
      "Treat method selection like diagnosis. First identify what information is available, then test the simplest justified method, and only then move to a technique matched to the remaining obstacle.",
    formalExplanation:
      "A reliable selection process is: identify the representation; check domain and one-sided requirements; try direct substitution when an expression is given; classify any result; and use a structure-matched transformation or graphical/numerical estimate. A method is justified by its hypotheses and the expression's form, not merely by producing an answer.",
    prerequisiteConnections: [
      {
        conceptId: "evaluating-limits-with-limit-laws",
        title: "Evaluating limits with limit laws",
        connection:
          "Limit laws and substitution are the efficient first test for many analytical limits.",
      },
      {
        conceptId: "algebraic-limit-techniques",
        title: "Algebraic limit techniques",
        connection:
          "Each transformation has structural cues that make it appropriate.",
      },
      {
        conceptId: "estimating-limits-from-tables",
        title: "Estimating limits from tables",
        connection:
          "Numerical evidence requires a different claim of precision from exact analytical work.",
      },
    ],
    workedExamples: [
      {
        title: "Select three different first steps",
        setup:
          "Choose a first step for a polynomial limit, (x²-4)/(x-2) at 2, and (sqrt(x+1)-1)/x at 0.",
        walkthrough: [
          "The polynomial is continuous, so direct substitution is sufficient.",
          "The factorable quotient gives 0/0 and a difference-of-squares cue, so factor.",
          "The radical quotient gives 0/0 and a radical difference, so multiply by the conjugate.",
          "For each, state why the other extra procedures would be unnecessary or mismatched.",
        ],
        takeaway:
          "A substitution result narrows the choice, while expression structure identifies the next method.",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "If substitution gives 7/3, why is factoring usually unnecessary?",
        hint: "The expression is already defined and continuous at the target.",
        targetInsight:
          "Direct substitution has already produced the justified limit value.",
      },
      {
        prompt:
          "If only a graph is supplied, what should your conclusion say about precision?",
        hint: "A graph has finite scale and resolution.",
        targetInsight:
          "State an estimate supported by the visible behavior, not an unsupported exact value.",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "Factoring is always the safest first step.",
        checkPrompt:
          "What if direct substitution already gives a finite value?",
        correction:
          "Then continuity and substitution usually finish the problem; factoring only adds unnecessary work.",
      },
      {
        misconception: "A method is valid if it produces a plausible number.",
        checkPrompt: "Which hypotheses or equivalences justify that number?",
        correction:
          "A valid solution must connect the selected method to the representation, domain, and mathematical structure.",
      },
    ],
    reflectionPrompt: {
      prompt:
        "Write the questions you should ask before choosing a limit method.",
      sentenceStarter:
        "First I identify ____, then I test ____, and if I see ____ I choose ____.",
    },
    applicationPrompt: {
      title: "Build a limit decision memo",
      prompt:
        "For four unfamiliar limits, name the representation, substitution result or evidence, selected method, and one rejected alternative.",
      whyItTransfers:
        "Explaining rejected alternatives demonstrates genuine method selection rather than pattern matching.",
    },
    keyTakeaways: [
      "Inspect the evidence before choosing a procedure.",
      "Use the simplest justified method first.",
      "A correct procedure choice includes a reason and its conditions.",
    ],
  },
  {
    conceptId: "connecting-limit-representations",
    title: "Connecting multiple representations of limits",
    objective: {
      title: "Translate and cross-check limit evidence",
      description:
        "Connect graphical, numerical, analytical, symbolic, and verbal forms while preserving one mathematical behavior.",
      successCriteria: [
        "Keep the target input, direction, and approached output consistent across forms.",
        "Use both directions when representing a two-sided limit.",
        "Explain what each representation establishes and what it only suggests.",
      ],
    },
    hook:
      "A formula may hide a hole, a graph may hide oscillation at its scale, and a table may miss important inputs. Connecting representations makes each one check the others.",
    intuition:
      "Think of representations as different camera angles on the same event. They must tell a consistent story about where x goes and where f(x) goes, even though each reveals different details.",
    formalExplanation:
      "Equivalent limit representations preserve the target input, approach direction, and output behavior. Graphs and tables often estimate; algebra and theorems can justify exact conclusions. A complete translation separates f(c) from lim x→c f(x) and states directional evidence when the two-sided limit is at issue.",
    prerequisiteConnections: [
      {
        conceptId: "estimating-limits-from-graphs",
        title: "Estimating limits from graphs",
        connection: "Graphs show the shape and direction of approach.",
      },
      {
        conceptId: "estimating-limits-from-tables",
        title: "Estimating limits from tables",
        connection: "Tables expose numerical convergence and sampling limits.",
      },
      {
        conceptId: "selecting-limit-procedures",
        title: "Selecting limit procedures",
        connection:
          "Analytical structure determines when a representation can support an exact conclusion.",
      },
    ],
    workedExamples: [
      {
        title: "Describe one removable hole four ways",
        setup:
          "For f(x)=(x²-1)/(x-1), x not equal to 1, connect the formula, table, graph, and limit statement near x=1.",
        walkthrough: [
          "Factor to show the nearby formula equals x+1 for x not equal to 1.",
          "Predict table outputs near 1 that approach 2 from both sides.",
          "Describe a line y=x+1 with a hole at (1,2).",
          "Write lim x→1 f(x)=2 and explain that f(1) may remain undefined.",
        ],
        takeaway:
          "All representations preserve the same nearby destination while the point value stays separate.",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "Why might a graph appear to show a limit even when rapid oscillation prevents one?",
        hint: "Consider the graph's pixel scale near the target.",
        targetInsight:
          "Finite resolution may hide behavior revealed by an analytical formula or denser sampling.",
      },
      {
        prompt:
          "What information must remain unchanged when translating a limit statement into a table?",
        hint: "Track input target, direction, and output trend.",
        targetInsight:
          "The table must approach the same input from the stated directions and support the same output behavior.",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "A smooth-looking graph proves an exact limit.",
        checkPrompt: "What behavior could the graph scale hide?",
        correction:
          "A graph supports an estimate; hidden holes, oscillation, or scale effects may require numerical or analytical confirmation.",
      },
      {
        misconception: "The target row must equal the nearby table trend.",
        checkPrompt:
          "Can a table list f(c)=9 while nearby outputs approach 2?",
        correction:
          "Yes. That represents a limit of 2 with a different point value of 9.",
      },
    ],
    reflectionPrompt: {
      prompt:
        "Which representation would you trust for an exact conclusion, and what support would you seek from the others?",
      sentenceStarter:
        "The ____ representation shows ____, while ____ confirms or qualifies it by ____.",
    },
    applicationPrompt: {
      title: "Reconcile conflicting evidence",
      prompt:
        "A graph suggests a finite limit, a sparse table is inconclusive, and a formula contains oscillation. Decide which additional evidence is needed and write a cautious conclusion.",
      whyItTransfers:
        "Real problem solving requires evaluating evidence quality instead of accepting the first representation.",
    },
    keyTakeaways: [
      "All representations must preserve the same input and output behavior.",
      "Graphs and tables usually estimate; analysis can justify exact claims.",
      "Cross-checking representations exposes hidden assumptions and scale limits.",
    ],
  },
  {
    conceptId: "classifying-discontinuities",
    title: "Exploring types of discontinuities",
    objective: {
      title: "Classify continuity failures",
      description:
        "Distinguish removable, jump, and infinite discontinuities and decide whether one point-value change can repair them.",
      successCriteria: [
        "Use directional limits and function values to name the discontinuity type.",
        "Explain which continuity condition fails.",
        "Identify exactly when redefining one point repairs the function.",
      ],
    },
    hook:
      "A hole, a jump, and a vertical asymptote all break continuity, but they break it in different ways. Naming the type tells you what evidence failed and whether repair is possible.",
    intuition:
      "Ask three questions: Do both sides approach finite values? Do those values agree? Does the function value match? The pattern of answers classifies the discontinuity.",
    formalExplanation:
      "A removable discontinuity has an existing finite two-sided limit but a missing or mismatched f(c). A jump has finite one-sided limits that are unequal. An infinite discontinuity has unbounded one-sided behavior. Only the removable type can be repaired by defining f(c) as the shared finite limit.",
    prerequisiteConnections: [
      {
        conceptId: "connecting-limit-representations",
        title: "Connecting limit representations",
        connection:
          "Classification combines graph or table evidence, one-sided limits, and the point value.",
      },
      {
        conceptId: "one-sided-limits",
        title: "One-sided limits",
        connection:
          "Directional agreement or disagreement distinguishes removable and jump behavior.",
      },
    ],
    workedExamples: [
      {
        title: "Classify three failures",
        setup:
          "Case A approaches 3 from both sides but f(c)=8; case B approaches 1 from the left and 4 from the right; case C grows without bound from the right.",
        walkthrough: [
          "Case A has a finite shared limit but a mismatched point value, so it is removable.",
          "Defining f(c)=3 repairs Case A.",
          "Case B has unequal finite one-sided limits, so it is a jump and cannot be repaired at one point.",
          "Case C has unbounded directional behavior, so it is infinite and cannot be repaired at one point.",
        ],
        takeaway:
          "Classification follows from directional behavior before considering a repair.",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "Why is the midpoint of two jump values not the two-sided limit?",
        hint: "A limit describes one value both sides actually approach.",
        targetInsight:
          "Averaging unequal one-sided limits does not create shared approach behavior.",
      },
      {
        prompt:
          "What single condition makes a discontinuity removable?",
        hint: "Focus on the nearby two-sided behavior.",
        targetInsight:
          "A finite two-sided limit must exist; then the point value can be matched to it.",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "Every discontinuity is a hole.",
        checkPrompt:
          "Can left and right sides approach different finite values or become unbounded?",
        correction:
          "Yes. Those patterns are jump and infinite discontinuities, not removable holes.",
      },
      {
        misconception: "Adding a filled point repairs any discontinuity.",
        checkPrompt:
          "Can one point make unequal one-sided limits agree?",
        correction:
          "No. A point-value change only repairs an already existing finite two-sided limit.",
      },
    ],
    reflectionPrompt: {
      prompt:
        "Create a short decision rule for classifying discontinuities.",
      sentenceStarter:
        "First compare ____. If they ____, then check ____; otherwise classify ____.",
    },
    applicationPrompt: {
      title: "Diagnose a piecewise boundary",
      prompt:
        "At two boundaries of a piecewise function, calculate or read both one-sided limits, classify each discontinuity, and determine whether a parameter can repair it.",
      whyItTransfers:
        "Piecewise functions require the same classification logic in graphical and analytical forms.",
    },
    keyTakeaways: [
      "Directional behavior distinguishes removable, jump, and infinite discontinuities.",
      "Only a finite shared two-sided limit allows one-point repair.",
      "A function value cannot repair disagreement or unbounded behavior.",
    ],
  },
  {
    conceptId: "continuity-over-intervals",
    title: "Confirming continuity over an interval",
    objective: {
      title: "Justify interval continuity from domains and endpoints",
      description:
        "Use continuity of familiar function families on their domains and apply one-sided endpoint conditions on closed intervals.",
      successCriteria: [
        "Find domain restrictions that split continuity intervals.",
        "Use the two-sided definition at interior points.",
        "Use the appropriate one-sided condition at included endpoints.",
      ],
    },
    hook:
      "Checking continuity at one point is local. Theorems such as the Intermediate Value Theorem require a stronger statement: no continuity failure anywhere across an entire interval.",
    intuition:
      "Start with a function family known to be continuous wherever it is defined, then mark the inputs where the formula stops making sense. Those exclusions divide the real line into continuity intervals.",
    formalExplanation:
      "Polynomials are continuous on all real numbers. Rational functions are continuous where their denominators are nonzero; roots and logarithms require their real domains. A function is continuous on an open interval if it is continuous at every point there. On [a,b], it must be continuous on (a,b), right-continuous at a, and left-continuous at b.",
    prerequisiteConnections: [
      {
        conceptId: "continuity-at-a-point",
        title: "Continuity at a point",
        connection:
          "Interval continuity applies the local conditions at every relevant point and adapts them at endpoints.",
      },
    ],
    workedExamples: [
      {
        title: "Find rational-function continuity intervals",
        setup:
          "Determine where r(x)=(x+3)/[(x-2)(x+1)] is continuous.",
        walkthrough: [
          "A rational function is continuous wherever its denominator is nonzero.",
          "Solve (x-2)(x+1)=0 to find excluded inputs x=2 and x=-1.",
          "Use the excluded inputs to split the real line.",
          "State continuity on (-∞,-1), (-1,2), and (2,∞).",
        ],
        takeaway:
          "For familiar function families, domain analysis efficiently determines continuity intervals.",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "Why does continuity on [a,b] use a right-hand limit at a?",
        hint: "Which inputs belong to the interval near its left endpoint?",
        targetInsight:
          "Only inputs inside the interval, to the right of a, are relevant at that endpoint.",
      },
      {
        prompt:
          "Why is checking three sample points not enough to prove interval continuity?",
        hint: "The claim covers every point in the interval.",
        targetInsight:
          "A missed domain restriction or piecewise boundary could still create a discontinuity elsewhere.",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "Every familiar formula is continuous for all real x.",
        checkPrompt:
          "What happens where a rational denominator is zero or a logarithm input is nonpositive?",
        correction:
          "Continuity follows only on the function's real domain, so restrictions must be identified first.",
      },
      {
        misconception:
          "A closed interval requires two-sided limits at both endpoints.",
        checkPrompt: "Are inputs beyond an endpoint part of the interval?",
        correction:
          "No. Use the one-sided limit from within the interval at each included endpoint.",
      },
    ],
    reflectionPrompt: {
      prompt:
        "Explain how domain information becomes a continuity statement.",
      sentenceStarter:
        "Because ____ functions are continuous on their domain, I exclude ____ and state the intervals ____.",
    },
    applicationPrompt: {
      title: "Prepare an IVT continuity claim",
      prompt:
        "Given a piecewise function on [0,4], identify every interior boundary and endpoint condition needed before claiming continuity on the full interval.",
      whyItTransfers:
        "Theorems require interval-wide hypotheses, so auditing every possible failure point is essential.",
    },
    keyTakeaways: [
      "Familiar functions are continuous on their domains.",
      "Domain exclusions split continuity into intervals.",
      "Closed-interval endpoints use one-sided continuity from inside the interval.",
    ],
  },
];
