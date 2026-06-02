import type { Language } from "@/components/i18n/language-provider";
import type { Concept, Course, LearningObjective, Topic, Unit } from "@/features/knowledge/types";

type LocalizedLearningObjective = Pick<
  LearningObjective,
  "title" | "description" | "successCriteria"
>;

type LocalizedConcept = Partial<
  Pick<Concept, "title" | "description" | "commonMisconceptions" | "examples">
> & {
  learningObjectives?: LocalizedLearningObjective[];
};

const localizedCourses: Record<string, Partial<Course>> = {
  "ap-calculus-ab": {
    title: "AP 微积分 AB（AP Calculus AB）",
    shortTitle: "AP 微积分 AB",
    subject: "微积分（Calculus）",
    description:
      "一门围绕概念理解搭建的 AP 微积分 AB 学习路径，先学清楚概念，再进入应用练习。",
  },
};

const localizedUnits: Record<string, Partial<Unit>> = {
  "ap-calculus-ab-unit-1-limits-continuity": {
    title: "极限与连续性（Limits and Continuity）",
    description:
      "第 1 单元帮助学生用图像、表格、符号和语言描述函数（function）在某个输入附近的行为。",
  },
};

const localizedTopics: Record<string, Partial<Topic>> = {
  "unit-1-topic-limit-foundations": {
    title: "极限基础（Limit foundations）",
    description: "先理解接近行为，再学习极限符号（limit notation）。",
  },
  "unit-1-topic-graphical-limits": {
    title: "从图像判断极限（Graphical limit reasoning）",
    description:
      "从图像上观察函数值（function value）如何接近目标值，而不是只看某一个点。",
  },
  "unit-1-topic-one-sided-and-infinite-limits": {
    title: "单侧与无界行为（Directional and unbounded behavior）",
    description:
      "分析单侧极限（one-sided limit）以及函数值无限增大或减小时的极限行为。",
  },
};

const localizedConcepts: Record<string, LocalizedConcept> = {
  "what-is-a-limit": {
    title: "什么是极限（limit）？",
    description:
      "把极限（limit）理解成：当输入靠近某个目标值时，函数值（function value）正在靠近哪里，即使目标点本身的函数值不同或不存在。",
    learningObjectives: [
      {
        title: "解释接近行为（approaching behavior）",
        description:
          "能用附近输入值和对应输出值说明一个极限（limit）在描述什么。",
        successCriteria: [
          "能区分接近行为和直接代入。",
          "能说清楚输入正在靠近某个目标值。",
          "能解释为什么函数值不存在时，极限仍然可能存在。",
        ],
      },
      {
        title: "区分极限值和函数值",
        description:
          "认识到同一个输入位置的极限值（limit value）和函数值（function value）可以相同、不同，或其中一个不存在。",
        successCriteria: [
          "能识别空心点可能对应一个存在的极限。",
          "不会默认把 f(a) 当成极限值。",
          "能用图像或表格解释两者差别。",
        ],
      },
    ],
    commonMisconceptions: [
      "极限值（limit value）总是等于函数值（function value）。",
      "图像有空心点时，极限（limit）一定不存在。",
      "讨论极限时，输入必须真的等于目标值。",
    ],
    examples: [
      {
        id: "example-limit-hole",
        title: "有空心点但接近值清楚",
        description:
          "图像在 x = 2 附近从左右两侧都接近 y = 4，但 x = 2 处是空心点。",
      },
      {
        id: "example-limit-table",
        title: "用表格看接近趋势",
        description:
          "输出值 2.9、2.99、3.01、3.1 暗示函数值正在靠近 3。",
      },
    ],
  },
  "limit-notation": {
    title: "极限符号（limit notation）",
    description:
      "读懂并表达类似 lim x → a f(x) = L 的极限陈述，把符号翻译成输入和输出的接近关系。",
    learningObjectives: [
      {
        title: "流畅读懂极限符号（limit notation）",
        description:
          "把符号里的目标输入、函数表达式和接近的输出值分别说清楚。",
        successCriteria: [
          "能找出输入正在靠近哪个值。",
          "能找出被分析的函数（function）。",
          "能找出函数值正在靠近哪个输出值。",
        ],
      },
      {
        title: "从文字写出极限符号",
        description:
          "能把文字或图像里的极限关系写成规范的极限符号（limit notation）。",
        successCriteria: [
          "能正确写出 x → a。",
          "能把函数表达式放在正确位置。",
          "能把接近的输出值写在等号后面。",
        ],
      },
    ],
    commonMisconceptions: [
      "箭头 x → a 表示 x 已经等于 a。",
      "只有 f(a) 有定义时，极限符号（limit notation）才有意义。",
      "接近的输出值应该写在下标里，而不是等号后面。",
    ],
    examples: [
      {
        id: "example-limit-notation-sentence",
        title: "从符号到句子",
        description:
          "lim x → 5 f(x) = 7 表示当 x 靠近 5 时，f(x) 靠近 7。",
      },
      {
        id: "example-limit-notation-graph",
        title: "从图像到符号",
        description:
          "如果图像在 x = 1 附近接近 y = -2，就可以写成一个极限陈述。",
      },
    ],
  },
  "estimating-limits-from-graphs": {
    title: "从图像估计极限（estimating limits from graphs）",
    description:
      "观察目标输入左右两侧的图像趋势，估计函数值（function value）是否靠近同一个输出值。",
    learningObjectives: [
      {
        title: "估计双侧极限（two-sided limit）",
        description:
          "判断左侧和右侧的图像行为是否靠近同一个输出值。",
        successCriteria: [
          "能从目标输入的左右两侧分别沿图像观察。",
          "比较接近的 y 值，而不是只看点是实心还是空心。",
          "能说明双侧极限存在或不存在。",
        ],
      },
      {
        title: "忽略干扰性的函数值",
        description:
          "用附近图像趋势判断极限（limit），而不是被目标点处的实心点误导。",
        successCriteria: [
          "能正确识别实心点和空心点。",
          "能解释为什么实心点可以和极限值不同。",
          "能用图像趋势作为判断依据。",
        ],
      },
    ],
    commonMisconceptions: [
      "目标点的实心点一定决定极限（limit）。",
      "没有特别说明时，只看右侧图像就够了。",
      "如果图像在目标点跳跃，双侧极限（two-sided limit）仍然存在。",
    ],
    examples: [
      {
        id: "example-graph-open-filled-points",
        title: "空心点和实心点同时出现",
        description:
          "图像趋势接近 y = 3 的空心点，但同一个 x 值上有一个 y = 1 的实心点。",
      },
      {
        id: "example-graph-jump",
        title: "跳跃行为（jump behavior）",
        description:
          "左侧接近 y = 2，右侧接近 y = 5，因此双侧极限不存在。",
      },
    ],
  },
  "one-sided-limits": {
    title: "单侧极限（one-sided limits）",
    description:
      "只从左侧或右侧靠近目标输入，分析函数值（function value）的接近行为。",
    learningObjectives: [
      {
        title: "区分左侧和右侧接近",
        description:
          "解释从小于目标值的一侧靠近，和从大于目标值的一侧靠近有什么不同。",
        successCriteria: [
          "能读懂极限符号里的上标 - 和 +。",
          "能用图像方向判断左极限和右极限。",
          "不会把接近方向和输出值正负混为一谈。",
        ],
      },
      {
        title: "连接单侧极限和双侧极限",
        description:
          "知道只有左右单侧极限靠近同一个值时，双侧极限（two-sided limit）才存在。",
        successCriteria: [
          "能比较左极限和右极限。",
          "能说明左右不同为什么导致双侧极限不存在。",
          "能用单侧证据支持双侧结论。",
        ],
      },
    ],
    commonMisconceptions: [
      "+ 号表示极限值一定是正数。",
      "- 号表示输出值一定是负数。",
      "左右单侧极限不同，双侧极限仍然可以存在。",
    ],
    examples: [
      {
        id: "example-one-sided-piecewise",
        title: "分段图像的边界点",
        description:
          "图像在 x = 0 左侧遵循一条规则，右侧遵循另一条规则。",
      },
      {
        id: "example-one-sided-table",
        title: "方向性表格数值",
        description:
          "略小于 4 的输入接近一个输出值，略大于 4 的输入接近另一个输出值。",
      },
    ],
  },
  "infinite-limits": {
    title: "无穷极限（infinite limits）",
    description:
      "识别当输入靠近目标值时，函数值（function value）无限增大或无限减小的情况，常常对应垂直渐近线（vertical asymptote）。",
    learningObjectives: [
      {
        title: "描述无界行为（unbounded behavior）",
        description:
          "说明输出值在目标输入附近无限增大或无限减小是什么意思。",
        successCriteria: [
          "用无界语言描述，而不是把无穷当成普通数字。",
          "能从图像识别垂直渐近线（vertical asymptote）。",
          "能说明趋势是趋向正无穷还是负无穷。",
        ],
      },
      {
        title: "解释方向性的无穷极限",
        description:
          "分析无界行为来自左侧、右侧，还是两侧都有。",
        successCriteria: [
          "能结合单侧极限符号和正/负无穷。",
          "能识别左右两侧朝不同方向发散的情况。",
          "能用图像或表格证据描述极限行为。",
        ],
      },
    ],
    commonMisconceptions: [
      "无穷（infinity）是函数最终达到的一个数。",
      "只要有垂直渐近线，两侧都一定趋向正无穷。",
      "无穷极限（infinite limit）和无穷远处的极限（limit at infinity）是一回事。",
    ],
    examples: [
      {
        id: "example-infinite-vertical-asymptote",
        title: "垂直渐近线附近的行为",
        description:
          "当 x 靠近 2 时，图像在一侧或两侧快速向上增长，没有上界。",
      },
      {
        id: "example-infinite-opposite-directions",
        title: "左右方向相反",
        description:
          "同一个 x 值附近，左侧向负无穷下降，右侧向正无穷上升。",
      },
    ],
  },
};

export function getLocalizedCourse(course: Course, language: Language): Course {
  if (language === "en") {
    return course;
  }

  return { ...course, ...localizedCourses[course.id] };
}

export function getLocalizedUnit(unit: Unit, language: Language): Unit {
  if (language === "en") {
    return unit;
  }

  return { ...unit, ...localizedUnits[unit.id] };
}

export function getLocalizedTopic(topic: Topic, language: Language): Topic {
  if (language === "en") {
    return topic;
  }

  return { ...topic, ...localizedTopics[topic.id] };
}

export function getLocalizedConcept(concept: Concept, language: Language): Concept {
  if (language === "en") {
    return concept;
  }

  const localizedConcept = localizedConcepts[concept.id];

  if (!localizedConcept) {
    return concept;
  }

  return {
    ...concept,
    ...localizedConcept,
    learningObjectives: localizedConcept.learningObjectives
      ? concept.learningObjectives.map((objective, index) => ({
          ...objective,
          ...localizedConcept.learningObjectives?.[index],
        }))
      : concept.learningObjectives,
  };
}
