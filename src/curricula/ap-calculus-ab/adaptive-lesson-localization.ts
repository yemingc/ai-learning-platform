import { apCalculusABUnit1Lessons } from "./lessons.ts";
import { apCalculusABUnit2Lessons } from "./unit-2-lessons.ts";
import type { LessonContent, LessonSectionType } from "@/features/lessons/types";

type LocalizedGlossaryDraft = {
  term: string;
  definition: string;
  aliases: string[];
};

const localizedGlossaryByCanonicalTerm: Record<
  string,
  LocalizedGlossaryDraft
> = {
  "limit": {
    term: "极限（limit）",
    definition: "当输入靠近某个位置时，函数输出所靠近的值；判断依据是目标点附近的行为。",
    aliases: ["极限值"],
  },
  "function value": {
    term: "函数值（function value）",
    definition: "函数在某个具体输入处实际取到的输出；前提是该点有定义。",
    aliases: ["点值"],
  },
  "limit notation": {
    term: "极限符号（limit notation）",
    definition: "用简洁符号同时说明输入趋近方向和输出目标的数学表达。",
    aliases: ["极限记号"],
  },
  "approaches": {
    term: "趋近（approaches）",
    definition: "越来越靠近某个目标值，但不要求实际等于这个目标值。",
    aliases: ["靠近"],
  },
  "two-sided limit": {
    term: "双侧极限（two-sided limit）",
    definition: "当目标点左侧和右侧的函数行为都趋近同一个输出时得到的极限。",
    aliases: ["两侧极限"],
  },
  "filled point": {
    term: "实心点（filled point）",
    definition: "图像上表示函数在某个输入处实际取值的点；它不一定等于该点的极限。",
    aliases: ["实点"],
  },
  "left-hand limit": {
    term: "左极限（left-hand limit）",
    definition: "x 从小于目标值的一侧靠近时，函数输出所呈现的趋势。",
    aliases: ["左侧极限"],
  },
  "right-hand limit": {
    term: "右极限（right-hand limit）",
    definition: "x 从大于目标值的一侧靠近时，函数输出所呈现的趋势。",
    aliases: ["右侧极限"],
  },
  "numerical estimate": {
    term: "数值估计（numerical estimate）",
    definition: "根据目标输入附近的一组采样值，对函数趋势作出的近似判断。",
    aliases: ["表格估计"],
  },
  "directional data": {
    term: "方向性数据（directional data）",
    definition: "输入从目标值下方或上方逐步靠近时得到的表格数据。",
    aliases: ["左侧数据", "右侧数据"],
  },
  "limit laws": {
    term: "极限法则（limit laws）",
    definition: "把已知极限通过和、差、常数倍、积、商与幂等运算组合起来的规则。",
    aliases: ["极限运算法则"],
  },
  "direct substitution": {
    term: "直接代入（direct substitution）",
    definition: "函数在目标点连续时，用目标输入替换 x 来计算极限的方法。",
    aliases: ["代入法"],
  },
  "deleted neighborhood": {
    term: "去心邻域（deleted neighborhood）",
    definition: "足够靠近目标输入、但把目标点本身排除在外的一组输入。",
    aliases: ["目标点附近的非目标输入"],
  },
  "conjugate": {
    term: "共轭式（conjugate）",
    definition: "把两项之间的正负号互换得到的表达式，常用于化简根式之差。",
    aliases: ["根式共轭"],
  },
  "procedure selection": {
    term: "方法选择（procedure selection）",
    definition: "在计算前，根据表示方式和表达式结构选择有依据的求极限方法。",
    aliases: ["策略选择"],
  },
  "structural cue": {
    term: "结构线索（structural cue）",
    definition: "公因式、根式之差或非零分母等能提示合适方法的表达式特征。",
    aliases: ["方法线索"],
  },
  "Squeeze Theorem": {
    term: "夹逼定理（Squeeze Theorem）",
    definition: "若一个函数始终夹在两个具有相同极限的函数之间，它也趋近这个共同值。",
    aliases: ["夹挤定理"],
  },
  "bounding functions": {
    term: "边界函数（bounding functions）",
    definition: "在目标附近从下方和上方限制另一个函数的两个函数。",
    aliases: ["上下界函数"],
  },
  "representation": {
    term: "数学表示（representation）",
    definition: "用图像、表格、公式、符号或语言呈现同一数学信息的方式。",
    aliases: ["表示方式"],
  },
  "resolution": {
    term: "分辨率（resolution）",
    definition: "图像刻度或数值采样在目标附近能够呈现的细节程度。",
    aliases: ["表示精度"],
  },
  "removable discontinuity": {
    term: "可去间断（removable discontinuity）",
    definition: "有限双侧极限存在，但函数值缺失或与极限不相等造成的间断。",
    aliases: ["空点"],
  },
  "jump discontinuity": {
    term: "跳跃间断（jump discontinuity）",
    definition: "左右两个有限单侧极限都存在、但彼此不相等造成的间断。",
    aliases: ["跳跃"],
  },
  "infinite discontinuity": {
    term: "无穷间断（infinite discontinuity）",
    definition: "目标点至少一侧的函数值无界增长或下降造成的间断。",
    aliases: ["垂直渐近线间断"],
  },
  "continuous at a point": {
    term: "一点处连续（continuous at a point）",
    definition: "f(c) 有定义、x→c 时的极限存在，并且这个极限等于 f(c)。",
    aliases: ["点连续"],
  },
  "discontinuity": {
    term: "间断（discontinuity）",
    definition: "一点处至少有一个连续性条件不成立的情况。",
    aliases: ["不连续点"],
  },
  "continuous on an interval": {
    term: "区间上连续（continuous on an interval）",
    definition: "函数在每个内部点连续，并在区间包含的端点满足相应的单侧连续条件。",
    aliases: ["区间连续"],
  },
  "domain restriction": {
    term: "定义域限制（domain restriction）",
    definition: "因为原函数或导函数没有实数定义而必须排除的输入。",
    aliases: ["排除值"],
  },
  "infinite limit": {
    term: "无穷极限（infinite limit）",
    definition: "输入靠近某个位置时，函数值向上或向下无界变化的描述。",
    aliases: ["无界极限"],
  },
  "vertical asymptote": {
    term: "垂直渐近线（vertical asymptote）",
    definition: "图像在其附近可能出现无界单侧行为的一条垂直直线。",
    aliases: ["竖直渐近线"],
  },
  "limit at infinity": {
    term: "无穷远处的极限（limit at infinity）",
    definition: "输入向正无穷或负无穷变化时，函数输出呈现的长期趋势。",
    aliases: ["端行为极限"],
  },
  "horizontal asymptote": {
    term: "水平渐近线（horizontal asymptote）",
    definition: "至少在一个方向上描述函数长期端行为的一条水平直线。",
    aliases: ["横向渐近线"],
  },
  "Intermediate Value Theorem": {
    term: "介值定理（Intermediate Value Theorem）",
    definition: "闭区间上的连续函数会取到两个端点输出之间的每一个值。",
    aliases: ["IVT"],
  },
  "existence guarantee": {
    term: "存在性保证（existence guarantee）",
    definition: "证明至少有一个输入满足条件，但不必找出它的准确位置。",
    aliases: ["存在性结论"],
  },
  "average rate of change": {
    term: "平均变化率（average rate of change）",
    definition: "在一个非零输入区间内，用输出变化量除以对应的输入变化量。",
    aliases: ["割线斜率", "区间变化率"],
  },
  "instantaneous rate of change": {
    term: "瞬时变化率（instantaneous rate of change）",
    definition: "区间向某个输入点缩短时，平均变化率所趋近的值。",
    aliases: ["一点处的变化率"],
  },
  "derivative": {
    term: "导数（derivative）",
    definition: "差商极限存在时得到的瞬时变化率；它可以表示一个数，也可以表示一个函数。",
    aliases: ["瞬时变化率", "切线斜率"],
  },
  "tangent line": {
    term: "切线（tangent line）",
    definition: "经过曲线上一点，并以该点导数为斜率的直线。",
    aliases: ["切线方程"],
  },
  "centered difference": {
    term: "中心差分（centered difference）",
    definition: "在目标点左右各取一个输入计算割线斜率，常用于估计导数。",
    aliases: ["对称差分"],
  },
  "local slope": {
    term: "局部斜率（local slope）",
    definition: "图像在某一点附近所呈现的斜率趋势。",
    aliases: ["附近斜率"],
  },
  "differentiable at a point": {
    term: "一点处可导（differentiable at a point）",
    definition: "相关差商具有有限极限，因此该点存在有限导数。",
    aliases: ["点可导"],
  },
  "nondifferentiable point": {
    term: "不可导点（nondifferentiable point）",
    definition: "有限导数不存在的点，例如间断点、尖角、尖点或垂直切线处。",
    aliases: ["导数不存在的点"],
  },
  "power rule": {
    term: "幂函数求导法则（power rule）",
    definition: "在原式和导数有定义处，d/dx(x^r)=r x^(r-1)。",
    aliases: ["幂法则"],
  },
  "linearity of differentiation": {
    term: "求导的线性性质（linearity of differentiation）",
    definition: "求导保持函数的和与常数倍，即 (af+bg)'=af'+bg'。",
    aliases: ["线性求导法则"],
  },
  "constant rule": {
    term: "常数法则（constant rule）",
    definition: "常数函数的导数等于 0。",
    aliases: ["常数求导"],
  },
  "transcendental function": {
    term: "超越函数（transcendental function）",
    definition: "三角函数、指数函数和对数函数等不能只靠有限次代数运算构成的函数。",
    aliases: ["非代数函数"],
  },
  "radian measure": {
    term: "弧度制（radian measure）",
    definition: "标准三角函数导数公式所要求的角度单位。",
    aliases: ["弧度"],
  },
  "product rule": {
    term: "乘积法则（product rule）",
    definition: "两个可导函数乘积的导数满足 (fg)'=f'g+fg'。",
    aliases: ["乘法求导法则"],
  },
  "factor": {
    term: "因子（factor）",
    definition: "乘积中彼此相乘的一个函数或表达式。",
    aliases: ["乘积因子"],
  },
  "quotient rule": {
    term: "商法则（quotient rule）",
    definition: "当 g(x)≠0 时，(f/g)'=(f'g-fg')/g²。",
    aliases: ["除法求导法则"],
  },
  "original domain": {
    term: "原函数定义域（original domain）",
    definition: "在任何化简或求导之前，原函数本身允许的全部输入。",
    aliases: ["原始定义域"],
  },
  "reciprocal identity": {
    term: "倒数恒等式（reciprocal identity）",
    definition: "例如 sec x=1/cos x、csc x=1/sin x 的三角恒等关系。",
    aliases: ["三角倒数关系"],
  },
  "Pythagorean identity": {
    term: "勾股恒等式（Pythagorean identity）",
    definition: "由 sin²x+cos²x=1 推出的恒等式，包括 1+tan²x=sec²x。",
    aliases: ["三角勾股恒等式"],
  },
};

const localizedRetrievalTags: Record<string, string[]> = {
  "instantaneous-change-motivation": ["瞬时变化", "平均变化率", "缩短区间", "割线斜率"],
  "what-is-a-limit": ["极限", "附近行为", "函数值", "趋近"],
  "limit-notation": ["极限符号", "输入趋近", "输出目标", "箭头记号"],
  "estimating-limits-from-graphs": [
    "图像估计极限",
    "从图像看极限",
    "从图像怎么看极限",
    "怎么看极限",
    "双侧极限",
    "空心点",
    "实心点",
  ],
  "one-sided-limits": ["单侧极限", "左极限", "右极限", "方向性行为"],
  "estimating-limits-from-tables": ["表格估计极限", "数值证据", "双侧数据", "附近取值"],
  "evaluating-limits-with-limit-laws": [
    "极限法则",
    "直接代入",
    "直接代入得到 0/0",
    "0/0 不是极限",
    "和积商法则",
    "不定式",
  ],
  "algebraic-limit-techniques": ["代数求极限", "因式分解", "共轭式", "三角变形"],
  "selecting-limit-procedures": ["极限方法选择", "求极限策略", "结构线索", "表示方式"],
  "squeeze-theorem": ["夹逼定理", "上下界", "振荡函数", "绝对值界"],
  "connecting-limit-representations": ["极限多重表示", "图表公式互译", "证据核对", "表示精度"],
  "classifying-discontinuities": ["间断分类", "可去间断", "跳跃间断", "无穷间断"],
  "continuity-at-a-point": [
    "一点处连续",
    "一点处的连续性",
    "连续性三个条件",
    "f(c) 与双侧极限相等",
    "函数值与极限",
    "可去间断",
  ],
  "continuity-over-intervals": ["区间连续", "端点连续", "定义域限制", "连续区间"],
  "infinite-limits": ["无穷极限", "无界行为", "垂直渐近线", "单侧趋势"],
  "limits-at-infinity": ["无穷远极限", "端行为", "水平渐近线", "主导项"],
  "intermediate-value-theorem": ["介值定理", "连续闭区间", "存在性保证", "零点"],
  "average-and-instantaneous-rates-of-change": ["平均变化率", "瞬时变化率", "差商", "割线斜率"],
  "derivative-as-a-limit-and-tangent-slope": ["导数定义", "差商极限", "切线斜率", "导数记号"],
  "estimating-derivatives-at-a-point": ["估计导数", "中心差分", "表格", "局部斜率"],
  "differentiability-and-continuity": ["可导性", "连续性", "尖角", "尖点", "垂直切线"],
  "power-rule": ["幂函数求导", "负指数", "分数指数", "定义域"],
  "linearity-rules-for-derivatives": ["求导线性法则", "常数法则", "和差法则", "多项式求导"],
  "basic-transcendental-derivatives": ["三角函数求导", "指数函数求导", "对数函数求导", "弧度制"],
  "product-rule": ["乘积法则", "函数乘积求导", "表格数据", "两项之和"],
  "quotient-rule": ["商法则", "函数商求导", "分母平方", "定义域限制"],
  "remaining-trigonometric-derivatives": ["正切求导", "余切求导", "正割求导", "余割求导"],
};

const sectionTitles: Record<LessonSectionType, string> = {
  why_this_matters: "为什么要学这个？",
  intuition: "先建立直觉",
  formal_idea: "把直觉写成数学",
  worked_example: "例题拆解",
  think_with_me: "一起想一想",
  common_trap: "常见误区",
  reflection: "用自己的话说一遍",
  try_applying_it: "换个情境试一试",
  key_takeaways: "这一课要带走什么？",
};

const sectionTeachingGoals: Record<LessonSectionType, string> = {
  why_this_matters: "先从学习者能观察到的问题出发，说明这个概念要解决什么。",
  intuition: "在正式符号和步骤之前，建立可以反复调用的直观模型。",
  formal_idea: "用 AP 微积分要求的语言和符号准确表达概念。",
  worked_example: "展示从信息判断、方法选择到结论解释的完整推理。",
  think_with_me: "用追问暴露学习者是否真正理解关键条件。",
  common_trap: "指出具体错误想法，并说明怎样用证据修正。",
  reflection: "让学习者不用照抄定义，也能复述核心关系。",
  try_applying_it: "把同一推理迁移到新的表示或实际情境。",
  key_takeaways: "收束本课最需要长期保留的概念与判断规则。",
};

const sectionRetrievalTags: Record<LessonSectionType, string[]> = {
  why_this_matters: ["学习动机", "为什么重要"],
  intuition: ["直观理解", "心智模型"],
  formal_idea: ["正式定义", "数学表达"],
  worked_example: ["例题", "推理步骤"],
  think_with_me: ["引导问题", "理解检查"],
  common_trap: ["常见误区", "纠错"],
  reflection: ["反思", "自我解释"],
  try_applying_it: ["迁移应用", "学习准备度"],
  key_takeaways: ["小结", "关键收获"],
};

const defaultRetrievalBoostSections: LessonSectionType[] = [
  "formal_idea",
  "worked_example",
  "common_trap",
];

const retrievalBoostSectionOverrides: Record<
  string,
  LessonSectionType[]
> = {
  "estimating-limits-from-graphs": [
    "intuition",
    "worked_example",
    "think_with_me",
  ],
  "one-sided-limits": ["intuition", "formal_idea", "common_trap"],
  "continuity-at-a-point": [
    "intuition",
    "formal_idea",
    "worked_example",
    "common_trap",
  ],
  "selecting-limit-procedures": [
    "formal_idea",
    "worked_example",
    "key_takeaways",
  ],
  "infinite-limits": ["intuition", "formal_idea", "worked_example"],
  "limits-at-infinity": ["formal_idea", "think_with_me", "common_trap"],
  "estimating-derivatives-at-a-point": [
    "intuition",
    "worked_example",
    "think_with_me",
  ],
};

function getLocalizedSectionRetrievalTags(
  conceptId: string,
  sectionType: LessonSectionType,
) {
  const boostSections =
    retrievalBoostSectionOverrides[conceptId] ?? defaultRetrievalBoostSections;

  return [
    ...(boostSections.includes(sectionType)
      ? (localizedRetrievalTags[conceptId] ?? [])
      : []),
    ...sectionRetrievalTags[sectionType],
  ];
}

const canonicalLessons = new Map(
  [...apCalculusABUnit1Lessons, ...apCalculusABUnit2Lessons].map((lesson) => [
    lesson.conceptId,
    lesson,
  ]),
);

function formatPrerequisites(lesson: LessonContent) {
  if (lesson.prerequisiteConnections.length === 0) {
    return lesson.intuition;
  }

  return [
    lesson.intuition,
    ...lesson.prerequisiteConnections.map(
      (connection) => `前置联系｜${connection.title}：${connection.connection}`,
    ),
  ].join("\n\n");
}

function formatWorkedExamples(lesson: LessonContent) {
  return lesson.workedExamples
    .map((example) =>
      [
        example.title,
        example.setup,
        ...example.walkthrough.map((step, index) => `${index + 1}. ${step}`),
        `结论：${example.takeaway}`,
      ].join("\n"),
    )
    .join("\n\n");
}

function formatGuidedQuestions(lesson: LessonContent) {
  return lesson.guidedQuestions
    .map((question, index) =>
      [
        `问题 ${index + 1}：${question.prompt}`,
        `提示：${question.hint}`,
        `关键点：${question.targetInsight}`,
      ].join("\n"),
    )
    .join("\n\n");
}

function formatMisconceptions(lesson: LessonContent) {
  return lesson.misconceptionChecks
    .map((check, index) =>
      [
        `误区 ${index + 1}：${check.misconception}`,
        `检查：${check.checkPrompt}`,
        `修正：${check.correction}`,
      ].join("\n"),
    )
    .join("\n\n");
}

function getSectionBody(lesson: LessonContent, type: LessonSectionType) {
  switch (type) {
    case "why_this_matters":
      return lesson.hook;
    case "intuition":
      return formatPrerequisites(lesson);
    case "formal_idea":
      return lesson.formalExplanation;
    case "worked_example":
      return formatWorkedExamples(lesson);
    case "think_with_me":
      return formatGuidedQuestions(lesson);
    case "common_trap":
      return formatMisconceptions(lesson);
    case "reflection":
      return `${lesson.reflectionPrompt.prompt}\n可从这里开始：${lesson.reflectionPrompt.sentenceStarter}`;
    case "try_applying_it":
      return `${lesson.applicationPrompt.prompt}\n\n为什么能迁移：${lesson.applicationPrompt.whyItTransfers}`;
    case "key_takeaways":
      return lesson.keyTakeaways.map((takeaway) => `- ${takeaway}`).join("\n");
  }
}

function requireLocalizedCore(
  conceptId: string,
  draft: Partial<LessonContent>,
): asserts draft is Partial<LessonContent> &
  Pick<
    LessonContent,
    | "title"
    | "objective"
    | "hook"
    | "intuition"
    | "formalExplanation"
    | "prerequisiteConnections"
    | "workedExamples"
    | "guidedQuestions"
    | "misconceptionChecks"
    | "reflectionPrompt"
    | "applicationPrompt"
    | "keyTakeaways"
  > {
  const requiredFields = [
    "title",
    "objective",
    "hook",
    "intuition",
    "formalExplanation",
    "prerequisiteConnections",
    "workedExamples",
    "guidedQuestions",
    "misconceptionChecks",
    "reflectionPrompt",
    "applicationPrompt",
    "keyTakeaways",
  ] as const;

  const missingFields = requiredFields.filter((field) => draft[field] === undefined);
  if (missingFields.length > 0) {
    throw new Error(
      `${conceptId}: incomplete Chinese lesson localization: ${missingFields.join(", ")}`,
    );
  }
}

function localizeGlossary(canonicalLesson: LessonContent) {
  return canonicalLesson.glossaryTerms.map((canonicalTerm) => {
    const localizedTerm = localizedGlossaryByCanonicalTerm[canonicalTerm.term];
    if (!localizedTerm) {
      throw new Error(
        `${canonicalLesson.conceptId}: missing Chinese glossary term for ${canonicalTerm.term}`,
      );
    }

    return {
      ...localizedTerm,
      aliases: Array.from(
        new Set([
          ...localizedTerm.aliases,
          canonicalTerm.term,
          ...canonicalTerm.aliases,
        ]),
      ),
    };
  });
}

function completeLessonLocalization(
  conceptId: string,
  draft: Partial<LessonContent>,
): Partial<LessonContent> {
  const canonicalLesson = canonicalLessons.get(conceptId);
  if (!canonicalLesson) {
    return draft;
  }

  requireLocalizedCore(conceptId, draft);
  const canonicalApplicationTask = canonicalLesson.applicationTasks[0];
  if (!canonicalApplicationTask) {
    throw new Error(`${conceptId}: canonical lesson has no application task.`);
  }

  const localizedApplicationTask = {
    ...canonicalApplicationTask,
    title: draft.applicationPrompt.title,
    prompt: draft.applicationPrompt.prompt,
    readinessSignal: draft.applicationPrompt.whyItTransfers,
  };

  return {
    ...draft,
    learningObjectives: draft.learningObjectives ?? [
      draft.objective.description,
      ...draft.objective.successCriteria,
    ],
    retrievalTags:
      draft.retrievalTags ?? [
        ...(localizedRetrievalTags[conceptId] ?? []),
        ...canonicalLesson.retrievalTags,
      ],
    sections:
      draft.sections ??
      canonicalLesson.sections.map((section) => ({
        ...section,
        title: sectionTitles[section.type],
        body: getSectionBody(draft as LessonContent, section.type),
        teachingGoal: sectionTeachingGoals[section.type],
        retrievalTags: getLocalizedSectionRetrievalTags(
          conceptId,
          section.type,
        ),
      })),
    glossaryTerms: draft.glossaryTerms ?? localizeGlossary(canonicalLesson),
    applicationTasks: draft.applicationTasks ?? [localizedApplicationTask],
    practiceReadinessTasks: draft.practiceReadinessTasks ?? [
      localizedApplicationTask,
    ],
  };
}

export function completeApCalculusZhLessonLocalizations(
  drafts: Record<string, Partial<LessonContent>>,
) {
  return Object.fromEntries(
    Object.entries(drafts).map(([conceptId, draft]) => [
      conceptId,
      completeLessonLocalization(conceptId, draft),
    ]),
  ) satisfies Record<string, Partial<LessonContent>>;
}
