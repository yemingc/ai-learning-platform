import type { LessonContent } from "@/features/lessons/types";
import { completeApCalculusZhLessonLocalizations } from "./adaptive-lesson-localization.ts";

const unit1ExtensionZhLessonDrafts: Record<
  string,
  Partial<LessonContent>
> = {
  "evaluating-limits-with-limit-laws": {
    conceptId: "evaluating-limits-with-limit-laws",
    title: "什么时候可以直接代入？",
    objective: {
      title: "有依据地组合已知极限",
      description:
        "先判断函数结构是否允许直接代入，再用极限法则组合已知结果；遇到分母趋近 0 或 0/0 时及时停下来继续分析。",
      successCriteria: [
        "能选择正确的和、积、商、幂或常数倍法则。",
        "只有在连续性支持时才直接代入。",
        "把 0/0 当成需要继续分析的信号，而不是最终值。",
      ],
    },
    hook:
      "一道极限题如果每次都重新画图、列一长串数据，会很低效。只要各部分的趋势可靠，极限法则就能像拼积木一样把结果组合起来；关键是先检查这块积木能不能用。",
    intuition:
      "如果 x 靠近同一个目标时 f(x) 靠近 3、g(x) 靠近 4，那么 f(x) + 2g(x) 就会靠近 3 + 2(4) = 11。附近函数值的代数结构预示极限的代数结构，但除法还要保证分母不会趋近于 0。",
    formalExplanation:
      "若 x 趋近于 c 时 f(x) → L、g(x) → M，那么 f+g、f-g、kf、fg 与整数幂的极限可对 L、M 做相同运算。商法则要求 M ≠ 0。多项式处处连续；有理函数在分母不为 0 处连续，因此这些位置可直接代入。如果直接代入得到 0/0，它只是提醒我们当前形式无法决定极限，0/0 不是极限值。",
    prerequisiteConnections: [
      {
        conceptId: "limit-notation",
        title: "极限符号",
        connection: "组合极限前必须准确读出趋近输入和被趋近的输出。",
      },
      {
        conceptId: "one-sided-limits",
        title: "单侧极限",
        connection: "相关单侧极限都存在时，相同法则也可用于方向性极限。",
      },
    ],
    workedExamples: [
      {
        title: "组合两个已知的附近行为",
        setup:
          "当 x 趋近于 2 时，已知 f(x) → 3、g(x) → 4，求 f(x) + 2g(x) 的极限。",
        walkthrough: [
          "用和法则把两个部分分开。",
          "对 2g(x) 使用常数倍法则。",
          "把分量极限替换为 3 和 4。",
          "计算 3 + 2(4) = 11。",
        ],
        takeaway: "有效代数组合的结构会被极限法则保留下来。",
      },
    ],
    guidedQuestions: [
      {
        prompt: "如果商的分母趋近于 5，商法则的哪个条件已经得到检查？",
        hint: "判断分母所趋近的值是否为 0。",
        targetInsight: "分母极限不为 0，因此可以使用商法则。",
      },
      {
        prompt: "直接代入得到 0/0 时，为什么不能说极限是 0？",
        hint: "0/0 不是一个有定义的商。",
        targetInsight:
          "0/0 是不定式，单凭这个结果无法判断附近行为，还需要化简或换一种方法。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "所有极限都能直接代入。",
        checkPrompt: "代入让有理式分母变成 0 时会发生什么？",
        correction: "直接代入依赖连续性；分母为 0 表明还要继续分析。",
      },
      {
        misconception: "0/0 表示极限为 0 或不存在。",
        checkPrompt: "两个因子能否在附近的 x 上约掉，而只在目标点同时为 0？",
        correction: "可以。附近表达式可能化简成具有有限极限的函数。",
      },
    ],
    reflectionPrompt: {
      prompt: "怎样判断极限法则已经解决问题，还是只完成了第一步？",
      sentenceStarter: "当 ____ 时极限法则可以直接完成；当 ____ 时还要继续。",
    },
    applicationPrompt: {
      title: "审查直接代入策略",
      prompt:
        "分别说明多项式、分母代入后非零的有理函数、以及产生 0/0 的有理式，哪些可以立即计算以及理由。",
      whyItTransfers: "AP 极限题重视先选择有依据的方法，再进行代数运算。",
    },
    keyTakeaways: [
      "极限法则通过有效代数运算组合已知的附近行为。",
      "直接代入来自连续性，不是万能技巧。",
      "0/0 是需要进一步分析的不定式。",
    ],
  },
  "squeeze-theorem": {
    conceptId: "squeeze-theorem",
    title: "函数振荡不停，极限还能存在吗？",
    objective: {
      title: "用相同极限的上下界确定困难极限",
      description: "把函数夹在趋近于同一个值的上下界之间，从而确定其极限。",
      successCriteria: [
        "找出在目标输入附近成立的不等式。",
        "验证上下界函数趋近于同一个值。",
        "只得出中间函数的极限，不混淆目标点函数值。",
      ],
    },
    hook:
      "手机信号曲线可能上下抖动得很厉害，但如果抖动范围越来越窄，最终趋势仍然可以判断。夹逼定理不追每一次振荡，只盯住它无法越过的上下边界。",
    intuition:
      "想象一个点被限制在逐渐变窄的走廊中。如果地板和天花板都靠近高度 0，中间的点就无处可逃。x²sin(1/x) 的正弦因子不断振荡，但 x² 把振幅压在 -x² 与 x² 之间。",
    formalExplanation:
      "若在 c 附近有 g(x) ≤ f(x) ≤ h(x)，且 x 趋近于 c 时 g(x) 与 h(x) 都趋近于 L，则 f(x) 也趋近于 L。不等式只需在 c 的去心邻域（deleted neighborhood）中成立，c 点本身的函数值与极限结论无关。",
    prerequisiteConnections: [
      {
        conceptId: "evaluating-limits-with-limit-laws",
        title: "用极限法则计算极限",
        connection: "极限法则能快速验证上下界函数的极限。",
      },
      {
        conceptId: "what-is-a-limit",
        title: "极限看的是附近行为",
        connection: "夹逼定理只使用附近行为，不要求目标点函数值存在。",
      },
    ],
    workedExamples: [
      {
        title: "压缩不断振荡的函数",
        setup:
          "已知 -1 ≤ sin(1/x) ≤ 1，求 x 趋近于 0 时 x²sin(1/x) 的极限。",
        walkthrough: [
          "由于 x² ≥ 0，不等式同乘 x² 得 -x² ≤ x²sin(1/x) ≤ x²。",
          "用极限法则说明 -x² 与 x² 都趋近于 0。",
          "中间函数始终被夹在趋近同一值的边界中。",
          "因此 x²sin(1/x) 趋近于 0。",
        ],
        takeaway: "振荡不必停止；只要振幅被夹到 0，极限仍然确定。",
      },
    ],
    guidedQuestions: [
      {
        prompt: "为什么只有一个趋近于 0 的上界还不够？",
        hint: "函数仍可能远远落到这个上界下方。",
        targetInsight: "还需要匹配的下界，阻止函数向另一个方向逃离。",
      },
      {
        prompt: "x²sin(1/x) 必须在 x = 0 有定义才能讨论这个极限吗？",
        hint: "去心邻域不包含目标点。",
        targetInsight: "不需要；定理使用的是附近非零 x 的不等式。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "任意两个边界都能证明极限。",
        checkPrompt: "如果下界趋近 -1、上界趋近 1，会怎样？",
        correction: "两个边界必须趋近同一个值，否则中间仍有多种可能行为。",
      },
      {
        misconception: "不等式必须在目标点本身成立。",
        checkPrompt: "中间函数在 c 未定义时，能否仍使用附近 x 的夹逼？",
        correction: "可以；不等式只需在足够靠近 c 的非目标点处成立。",
      },
    ],
    reflectionPrompt: {
      prompt: "为什么振荡速度不减慢，函数仍然可能有极限？",
      sentenceStarter: "函数仍在振荡，但它的可能输出被限制在 ____ 与 ____ 之间。",
    },
    applicationPrompt: {
      title: "建立夹逼论证",
      prompt: "若 x = 0 附近 |q(x)| ≤ 3x²，请构造上下界并证明 q(x) 的极限。",
      whyItTransfers: "绝对值边界是微积分中建立夹逼论证的常见入口。",
    },
    keyTakeaways: [
      "中间函数会继承上下界的共同极限。",
      "上下界必须趋近于同一个值。",
      "不等式只需在目标输入附近成立。",
    ],
  },
  "continuity-at-a-point": {
    conceptId: "continuity-at-a-point",
    title: "什么才叫在一点处连续？",
    objective: {
      title: "检查连续性的三个条件",
      description: "通过函数值、双侧极限及两者是否相等来判断一点处的连续性。",
      successCriteria: [
        "确认 f(c) 有定义。",
        "确认 x 趋近于 c 时的双侧极限存在。",
        "比较极限与 f(c)，并指出间断时失败的条件。",
      ],
    },
    hook:
      "“画图时不用抬笔”只能帮助你快速想象。遇到空点、错放的实心点或分段函数时，真正可靠的是三项检查：点值、极限，以及两者是否相等。",
    intuition:
      "可以把极限看成曲线从附近赶往的“目的地”，把 f(c) 看成目标点真正登记的“地址”。两者一致才连续；地址缺失或登记错了，即使曲线走向很清楚也不连续。",
    formalExplanation:
      "判断函数在一点处的连续性，需要检查三个条件：f(c) 有定义；双侧极限 lim x→c f(x) 存在；并且该极限等于 f(c)。任何条件失败都会产生间断（discontinuity）。如果有限极限存在但函数值缺失或不匹配，这种间断是可去的。",
    prerequisiteConnections: [
      {
        conceptId: "estimating-limits-from-graphs",
        title: "从图像估计极限",
        connection: "图像极限推理提供连续性的第二个条件。",
      },
      {
        conceptId: "evaluating-limits-with-limit-laws",
        title: "用极限法则计算极限",
        connection: "极限法则和代入常用于验证代数函数的连续性。",
      },
    ],
    workedExamples: [
      {
        title: "修复可去间断",
        setup:
          "当 x ≠ 1 时 f(x) = (x² - 1)/(x - 1)，并定义 f(1) = 5。f 在 1 连续吗？",
        walkthrough: [
          "f(1) 有定义且等于 5。",
          "对附近 x ≠ 1，把表达式化简为 x + 1。",
          "x 趋近于 1 时双侧极限为 2。",
          "极限 2 不等于 f(1)=5，所以不连续；若定义 f(1)=2 则可修复。",
        ],
        takeaway: "极限存在是必要条件，但目标点函数值还必须与它一致。",
      },
    ],
    guidedQuestions: [
      {
        prompt: "若 f(c) 未定义但双侧极限存在，连续性的哪个条件失败？",
        hint: "先检查目标点函数值。",
        targetInsight: "第一个条件失败，所以即使极限存在也不连续。",
      },
      {
        prompt: "若左右极限不同，还需要把什么与 f(c) 比较吗？",
        hint: "双侧极限条件已经失败。",
        targetInsight: "不需要；双侧极限不存在时，无论函数值如何都不连续。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "只要 f(c) 存在，函数就在 c 连续。",
        checkPrompt: "实心点能否位于图像附近趋势所靠近高度之外？",
        correction: "可以；函数值还必须等于存在的双侧极限。",
      },
      {
        misconception: "只要极限存在，函数就连续。",
        checkPrompt: "若图像趋近于 2，但 f(c) 缺失或等于 5，会怎样？",
        correction: "极限条件成立，但函数值定义或相等条件失败。",
      },
    ],
    reflectionPrompt: {
      prompt: "把连续性解释成哪两类信息之间的一致？",
      sentenceStarter: "c 点连续要求附近行为 ____ 与目标点函数值 ____ 一致。",
    },
    applicationPrompt: {
      title: "选择参数保证连续",
      prompt:
        "一个分段函数在 x = 2 有边界。说明如何选择缺失参数，让左极限、右极限和函数值一致。",
      whyItTransfers: "含参数的连续性题直接考查三个条件框架。",
    },
    keyTakeaways: [
      "连续性要求函数值有定义、双侧极限存在，并且两者相等。",
      "极限存在时连续性仍可能失败。",
      "可去间断可以通过赋予极限值来修复。",
    ],
  },
  "intermediate-value-theorem": {
    conceptId: "intermediate-value-theorem",
    title: "不解方程，也能知道零点存在吗？",
    objective: {
      title: "用连续性保证一个输出一定出现",
      description: "利用介值定理判断连续函数何时必定取得两个端点输出之间的值。",
      successCriteria: [
        "验证函数在闭区间上连续。",
        "检查目标输出位于两个端点输出之间。",
        "写出存在性结论，不声称唯一或精确输入。",
      ],
    },
    hook:
      "一段连续山路从海拔 -20 米爬到 80 米，中途一定经过海拔 0 米。我们也许不知道具体在哪一米经过，但连续性足以保证“至少经过一次”。",
    intuition:
      "连续图像不能从一个高度瞬间跳到另一个高度。只要目标值夹在 f(a) 与 f(b) 之间，曲线途中就必须碰到它；至于碰到几次、在哪里碰到，定理并不回答。",
    formalExplanation:
      "若 f 在闭区间 [a,b] 上连续，且 N 位于 f(a) 与 f(b) 之间，则至少存在一个 c∈[a,b] 使 f(c)=N。若 N 严格位于端点输出之间，可取 c∈(a,b)。定理只保证存在，不给出 c 的位置或唯一性。",
    prerequisiteConnections: [
      {
        conceptId: "continuity-at-a-point",
        title: "一点处的连续性",
        connection: "介值定理把单点处的连续性扩展为整个区间上的保证。",
      },
      {
        conceptId: "estimating-limits-from-graphs",
        title: "从图像估计极限",
        connection: "沿图像追踪能直观看出连续曲线不能跳过中间高度。",
      },
    ],
    workedExamples: [
      {
        title: "不求解也能保证零点",
        setup: "多项式 p 满足 p(1)=-2、p(3)=5，说明 1 与 3 之间存在 p(c)=0。",
        walkthrough: [
          "多项式连续，所以 p 在 [1,3] 上连续。",
          "目标输出 0 位于 -2 与 5 之间。",
          "应用介值定理。",
          "结论：至少存在一个 c∈(1,3) 使 p(c)=0。",
        ],
        takeaway: "介值定理不需要算出零点，也能证明零点至少存在一个。",
      },
    ],
    guidedQuestions: [
      {
        prompt: "为什么端点函数值分处 0 两侧还不够，仍需连续性？",
        hint: "想象一个跳跃图像。",
        targetInsight: "不连续函数可以从负值跳到正值而从未等于 0。",
      },
      {
        prompt: "若定理保证 f(c)=2，能否断言这样的 c 只有一个？",
        hint: "连续曲线可以多次经过同一个高度。",
        targetInsight: "不能；定理只保证至少存在一个，不保证唯一。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "介值定理会找出精确输入 c。",
        checkPrompt: "只知道端点符号时，实际上解出了哪个方程？",
        correction: "没有解出方程；定理只证明至少一个输入存在。",
      },
      {
        misconception: "端点输出夹住 N 就一定存在 f(c)=N。",
        checkPrompt: "跳跃间断能否直接越过 N？",
        correction: "可以；整个闭区间上的连续性是不可缺少的条件。",
      },
    ],
    reflectionPrompt: {
      prompt: "存在性证明与求出精确输入有什么区别？",
      sentenceStarter: "定理告诉我 ____ 存在，但没有告诉我 ____。",
    },
    applicationPrompt: {
      title: "验证一个介值定理结论",
      prompt:
        "给定函数、区间和目标输出，列出需要验证的两个条件，并写出准确的存在性结论。",
      whyItTransfers: "AP 自由回答题会分别评价连续性、夹住目标值和结论三部分推理。",
    },
    keyTakeaways: [
      "连续性阻止函数跳过中间输出。",
      "目标输出必须位于两个端点输出之间。",
      "定理保证存在，不给出精确位置或唯一性。",
    ],
  },
  "limits-at-infinity": {
    conceptId: "limits-at-infinity",
    title: "图像走得足够远，会留下什么趋势？",
    objective: {
      title: "描述输入无界时的函数行为",
      description:
        "分析 x 趋近正无穷或负无穷时的极限，并把有限端极限与水平渐近线联系起来。",
      successCriteria: [
        "区分无穷远处的极限和无穷极限。",
        "比较有理函数的主导项。",
        "把水平渐近线理解为可被穿过的方向性端行为。",
      ],
    },
    hook:
      "前面求极限像拿放大镜盯住某个 x 值；现在把镜头拉远，看图像向左、向右延伸很久以后，哪些细节消失了，哪条长期趋势还留着。",
    intuition:
      "当 |x| 很大时，低次项相对最高次幂越来越小。在 (2x²+1)/(x²+3) 中，同除以 x² 后，1/x² 逐渐消失，整个比值就靠近 2。",
    formalExplanation:
      "x 趋近正无穷或负无穷的极限描述端行为，而不是某个有限输入附近的行为。对有理函数，可同除以分母最高次幂；含 1/xᵏ 的项趋近 0。分子分母同次数时极限为首项系数之比；分子次数较低时极限为 0。有限端极限 y=L 给出相应方向的水平渐近线。",
    prerequisiteConnections: [
      {
        conceptId: "infinite-limits",
        title: "无穷极限",
        connection: "无穷极限让输入靠近有限值而输出无界；无穷远极限关注无界输入。",
      },
      {
        conceptId: "evaluating-limits-with-limit-laws",
        title: "用极限法则计算极限",
        connection: "主导幂标准化后，用极限法则处理常数项和趋近 0 的倒数幂。",
      },
    ],
    workedExamples: [
      {
        title: "比较首项",
        setup: "求 x→∞ 时 (2x²+1)/(x²+3) 的极限。",
        walkthrough: [
          "分子分母每一项同除以 x²。",
          "写成 (2+1/x²)/(1+3/x²)。",
          "x 无界增大时 1/x² 与 3/x² 都趋近于 0。",
          "用商法则得到 2/1=2。",
        ],
        takeaway: "分子分母同次数时，首项系数之比控制端行为。",
      },
    ],
    guidedQuestions: [
      {
        prompt: "无穷极限与无穷远处的极限在符号上改变的是哪一部分？",
        hint: "观察无穷描述的是 x 还是 f(x)。",
        targetInsight: "无穷远极限中 x 无界；无穷极限中 x 靠近有限值而 f(x) 无界。",
      },
      {
        prompt: "图像能穿过水平渐近线后仍在 x→∞ 时趋近它吗？",
        hint: "极限约束长期趋势，不约束每个有限输入。",
        targetInsight: "可以；图像可穿过该直线，最终仍逐渐靠近它。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "水平渐近线是图像绝不能穿过的直线。",
        checkPrompt: "端行为是否说明每个有限 x 处发生什么？",
        correction: "不是；水平渐近线描述长期趋势，图像在有限输入处可以穿过它。",
      },
      {
        misconception: "无穷远处的极限与无穷极限相同。",
        checkPrompt: "两种情况中分别是输入还是输出无界？",
        correction: "前者输入无界；后者输出在有限输入附近无界。",
      },
    ],
    reflectionPrompt: {
      prompt: "为什么除以主导幂能够暴露端行为？",
      sentenceStarter: "同除以 ____ 后，____ 项消失，保留下来的比值是 ____。",
    },
    applicationPrompt: {
      title: "分类有理函数端行为",
      prompt:
        "比较三个有理函数的分子分母次数，预测无穷远极限是 0、首项系数比还是无界。",
      whyItTransfers: "主导项推理会继续支持渐近线与函数行为分析。",
    },
    keyTakeaways: [
      "无穷远处的极限描述输入无界时的输出行为。",
      "主导幂决定有理函数端行为。",
      "水平渐近线描述长期趋势，图像可以穿过它。",
    ],
  },
};

export const unit1ExtensionZhLessons =
  completeApCalculusZhLessonLocalizations(unit1ExtensionZhLessonDrafts);
