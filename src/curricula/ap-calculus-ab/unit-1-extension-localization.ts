import type { Concept, Topic } from "@/features/knowledge/types";

type LocalizedConceptDraft = Partial<
  Pick<Concept, "title" | "description" | "commonMisconceptions" | "examples">
> & {
  learningObjectives?: Array<{
    title: string;
    description: string;
    successCriteria: string[];
  }>;
};

export const unit1ExtensionLocalizedTopics: Record<string, Partial<Topic>> = {
  "unit-1-topic-limit-laws-and-squeeze": {
    title: "极限法则与夹逼论证（Limit laws and bounding arguments）",
    description:
      "用有依据的极限法则（limit laws）计算代数极限，并通过上下界判断难以直接观察的极限。",
  },
  "unit-1-topic-continuity-and-ivt": {
    title: "连续性与存在性定理（Continuity and existence theorems）",
    description:
      "准确检查连续性（continuity），再用区间上的连续性保证中间输出一定出现。",
  },
  "unit-1-topic-end-behavior": {
    title: "无穷远处的极限与端行为（Limits at infinity and end behavior）",
    description:
      "分析输入无界增大或减小时的函数行为，并把有限端行为与水平渐近线联系起来。",
  },
};

export const unit1ExtensionLocalizedConcepts: Record<
  string,
  LocalizedConceptDraft
> = {
  "evaluating-limits-with-limit-laws": {
    title: "用极限法则计算极限（evaluating limits with limit laws）",
    description:
      "通过有效代数运算组合已知极限，在连续性允许时直接代入，并识别需要其他方法的不定式（indeterminate form）。",
    learningObjectives: [
      {
        title: "应用极限法则（limit laws）",
        description:
          "根据已知分量极限计算和、差、常数倍、积、商与幂的极限。",
        successCriteria: [
          "能把代数结构与正确法则匹配。",
          "使用商法则前会检查分母极限不为 0。",
          "化简前会先写出分量极限。",
        ],
      },
      {
        title: "有依据地直接代入（direct substitution）",
        description:
          "区分可由连续性立即计算的表达式与仍需分析的不定式。",
        successCriteria: [
          "能对多项式和分母非零的有理函数直接代入。",
          "能识别 0/0 是不定式。",
          "不会把未定义的代入结果当成最终极限结论。",
        ],
      },
    ],
    commonMisconceptions: [
      "每个极限都可以直接代入。",
      "出现 0/0 就说明极限等于 0。",
      "分母趋近于 0 时仍可直接使用商法则。",
    ],
    examples: [
      {
        id: "example-limit-laws-combination",
        title: "组合两个已知极限",
        description: "若 f 趋近于 3、g 趋近于 4，则 f + 2g 趋近于 11。",
      },
      {
        id: "example-limit-laws-indeterminate",
        title: "诊断 0/0",
        description:
          "(x² - 1)/(x - 1) 在 x = 1 直接代入得到 0/0，但附近代数行为揭示有限极限。",
      },
    ],
  },
  "squeeze-theorem": {
    title: "夹逼定理（Squeeze Theorem）",
    description:
      "把困难或振荡函数夹在趋近于同一个值的上下界之间，从而确定中间函数的极限。",
    learningObjectives: [
      {
        title: "建立有效夹逼",
        description: "找出在目标输入附近成立的下界和上界。",
        successCriteria: [
          "能写出三段不等式。",
          "会检查不等式在目标点附近成立。",
          "能正确识别被夹住的函数。",
        ],
      },
      {
        title: "使用相同的边界极限",
        description: "只有上下界趋近于同一个值时，才得出中间函数的极限。",
        successCriteria: [
          "能分别计算两个边界极限。",
          "会确认两者相等。",
          "能准确写出夹逼定理的结论。",
        ],
      },
    ],
    commonMisconceptions: [
      "只有一个边界也足以确定极限。",
      "上下界可以趋近于不同的值。",
      "不等式必须在目标输入本身成立。",
    ],
    examples: [
      {
        id: "example-squeeze-oscillation",
        title: "不断缩小的振荡",
        description:
          "x²sin(1/x) 位于 -x² 与 x² 之间，所以 x 趋近于 0 时它也趋近于 0。",
      },
      {
        id: "example-squeeze-absolute-bound",
        title: "绝对值边界",
        description:
          "若 |q(x)| ≤ 3x²，则 -3x² ≤ q(x) ≤ 3x² 能确定 q(x) 的极限。",
      },
    ],
  },
  "continuity-at-a-point": {
    title: "一点处的连续性（continuity at a point）",
    description:
      "检查函数值是否存在、双侧极限是否存在，以及这两个量是否相等。",
    learningObjectives: [
      {
        title: "验证连续性的三个条件",
        description:
          "通过 f(c)、x 趋近于 c 时的双侧极限以及两者相等来判断连续性。",
        successCriteria: [
          "会检查 f(c) 是否定义。",
          "会检查左右极限是否一致。",
          "会把极限与函数值进行比较。",
        ],
      },
      {
        title: "诊断间断（discontinuity）",
        description: "找出哪个连续条件失败，并判断间断是否可去。",
        successCriteria: [
          "能区分函数值缺失与极限缺失。",
          "能识别跳跃间断不可通过改一个点修复。",
          "会用极限值修复可去间断。",
        ],
      },
    ],
    commonMisconceptions: [
      "函数值存在就保证连续。",
      "极限存在就保证连续。",
      "所有间断都能通过修改一个点来修复。",
    ],
    examples: [
      {
        id: "example-continuity-removable",
        title: "修复可去间断",
        description:
          "图像在 x = 1 处趋近于 y = 2，但 f(1) = 5；把 f(1) 改成 2 可恢复连续。",
      },
      {
        id: "example-continuity-jump",
        title: "双侧极限失败",
        description:
          "左右极限不同会阻止连续性，无论目标点函数值取什么。",
      },
    ],
  },
  "intermediate-value-theorem": {
    title: "介值定理（Intermediate Value Theorem）",
    description:
      "利用闭区间上的连续性，保证函数会取得两个端点输出之间的每个中间值。",
    learningObjectives: [
      {
        title: "验证介值定理的条件",
        description:
          "检查闭区间上的连续性，并确认目标输出被两个端点输出夹住。",
        successCriteria: [
          "能明确写出闭区间。",
          "会说明函数在区间上连续。",
          "会证明目标值位于端点输出之间。",
        ],
      },
      {
        title: "写出存在性结论",
        description:
          "说明至少存在一个输入产生目标输出，但不声称精确位置或唯一性。",
        successCriteria: [
          "使用“至少存在一个”的语言。",
          "把保证存在的输入放在正确区间中。",
          "没有额外证据时不会声称唯一。",
        ],
      },
    ],
    commonMisconceptions: [
      "即使函数不连续，只看端点输出也足够。",
      "介值定理能找出精确输入。",
      "介值定理保证恰好只有一个输入。",
    ],
    examples: [
      {
        id: "example-ivt-root",
        title: "保证零点存在",
        description:
          "连续函数满足 f(1) = -2、f(3) = 5，因此在 1 与 3 之间至少有一点使 f(c) = 0。",
      },
      {
        id: "example-ivt-temperature",
        title: "中间温度一定出现",
        description:
          "温度连续地从 18°C 变化到 24°C 时，中间某一时刻一定等于 20°C。",
      },
    ],
  },
  "limits-at-infinity": {
    title: "无穷远处的极限与端行为（limits at infinity and end behavior）",
    description:
      "描述输入无界变化时的函数行为，比较主导项，并把有限端行为理解为水平渐近线。",
    learningObjectives: [
      {
        title: "解释无穷远处的极限",
        description:
          "区分输入无界时的端行为与有限输入附近输出无界的行为。",
        successCriteria: [
          "能识别是 x 还是 f(x) 无界。",
          "能区分正向和负向的端行为。",
          "能把有限端极限与水平渐近线联系起来。",
        ],
      },
      {
        title: "分析有理函数端行为",
        description: "利用主导幂与首项系数计算有理函数的无穷远极限。",
        successCriteria: [
          "会除以合适的主导幂。",
          "能识别倒数幂趋近于 0。",
          "能根据分子分母次数分类端行为。",
        ],
      },
    ],
    commonMisconceptions: [
      "无穷远处的极限和无穷极限是同一回事。",
      "图像绝不能穿过水平渐近线。",
      "可以不说明极限就直接删除所有低次项。",
    ],
    examples: [
      {
        id: "example-end-behavior-equal-degree",
        title: "同次数有理函数",
        description:
          "(2x² + 1)/(x² + 3) 在 x 趋近正无穷或负无穷时都趋近于 2。",
      },
      {
        id: "example-end-behavior-lower-numerator",
        title: "分子次数较低",
        description:
          "分子次数低于分母次数的有理函数在 |x| 增大时趋近于 0。",
      },
    ],
  },
};
