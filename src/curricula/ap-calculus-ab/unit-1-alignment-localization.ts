import type {
  Concept,
  LearningObjective,
  Topic,
  Unit,
} from "@/features/knowledge/types";

type LocalizedConcept = Partial<Omit<Concept, "learningObjectives">> & {
  learningObjectives?: Array<Partial<LearningObjective>>;
};

const UNIT_ID = "ap-calculus-ab-unit-1-limits-continuity";

export const unit1AlignmentLocalizedUnits: Record<string, Partial<Unit>> = {
  [UNIT_ID]: {
    title: "第 1 单元：极限与连续性",
    description:
      "按官方主题顺序，从瞬时变化的动机出发，依次学习极限表示、计算方法、连续性、渐近行为与介值定理。",
  },
};

export const unit1AlignmentLocalizedTopics: Record<string, Partial<Topic>> = {
  "unit-1-topic-limit-foundations": {
    title: "变化与极限基础",
    description:
      "从瞬时变化问题进入极限含义与符号，为后续多种表示和计算方法建立共同语言。",
  },
  "unit-1-topic-graphical-limits": {
    title: "图像、单侧与表格极限",
    description:
      "从图像和表格读取目标两侧的附近行为，并把函数值与极限分开。",
  },
  "unit-1-topic-limit-laws-and-squeeze": {
    title: "极限计算、策略与多重表示",
    description:
      "使用极限法则、代数变形、方法选择和夹逼论证，并协调图像、表格、公式与语言证据。",
  },
  "unit-1-topic-continuity-and-ivt": {
    title: "间断类型与连续性",
    description:
      "分类连续性失败的方式，检查一点处连续，并把连续性扩展到整个区间。",
  },
  "unit-1-topic-one-sided-and-infinite-limits": {
    title: "无穷极限与垂直渐近线",
    description: "用方向性语言描述有限输入附近的无界函数行为。",
  },
  "unit-1-topic-end-behavior": {
    title: "无穷远处的极限与水平渐近线",
    description: "分析输入无界变化时的端行为和水平渐近线。",
  },
  "unit-1-topic-intermediate-value-theorem": {
    title: "区间连续性与介值定理",
    description: "使用闭区间上的连续性保证中间输出一定出现。",
  },
};

export const unit1AlignmentLocalizedConcepts: Record<
  string,
  LocalizedConcept
> = {
  "instantaneous-change-motivation": {
    title: "怎样描述某一瞬间的变化？",
    description:
      "“瞬时”并不意味着拿零秒作除数。我们会把观察窗口一次次缩短，比较平均变化率是否稳定靠近某个数，由此引出极限。",
    learningObjectives: [
      {
        title: "分清“这一段”与“这一刻”",
        description: "判断一个变化率说的是整段区间的平均表现，还是某个时刻的局部表现。",
        successCriteria: [
          "能在差商中指出输出变化量和对应的输入变化量。",
          "能结合车速、降温等情境解释变化率的单位。",
          "能说明零长度区间会导致除以零，不能直接使用。",
        ],
      },
      {
        title: "让观察窗口不断缩短",
        description: "比较同一时刻附近的一组平均变化率，判断它们能否支持一个瞬时变化的候选值。",
        successCriteria: [
          "能按区间长度由大到小追踪变化率的趋势。",
          "能寻找一组数共同靠近的稳定值，而不是凭单次结果下结论。",
          "能把这种“越来越靠近”的过程与极限联系起来。",
        ],
      },
    ],
    commonMisconceptions: [
      "既然研究“瞬时”，就应该把时间间隔 h 直接取成 0。",
      "全程平均速度是多少，途中每一刻的速度就是多少。",
      "只写一个变化率数值就够了，不必说明正负号和单位的含义。",
    ],
    examples: [
      {
        id: "example-instantaneous-speed",
        title: "长途客车在第 5 小时时开得多快？",
        description: "把第 5 小时之后的观察窗口逐步缩短，看平均速度是否稳定靠近同一个数。",
      },
      {
        id: "example-cooling-rate",
        title: "保温杯里的水，此刻降温有多快？",
        description: "比较 1 分钟、10 秒和 1 秒内的平均温度变化，寻找整小时平均值可能掩盖的局部趋势。",
      },
    ],
  },
  "estimating-limits-from-tables": {
    title: "表里有很多数，哪些才算极限证据？",
    description:
      "选择从目标两侧靠近的输入和对应输出，估计极限或判断数据不支持同一个趋近值。",
    learningObjectives: [
      {
        title: "选择有效的表格证据",
        description: "优先选择目标两侧且最靠近目标的输入。",
        successCriteria: [
          "同时使用小于和大于目标的输入。",
          "优先查看最接近目标的可靠数据。",
          "把目标行的函数值与附近趋势分开。",
        ],
      },
      {
        title: "估计或否定双侧极限",
        description: "比较两个方向的输出趋势并给出与数据精度相符的结论。",
        successCriteria: [
          "能分别描述左侧和右侧趋势。",
          "只有两侧一致时才报告共同趋近值。",
          "不会声称超出表格支持范围的精度。",
        ],
      },
    ],
    commonMisconceptions: [
      "目标输入所在行决定极限。",
      "只查看一个方向就足以判断所有双侧极限。",
      "输出小数位越多，极限估计就一定越准确。",
    ],
    examples: [
      {
        id: "example-table-two-sided",
        title: "从两侧靠近 2",
        description: "1.9、1.99、2.01、2.1 的输出共同支持一个趋近值。",
      },
      {
        id: "example-table-disagreement",
        title: "表格中的方向性分歧",
        description: "目标左侧趋近 1、右侧趋近 4，因此双侧极限不存在。",
      },
    ],
  },
  "algebraic-limit-techniques": {
    title: "得到 0/0 之后，下一步是什么？",
    description:
      "通过因式分解、共轭有理化或三角恒等变形消除不定式，同时保持去心邻域中的函数行为。",
    learningObjectives: [
      {
        title: "选择有效的代数变形",
        description: "根据多项式、根式或三角结构选择合适方法。",
        successCriteria: [
          "能在附近非零条件下约去公因式。",
          "能用共轭式处理根式之差。",
          "能在说明条件后使用恒等式或标准三角极限。",
        ],
      },
      {
        title: "保持附近行为不变",
        description: "说明为什么目标点处未定义也可以使用附近等价表达式。",
        successCriteria: [
          "能写出约分成立的输入限制。",
          "区分化简附近行为与重新定义函数。",
          "只有消除不定结构后才再次代入。",
        ],
      },
    ],
    commonMisconceptions: [
      "约去因式说明原函数在目标点已有定义。",
      "乘共轭式只需改变分子，不需要同步处理分母。",
      "每个 0/0 极限都应该使用同一种代数方法。",
    ],
    examples: [
      {
        id: "example-factor-limit",
        title: "因式分解平方差",
        description: "先分解并在 x≠3 时约分，再求 (x²-9)/(x-3) 在 3 处的极限。",
      },
      {
        id: "example-conjugate-limit",
        title: "有理化根式之差",
        description: "用共轭式把根式差商改写成可直接分析的附近表达式。",
      },
    ],
  },
  "selecting-limit-procedures": {
    title: "求极限没有万能第一步",
    description:
      "先识别表示方式、定义域和代入结果，再选择直接计算、图表估计或合适的代数技术。",
    learningObjectives: [
      {
        title: "分类证据与表达式",
        description: "用表示方式、定义域和代入形式缩小可用方法范围。",
        successCriteria: [
          "做多余代数前先检查直接代入。",
          "把 0/0 视为检查表达式结构的信号。",
          "没有解析式时使用图像或表格证据。",
        ],
      },
      {
        title: "说明方法选择依据",
        description: "解释所选方法为什么匹配结构，以及常见替代方法为什么不合适。",
        successCriteria: [
          "指出触发该方法的结构特征。",
          "在整个计算中保留定义域限制。",
          "有其他表示时会检查结果是否合理。",
        ],
      },
    ],
    commonMisconceptions: [
      "应该先使用最熟悉的方法，再看表达式结构。",
      "只要得到一个数，使用的方法就有效。",
      "粗糙图像或稀疏表格一定能给出精确结论。",
    ],
    examples: [
      {
        id: "example-procedure-decision-tree",
        title: "在代入、因式分解和共轭式之间选择",
        description: "不同代入结果和结构线索要求不同的第一步。",
      },
      {
        id: "example-procedure-representation",
        title: "使用题目真正提供的证据",
        description: "只有图像或表格时，从两侧估计并说明表示精度的限制。",
      },
    ],
  },
  "connecting-limit-representations": {
    title: "图像、表格和公式为什么看起来会冲突？",
    description:
      "在图像、数值、解析、符号和语言表示之间转换同一个极限行为，并判断每种证据的能力边界。",
    learningObjectives: [
      {
        title: "在不同表示之间转换",
        description: "保持目标输入、趋近方向和输出趋势一致。",
        successCriteria: [
          "各表示中的目标输入和趋近输出一致。",
          "声称双侧极限时会表示两个方向。",
          "在所有形式中都把函数值与极限分开。",
        ],
      },
      {
        title: "评价表示证据",
        description: "用第二种表示确认、限定或质疑极限结论。",
        successCriteria: [
          "能指出图像分辨率或表格抽样限制。",
          "可能时用解析推理给出精确论证。",
          "能明确解释不同证据是否一致。",
        ],
      },
    ],
    commonMisconceptions: [
      "粗略图像或表格本身就能证明精确极限。",
      "同一个极限的不同表示可以使用不同目标输入或输出。",
      "图上的实心点必须与附近趋势一致。",
    ],
    examples: [
      {
        id: "example-representation-hole",
        title: "用四种形式表示一个可去间断极限",
        description: "因式分解、带孔图像、双侧表格和语言陈述都指向同一输出。",
      },
      {
        id: "example-representation-oscillation",
        title: "图像尺度隐藏的行为",
        description: "图像看似稳定，但解析式可能揭示振荡，因此需要评价表示限制。",
      },
    ],
  },
  "classifying-discontinuities": {
    title: "空点、跳跃和渐近线，怎样分类？",
    description:
      "比较函数值与左右行为，分类可去间断、跳跃间断和无穷间断。",
    learningObjectives: [
      {
        title: "根据证据分类间断",
        description: "用方向性极限和点值区分三类主要间断。",
        successCriteria: [
          "识别有限共同极限加缺失或错误点值是可去间断。",
          "识别有限但不相等的单侧极限是跳跃间断。",
          "识别无界方向性行为是无穷间断。",
        ],
      },
      {
        title: "判断是否能在一点修复",
        description: "判断重新定义一个函数值能否恢复连续性。",
        successCriteria: [
          "把有限双侧极限存在作为可修复条件。",
          "选择共同极限作为修复值。",
          "能说明跳跃和无穷间断不能靠一个点修复。",
        ],
      },
    ],
    commonMisconceptions: [
      "孔、跳跃和垂直渐近线都能通过修改 f(c) 修复。",
      "跳跃间断的双侧极限是两个单侧极限的平均数。",
      "只要有实心点，函数就连续。",
    ],
    examples: [
      {
        id: "example-discontinuity-classification",
        title: "三张图、三种失败",
        description: "孔、跳跃和无界行为以不同方式破坏连续性。",
      },
      {
        id: "example-removable-repair",
        title: "选择修复值",
        description: "两侧都趋近 6 而 f(c) 缺失时，定义 f(c)=6 可以修复。",
      },
    ],
  },
  "continuity-over-intervals": {
    title: "函数在哪些区间连续？",
    description:
      "根据常见函数族的定义域、排除输入和端点条件，说明函数在哪些开区间或闭区间上连续。",
    learningObjectives: [
      {
        title: "用定义域寻找连续区间",
        description: "使用常见函数族在其定义域上连续的性质，并找出排除输入。",
        successCriteria: [
          "知道多项式在所有实数上连续。",
          "能排除有理函数分母为零以及根式或对数无定义的输入。",
          "能把定义域拆成正确的连续区间。",
        ],
      },
      {
        title: "检查区间端点",
        description: "在闭区间端点使用正确的单侧连续条件。",
        successCriteria: [
          "左端点使用右连续。",
          "右端点使用左连续。",
          "所有内部点使用双侧连续条件。",
        ],
      },
    ],
    commonMisconceptions: [
      "熟悉的公式一定在每个实数输入处连续。",
      "闭区间连续要求在端点外侧也有双侧极限。",
      "检查区间内几个点就能证明整个区间连续。",
    ],
    examples: [
      {
        id: "example-rational-continuity-intervals",
        title: "在分母零点处分割区间",
        description: "分母为 (x-2)(x+1) 的有理函数在 -1 和 2 处分割连续区间。",
      },
      {
        id: "example-closed-interval-continuity",
        title: "用单侧条件检查端点",
        description: "[a,b] 上连续要求内部连续、a 处右连续、b 处左连续。",
      },
    ],
  },
};
