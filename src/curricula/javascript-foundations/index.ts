import type { CurriculumPack } from "@/curricula/types";
import {
  createFormativeAssessmentProvider,
  type FormativeAssessmentBank,
} from "../../features/assessment/formative-assessments.ts";
import type { Concept, Course, Topic, Unit } from "@/features/knowledge/types";
import type { LessonContent } from "@/features/lessons/types";

export const JAVASCRIPT_FOUNDATIONS_COURSE_ID = "javascript-foundations";
export const JAVASCRIPT_FOUNDATIONS_UNIT_ID =
  "javascript-foundations-unit-1-language-basics";

const course: Course = {
  id: JAVASCRIPT_FOUNDATIONS_COURSE_ID,
  title: "JavaScript Foundations",
  shortTitle: "JavaScript",
  subject: "Programming",
  description:
    "A concept-first introduction to JavaScript values, types, and variables.",
  unitIds: [JAVASCRIPT_FOUNDATIONS_UNIT_ID],
};

const units: Unit[] = [
  {
    id: JAVASCRIPT_FOUNDATIONS_UNIT_ID,
    courseId: JAVASCRIPT_FOUNDATIONS_COURSE_ID,
    sequence: 1,
    title: "Language basics",
    description:
      "Build a precise mental model of values before using variables to name them.",
    topicIds: ["javascript-values", "javascript-bindings"],
    conceptIds: ["js-values-and-types", "js-variables-and-const"],
    estimatedMinutes: 35,
  },
];

const topics: Topic[] = [
  {
    id: "javascript-values",
    unitId: JAVASCRIPT_FOUNDATIONS_UNIT_ID,
    sequence: 1,
    title: "Values and types",
    description: "Understand the data JavaScript expressions produce.",
    conceptIds: ["js-values-and-types"],
  },
  {
    id: "javascript-bindings",
    unitId: JAVASCRIPT_FOUNDATIONS_UNIT_ID,
    sequence: 2,
    title: "Variables and bindings",
    description: "Give values stable names and update state intentionally.",
    conceptIds: ["js-variables-and-const"],
  },
];

const concepts: Concept[] = [
  {
    id: "js-values-and-types",
    courseId: JAVASCRIPT_FOUNDATIONS_COURSE_ID,
    unitId: JAVASCRIPT_FOUNDATIONS_UNIT_ID,
    topicId: "javascript-values",
    title: "Values and types",
    description:
      "Recognize JavaScript values and explain how a value's type changes the operations that make sense.",
    prerequisiteConceptIds: [],
    learningObjectives: [
      {
        id: "js-values-objective-1",
        conceptId: "js-values-and-types",
        title: "Classify common values",
        description: "Distinguish strings, numbers, and booleans.",
        successCriteria: [
          "Identify a value from its literal syntax.",
          "Use typeof as supporting evidence.",
          "Explain why type matters to an operation.",
        ],
      },
    ],
    commonMisconceptions: [
      "Quotation marks are decorative and do not affect a value's type.",
      "A numeric-looking string behaves exactly like a number.",
    ],
    examples: [
      {
        id: "js-value-example",
        title: "The value 42 versus the value \"42\"",
        description:
          "The first is a number and the second is a string, so addition can behave differently.",
      },
    ],
    difficulty: "foundational",
    estimatedMinutes: 15,
  },
  {
    id: "js-variables-and-const",
    courseId: JAVASCRIPT_FOUNDATIONS_COURSE_ID,
    unitId: JAVASCRIPT_FOUNDATIONS_UNIT_ID,
    topicId: "javascript-bindings",
    title: "Variables and const",
    description:
      "Treat variables as named bindings to values and choose const by default when the binding will not be reassigned.",
    prerequisiteConceptIds: ["js-values-and-types"],
    learningObjectives: [
      {
        id: "js-bindings-objective-1",
        conceptId: "js-variables-and-const",
        title: "Create intentional bindings",
        description: "Declare and read const and let bindings.",
        successCriteria: [
          "Separate a variable name from its current value.",
          "Choose const when reassignment is unnecessary.",
          "Predict the result of a simple reassignment.",
        ],
      },
    ],
    commonMisconceptions: [
      "const makes every nested value permanently immutable.",
      "A variable is a box that is identical to the value it currently references.",
    ],
    examples: [
      {
        id: "js-binding-example",
        title: "Naming a course count",
        description:
          "const courseCount = 2 creates a stable name for the number value 2.",
      },
    ],
    difficulty: "foundational",
    estimatedMinutes: 20,
  },
];

const lessons: LessonContent[] = [
  {
    id: "js-values-and-types-lesson-v1",
    lessonId: "js-values-and-types-lesson",
    courseId: JAVASCRIPT_FOUNDATIONS_COURSE_ID,
    unitId: JAVASCRIPT_FOUNDATIONS_UNIT_ID,
    conceptId: "js-values-and-types",
    title: "Values carry meaning through types",
    learningObjectives: ["Classify strings, numbers, and booleans."],
    prerequisiteConceptIds: [],
    retrievalTags: ["javascript", "value", "type", "typeof"],
    sections: [
      {
        id: "js-values-intuition-v1",
        sectionId: "intuition",
        type: "intuition",
        title: "The same characters can represent different values",
        body: "42 and \"42\" look similar to a reader, but JavaScript treats one as a number and one as text.",
        retrievalTags: ["literal", "string", "number"],
        misconceptionIds: ["quotes-are-decorative"],
      },
    ],
    glossaryTerms: [
      {
        term: "value",
        definition: "A piece of data produced or used by a JavaScript expression.",
        aliases: [],
      },
      {
        term: "type",
        definition: "A category that determines how JavaScript treats a value.",
        aliases: ["data type"],
      },
    ],
    applicationTasks: [],
    practiceReadinessTasks: [
      {
        id: "js-values-readiness",
        title: "Classify three literals",
        prompt: "Classify 7, \"7\", and true, then explain one difference.",
        readinessSignal: "Correct classifications plus a type-based explanation.",
        sectionId: "application",
      },
    ],
    objective: {
      title: "Read values precisely",
      description:
        "Recognize common JavaScript values and connect their syntax to type.",
      successCriteria: [
        "Distinguish numbers, strings, and booleans.",
        "Explain the role of quotation marks.",
        "Use typeof to check a prediction.",
      ],
    },
    hook:
      "Why can 2 + 3 produce 5 while \"2\" + 3 can produce \"23\"? The answer begins with value types.",
    intuition:
      "A type is a label for the kind of data a value represents. It helps JavaScript decide which operations are meaningful.",
    formalExplanation:
      "JavaScript primitive values include numbers, strings, and booleans. Literal syntax creates values directly, and typeof reports a value's runtime type category.",
    prerequisiteConnections: [],
    workedExamples: [
      {
        title: "Compare 42 and \"42\"",
        setup: "Evaluate typeof 42 and typeof \"42\".",
        walkthrough: [
          "42 is written without quotation marks.",
          "typeof 42 evaluates to \"number\".",
          "\"42\" is enclosed in quotation marks.",
          "typeof \"42\" evaluates to \"string\".",
        ],
        takeaway: "Similar-looking values can have different types.",
      },
    ],
    guidedQuestions: [
      {
        prompt: "What type do you predict for false?",
        hint: "It represents a yes-or-no state.",
        targetInsight: "false is a boolean value.",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "Quotation marks are only visual decoration.",
        checkPrompt: "Would removing the quotes from \"8\" preserve its type?",
        correction: "No. Removing the quotes changes a string literal into a number literal.",
      },
    ],
    reflectionPrompt: {
      prompt: "Explain why a value's type matters.",
      sentenceStarter: "Type matters because JavaScript uses it to ____.",
    },
    applicationPrompt: {
      title: "Predict before running",
      prompt: "Predict typeof for 3.5, \"hello\", and true, then verify.",
      whyItTransfers: "Prediction builds the habit of reading code from evidence.",
    },
    keyTakeaways: [
      "Values are the data JavaScript works with.",
      "Literal syntax helps identify a value's type.",
      "Type affects how operations behave.",
    ],
  },
  {
    id: "js-variables-and-const-lesson-v1",
    lessonId: "js-variables-and-const-lesson",
    courseId: JAVASCRIPT_FOUNDATIONS_COURSE_ID,
    unitId: JAVASCRIPT_FOUNDATIONS_UNIT_ID,
    conceptId: "js-variables-and-const",
    title: "Variables give values useful names",
    learningObjectives: ["Declare and reason about const and let bindings."],
    prerequisiteConceptIds: ["js-values-and-types"],
    retrievalTags: ["javascript", "variable", "const", "let", "binding"],
    sections: [
      {
        id: "js-bindings-formal-v1",
        sectionId: "formal",
        type: "formal_idea",
        title: "A declaration creates a binding",
        body: "const courseCount = 2 binds the name courseCount to the number value 2.",
        retrievalTags: ["declaration", "binding", "const"],
        misconceptionIds: ["const-deep-immutable"],
      },
    ],
    glossaryTerms: [
      {
        term: "binding",
        definition: "A relationship between a name and a value.",
        aliases: ["variable binding"],
      },
      {
        term: "reassignment",
        definition: "Changing which value an existing variable name refers to.",
        aliases: [],
      },
    ],
    applicationTasks: [],
    practiceReadinessTasks: [
      {
        id: "js-bindings-readiness",
        title: "Choose a declaration",
        prompt: "Choose const or let for a learner name that will not be reassigned.",
        readinessSignal: "Selects const and explains that the binding stays stable.",
        sectionId: "application",
      },
    ],
    objective: {
      title: "Name values intentionally",
      description:
        "Use const and let while keeping the name, binding, and value conceptually separate.",
      successCriteria: [
        "Read a declaration from right to left.",
        "Choose const by default.",
        "Identify when reassignment requires let.",
      ],
    },
    hook:
      "Programs become understandable when important values have names that explain their role.",
    intuition:
      "Think of a variable name as a stable label that lets later expressions refer to a value.",
    formalExplanation:
      "A declaration creates a binding. const prevents reassignment of that binding; let permits reassignment. This is different from guaranteeing deep immutability of an object value.",
    prerequisiteConnections: [
      {
        conceptId: "js-values-and-types",
        title: "Values and types",
        connection: "A variable name refers to a value whose type still matters.",
      },
    ],
    workedExamples: [
      {
        title: "Choose const for a stable name",
        setup: "Store a course title that will not be reassigned.",
        walkthrough: [
          "Identify the value: \"JavaScript Foundations\".",
          "Choose the descriptive name courseTitle.",
          "The binding will not be reassigned.",
          "Declare const courseTitle = \"JavaScript Foundations\".",
        ],
        takeaway: "Use const when the binding should stay attached to one value.",
      },
    ],
    guidedQuestions: [
      {
        prompt: "When would let be more appropriate than const?",
        hint: "Focus on whether the name must later refer to a different value.",
        targetInsight: "Use let when intentional reassignment is required.",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "const makes every nested value permanently immutable.",
        checkPrompt: "Does const user = { name: \"A\" } freeze the object automatically?",
        correction:
          "No. const prevents reassigning user, but it does not automatically freeze the object.",
      },
    ],
    reflectionPrompt: {
      prompt: "Explain the difference between a variable name and its value.",
      sentenceStarter: "The name ____ refers to the value ____.",
    },
    applicationPrompt: {
      title: "Design clear bindings",
      prompt: "Declare names for a learner's display name and changing score.",
      whyItTransfers: "Clear declaration choices make state changes easier to reason about.",
    },
    keyTakeaways: [
      "Declarations create named bindings.",
      "Use const by default when reassignment is unnecessary.",
      "Use let for intentional reassignment.",
    ],
  },
];

const assessmentBank: FormativeAssessmentBank = {
  "js-values-and-types": {
    diagnostic: [
      {
        id: "js-values-d1",
        prompt: {
          en: "Which expression creates a string value?",
          zh: "哪个表达式会创建字符串（string）值？",
        },
        options: [
          { id: "a", label: { en: "42", zh: "42" } },
          { id: "b", label: { en: "\"42\"", zh: "\"42\"" } },
        ],
        correctOptionId: "b",
        explanation: {
          en: "Quotation marks create a string literal.",
          zh: "引号会创建字符串字面量（string literal）。",
        },
      },
    ],
    exit_ticket: [
      {
        id: "js-values-e1",
        prompt: {
          en: "What does typeof true evaluate to?",
          zh: "typeof true 的结果是什么？",
        },
        options: [
          { id: "a", label: { en: "\"boolean\"", zh: "\"boolean\"" } },
          { id: "b", label: { en: "\"string\"", zh: "\"string\"" } },
        ],
        correctOptionId: "a",
        explanation: {
          en: "true is a boolean primitive value.",
          zh: "true 是布尔（boolean）基本值。",
        },
      },
    ],
  },
  "js-variables-and-const": {
    diagnostic: [
      {
        id: "js-bindings-d1",
        prompt: {
          en: "Which declaration fits a name that will not be reassigned?",
          zh: "一个名称之后不会被重新赋值时，应该使用哪种声明？",
        },
        options: [
          { id: "a", label: { en: "const", zh: "const" } },
          { id: "b", label: { en: "let", zh: "let" } },
        ],
        correctOptionId: "a",
        explanation: {
          en: "const communicates that the binding will not be reassigned.",
          zh: "const 表示这个绑定（binding）不会被重新赋值。",
        },
      },
    ],
    exit_ticket: [
      {
        id: "js-bindings-e1",
        prompt: {
          en: "What does const prevent?",
          zh: "const 阻止的是什么？",
        },
        options: [
          {
            id: "a",
            label: {
              en: "Reassigning the binding",
              zh: "重新赋值这个绑定（binding）",
            },
          },
          {
            id: "b",
            label: {
              en: "Every possible object mutation",
              zh: "对象发生任何形式的变化",
            },
          },
        ],
        correctOptionId: "a",
        explanation: {
          en: "const prevents reassignment; it does not deep-freeze object values.",
          zh: "const 阻止重新赋值，但不会自动深度冻结对象值。",
        },
      },
    ],
  },
};

export const javascriptFoundationsAssessments =
  createFormativeAssessmentProvider({
  bank: assessmentBank,
  courseId: JAVASCRIPT_FOUNDATIONS_COURSE_ID,
  version: "javascript-foundations-formative-v1",
  });

export const javascriptFoundationsCurriculum: CurriculumPack = {
  id: JAVASCRIPT_FOUNDATIONS_COURSE_ID,
  defaultUnitId: JAVASCRIPT_FOUNDATIONS_UNIT_ID,
  course,
  units,
  topics,
  concepts,
  dependencies: [
    {
      id: "js-values-support-variables",
      prerequisiteConceptId: "js-values-and-types",
      dependentConceptId: "js-variables-and-const",
      relationship: "prerequisite",
      rationale: "Variables bind names to values, so values come first.",
    },
  ],
  lessons,
  teachingProfile: {
    role: "JavaScript concept-first programming teacher",
    audience: "Beginners learning their first programming language",
    tone: "Concrete, curious, precise, and encouraging",
    terminologyPolicy:
      "Introduce programming terms with a short definition and one runnable example.",
    learningPriorities: [
      "Predict code before running it",
      "Separate syntax from runtime meaning",
      "Use small examples to expose misconceptions",
      "Prefer clear mental models over memorized rules",
    ],
  },
  catalog: {
    status: "available",
    level: "Beginner",
    tags: ["programming", "javascript", "web development"],
  },
  capabilities: {
    formativeAssessments: true,
    conceptVisualizations: false,
  },
  localizations: {
    zh: {
      course: {
        title: "JavaScript 基础",
        shortTitle: "JavaScript",
        subject: "编程",
        description: "从值、类型和变量开始，建立准确的 JavaScript 心智模型。",
      },
      units: {
        [JAVASCRIPT_FOUNDATIONS_UNIT_ID]: {
          title: "第 1 单元：语言基础",
          description: "先理解值和类型，再用变量为值命名。",
        },
      },
      topics: {
        "javascript-values": {
          title: "值与类型",
          description: "理解 JavaScript 表达式产生的数据。",
        },
        "javascript-bindings": {
          title: "变量与绑定",
          description: "为值创建清晰的名称，并有意识地更新状态。",
        },
      },
      concepts: {
        "js-values-and-types": {
          title: "值与类型",
          description: "识别常见 JavaScript 值，并解释类型如何影响运算。",
        },
        "js-variables-and-const": {
          title: "变量与 const",
          description: "把变量理解为名称和值之间的绑定，并合理选择 const 或 let。",
        },
      },
      lessons: {
        "js-values-and-types": {
          title: "值通过类型表达含义",
          hook: "为什么 2 + 3 得到 5，而 \"2\" + 3 可能得到 \"23\"？答案从值的类型开始。",
          intuition: "类型说明一个值属于哪类数据，JavaScript 会据此决定运算方式。",
          formalExplanation: "JavaScript 的基本值包括数字、字符串和布尔值；typeof 可以检查运行时类型。",
          keyTakeaways: ["值是程序处理的数据。", "字面量语法能提示类型。", "类型会影响运算行为。"],
        },
        "js-variables-and-const": {
          title: "变量为值提供有意义的名称",
          hook: "当重要的值拥有清晰名称时，程序才更容易理解。",
          intuition: "可以把变量名理解为一个稳定标签，后续表达式通过它引用值。",
          formalExplanation: "声明会创建绑定；const 阻止重新赋值，let 允许重新赋值，但 const 不等于自动深度冻结对象。",
          keyTakeaways: ["声明会创建命名绑定。", "不需要重新赋值时优先使用 const。", "需要有意重新赋值时使用 let。"],
        },
      },
    },
  },
};
