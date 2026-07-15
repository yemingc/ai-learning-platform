import type { LessonContent } from "@/features/lessons/types";
import { completeApCalculusZhLessonLocalizations } from "./adaptive-lesson-localization.ts";

const unit2ZhLessonDrafts: Record<string, Partial<LessonContent>> = {
  "average-and-instantaneous-rates-of-change": {
    title: "一段时间的平均速度，怎样变成某一刻的速度？",
    objective: {
      title: "把差商解释为变化率",
      description:
        "计算平均变化率，并说明平均变化率的极限怎样定义瞬时变化率。",
      successCriteria: [
        "保持端点顺序一致地构造差商。",
        "在具体情境中解释正负号和单位。",
        "说明瞬时变化率为什么使用极限，而不是直接计算零宽度差商。",
      ],
    },
    hook:
      "外卖骑手十分钟骑了多远，可以算出平均速度；车把上的速度表却在回答“现在这一刻有多快”。微积分要做的，就是在不把时间间隔硬设为零的前提下，连接这两个问题。",
    intuition:
      "平均变化率就是割线斜率：它比较水平距离非零的两个点。要描述某一瞬间，就固定一个端点，让另一个端点不断靠近。如果割线斜率稳定地趋近同一个数，这个极限就是固定点处的局部变化率。",
    formalExplanation:
      "对 a≠b，f 在 [a,b] 上的平均变化率是 (f(b)-f(a))/(b-a)。等价地，在 [a,a+h] 上且 h≠0 时，差商为 (f(a+h)-f(a))/h。若极限存在，a 处的瞬时变化率就是 b→a 或 h→0 时这些差商的极限。计算过程中区间宽度始终非零；0 是趋近目标，不是直接使用的分母。",
    prerequisiteConnections: [
      {
        conceptId: "evaluating-limits-with-limit-laws",
        title: "用极限法则计算极限",
        connection:
          "通过代数化简和极限法则，可以看出差商最终趋近的值。",
      },
    ],
    workedExamples: [
      {
        title: "让 x=2 附近的割线不断缩短",
        setup:
          "对 f(x)=x²，先求区间 [2,2+h] 上的平均变化率，再求 h→0 时的极限。",
        walkthrough: [
          "写出差商：((2+h)²-2²)/h。",
          "展开分子，得到 (4+4h+h²-4)/h。",
          "当 h≠0 时化简为 4+h。",
          "h→0 时 4+h→4，所以 x=2 处的瞬时变化率为 4。",
        ],
        takeaway:
          "计算中的区间宽度从不等于 0，而是由非零值不断趋近于 0。",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "若距离单位是米、时间单位是秒，平均变化率应使用什么单位？",
        hint: "按“输出变化量除以输入变化量”读取差商。",
        targetInsight: "变化率的单位是米/秒。",
      },
      {
        prompt:
          "h 趋近于 0 时，为什么仍可以在差商中约去因子 h？",
        hint: "极限考察的是 0 附近的 h，而不是 h=0 本身。",
        targetInsight:
          "取极限前使用的每个差商都满足 h≠0，所以在去心邻域中约分有效。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "平均变化率就是两个端点函数值的平均数。",
        checkPrompt:
          "(f(a)+f(b))/2 能表示每单位输入对应多少输出变化吗？",
        correction:
          "不能。平均变化率是 Δ输出/Δ输入，不是输出值的算术平均数。",
      },
      {
        misconception: "直接在差商中令 h=0 就能得到瞬时变化率。",
        checkPrompt: "若 h=0，分母会怎样？",
        correction:
          "差商会变成无定义。瞬时变化率来自非零 h 趋近于 0 的极限。",
      },
    ],
    reflectionPrompt: {
      prompt: "一串割线斜率怎样为某个瞬时变化率提供证据？",
      sentenceStarter:
        "随着区间缩小，割线斜率 ____；如果它们趋近 ____，那么 ____。",
    },
    applicationPrompt: {
      title: "估计蓄水池此刻的水位变化",
      prompt:
        "监测表给出 4.9、5.0、5.1 分钟时的水位。估计 5.0 分钟这一刻水位变化得多快，并说明结果的单位和正负号。",
      whyItTransfers:
        "任务从公式转到数值情境，但仍使用同一个差商结构。",
    },
    keyTakeaways: [
      "平均变化率是非零区间上的割线斜率。",
      "瞬时变化率是区间不断缩小时平均变化率的极限。",
      "变化率单位等于输出单位除以输入单位。",
    ],
  },
  "derivative-as-a-limit-and-tangent-slope": {
    title: "导数为什么既是变化率，又是切线斜率？",
    objective: {
      title: "表示并使用导数定义",
      description:
        "写出导数极限、解释导数记号，并把导数值作为切线斜率。",
      successCriteria: [
        "识别导数定义在一点处的两种等价形式。",
        "区分导函数和导函数在一点处的值。",
        "使用 f'(a) 作为斜率，通过正确点写出切线方程。",
      ],
    },
    hook:
      "“这一刻变化得多快”和“图像在这里有多陡”听起来是两个问题。导数定义会告诉你：它们最后算出的其实是同一个数。",
    intuition:
      "切线可以理解为通过固定点和附近点的割线所趋近的位置。导数不是切线本身，而是附近点不断靠近时留下来的斜率值。让基准点变化，就得到一个新的函数 f'。",
    formalExplanation:
      "若极限存在，则 f'(a)=lim h→0 (f(a+h)-f(a))/h；等价地，f'(a)=lim x→a (f(x)-f(a))/(x-a)。导函数为 f'(x)=lim h→0 (f(x+h)-f(x))/h。若 y=f(x)，常用记号包括 f'(x)、y' 与 dy/dx。在 x=a 处，f'(a) 是切线斜率，因此切线可写为 y-f(a)=f'(a)(x-a)。",
    prerequisiteConnections: [
      {
        conceptId: "average-and-instantaneous-rates-of-change",
        title: "平均变化率与瞬时变化率",
        connection: "导数定义对平均变化率差商取极限。",
      },
      {
        conceptId: "limit-notation",
        title: "极限记号",
        connection:
          "只有准确读出趋近变量和目标位置，才能识别有效的导数极限。",
      },
    ],
    workedExamples: [
      {
        title: "由定义求导数值与切线",
        setup: "对 f(x)=x²，用 h 形式求 f'(3)，再写出 x=3 处的切线。",
        walkthrough: [
          "写 f'(3)=lim h→0 ((3+h)²-9)/h。",
          "展开并在 h≠0 时化简为 6+h。",
          "取极限得 f'(3)=6。",
          "使用点 (3,9)，得到 y-9=6(x-3)。",
        ],
        takeaway: "导数值提供斜率，原函数提供切线经过的点。",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "lim x→4 (f(x)-f(4))/(x-4) 表示哪个导数值？",
        hint: "观察 f(4) 与分母中的固定输入。",
        targetInsight: "若极限存在，它表示 f'(4)。",
      },
      {
        prompt:
          "若 f'(2)=-3 且 f(2)=5，切线方程中应使用哪些信息？",
        hint: "使用斜率 -3 和点 (2,5)。",
        targetInsight: "切线为 y-5=-3(x-2)。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "一点处的导数就是切线。",
        checkPrompt:
          "单独一个数 f'(a) 能同时给出一条直线所需的斜率和点吗？",
        correction:
          "不能。f'(a) 只是斜率，切线还需要原函数上的点 (a,f(a))。",
      },
      {
        misconception:
          "只要分子含有 f(x)-f(a)，这个商的极限就是导数定义。",
        checkPrompt:
          "f(x)-f(a) 必须搭配什么分母和什么趋近目标？",
        correction:
          "分母必须是 x-a，极限必须令 x→a，或使用等价的 h 形式。",
      },
    ],
    reflectionPrompt: {
      prompt: "导数定义、瞬时变化率和切线斜率怎样相互连接？",
      sentenceStarter:
        "差商测量 ____；它的极限是 ____，也就是 ____。",
    },
    applicationPrompt: {
      title: "看穿一道没有写“导数”的题",
      prompt:
        "识别 lim h→0 ((1+h)^5-1)/h 对应的函数和基准点，再用相应导数值计算极限。",
      whyItTransfers:
        "AP 题目经常给出一个极限，却不直接说明它是导数。",
    },
    keyTakeaways: [
      "导数由差商的极限定义。",
      "f'(a) 是 x=a 处的瞬时变化率与切线斜率。",
      "切线方程同时需要 f'(a) 和点 (a,f(a))。",
    ],
  },
  "estimating-derivatives-at-a-point": {
    title: "没有公式，怎样估计某一点的导数？",
    objective: {
      title: "根据表格与图像估计导数",
      description:
        "选择邻近证据、写出差商，并给出合理的导数估计。",
      successCriteria: [
        "使用靠近目标输入的表格数据。",
        "有条件时优先使用目标两侧的中心估计。",
        "把图像上的升高量/水平变化量连接到局部切线斜率。",
      ],
    },
    hook:
      "空气质量监测、体温记录或骑行速度表通常只给出一串数据，不会附送一个漂亮公式。没有公式时，我们仍能借助目标点附近的数据估计变化速度。",
    intuition:
      "导数估计要让所选割线尽可能代表切线。靠近目标的点会缩小区间；分布在目标两侧的点能让估计居中，而不是偏向左侧或右侧。",
    formalExplanation:
      "若有对称数据，可用 (f(a+h)-f(a-h))/(2h) 估计 f'(a)；否则使用邻近的单侧差商。根据图像估计时，先画出或判断目标点处的切线，再用切线估计线上的两个点计算升高量/水平变化量。技术工具能计算数值导数，但结果仍依赖局部尺度和近似方法。",
    prerequisiteConnections: [
      {
        conceptId: "average-and-instantaneous-rates-of-change",
        title: "平均变化率与瞬时变化率",
        connection: "小区间上的割线斜率是切线斜率的可观察近似。",
      },
    ],
    workedExamples: [
      {
        title: "用中心差分估计",
        setup:
          "表格给出 f(1.9)=3.61、f(2.1)=4.41，估计 f'(2)。",
        walkthrough: [
          "选择位于 2 两侧且距离相等的数据。",
          "写中心差商 (4.41-3.61)/(2.1-1.9)。",
          "计算 0.80/0.20=4。",
          "报告 f'(2)≈4，并说明这是数值估计。",
        ],
        takeaway: "中心割线通常能平衡目标两侧的局部行为。",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "估计 f'(5) 时，4.9 和 5.1 处的值通常是否比 1 和 9 处的值更有用？",
        hint: "比较两条割线与 x=5 的局部程度。",
        targetInsight:
          "通常是；邻近且居中的数据更能代表目标点处的切线行为。",
      },
      {
        prompt:
          "根据图像估计时，为什么升高量/水平变化量应使用切线估计线上的点，而不是曲线上的任意点？",
        hint: "曲线本身没有一个处处相同的斜率。",
        targetInsight:
          "目标导数是切线斜率；任意曲线点定义的是另一条割线。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "任意两个数据点都能给出同样好的导数估计。",
        checkPrompt: "若点离目标很远，或都位于目标同一侧，会怎样？",
        correction:
          "割线可能反映非局部行为或单侧偏差。更近、更平衡的数据通常更可靠。",
      },
      {
        misconception: "导数就是图像上读到的 y 值。",
        checkPrompt: "两条曲线能否经过同一点，却具有不同陡峭程度？",
        correction: "可以。导数测量斜率，而不是高度。",
      },
    ],
    reflectionPrompt: {
      prompt: "什么让一个数值导数估计比另一个更有说服力？",
      sentenceStarter:
        "更强的估计使用 ____ 的点，并尽量位于 ____，因为 ____。",
    },
    applicationPrompt: {
      title: "替一组监测数据挑选更可信的估计",
      prompt:
        "一组传感器数据在 x=3 附近的采样间隔并不相等。用两组邻近数据分别估计导数，再判断哪一个更可信并说明理由。",
      whyItTransfers:
        "任务要求评价证据质量，而不是机械使用最先看到的两个数据。",
    },
    keyTakeaways: [
      "导数估计来自局部割线或切线证据。",
      "靠近目标且分布在两侧的数据通常支持更好的中心估计。",
      "数值或图像结果应标明并说明它是估计值。",
    ],
  },
  "differentiability-and-continuity": {
    title: "图像连得上，为什么还可能不可导？",
    objective: {
      title: "判断导数何处存在",
      description:
        "使用连续性和单侧斜率行为区分可导点与不可导点。",
      successCriteria: [
        "由可导推出连续，而不反向推理。",
        "在间断点直接排除可导。",
        "根据导数行为识别尖角、尖点和垂直切线。",
      ],
    },
    hook:
      "一条山路可以全程没有断口，却在某处突然急转弯。连续性只保证“路接得上”；可导性还要求车辆经过这一点时，有一个明确而有限的前进方向。",
    intuition:
      "要让有限切线斜率稳定下来，图像必须先在该点连接，因此可导必然连续。但连续图像也可能从两侧以不同方向到达，或变得无限陡峭，于是点虽然连着，却不可导。",
    formalExplanation:
      "若 f 在 x=c 处可导，则 f 在 c 处连续；反命题不成立。间断一定会阻止可导。即使连续，导数仍可能因为左右差商极限不相等、垂直切线处斜率无界，或尖点两侧向相反无穷方向变化而不存在。结论应指出具体行为，而不只说“图像不光滑”。",
    prerequisiteConnections: [
      {
        conceptId: "derivative-as-a-limit-and-tangent-slope",
        title: "作为极限的导数",
        connection: "可导性要求差商极限存在并且是同一个有限值。",
      },
      {
        conceptId: "continuity-at-a-point",
        title: "一点处的连续性",
        connection: "函数值缺失或与极限不一致时，可导性立即失败。",
      },
      {
        conceptId: "one-sided-limits",
        title: "单侧极限",
        connection: "左右两侧斜率行为必须一致，有限导数才存在。",
      },
    ],
    workedExamples: [
      {
        title: "判断 |x| 的尖角",
        setup: "判断 f(x)=|x| 在 x=0 处是否连续、是否可导。",
        walkthrough: [
          "函数值 f(0)=0 存在。",
          "图像左右两侧都趋近 0，所以 f 在 0 处连续。",
          "左侧差商极限为 -1，右侧差商极限为 1。",
          "两个单侧导数不相等，因此 f 在 0 处不可导。",
        ],
        takeaway: "尖角不破坏连续性，但它不具有唯一切线斜率。",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "图像在 x=2 处发生跳跃时，还需要计算差商才能判断是否可导吗？",
        hint: "使用“可导推出连续”。",
        targetInsight: "不需要。不连续已经足以排除可导。",
      },
      {
        prompt: "为什么垂直切线不给出普通的有限导数？",
        hint: "思考水平距离趋近于 0 时的升高量/水平变化量。",
        targetInsight: "斜率变得无界，而不是趋近一个有限实数。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "每个连续函数都可导。",
        checkPrompt: "|x| 在 0 处连续吗？它的左右斜率相等吗？",
        correction:
          "|x| 在 0 处连续，但左右斜率为 -1 和 1，所以连续不是可导的充分条件。",
      },
      {
        misconception: "垂直切线的导数为 0。",
        checkPrompt: "垂直直线的斜率是 0，还是升高量/水平变化量无定义？",
        correction: "垂直切线的斜率无界或无定义，不是 0。",
      },
    ],
    reflectionPrompt: {
      prompt: "分别说明可导与连续两个方向的逻辑关系。",
      sentenceStarter:
        "如果函数可导，那么 ____；但如果只知道它连续，____。",
    },
    applicationPrompt: {
      title: "给五种道路形状做“可通行性检查”",
      prompt:
        "把光滑点、可去空点、跳跃、尖角和垂直切线看成五种道路形状，逐一判断图像是否连续、是否可导，并用左右行为说明理由。",
      whyItTransfers:
        "比较任务要求使用通用判断框架，而不是只识别一个熟悉图像。",
    },
    keyTakeaways: [
      "一点处可导必然意味着该点连续。",
      "只有连续不能保证可导。",
      "间断、尖角、尖点和垂直切线都会阻止有限导数存在。",
    ],
  },
  "power-rule": {
    title: "幂函数为什么都能用同一条求导规则？",
    objective: {
      title: "准确求幂函数的导数",
      description:
        "使用 d/dx(x^r)=r x^(r-1)，同时检查定义域和斜率行为。",
      successCriteria: [
        "把原指数变成系数。",
        "指数减 1 时不丢失正负号。",
        "保留负数幂和分数幂的定义域限制。",
      ],
    },
    hook:
      "如果每遇到 x²、x⁵ 或 x^-2 都从差商重新展开，求导会变成重复劳动。幂法则把这些计算里反复出现的结构，压缩成一个可以检查、也可以解释的动作。",
    intuition:
      "指数越大，幂函数通常增长得越陡；求导会把指数移到前面作为缩放系数，再把剩余幂次降低 1。它同时改变系数与指数，结果仍描述局部斜率。",
    formalExplanation:
      "对实数幂 r，在相关表达式有定义的位置，d/dx(x^r)=r x^(r-1)。因此 d/dx(x)=1。负数幂和分数幂可以先把倒数或根式改写为幂，再使用法则。仍需保留原函数定义域，并注意导数在端点处可能拥有更小的定义域。",
    prerequisiteConnections: [
      {
        conceptId: "derivative-as-a-limit-and-tangent-slope",
        title: "作为极限的导数",
        connection: "幂法则是从差商规律中得到的可重复使用结果。",
      },
    ],
    workedExamples: [
      {
        title: "求倒数幂的导数",
        setup: "求 f(x)=x^-2 的导数，并说明定义域。",
        walkthrough: [
          "识别指数 r=-2。",
          "把 -2 移到系数位置。",
          "指数减 1：-2-1=-3。",
          "因此 f'(x)=-2x^-3=-2/x³，并保留 x≠0。",
        ],
        takeaway:
          "负数幂遵循同样的“指数变系数、指数减一”模式，同时保留原定义域。",
      },
    ],
    guidedQuestions: [
      {
        prompt: "f(x)=x 中隐藏的指数是多少？",
        hint: "把 x 写成 x^1。",
        targetInsight: "幂法则给出 1·x^0=1。",
      },
      {
        prompt:
          "若 f(x)=sqrt(x)=x^(1/2)，为什么 f'(x)=1/(2sqrt(x)) 在 x=0 需要额外检查？",
        hint: "检查导数表达式在 0 处是否为有限值。",
        targetInsight: "原函数在 0 有定义，但导数表达式在 0 无定义。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "幂法则只把指数减 1，所以 d/dx(x^5)=x^4。",
        checkPrompt: "哪个缩放系数反映 x^5 的变化强度？",
        correction: "原指数必须变成系数，因此导数是 5x^4。",
      },
      {
        misconception: "x 的导数为 0。",
        checkPrompt: "直线 y=x 的斜率是多少？",
        correction: "它的固定斜率为 1，与 d/dx(x^1)=1x^0=1 一致。",
      },
    ],
    reflectionPrompt: {
      prompt: "说明幂法则做出的两种变化，以及它不会替你完成的一个检查。",
      sentenceStarter:
        "法则把 ____ 移到前面并改变 ____；我仍需检查 ____。",
    },
    applicationPrompt: {
      title: "规则算完了，定义域检查还没结束",
      prompt:
        "分别求 x^(1/3)、x^(-1/2)、x^(3/2) 的导数，再比较每个原函数与导数的定义域。",
      whyItTransfers:
        "任务把程序熟练度与后续可导性分析所需的定义域推理结合起来。",
    },
    keyTakeaways: [
      "幂法则同时产生新系数和新指数。",
      "负数幂与分数幂可在有效定义域内使用幂法则。",
      "导数公式不会消除原函数的定义域限制。",
    ],
  },
  "linearity-rules-for-derivatives": {
    title: "多项式为什么可以逐项求导？",
    objective: {
      title: "使用常数与线性求导法则",
      description:
        "在保留结构的前提下，求常数、和、差、常数倍与多项式的导数。",
      successCriteria: [
        "常数求导得到 0。",
        "正确保留常数系数和减号。",
        "对多项式的每一项组合使用线性法则与幂法则。",
      ],
    },
    hook:
      "一张总账由几项收入和支出相加而成，每一项的变化会共同决定总额怎样变化。函数的和与差也一样：先看每一项贡献多少变化率，再把这些贡献按原来的符号合起来。",
    intuition:
      "两个量的和会以两个变化率之和变化；函数乘以固定倍数后，变化率也乘同样倍数。常数完全不变，因此变化率为 0。",
    formalExplanation:
      "若 f、g 可导，c 为常数，则 d/dx(c)=0，(f+g)'=f'+g'，(f-g)'=f'-g'，(cf)'=cf'。这些线性法则与幂法则结合，可以逐项求多项式导数；它们不能直接分配到两个变化函数的乘积或商上。",
    prerequisiteConnections: [
      {
        conceptId: "power-rule",
        title: "幂法则",
        connection:
          "先用幂法则处理每个非常数多项式项，再把各项导数重新组合。",
      },
    ],
    workedExamples: [
      {
        title: "带符号求多项式导数",
        setup: "求 p(x)=3x^4-2x+7 的导数。",
        walkthrough: [
          "把表达式看成 3x^4、-2x 与 7 的和。",
          "用常数倍和幂法则得到 d/dx(3x^4)=12x^3。",
          "-2x 的导数为 -2，常数 7 的导数为 0。",
          "合并得到 p'(x)=12x^3-2。",
        ],
        takeaway: "线性法则保留系数与符号，每一项各自贡献导数。",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "若 f'(2)=3、g'(2)=-1，4f-2g 在 x=2 处的导数是多少？",
        hint: "对导数值使用相同的线性组合。",
        targetInsight: "4(3)-2(-1)=14。",
      },
      {
        prompt: "为什么竖直平移会改变 f(x)，却不改变 f'(x)？",
        hint: "固定高度不会随 x 改变。",
        targetInsight: "常数平移给每个输出加同一个量，因此贡献 0 斜率。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "常数的导数仍是该常数。",
        checkPrompt: "图像 y=7 随 x 增大时会上升或下降吗？",
        correction: "不会。水平常数函数的斜率与导数均为 0。",
      },
      {
        misconception: "导数能分配到和上，也能直接分配到乘积上。",
        checkPrompt:
          "若 f(x)=g(x)=x，错误规则会给出 1，而 x² 的导数应是什么？",
        correction: "应为 2x，因此乘积需要乘积法则。",
      },
    ],
    reflectionPrompt: {
      prompt: "为什么这些规则被称为求导的线性法则？",
      sentenceStarter:
        "从函数到导数的过程中，它们保留 ____ 与 ____。",
    },
    applicationPrompt: {
      title: "同一道题，先展开还是直接求导？",
      prompt:
        "对 (2x-1)(x+3)，先展开再求导，并用后续乘积法则预览再求一次。比较结果，解释为什么展开前不能只用线性法则。",
      whyItTransfers:
        "任务通过区分代数等价与求导结构来培养方法选择能力。",
    },
    keyTakeaways: [
      "常数的导数为 0。",
      "求导保留和、差与固定常数倍。",
      "多项式求导逐项结合线性法则与幂法则。",
    ],
  },
  "basic-transcendental-derivatives": {
    title: "sin、cos、e^x 和 ln x 的导数怎样记得住？",
    objective: {
      title: "求常见非代数函数的导数",
      description:
        "使用 sin x、cos x、e^x、ln x 的导数，并识别表示导数值的极限。",
      successCriteria: [
        "对正弦和余弦使用正确函数与符号。",
        "在有效定义域内使用 e^x 与 1/x。",
        "把差商极限匹配到熟悉函数的导数值。",
      ],
    },
    hook:
      "这四个公式不该只是一张背诵表。看一眼图像的上升、下降和弯曲方式，就能解释余弦为什么带负号、e^x 为什么求导后还是自己，以及 ln x 为什么越走越平。",
    intuition:
      "求导公式反映图像的局部几何。在弧度制下，正弦斜率跟随余弦，余弦斜率跟随负正弦。自然指数函数以自身数值为增长率；自然对数靠近 0 时变化很快，输入变大后变化减慢，正好对应 1/x。",
    formalExplanation:
      "角度使用弧度制时，d/dx(sin x)=cos x，d/dx(cos x)=-sin x；同时 d/dx(e^x)=e^x，d/dx(ln x)=1/x（x>0）。这些公式可与线性法则组合。若极限具有 lim h→0 (f(a+h)-f(a))/h 的形式，可把它识别为 f'(a)。",
    prerequisiteConnections: [
      {
        conceptId: "derivative-as-a-limit-and-tangent-slope",
        title: "作为极限的导数",
        connection: "识别差商后，可以用已知导数值计算相应极限。",
      },
      {
        conceptId: "linearity-rules-for-derivatives",
        title: "线性求导法则",
        connection: "常数倍和加减把四个公式组合到更大的表达式中。",
      },
    ],
    workedExamples: [
      {
        title: "求混合常见函数的导数",
        setup: "对 f(x)=2sin x-3e^x+ln x 求 f'(x)。",
        walkthrough: [
          "2sin x 的导数为 2cos x。",
          "-3e^x 的导数为 -3e^x。",
          "ln x 的导数为 1/x，且 x>0。",
          "合并得 f'(x)=2cos x-3e^x+1/x。",
        ],
        takeaway: "通过线性法则组合熟悉求导对，同时保留符号与定义域。",
      },
    ],
    guidedQuestions: [
      {
        prompt: "lim h→0 sin(h)/h 表示哪个熟悉的导数值？",
        hint: "把 sin(h) 写成 sin(0+h)-sin(0)。",
        targetInsight: "它是 sin x 在 0 处的导数，所以等于 cos 0=1。",
      },
      {
        prompt: "为什么 x 刚大于 0 时 cos x 的导数应为负？",
        hint: "观察此时余弦函数是在上升还是下降。",
        targetInsight: "余弦正在下降，所以斜率为负，与 -sin x 一致。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "cos x 的导数是 sin x。",
        checkPrompt: "在 x=π/2 附近，余弦在上升还是下降？",
        correction: "余弦在下降，因此导数是 -sin x。",
      },
      {
        misconception: "ln x 的导数仍然是 ln x。",
        checkPrompt: "对数增长会像 e^x 一样保持相同形状和变化率吗？",
        correction: "不会。ln x 的斜率是倒数 1/x，且 x>0。",
      },
    ],
    reflectionPrompt: {
      prompt: "从图像角度解释一个求导公式中的符号或定义域特征。",
      sentenceStarter: "公式 ____ 合理，是因为原函数图像 ____。",
    },
    applicationPrompt: {
      title: "从极限外表认出熟悉的导数",
      prompt:
        "通过识别导数定义计算 lim h→0 (e^h-1)/h 与 lim x→1 (ln x-ln 1)/(x-1)，并写出每个函数和基准点。",
      whyItTransfers:
        "任务把熟悉求导公式重新连接到 Unit 2 明确要求的极限解释。",
    },
    keyTakeaways: [
      "弧度制下，(sin x)'=cos x，(cos x)'=-sin x。",
      "(e^x)'=e^x，而 (ln x)'=1/x（x>0）。",
      "匹配导数定义的极限可用已知导数值计算。",
    ],
  },
  "product-rule": {
    title: "两个量同时变化，乘积会怎样变化？",
    objective: {
      title: "求函数乘积的导数",
      description:
        "对公式和表格函数数据使用乘积法则，并判断何时需要它。",
      successCriteria: [
        "完整写出 f'g 与 fg' 两项。",
        "每一项保留一个未求导因子。",
        "区分函数乘积与常数倍。",
      ],
    },
    hook:
      "商场中庭的电子屏正在同时变宽、变高，屏幕面积会因为两个方向的变化而增加。只算其中一个方向，结果一定会少一部分；乘积法则正是把两份贡献都记下来。",
    intuition:
      "一次微小变化中，一个贡献来自第一个因子变化、第二个因子保持当前值；另一个贡献恰好相反。两个因子同时发生的微小重叠项在极限中消失，留下两个主要项。",
    formalExplanation:
      "若 f、g 可导，则 d/dx[f(x)g(x)]=f'(x)g(x)+f(x)g'(x)。法则既可用于公式，也可用于表格中的函数值与导数值。一个因子为常数时无需使用完整乘积法则；有时先展开或化简也能得到等价路径。一般而言 f'g' 不是乘积的导数。",
    prerequisiteConnections: [
      {
        conceptId: "linearity-rules-for-derivatives",
        title: "线性求导法则",
        connection: "乘积法则产生的两个贡献通过加法重新组合。",
      },
      {
        conceptId: "basic-transcendental-derivatives",
        title: "基础超越函数导数",
        connection: "乘积常包含多项式、三角、指数或对数因子。",
      },
    ],
    workedExamples: [
      {
        title: "求 x²e^x 的导数",
        setup: "令 h(x)=x²e^x，求 h'(x)。",
        walkthrough: [
          "识别 f(x)=x²、g(x)=e^x。",
          "求得 f'(x)=2x、g'(x)=e^x。",
          "使用 f'g+fg'：h'(x)=2xe^x+x²e^x。",
          "需要时可提取 e^x，写成 e^x(2x+x²)。",
        ],
        takeaway: "每一项只对一个因子求导，并保留另一个因子。",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "若 f(1)=2、f'(1)=3、g(1)=-1、g'(1)=4，(fg)'(1) 是多少？",
        hint: "使用 f'(1)g(1)+f(1)g'(1)。",
        targetInsight: "3(-1)+2(4)=5。",
      },
      {
        prompt: "为什么 d/dx[7f(x)] 使用常数倍法则，而不是乘积法则？",
        hint: "因子 7 会产生变化贡献吗？",
        targetInsight: "7 是常数，导数为 0，所以结果直接是 7f'(x)。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "(fg)'=f'g'。",
        checkPrompt:
          "若 f(x)=g(x)=x，错误法则会得到 1；这与 x² 的导数 2x 一致吗？",
        correction: "不一致。正确乘积法则是 f'g+fg'。",
      },
      {
        misconception: "乘积法则两项都对两个因子求导。",
        checkPrompt: "在 f'g+fg' 中，原函数值分别出现在哪里？",
        correction: "每一项只对一个因子求导，另一个保持原形式。",
      },
    ],
    reflectionPrompt: {
      prompt: "把乘积法则两项解释成两个独立的变化来源。",
      sentenceStarter:
        "第一项表示 ____ 变化而 ____ 保持当前值；第二项表示 ____。",
    },
    applicationPrompt: {
      title: "解释一块伸缩电子屏的面积变化",
      prompt:
        "一块长方形电子屏的长为 L(t)、宽为 W(t)。写出 A'(t)，说明两个乘积法则项各对应哪一种伸缩，并为每项附上单位。",
      whyItTransfers:
        "任务从符号法则转到具体情境，说明为什么两个贡献都不可缺少。",
    },
    keyTakeaways: [
      "乘积的导数为 f'g+fg'。",
      "乘积法则每一项恰好对一个因子求导。",
      "常数倍是更简单的特殊情况，不必使用完整乘积法则。",
    ],
  },
  "quotient-rule": {
    title: "分子和分母都在变，比值怎样求导？",
    objective: {
      title: "求函数商的导数",
      description:
        "正确处理商法则的次序、分母和定义域限制。",
      successCriteria: [
        "按固定次序写出 f'g-fg'。",
        "平方原来的分母函数。",
        "检查原分母不为 0。",
      ],
    },
    hook:
      "同样一笔总价，如果商品数量也在变化，“每件平均多少钱”就会同时受总价和数量影响。比值的变化不是把上下分别求导再相除，而要把两种影响按正确次序合在一起。",
    intuition:
      "分子增大通常让比值增大，而正分母增大通常让比值减小。商法则中的减法反映这种竞争，分母平方则重新缩放合成后的变化。",
    formalExplanation:
      "若 f、g 可导且 g(x)≠0，则 d/dx[f(x)/g(x)]=(f'(x)g(x)-f(x)g'(x))/[g(x)]²。先明确分子 f 与分母 g，再代入公式，比只记口诀更安全。能合法化简或改写为幂时可选更短路径，但任何改写都不能恢复原函数定义域中被排除的点。",
    prerequisiteConnections: [
      {
        conceptId: "product-rule",
        title: "乘积法则",
        connection:
          "商法则同样组合两个变化函数的贡献，只是额外加入分母缩放与减法。",
      },
    ],
    workedExamples: [
      {
        title: "求 sin x/x² 的导数",
        setup: "对 q(x)=sin x/x²（x≠0）求 q'(x)。",
        walkthrough: [
          "令 f(x)=sin x、g(x)=x²。",
          "得到 f'(x)=cos x、g'(x)=2x。",
          "使用商法则：q'(x)=(x²cos x-2x sin x)/x^4。",
          "需要时继续化简，但保留原定义域 x≠0。",
        ],
        takeaway: "分子次序和原分母平方都是商法则的结构组成。",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "若 f(a)=4、f'(a)=1、g(a)=2、g'(a)=3，(f/g)'(a) 是多少？",
        hint: "计算 (1·2-4·3)/2²。",
        targetInsight: "导数值为 -10/4=-5/2。",
      },
      {
        prompt: "什么时候把 1/x³ 写成 x^-3 会比商法则更简单？",
        hint: "分子是常数，而且表达式本身就是单个幂。",
        targetInsight: "幂法则直接得到 -3x^-4，同时保留 x≠0。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "(f/g)'=f'/g'。",
        checkPrompt:
          "x²/x 在 x≠0 时等于 x；导数商 2x/1 会与正确导数 1 一致吗？",
        correction: "不会。函数商需要商法则，或先做有效化简。",
      },
      {
        misconception: "分母应该先求导再平方。",
        checkPrompt: "公式分母是 [g(x)]² 还是 [g'(x)]²？",
        correction: "是原分母函数 g(x) 的平方。",
      },
    ],
    reflectionPrompt: {
      prompt: "商法则结果化简前，你会检查哪三个结构？",
      sentenceStarter:
        "我检查分子次序 ____、分母 ____，以及原定义域条件 ____。",
    },
    applicationPrompt: {
      title: "先判断结构，再选择最省力的求导路径",
      prompt:
        "分别对 (x²+1)/(x-2)、5/x³、sin x/cos x 选择合理求导路径，完成求导并保留定义域限制。",
      whyItTransfers:
        "任务要求在有理式、幂和三角形式之间选择方法。",
    },
    keyTakeaways: [
      "商法则为 (f'g-fg')/g²。",
      "分子次序决定结果符号。",
      "化简可以缩短过程，但不能消除原函数定义域限制。",
    ],
  },
  "remaining-trigonometric-derivatives": {
    title: "不再死背：从恒等式重建四个三角导数",
    objective: {
      title: "求 tan、cot、sec、csc 的导数",
      description:
        "推导并应用其余三角函数求导法则，正确处理因子、符号和定义域。",
      successCriteria: [
        "从商恒等式推导正切或余切导数。",
        "保留正割和余割导数中的成对因子。",
        "跟踪负号与无定义输入。",
      ],
    },
    hook:
      "tan、cot、sec、csc 的导数看起来又要多背四行。其实忘了也没关系：从正弦、余弦和熟悉的恒等式出发，几步就能把它们重新推出来。",
    intuition:
      "正切和余切是比值，因此导数带有商法则结构；正割和余割是倒数，因此变化率既保留倒数函数，也带上对应的正切或余切因子。忘记公式时重新推导，比猜符号更可靠。",
    formalExplanation:
      "在原函数有定义的位置，d/dx(tan x)=sec²x，d/dx(cot x)=-csc²x，d/dx(sec x)=sec x tan x，d/dx(csc x)=-csc x cot x。例如对 tan x=sin x/cos x 使用商法则，得到 (cos²x+sin²x)/cos²x=sec²x。余切和余割公式带负号，且所有公式使用弧度制。",
    prerequisiteConnections: [
      {
        conceptId: "quotient-rule",
        title: "商法则",
        connection:
          "正切和余切公式可分别从 sin x/cos x 与 cos x/sin x 推导。",
      },
      {
        conceptId: "basic-transcendental-derivatives",
        title: "基础三角函数导数",
        connection:
          "推导从 (sin x)'=cos x、(cos x)'=-sin x 开始。",
      },
    ],
    workedExamples: [
      {
        title: "推导正切求导公式",
        setup: "使用 tan x=sin x/cos x 求 d/dx(tan x)。",
        walkthrough: [
          "识别 f(x)=sin x、g(x)=cos x。",
          "使用商法则：(cos x·cos x-sin x·(-sin x))/cos²x。",
          "分子合并为 cos²x+sin²x=1。",
          "结果为 1/cos²x=sec²x，且 cos x≠0。",
        ],
        takeaway: "商法则与勾股恒等式同时说明公式和定义域。",
      },
    ],
    guidedQuestions: [
      {
        prompt: "2tan x-3csc x 的导数是什么？",
        hint: "使用 (tan x)'=sec²x、(csc x)'=-csc x cot x。",
        targetInsight: "导数为 2sec²x+3csc x cot x。",
      },
      {
        prompt:
          "忘记 (cot x)' 的符号时，怎样用 cot x=cos x/sin x 恢复？",
        hint: "使用商法则并化简分子。",
        targetInsight:
          "分子变成 -sin²x-cos²x=-1，因此结果为 -csc²x。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "正切和余切的求导公式都为正。",
        checkPrompt:
          "对 cot x=cos x/sin x 求导时，余弦的导数带什么符号？",
        correction:
          "负的余弦导数贡献会得到 (cot x)'=-csc²x。",
      },
      {
        misconception: "sec x 的导数只有 tan x。",
        checkPrompt: "对倒数 1/cos x 求导时，倒数因子会消失吗？",
        correction: "不会。结果为 sec x tan x，两个因子都要保留。",
      },
    ],
    reflectionPrompt: {
      prompt: "四个公式中哪两个带负号？如何用恒等式恢复它们？",
      sentenceStarter:
        "带负号的是 ____ 与 ____；我可以通过 ____ 重新推导。",
    },
    applicationPrompt: {
      title: "重建并审查求导表",
      prompt:
        "为 tan、cot、sec、csc 制作四行求导表，每行写出恒等式推导线索、导数、符号与一个定义域提醒。",
      whyItTransfers:
        "这张表把死记硬背变成可恢复的过程，并突出 AP 题目常考的差异。",
    },
    keyTakeaways: [
      "(tan x)'=sec²x，(cot x)'=-csc²x。",
      "(sec x)'=sec x tan x，(csc x)'=-csc x cot x。",
      "商与倒数恒等式能帮助恢复遗忘的公式及其符号。",
    ],
  },
};

export const unit2ZhLessons =
  completeApCalculusZhLessonLocalizations(unit2ZhLessonDrafts);
