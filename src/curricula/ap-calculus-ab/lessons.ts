import { lessonContentArraySchema } from "@/features/lessons/lesson-schema";
import { validateRetrievalReadyLessons } from "@/features/lessons/retrieval-chunks";
import {
  apCalculusABUnit1ExtensionLessons,
  unit1ExtensionLessonMetadata,
} from "@/curricula/ap-calculus-ab/unit-1-extension-lessons";
import type {
  LessonApplicationPrompt,
  LessonGuidedQuestion,
  LessonMisconceptionCheck,
  LessonObjective,
  LessonPrerequisiteConnection,
  LessonReflectionPrompt,
  LessonWorkedExample,
} from "@/features/lessons/types";

const COURSE_ID = "ap-calculus-ab";
const UNIT_ID = "ap-calculus-ab-unit-1-limits-continuity";

type LegacyLessonContent = {
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

const lessonMetadata: Record<
  string,
  {
    retrievalTags: string[];
    glossaryTerms: Array<{
      term: string;
      definition: string;
      aliases?: string[];
    }>;
  }
> = {
  ...unit1ExtensionLessonMetadata,
  "what-is-a-limit": {
    retrievalTags: ["limits", "approaching behavior", "function value"],
    glossaryTerms: [
      {
        term: "limit",
        definition:
          "The value a function approaches near an input, based on nearby behavior.",
      },
      {
        term: "function value",
        definition:
          "The actual output of the function at a specific input, when it is defined.",
      },
    ],
  },
  "limit-notation": {
    retrievalTags: ["limits", "notation", "approach"],
    glossaryTerms: [
      {
        term: "limit notation",
        definition:
          "A compact symbolic statement describing input movement and output behavior.",
      },
      {
        term: "approaches",
        definition:
          "Describes getting close to a target value without requiring equality.",
      },
    ],
  },
  "estimating-limits-from-graphs": {
    retrievalTags: ["limits", "graphs", "two-sided limits"],
    glossaryTerms: [
      {
        term: "two-sided limit",
        definition:
          "A limit where the left-hand and right-hand behaviors approach the same output value.",
      },
      {
        term: "filled point",
        definition:
          "A plotted point showing the function value at an input, not necessarily the limit.",
      },
    ],
  },
  "one-sided-limits": {
    retrievalTags: ["limits", "one-sided limits", "left and right behavior"],
    glossaryTerms: [
      {
        term: "left-hand limit",
        definition:
          "Function behavior as x approaches a target from values less than the target.",
      },
      {
        term: "right-hand limit",
        definition:
          "Function behavior as x approaches a target from values greater than the target.",
      },
    ],
  },
  "infinite-limits": {
    retrievalTags: ["limits", "infinite limits", "vertical asymptotes"],
    glossaryTerms: [
      {
        term: "infinite limit",
        definition:
          "A description of function values growing or decreasing without bound near an input.",
      },
      {
        term: "vertical asymptote",
        definition:
          "A vertical line near which a graph may show unbounded behavior.",
      },
    ],
  },
};

function stableSectionId(conceptId: string, sectionId: string) {
  return `${COURSE_ID}/${UNIT_ID}/${conceptId}/${sectionId}`;
}

function joinWorkedExamples(examples: LessonWorkedExample[]) {
  return examples
    .map((example) =>
      [
        example.title,
        example.setup,
        ...example.walkthrough.map((step, index) => `${index + 1}. ${step}`),
        `Takeaway: ${example.takeaway}`,
      ].join("\n"),
    )
    .join("\n\n");
}

function joinGuidedQuestions(questions: LessonGuidedQuestion[]) {
  return questions
    .map((question) =>
      [
        `Prompt: ${question.prompt}`,
        `Hint: ${question.hint}`,
        `Target insight: ${question.targetInsight}`,
      ].join("\n"),
    )
    .join("\n\n");
}

function joinMisconceptionChecks(checks: LessonMisconceptionCheck[]) {
  return checks
    .map((check, index) =>
      [
        `Misconception ${index + 1}: ${check.misconception}`,
        `Check prompt: ${check.checkPrompt}`,
        `Correction: ${check.correction}`,
      ].join("\n"),
    )
    .join("\n\n");
}

function createRetrievalReadyLesson(lesson: LegacyLessonContent) {
  const metadata = lessonMetadata[lesson.conceptId] ?? {
    glossaryTerms: [],
    retrievalTags: [],
  };
  const prerequisiteConceptIds = lesson.prerequisiteConnections.map(
    (connection) => connection.conceptId,
  );
  const misconceptionIds = lesson.misconceptionChecks.map(
    (_, index) => `${lesson.conceptId}-misconception-${index + 1}`,
  );
  const applicationTask = {
    id: `${COURSE_ID}/${UNIT_ID}/${lesson.conceptId}/application-task-1`,
    title: lesson.applicationPrompt.title,
    prompt: lesson.applicationPrompt.prompt,
    readinessSignal: lesson.applicationPrompt.whyItTransfers,
    sectionId: "application",
  };

  return {
    ...lesson,
    id: `${COURSE_ID}/${UNIT_ID}/${lesson.conceptId}`,
    lessonId: `${lesson.conceptId}-lesson`,
    courseId: COURSE_ID,
    unitId: UNIT_ID,
    learningObjectives: [
      lesson.objective.description,
      ...lesson.objective.successCriteria,
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
        id: stableSectionId(lesson.conceptId, "why"),
        sectionId: "why",
        type: "why_this_matters" as const,
        title: "Why this matters",
        body: lesson.hook,
        teachingGoal:
          "Show the purpose of the concept before introducing procedure.",
        retrievalTags: ["purpose", "motivation"],
      },
      {
        id: stableSectionId(lesson.conceptId, "intuition"),
        sectionId: "intuition",
        type: "intuition" as const,
        title: "Intuition",
        body: [
          lesson.intuition,
          ...lesson.prerequisiteConnections.map(
            (connection) =>
              `Prerequisite connection - ${connection.title}: ${connection.connection}`,
          ),
        ].join("\n\n"),
        teachingGoal:
          "Build a mental model before formal definitions or notation.",
        retrievalTags: ["intuition", "mental model", ...prerequisiteConceptIds],
      },
      {
        id: stableSectionId(lesson.conceptId, "formal"),
        sectionId: "formal",
        type: "formal_idea" as const,
        title: "Formal idea",
        body: lesson.formalExplanation,
        teachingGoal: "Name the concept precisely using AP-level language.",
        retrievalTags: ["definition", "formal explanation"],
      },
      {
        id: stableSectionId(lesson.conceptId, "worked"),
        sectionId: "worked",
        type: "worked_example" as const,
        title: "Worked example",
        body: joinWorkedExamples(lesson.workedExamples),
        teachingGoal:
          "Demonstrate the concept through a guided, non-question-bank example.",
        retrievalTags: ["worked example", "example"],
      },
      {
        id: stableSectionId(lesson.conceptId, "guided"),
        sectionId: "guided",
        type: "think_with_me" as const,
        title: "Think with me",
        body: joinGuidedQuestions(lesson.guidedQuestions),
        teachingGoal:
          "Use Socratic prompts to make the learner reason through the idea.",
        retrievalTags: ["guided question", "socratic"],
      },
      {
        id: stableSectionId(lesson.conceptId, "trap"),
        sectionId: "trap",
        type: "common_trap" as const,
        title: "Common trap",
        body: joinMisconceptionChecks(lesson.misconceptionChecks),
        teachingGoal:
          "Identify and repair misconceptions before they become durable.",
        retrievalTags: ["misconception", "common trap"],
        misconceptionIds,
      },
      {
        id: stableSectionId(lesson.conceptId, "reflection"),
        sectionId: "reflection",
        type: "reflection" as const,
        title: "Reflection",
        body: [
          lesson.reflectionPrompt.prompt,
          `Sentence starter: ${lesson.reflectionPrompt.sentenceStarter}`,
        ].join("\n"),
        teachingGoal:
          "Make the learner articulate understanding in their own words.",
        retrievalTags: ["reflection", "metacognition"],
      },
      {
        id: stableSectionId(lesson.conceptId, "application"),
        sectionId: "application",
        type: "try_applying_it" as const,
        title: lesson.applicationPrompt.title,
        body: [
          lesson.applicationPrompt.prompt,
          `Why it transfers: ${lesson.applicationPrompt.whyItTransfers}`,
        ].join("\n"),
        teachingGoal:
          "Connect concept understanding to application after readiness.",
        retrievalTags: ["application", "readiness"],
      },
      {
        id: stableSectionId(lesson.conceptId, "takeaways"),
        sectionId: "takeaways",
        type: "key_takeaways" as const,
        title: "Key takeaways",
        body: lesson.keyTakeaways.map((takeaway) => `- ${takeaway}`).join("\n"),
        teachingGoal: "Summarize the durable ideas the learner should retain.",
        retrievalTags: ["summary", "takeaways"],
      },
    ],
  };
}

const apCalculusABUnit1FoundationLessons: LegacyLessonContent[] = [
  {
    conceptId: "what-is-a-limit",
    title: "What is a limit?",
    objective: {
      title: "Explain approaching behavior",
      description:
        "Understand a limit as the value a function approaches near an input, even when the function value at that input is different or missing.",
      successCriteria: [
        "Describe a limit using nearby input values.",
        "Separate the limit from the actual function value.",
        "Use a graph or table as evidence for approach behavior.",
      ],
    },
    hook:
      "Calculus begins when we stop asking only what happens at a point and start asking what the function is doing near that point.",
    intuition:
      "Imagine walking toward a door from both sides of a hallway. A limit is about where your path is heading, not whether the door is open, locked, or missing. In a graph, we watch the y-values as x-values get closer and closer to the target.",
    formalExplanation:
      "The statement that the limit of f(x) as x approaches a is L means the outputs f(x) can be made close to L by choosing x-values sufficiently close to a, without requiring x to equal a. The behavior near a is the focus.",
    prerequisiteConnections: [],
    workedExamples: [
      {
        title: "A hole with a clear approach value",
        setup:
          "A graph has an open circle at (2, 4). As x moves toward 2 from the left and the right, the graph gets closer to y = 4.",
        walkthrough: [
          "Look near x = 2 from the left side and notice the y-values approach 4.",
          "Look near x = 2 from the right side and notice the y-values also approach 4.",
          "Ignore whether the point at x = 2 is filled, open, or missing; the nearby behavior points to 4.",
        ],
        takeaway:
          "A limit can exist because nearby behavior is consistent, even if the function value at the target is not defined.",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "If f(2) is undefined but the graph approaches y = 4 from both sides, what should we say about the limit?",
        hint: "Focus on what the graph approaches near x = 2, not what happens exactly at x = 2.",
        targetInsight:
          "The limit is 4 because the nearby y-values approach 4 from both sides.",
      },
      {
        prompt:
          "Why is substituting x = 2 not enough to decide whether the limit exists?",
        hint: "A limit is about nearby values, not only the value at the target.",
        targetInsight:
          "Substitution checks f(2), while a limit checks the pattern of f(x) as x gets close to 2.",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "The limit is always the same as the function value.",
        checkPrompt:
          "What if the graph approaches y = 4 near x = 2, but the filled point is at y = 1?",
        correction:
          "The limit would still be 4. The filled point tells us f(2), but the limit tells us nearby behavior.",
      },
      {
        misconception: "A limit cannot exist if the graph has a hole.",
        checkPrompt:
          "Does an open circle prevent the graph from approaching a clear y-value?",
        correction:
          "No. A hole can show that f(a) is missing while the limit still exists.",
      },
    ],
    reflectionPrompt: {
      prompt:
        "What is one sentence you could use to explain a limit without using the word answer?",
      sentenceStarter:
        "A limit describes what the function values are approaching when ____.",
    },
    applicationPrompt: {
      title: "Recognize a limit before calculating",
      prompt:
        "Look at a graph, table, or verbal description and identify what the outputs appear to approach near a target input.",
      whyItTransfers:
        "Most AP limit tasks become easier when students first identify the behavior being described.",
    },
    keyTakeaways: [
      "A limit describes nearby behavior.",
      "The function value and limit value can be different.",
      "Graphs, tables, and notation are different views of the same approaching idea.",
    ],
  },
  {
    conceptId: "limit-notation",
    title: "Limit notation",
    objective: {
      title: "Read and write limit statements",
      description:
        "Translate limit notation into precise language about input values approaching a target and output values approaching a result.",
      successCriteria: [
        "Identify the approaching input value.",
        "Identify the function being observed.",
        "State the output value being approached.",
      ],
    },
    hook:
      "Limit notation is a compact sentence. Once you can read it fluently, the symbols stop feeling like a code and start acting like directions.",
    intuition:
      "Read limit notation from the inside out: the function tells us what output we are watching, the arrow tells us where x is moving, and the value after the equals sign tells us where the outputs are heading.",
    formalExplanation:
      "A statement like lim as x approaches a of f(x) = L means that as x takes values close to a, the corresponding values of f(x) approach L. The arrow indicates approach, not equality.",
    prerequisiteConnections: [
      {
        conceptId: "what-is-a-limit",
        title: "What is a limit?",
        connection:
          "The notation only makes sense if the student already sees a limit as approaching behavior rather than direct substitution.",
      },
    ],
    workedExamples: [
      {
        title: "Translate symbols into a sentence",
        setup:
          "Consider the statement: lim as x approaches 5 of f(x) = 7.",
        walkthrough: [
          "The function being watched is f(x).",
          "The input value x is approaching 5.",
          "The output values are approaching 7.",
          "Say it aloud: as x gets close to 5, f(x) gets close to 7.",
        ],
        takeaway:
          "Good notation reading turns symbols into a clear statement about motion and behavior.",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "In the expression lim as x approaches 3 of g(x) = -2, what does the 3 describe?",
        hint: "It is attached to x, not to g(x).",
        targetInsight:
          "The 3 is the input value that x is approaching.",
      },
      {
        prompt:
          "Why does the arrow not mean x equals the target value?",
        hint: "Limit notation studies nearby inputs.",
        targetInsight:
          "The arrow means x gets close to the target; it does not require x to be exactly equal to it.",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "The arrow means x equals the target value.",
        checkPrompt:
          "If x only had to equal the target, why would we need limit notation instead of just f(a)?",
        correction:
          "The arrow means approach. Limit notation studies values around the target, which can reveal behavior that f(a) alone cannot.",
      },
      {
        misconception:
          "The approached output belongs under the limit symbol with x.",
        checkPrompt:
          "Which part of the notation tells us the input movement, and which part tells us the output destination?",
        correction:
          "The subscript describes x approaching a target input; the expression after the equals sign describes the output value approached.",
      },
    ],
    reflectionPrompt: {
      prompt:
        "Rewrite one limit statement in plain English and underline the input movement and output destination.",
      sentenceStarter: "As x approaches ____, the values of ____ approach ____.",
    },
    applicationPrompt: {
      title: "Convert a graph observation into notation",
      prompt:
        "If a graph approaches y = -2 as x approaches 1, write the matching limit statement and explain each part.",
      whyItTransfers:
        "AP questions often ask students to move between graphs, words, and notation.",
    },
    keyTakeaways: [
      "Limit notation is a sentence about input movement and output behavior.",
      "The arrow means approach, not equality.",
      "Reading notation precisely prevents many early limit errors.",
    ],
  },
  {
    conceptId: "estimating-limits-from-graphs",
    title: "Estimating limits from graphs",
    objective: {
      title: "Use graph behavior to estimate limits",
      description:
        "Determine whether a graph approaches the same output value from both sides of a target input.",
      successCriteria: [
        "Trace the graph from the left and right.",
        "Use approached y-values rather than the filled point alone.",
        "Explain when a two-sided limit exists or does not exist.",
      ],
    },
    hook:
      "A graph lets you see a limit happen. Instead of calculating, you follow the curve and ask where it is heading.",
    intuition:
      "Approach the target x-value from the left side and watch the height of the graph. Then approach from the right side. If both sides head toward the same height, the two-sided limit exists.",
    formalExplanation:
      "A two-sided limit exists at x = a when the left-hand and right-hand behavior of the graph approach the same y-value. The actual plotted value at x = a may support, distract from, or be unrelated to the limit.",
    prerequisiteConnections: [
      {
        conceptId: "what-is-a-limit",
        title: "What is a limit?",
        connection:
          "Graph estimation depends on understanding that the limit is about nearby behavior.",
      },
      {
        conceptId: "limit-notation",
        title: "Limit notation",
        connection:
          "Notation gives a precise way to state the graphical behavior you observe.",
      },
    ],
    workedExamples: [
      {
        title: "Open point and filled point",
        setup:
          "Near x = 2, the graph approaches an open circle at y = 3 from both sides, but a filled point appears at y = 1.",
        walkthrough: [
          "Trace the left side toward x = 2 and observe that y approaches 3.",
          "Trace the right side toward x = 2 and observe that y also approaches 3.",
          "Notice that the filled point gives f(2), not the limit.",
          "Conclude that the limit is 3.",
        ],
        takeaway:
          "The graph's approach behavior determines the limit, not the most visually bold point.",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "What should you compare when deciding whether a two-sided limit exists from a graph?",
        hint: "Think left side and right side.",
        targetInsight:
          "Compare the y-values approached from the left and right of the target input.",
      },
      {
        prompt:
          "If a graph has a filled point at y = 1 but approaches y = 3 from both sides, which value belongs to the limit?",
        hint: "The filled point is f(a), not necessarily the limit.",
        targetInsight: "The limit is 3 because both sides approach 3.",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "A filled point always determines the limit.",
        checkPrompt:
          "What does the filled point tell you, and what does nearby graph behavior tell you?",
        correction:
          "The filled point tells the function value. Nearby graph behavior tells the limit.",
      },
      {
        misconception:
          "If the graph has any point at the target, the limit must exist.",
        checkPrompt:
          "What if the left side approaches y = 2 and the right side approaches y = 5?",
        correction:
          "The two-sided limit does not exist if the two sides approach different values.",
      },
    ],
    reflectionPrompt: {
      prompt:
        "Describe the two motions your eyes should make when estimating a limit from a graph.",
      sentenceStarter:
        "First I trace the graph from ____, then I trace it from ____.",
    },
    applicationPrompt: {
      title: "Estimate before symbolizing",
      prompt:
        "Given a graph with a target x-value marked, estimate the left behavior, right behavior, and final two-sided conclusion.",
      whyItTransfers:
        "This prepares students for AP graph interpretation without turning the task into rote answer matching.",
    },
    keyTakeaways: [
      "Estimate graph limits by tracing both sides.",
      "A filled point may show f(a), not the limit.",
      "Two-sided limits require left and right agreement.",
    ],
  },
  {
    conceptId: "one-sided-limits",
    title: "One-sided limits",
    objective: {
      title: "Analyze left-hand and right-hand behavior",
      description:
        "Explain function behavior as x approaches a target from only one direction and use one-sided limits to reason about two-sided limits.",
      successCriteria: [
        "Interpret left-hand and right-hand notation.",
        "Distinguish approach direction from output sign.",
        "Use one-sided limits to decide whether a two-sided limit exists.",
      ],
    },
    hook:
      "Sometimes the two sides of a graph tell different stories. One-sided limits let you listen to each side separately.",
    intuition:
      "Approaching from the left means x-values are less than the target and moving toward it. Approaching from the right means x-values are greater than the target and moving toward it. The signs in the notation describe direction, not whether the answer is positive or negative.",
    formalExplanation:
      "A left-hand limit describes f(x) as x approaches a from values less than a. A right-hand limit describes f(x) as x approaches a from values greater than a. A two-sided limit exists only when both one-sided limits exist and are equal.",
    prerequisiteConnections: [
      {
        conceptId: "what-is-a-limit",
        title: "What is a limit?",
        connection:
          "One-sided limits refine the same approaching idea by specifying direction.",
      },
      {
        conceptId: "limit-notation",
        title: "Limit notation",
        connection:
          "The plus and minus superscripts are notation details students must read accurately.",
      },
      {
        conceptId: "estimating-limits-from-graphs",
        title: "Estimating limits from graphs",
        connection:
          "Graph tracing is the main visual habit used to compare one-sided behavior.",
      },
    ],
    workedExamples: [
      {
        title: "A jump at a boundary",
        setup:
          "As x approaches 0 from the left, the graph approaches y = 2. As x approaches 0 from the right, it approaches y = 5.",
        walkthrough: [
          "Record the left-hand limit as 2.",
          "Record the right-hand limit as 5.",
          "Compare the two one-sided values.",
          "Because they are different, the two-sided limit does not exist.",
        ],
        takeaway:
          "One-sided limits explain why a two-sided limit fails instead of only saying it does not exist.",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "In right-hand limit notation, what does the plus sign describe?",
        hint: "It is about the side x comes from.",
        targetInsight:
          "The plus sign means x approaches from values greater than the target.",
      },
      {
        prompt:
          "What must be true about the left-hand and right-hand limits for a two-sided limit to exist?",
        hint: "Both sides need to tell the same story.",
        targetInsight:
          "They must both exist and approach the same value.",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "The plus sign means the limit value is positive.",
        checkPrompt:
          "Could a right-hand limit approach a negative y-value?",
        correction:
          "Yes. The plus sign describes approaching from the right side, not the sign of the output.",
      },
      {
        misconception:
          "A two-sided limit can exist when the one-sided limits are different.",
        checkPrompt:
          "If one side approaches 2 and the other approaches 5, what single value would the function be approaching overall?",
        correction:
          "There is no single approached value, so the two-sided limit does not exist.",
      },
    ],
    reflectionPrompt: {
      prompt:
        "How would you explain the difference between approach direction and output value?",
      sentenceStarter:
        "The direction tells me ____, while the output value tells me ____.",
    },
    applicationPrompt: {
      title: "Diagnose a two-sided limit",
      prompt:
        "Given left-hand and right-hand graph behavior near a target input, decide whether the two-sided limit exists and justify the decision.",
      whyItTransfers:
        "This is the reasoning behind many AP questions involving piecewise functions and jump discontinuities.",
    },
    keyTakeaways: [
      "One-sided limits isolate behavior from one direction.",
      "Plus and minus signs describe input direction.",
      "A two-sided limit exists only when both sides agree.",
    ],
  },
  {
    conceptId: "infinite-limits",
    title: "Infinite limits",
    objective: {
      title: "Describe unbounded limit behavior",
      description:
        "Recognize when function values increase or decrease without bound near a target input, especially around vertical asymptotes.",
      successCriteria: [
        "Use unbounded language instead of treating infinity as a number.",
        "Identify positive and negative infinite behavior from a graph.",
        "Connect directional behavior to vertical asymptotes.",
      ],
    },
    hook:
      "Some limits do not settle near a finite height. Instead, the graph shoots upward or downward without bound, and that behavior still tells us something precise.",
    intuition:
      "Think of walking toward a cliff edge where the graph rises so steeply that no matter how high you look, it keeps going. Infinite limits describe this unbounded direction, not a final number the function reaches.",
    formalExplanation:
      "An infinite limit describes f(x) increasing without bound or decreasing without bound as x approaches a target value. The notation may use positive or negative infinity to describe direction of unbounded behavior, but infinity is not a real number output.",
    prerequisiteConnections: [
      {
        conceptId: "what-is-a-limit",
        title: "What is a limit?",
        connection:
          "Students still need the approaching idea, but now the outputs do not approach a finite number.",
      },
      {
        conceptId: "limit-notation",
        title: "Limit notation",
        connection:
          "Notation helps separate the approaching input from the direction of unbounded output.",
      },
      {
        conceptId: "one-sided-limits",
        title: "One-sided limits",
        connection:
          "Infinite behavior can differ on each side of a vertical asymptote.",
      },
    ],
    workedExamples: [
      {
        title: "Opposite sides of a vertical asymptote",
        setup:
          "Near x = 2, the graph falls without bound from the left and rises without bound from the right.",
        walkthrough: [
          "Approach x = 2 from the left and observe y-values decreasing without bound.",
          "Approach x = 2 from the right and observe y-values increasing without bound.",
          "State the one-sided behaviors separately.",
          "Do not call infinity a function value; describe the unbounded trend.",
        ],
        takeaway:
          "Infinite limits are directional descriptions of unbounded behavior, often around vertical asymptotes.",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "Why should we avoid saying the function equals infinity?",
        hint: "Infinity is not a real number output.",
        targetInsight:
          "The function values grow without bound; they do not reach infinity as a number.",
      },
      {
        prompt:
          "Why might one-sided notation matter near a vertical asymptote?",
        hint: "The two sides may go in different directions.",
        targetInsight:
          "One side can approach positive infinity while the other approaches negative infinity.",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "Infinity is a number the function reaches.",
        checkPrompt:
          "Can a graph arrive at infinity the way it arrives at y = 4?",
        correction:
          "No. Infinite limit notation describes unbounded growth or decline, not a reached y-value.",
      },
      {
        misconception:
          "A vertical asymptote means both sides go to positive infinity.",
        checkPrompt:
          "What if the graph drops on the left side and rises on the right side?",
        correction:
          "Each side must be checked. Infinite behavior can be positive, negative, or different by side.",
      },
    ],
    reflectionPrompt: {
      prompt:
        "How would you describe an infinite limit without treating infinity like an ordinary output?",
      sentenceStarter:
        "The function values become ____ as x approaches ____.",
    },
    applicationPrompt: {
      title: "Read asymptote behavior",
      prompt:
        "Given a graph with a vertical asymptote, describe the left-hand and right-hand infinite behavior in words before writing notation.",
      whyItTransfers:
        "This builds the conceptual language students need before handling symbolic rational-function limits.",
    },
    keyTakeaways: [
      "Infinite limits describe unbounded behavior.",
      "Infinity is not a function value.",
      "One-sided behavior is essential near vertical asymptotes.",
    ],
  },
];

const rawApCalculusABUnit1Lessons: LegacyLessonContent[] = [
  ...apCalculusABUnit1FoundationLessons,
  ...apCalculusABUnit1ExtensionLessons,
];

export const apCalculusABUnit1Lessons = lessonContentArraySchema.parse(
  rawApCalculusABUnit1Lessons.map(createRetrievalReadyLesson),
);

validateRetrievalReadyLessons(apCalculusABUnit1Lessons);
