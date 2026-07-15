import type {
  Concept,
  LearningObjective,
  Topic,
  Unit,
} from "@/features/knowledge/types";
import { AP_CALCULUS_AB_UNIT_2_ID } from "./unit-2-knowledge.ts";

type LocalizedConcept = Partial<Omit<Concept, "learningObjectives">> & {
  learningObjectives?: Array<Partial<LearningObjective>>;
};

export const unit2LocalizedUnits: Record<string, Partial<Unit>> = {
  [AP_CALCULUS_AB_UNIT_2_ID]: {
    title: "第 2 单元：导数的定义与基本性质",
    description:
      "从极限出发，把平均变化率、瞬时变化率、导数表示、可导性和基础求导法则连接成一条完整学习路径。",
  },
};

export const unit2LocalizedTopics: Record<string, Partial<Topic>> = {
  "unit-2-topic-rates-and-derivative-definition": {
    title: "变化率与导数定义",
    description:
      "从区间上的割线斜率过渡到一点处的切线斜率，并用极限定义导函数。",
  },
  "unit-2-topic-estimation-and-differentiability": {
    title: "导数估计与可导性",
    description:
      "根据表格和图像估计导数，并判断连续性何时能够、何时不能保证可导。",
  },
  "unit-2-topic-fundamental-derivative-rules": {
    title: "基本函数与线性求导法则",
    description:
      "用幂法则、线性法则和常见初等函数建立高效求导能力。",
  },
  "unit-2-topic-product-quotient-and-trig-rules": {
    title: "乘积、商与其余三角函数求导",
    description:
      "处理两个变化函数的乘积和商，并从恒等式推导其余三角函数的导数。",
  },
};

export const unit2LocalizedConcepts: Record<string, LocalizedConcept> = {
  "average-and-instantaneous-rates-of-change": {
    title: "一段时间的平均速度，怎样变成某一刻的速度？",
    description:
      "把差商理解为区间上的平均变化率，并用不断缩小的区间引出一点处的瞬时变化率。",
    learningObjectives: [
      {
        title: "求平均变化率",
        description:
          "从公式、表格、图像或文字信息中计算并解释差商。",
        successCriteria: [
          "使用输出变化量除以输入变化量",
          "保持分子与分母中的端点顺序一致",
          "在有单位时能解释结果的复合单位",
        ],
      },
      {
        title: "连接平均变化率与瞬时变化率",
        description:
          "说明区间不断缩小时，平均变化率怎样趋近一点处的瞬时变化率。",
        successCriteria: [
          "把割线斜率与非零宽度区间联系起来",
          "使用极限过程而不是直接代入零宽度",
          "把极限斜率解释为某个输入处的局部变化",
        ],
      },
    ],
    commonMisconceptions: [
      "可以把区间宽度直接设为 0 来计算瞬时变化率。",
      "平均变化率就是两个端点函数值的算术平均数。",
      "变化率为负表示输入值正在减小。",
    ],
    examples: [
      {
        id: "example-average-rate-temperature",
        title: "一段时间内的温度变化",
        description:
          "温度在 3 小时内从 18°C 升到 24°C，平均变化率为每小时 2°C。",
      },
      {
        id: "example-shrinking-secant-parabola",
        title: "割线逐渐靠近切线",
        description:
          "对 f(x)=x²，在 x=2 附近使用越来越短的区间，割线斜率趋近于 4。",
      },
    ],
  },
  "derivative-as-a-limit-and-tangent-slope": {
    title: "导数为什么既是变化率，又是切线斜率？",
    description:
      "用等价差商极限表示一点处的导数和导函数，并把导数值用于切线方程。",
    learningObjectives: [
      {
        title: "用极限表示导数",
        description: "写出并识别一点处和一般输入处的导数定义。",
        successCriteria: [
          "识别变化的输入和非零差商",
          "把趋近变量与目标位置写在正确位置",
          "根据语境区分 f'(a)、f'(x)、dy/dx 与 y'",
        ],
      },
      {
        title: "把导数连接到切线",
        description: "把 f'(a) 作为通过 (a,f(a)) 的切线斜率。",
        successCriteria: [
          "区分切线斜率与切线方程",
          "使用原函数上的正确点",
          "写出有效的点斜式方程",
        ],
      },
    ],
    commonMisconceptions: [
      "一点处的导数就是切线本身，而不是切线斜率。",
      "导数定义允许在差商中直接令 h=0。",
      "f'(a) 与 f(a) 表示同一个函数值。",
    ],
    examples: [
      {
        id: "example-derivative-definition-square",
        title: "从定义求 x² 的导数",
        description:
          "当 h 趋近于 0 时，((x+h)²-x²)/h 化简并趋近于 2x。",
      },
      {
        id: "example-tangent-line-square",
        title: "x=2 处的切线",
        description:
          "对 f(x)=x²，f(2)=4、f'(2)=4，因此切线为 y-4=4(x-2)。",
      },
    ],
  },
  "estimating-derivatives-at-a-point": {
    title: "没有公式，怎样估计某一点的导数？",
    description:
      "从邻近表格值、图像局部斜率或技术工具估计导数，并明确说明估计方法。",
    learningObjectives: [
      {
        title: "根据表格估计",
        description:
          "选择目标输入附近的数据，构造能够近似导数的差商。",
        successCriteria: [
          "使用靠近目标输入的点",
          "条件允许时优先选择目标两侧的对称数据",
          "先写出差商结构，再给出估计值",
        ],
      },
      {
        title: "根据图像估计",
        description:
          "用具有代表性的切线估计线上的升高量与水平变化量估计斜率。",
        successCriteria: [
          "使用切线估计线上的点，而不是任意曲线点",
          "正确判断斜率的正负与陡峭程度",
          "没有精确信息时明确标注结果是估计值",
        ],
      },
    ],
    commonMisconceptions: [
      "表格中任意两个点都能给出同样好的导数估计。",
      "一点处的导数就是该点的 y 坐标。",
      "图像递增就表示导数一定等于 1。",
    ],
    examples: [
      {
        id: "example-centered-difference-table",
        title: "用表格做中心差分",
        description:
          "用 x=1.9 和 x=2.1 的函数值，通过以 2 为中心的割线估计 f'(2)。",
      },
      {
        id: "example-graph-negative-slope",
        title: "估计负斜率",
        description:
          "一条切线向右移动 2 个单位时下降约 3 个单位，斜率约为 -1.5。",
      },
    ],
  },
  "differentiability-and-continuity": {
    title: "图像连得上，为什么还可能不可导？",
    description:
      "说明一点处可导必然连续，并识别连续但不存在有限导数的图像特征。",
    learningObjectives: [
      {
        title: "正确使用可导推出连续",
        description:
          "从可导推导连续，同时避免把这个逻辑关系反向使用。",
        successCriteria: [
          "准确陈述可导蕴含连续",
          "用不连续直接排除可导",
          "不把连续当作可导的充分条件",
        ],
      },
      {
        title: "诊断不可导行为",
        description:
          "根据单侧差商行为识别尖角、尖点、垂直切线和间断。",
        successCriteria: [
          "比较左右两侧的导数行为",
          "区分不相等的有限斜率与无界斜率",
          "把图像特征与有限导数不存在联系起来",
        ],
      },
    ],
    commonMisconceptions: [
      "每个连续函数都可导。",
      "垂直切线的导数为 0，因为直线没有水平移动。",
      "尖角两侧的斜率分别存在，所以尖角处可导。",
    ],
    examples: [
      {
        id: "example-absolute-value-corner",
        title: "连续的尖角",
        description:
          "|x| 在 0 处连续，但左右斜率分别为 -1 和 1。",
      },
      {
        id: "example-cube-root-vertical-tangent",
        title: "垂直切线",
        description:
          "立方根函数在 0 处连续，但切线斜率变得无界。",
      },
    ],
  },
  "power-rule": {
    title: "幂函数为什么都能用同一条求导规则？",
    description:
      "高效求 x 的幂函数的导数，并把系数与指数变化连接回导数定义。",
    learningObjectives: [
      {
        title: "使用幂法则",
        description:
          "在原函数和导数有定义的位置使用 d/dx(x^r)=r x^(r-1)。",
        successCriteria: [
          "把原指数移到系数位置",
          "把指数减 1",
          "处理零、负数和分数指数时检查定义域",
        ],
      },
      {
        title: "用定义检验法则",
        description:
          "用差商或局部斜率检查简单幂函数的求导结果。",
        successCriteria: [
          "构造正确差商",
          "先化简再取极限",
          "检查所得斜率行为是否合理",
        ],
      },
    ],
    commonMisconceptions: [
      "幂法则只把指数减 1，不需要把原指数变成系数。",
      "x 没有显式写指数，所以它的导数为 0。",
      "分数幂和负数幂使用幂法则时没有定义域限制。",
    ],
    examples: [
      {
        id: "example-power-rule-polynomial-term",
        title: "正整数次幂",
        description: "x^5 的导数为 5x^4。",
      },
      {
        id: "example-power-rule-negative-power",
        title: "倒数幂",
        description:
          "把 1/x² 写成 x^-2，可得导数 -2x^-3，且 x≠0。",
      },
    ],
  },
  "linearity-rules-for-derivatives": {
    title: "多项式为什么可以逐项求导？",
    description:
      "逐项求常数和线性组合的导数，同时保留系数与减号结构。",
    learningObjectives: [
      {
        title: "求线性组合的导数",
        description:
          "把常数、和、差与常数倍法则用于常见函数。",
        successCriteria: [
          "常数的导数为 0",
          "保留常数倍系数",
          "对每个加减项正确求导并保留符号",
        ],
      },
      {
        title: "高效求多项式导数",
        description:
          "结合幂法则和线性法则，得到化简后的多项式导数。",
        successCriteria: [
          "把表达式识别为若干幂函数的线性组合",
          "对每个非常数项使用幂法则",
          "检查导数次数是否与原多项式关系合理",
        ],
      },
    ],
    commonMisconceptions: [
      "常数项的导数仍然是该常数。",
      "f+g 的导数需要使用乘积法则。",
      "求导后可以丢掉某一项前面的负号。",
    ],
    examples: [
      {
        id: "example-linearity-polynomial",
        title: "求多项式导数",
        description: "3x^4-2x+7 的导数为 12x^3-2。",
      },
      {
        id: "example-linearity-function-values",
        title: "组合导数值",
        description:
          "若 f'(a)=2、g'(a)=-1，则 (3f-4g)'(a)=10。",
      },
    ],
  },
  "basic-transcendental-derivatives": {
    title: "sin、cos、e^x 和 ln x 的导数怎样记得住？",
    description:
      "求 sin x、cos x、e^x 与 ln x 的导数，并识别表示这些已知导数值的极限。",
    learningObjectives: [
      {
        title: "使用常见函数求导法则",
        description:
          "在有效定义域内求 sin x、cos x、e^x 和 ln x 的导数。",
        successCriteria: [
          "sin x 的导数写成 cos x",
          "cos x 的导数保留负号",
          "指数与对数函数分别正确使用 e^x 与 1/x",
        ],
      },
      {
        title: "识别导数定义型极限",
        description:
          "把合适的极限解释为某个常见函数在一点处的导数。",
        successCriteria: [
          "把分子匹配到 f(a+h)-f(a)",
          "识别函数 f 与基准点 a",
          "用已知导数值计算极限",
        ],
      },
    ],
    commonMisconceptions: [
      "cos x 的导数是没有负号的 sin x。",
      "ln x 的导数仍然是 ln x。",
      "以角度制输入时，标准三角求导公式完全不变。",
    ],
    examples: [
      {
        id: "example-basic-transcendental-linear-combination",
        title: "混合常见函数求导",
        description:
          "2sin x-3e^x+ln x 的导数为 2cos x-3e^x+1/x。",
      },
      {
        id: "example-sine-derivative-limit",
        title: "表示导数值的极限",
        description:
          "h→0 时 sin(h)/h 是 sin x 在 x=0 处的导数，因此等于 1。",
      },
    ],
  },
  "product-rule": {
    title: "两个量同时变化，乘积会怎样变化？",
    description:
      "把乘积的变化分解为两个贡献：每次对一个因子求导，同时保留另一个因子。",
    learningObjectives: [
      {
        title: "使用乘积法则",
        description:
          "根据公式或表格数据使用 (fg)'=f'g+fg'。",
        successCriteria: [
          "每一项都保留一个未求导因子",
          "完整写出两个乘积法则项",
          "把函数值和导数值代入正确位置",
        ],
      },
      {
        title: "判断何时需要乘积法则",
        description:
          "区分两个变化函数的乘积、常数倍以及适合先化简的表达式。",
        successCriteria: [
          "识别两个依赖变量的因子",
          "一个因子为常数时使用常数倍法则",
          "检查展开是否提供等价且更简单的路径",
        ],
      },
    ],
    commonMisconceptions: [
      "乘积的导数等于两个导数的乘积。",
      "乘积法则的两项都应该对第一个因子求导。",
      "只要看到乘号就必须使用乘积法则，包括乘以常数。",
    ],
    examples: [
      {
        id: "example-product-polynomial-exponential",
        title: "多项式乘指数函数",
        description:
          "对 h(x)=x²e^x，有 h'(x)=2xe^x+x²e^x。",
      },
      {
        id: "example-product-rule-table",
        title: "使用表格中的函数数据",
        description:
          "知道同一点处的 f、g、f'、g' 值，不需要公式也能求 (fg)'。",
      },
    ],
  },
  "quotient-rule": {
    title: "分子和分母都在变，比值怎样求导？",
    description:
      "按固定次序构造分子之差，并除以原分母的平方来求商的导数。",
    learningObjectives: [
      {
        title: "使用商法则",
        description:
          "在原分母不为 0 时使用 (f/g)'=(f'g-fg')/g²。",
        successCriteria: [
          "保持分子次序 f'g-fg'",
          "平方原来的分母函数",
          "说明或保留原商函数定义域中排除的点",
        ],
      },
      {
        title: "在商法则与化简之间选择",
        description:
          "判断何时可把商改写为幂或先做有效代数化简。",
        successCriteria: [
          "求导前先识别分子和分母",
          "只在相关定义域内等价时才改写为幂",
          "用符号或简单函数值检查结果是否合理",
        ],
      },
    ],
    commonMisconceptions: [
      "商的导数等于两个导数的商。",
      "商法则分子的顺序可以颠倒且结果不变。",
      "分母应该先求导再平方。",
    ],
    examples: [
      {
        id: "example-quotient-sine-polynomial",
        title: "三角函数分子除以多项式",
        description:
          "对 q(x)=sin x/x²，q'(x)=(x²cos x-2x sin x)/x^4，且 x≠0。",
      },
      {
        id: "example-quotient-table",
        title: "根据表格求商的导数",
        description:
          "只要 g(a)≠0，一点处的 f、g、f'、g' 值就能确定 (f/g)'(a)。",
      },
    ],
  },
  "remaining-trigonometric-derivatives": {
    title: "不再死背：从恒等式重建四个三角导数",
    description:
      "使用商与倒数恒等式推导并应用其余三角函数的求导公式。",
    learningObjectives: [
      {
        title: "从恒等式推导三角函数求导法则",
        description:
          "用 tan x=sin x/cos x 和倒数恒等式说明求导公式。",
        successCriteria: [
          "对等价恒等式正确使用商法则或乘积法则",
          "使用有效的勾股恒等式或倒数恒等式化简",
          "保留余切和余割求导公式中的负号",
        ],
      },
      {
        title: "应用其余三角函数求导法则",
        description:
          "求 tan、cot、sec、csc 项及其线性组合的导数。",
        successCriteria: [
          "tan x 的导数使用 sec²x",
          "cot x 的导数使用 -csc²x",
          "保留 sec x tan x 与 -csc x cot x 的成对因子",
        ],
      },
    ],
    commonMisconceptions: [
      "正切和余切的导数具有相同的正负号。",
      "sec x 的导数只有 tan x，不需要 sec x 因子。",
      "在原三角函数无定义的位置，求导恒等式仍然有效。",
    ],
    examples: [
      {
        id: "example-derive-tangent-rule",
        title: "推导正切求导公式",
        description:
          "对 sin x/cos x 使用商法则，得到 (cos²x+sin²x)/cos²x=sec²x。",
      },
      {
        id: "example-remaining-trig-linear-combination",
        title: "混合三角函数求导",
        description:
          "2tan x-3csc x 的导数为 2sec²x+3csc x cot x。",
      },
    ],
  },
};
