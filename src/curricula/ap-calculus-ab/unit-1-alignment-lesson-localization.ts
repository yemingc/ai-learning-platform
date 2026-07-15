import type { LessonContent } from "@/features/lessons/types";
import { completeApCalculusZhLessonLocalizations } from "./adaptive-lesson-localization.ts";

const unit11LessonBaseId =
  "ap-calculus-ab/ap-calculus-ab-unit-1-limits-continuity/instantaneous-change-motivation";

const unit11ApplicationTask = {
  id: `${unit11LessonBaseId}/application-task-1`,
  title: "保温杯里的水，此刻降温有多快？",
  prompt:
    "同一时刻附近，温度表分别给出 1 分钟、10 秒和 1 秒观察窗口内的平均温度变化率。判断这些数据是否支持一个瞬时降温速率，并写清正负号和单位。",
  readinessSignal:
    "只要研究的是“某一刻变化多快”，无论对象是车速、温度还是人口，都可以先比较不断缩短的非零区间。",
  sectionId: "application",
};

const unit1AlignmentZhLessonDrafts: Record<
  string,
  Partial<LessonContent>
> = {
  "instantaneous-change-motivation": {
    title: "怎样描述某一瞬间的变化？",
    learningObjectives: [
      "借助不断缩短的观察区间，说明平均变化率怎样为瞬时变化提供证据。",
      "能计算并结合情境单位解释平均变化率。",
      "能比较一组长度逐渐缩短、但始终不为 0 的区间。",
      "能说明 h→0 表示“无限靠近”，不是把 h 直接取成 0。",
    ],
    retrievalTags: [
      "瞬时变化",
      "平均变化率",
      "缩短区间",
      "割线斜率",
      "instantaneous change",
      "average rate of change",
    ],
    objective: {
      title: "从区间平均走向瞬时变化",
      description:
        "把同一时刻附近的观察窗口逐步缩短，比较平均变化率是否稳定靠近某个数，并据此解释瞬时变化。",
      successCriteria: [
        "正确计算平均变化率，并把结果放回情境中解释单位。",
        "比较多个越来越短、却始终非零的区间，而不是只盯着一个数值。",
        "说清 h→0 与 h=0 的区别，避免把瞬时变化理解成除以零。",
      ],
    },
    hook:
      "导航显示的是“过去一段路平均有多快”，仪表盘回答的却是“此刻有多快”。可我们手里的路程数据总要跨过一小段时间，怎么能用它判断一个瞬间？微积分从这个矛盾开始。",
    intuition:
      "先把目标时刻固定住，再像给镜头不断放大那样，把观察窗口从 1 小时缩到 0.1 小时、0.01 小时。每次都还能算平均变化率，因为窗口并没有消失。如果这些结果越来越稳定，我们就有理由把它们共同靠近的数看成“此刻变化多快”的候选值。",
    formalExplanation:
      "设 s(t) 表示随时间变化的路程。在区间 [a,b] 上，平均变化率为 [s(b)-s(a)]/(b-a)，前提是 b≠a。若要研究 t=a 这一刻，就保留 h≠0，考察差商 [s(a+h)-s(a)]/h 在 h→0 时靠近什么数。这里的 h→0 是一个趋近过程，不是令 h=0。第 1 单元用这件事引出极限（limit）；到第 2 单元，当这个极限存在时，我们会把它定义为导数（derivative）。",
    prerequisiteConnections: [],
    workedExamples: [
      {
        title: "长途客车在第 5 小时时开得多快？",
        setup:
          "一辆长途客车从出发起计时。以 t=5 小时为左端点，在 [5,6]、[5,5.5]、[5,5.1]、[5,5.01] 上算得的平均速度依次为 42、39、37.4、37.04 km/h。请估计 t=5 时的瞬时速度。",
        walkthrough: [
          "先认清数据的身份：42、39、37.4、37.04 都是某个时间段内的平均速度，不能单独冒充瞬时速度。",
          "观察窗口的长度依次为 1、0.5、0.1、0.01 小时；它们越来越短，却没有一个等于 0。",
          "窗口缩短时，平均速度从 42 逐步靠近 37 km/h，出现了清晰而稳定的趋势。",
          "所以目前最有根据的估计是：t=5 时客车的瞬时速度约为 37 km/h。之后我们会用极限把“越来越靠近”写得更精确。",
        ],
        takeaway: "可靠的瞬时估计来自一串缩短区间的共同趋势，而不是某一个区间碰巧给出的数。",
      },
    ],
    guidedQuestions: [
      {
        prompt: "既然要研究一个瞬间，为什么不干脆把时间间隔设成 0？",
        hint: "把 h=0 代入 [s(a+h)-s(a)]/h，看看分母会发生什么。",
        targetInsight: "h=0 会让差商出现除以零；正确做法是始终使用非零的 h，再让 h 趋近于 0。",
      },
      {
        prompt: "如果窗口越缩越短，算出的变化率却一直在 2 和 8 之间来回跳，我们还能选一个瞬时变化率吗？",
        hint: "问问自己：这些数有没有共同靠近同一个目标。",
        targetInsight: "不能。数据没有稳定到一个共同的趋近值，因此尚不足以支持唯一的瞬时变化率。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "“瞬时”就意味着把 h 直接取成 0。",
        checkPrompt: "当 h=0 时，差商 [s(a+h)-s(a)]/h 还有定义吗？",
        correction: "没有。分母会变成 0。极限保留 h≠0，只研究 h 无限靠近 0 时差商的趋势。",
      },
      {
        misconception: "全程平均速度是 60 km/h，就表示途中每一刻都是 60 km/h。",
        checkPrompt: "一辆车中途等过红灯、也上过高速，最后仍可能得到 60 km/h 的全程平均速度吗？",
        correction: "当然可能。长区间的平均值会把停车、加速等局部变化“抹平”，所以判断某一刻必须查看更短区间。",
      },
    ],
    reflectionPrompt: {
      prompt: "请用自己的话解释：为什么把观察窗口不断缩短，既没有除以零，又能逼近一个瞬间的变化？",
      sentenceStarter: "每个观察窗口的长度仍然 ____；当它趋近于 ____ 时，平均变化率逐渐趋近于 ____。",
    },
    applicationPrompt: {
      title: unit11ApplicationTask.title,
      prompt: unit11ApplicationTask.prompt,
      whyItTransfers: unit11ApplicationTask.readinessSignal,
    },
    keyTakeaways: [
      "平均变化率描述的是一段非零区间内的整体变化。",
      "把区间逐步缩短，可以检查平均变化率是否稳定靠近同一个局部趋势。",
      "h→0 不等于 h=0；瞬时变化靠极限描述，绝不是直接除以零。",
    ],
    sections: [
      {
        id: `${unit11LessonBaseId}/why`,
        sectionId: "why",
        type: "why_this_matters",
        title: "为什么要学这个？",
        body:
          "导航能告诉你过去一段路的平均速度，仪表盘却显示此刻速度。微积分要解决的第一个问题，就是怎样从一段段区间数据中读出“这一刻”的变化。",
        teachingGoal: "先让学习者看到区间平均与瞬时读数之间的真实问题。",
        retrievalTags: ["学习动机", "平均速度", "瞬时速度"],
        misconceptionIds: [],
      },
      {
        id: `${unit11LessonBaseId}/intuition`,
        sectionId: "intuition",
        type: "intuition",
        title: "先建立直觉",
        body:
          "固定目标时刻，再把观察窗口一次次缩短，就像不断放大镜头。窗口始终有长度，所以平均变化率仍能计算；若结果逐渐稳定，共同靠近的数就是瞬时变化的候选值。",
        teachingGoal: "用“缩短观察窗口”的图景建立极限直觉。",
        retrievalTags: ["直觉", "缩短观察窗口", "趋近"],
        misconceptionIds: [],
      },
      {
        id: `${unit11LessonBaseId}/formal`,
        sectionId: "formal",
        type: "formal_idea",
        title: "把直觉写成数学",
        body:
          "[a,b] 上的平均变化率为 [s(b)-s(a)]/(b-a)，其中 b≠a。研究 t=a 时，保留 h≠0，考察 [s(a+h)-s(a)]/h 在 h→0 时的趋势。h→0 表示无限靠近，不表示 h=0。这个趋近过程引出极限（limit），也为第 2 单元的导数（derivative）做准备。",
        teachingGoal: "准确区分差商中的非零条件与极限中的趋近过程。",
        retrievalTags: ["差商", "h→0", "h≠0", "极限"],
        misconceptionIds: [],
      },
      {
        id: `${unit11LessonBaseId}/worked`,
        sectionId: "worked",
        type: "worked_example",
        title: "例题：估计客车的瞬时速度",
        body:
          "一辆长途客车行驶到 t=5 小时。区间 [5,6]、[5,5.5]、[5,5.1]、[5,5.01] 上的平均速度依次为 42、39、37.4、37.04 km/h。\n\n1. 这些都是区间平均速度。\n2. 区间长度由 1 小时缩到 0.01 小时，但始终非零。\n3. 数值逐渐靠近 37 km/h。\n4. 因此可估计 t=5 时的瞬时速度约为 37 km/h。\n\n结论：要看一串缩短区间的共同趋势，不能拿单个平均值代替瞬时速度。",
        teachingGoal: "示范如何从数值趋势形成有单位的瞬时估计。",
        retrievalTags: ["例题", "客车速度", "37 km/h"],
        misconceptionIds: [],
      },
      {
        id: `${unit11LessonBaseId}/guided`,
        sectionId: "guided",
        type: "think_with_me",
        title: "一起想一想",
        body:
          "问题一：为什么不能把时间间隔直接设成 0？提示：检查差商的分母。要点：h=0 会导致除以零，因此只能让非零的 h 趋近于 0。\n\n问题二：如果更短区间上的变化率一直在 2 和 8 之间跳动，能否确定一个瞬时变化率？提示：检查是否存在共同的趋近值。要点：没有稳定趋势，就没有足够证据支持唯一候选值。",
        teachingGoal: "通过追问让学习者亲自说出非零区间与稳定趋势两个条件。",
        retrievalTags: ["引导问题", "除以零", "稳定趋势"],
        misconceptionIds: [],
      },
      {
        id: `${unit11LessonBaseId}/trap`,
        sectionId: "trap",
        type: "common_trap",
        title: "两个常见误区",
        body:
          "误区一：“瞬时”就是 h=0。修正：h=0 时差商无定义；极限研究的是 h≠0 且 h→0。\n\n误区二：全程平均速度等于途中每一刻的速度。修正：停车和加速可能被长区间平均值掩盖，必须用更短区间观察局部行为。",
        teachingGoal: "在形成程序性记忆前，修复对“瞬时”和“平均”的混淆。",
        retrievalTags: ["常见误区", "h=0", "全程平均速度"],
        misconceptionIds: [
          "instantaneous-change-motivation-misconception-1",
          "instantaneous-change-motivation-misconception-2",
        ],
      },
      {
        id: `${unit11LessonBaseId}/reflection`,
        sectionId: "reflection",
        type: "reflection",
        title: "用自己的话说一遍",
        body:
          "为什么缩短观察窗口既不会造成除以零，又能逼近一个瞬间的变化？\n可从这里开始：每个观察窗口的长度仍然 ____；当它趋近于 ____ 时，平均变化率逐渐趋近于 ____。",
        teachingGoal: "让学习者把趋近过程转述成自己的语言。",
        retrievalTags: ["反思", "自我解释", "趋近过程"],
        misconceptionIds: [],
      },
      {
        id: `${unit11LessonBaseId}/application`,
        sectionId: "application",
        type: "try_applying_it",
        title: unit11ApplicationTask.title,
        body: `${unit11ApplicationTask.prompt}\n\n为什么可以迁移：${unit11ApplicationTask.readinessSignal}`,
        teachingGoal: "把运动情境中的缩短区间推理迁移到温度变化。",
        retrievalTags: ["应用", "降温速率", "学习准备度"],
        misconceptionIds: [],
      },
      {
        id: `${unit11LessonBaseId}/takeaways`,
        sectionId: "takeaways",
        type: "key_takeaways",
        title: "这一课要带走什么？",
        body:
          "- 平均变化率属于非零区间。\n- 缩短区间可以揭示稳定的局部趋势。\n- h→0 不等于 h=0；瞬时变化由极限描述。",
        teachingGoal: "收束本课最需要长期保留的三个观念。",
        retrievalTags: ["小结", "平均变化率", "瞬时变化"],
        misconceptionIds: [],
      },
    ],
    glossaryTerms: [
      {
        term: "平均变化率（average rate of change）",
        definition:
          "在一个非零输入区间内，用输出变化量除以对应的输入变化量，表示这段区间整体变化得有多快。",
        aliases: ["区间变化率", "average rate of change", "interval rate"],
      },
      {
        term: "瞬时变化（instantaneous change）",
        definition:
          "某个输入位置上的局部变化；本课通过不断缩短区间上的平均变化率来逼近它。",
        aliases: ["瞬时变化率", "instantaneous change", "instantaneous rate"],
      },
    ],
    applicationTasks: [unit11ApplicationTask],
    practiceReadinessTasks: [unit11ApplicationTask],
  },
  "estimating-limits-from-tables": {
    title: "表里有很多数，哪些才算极限证据？",
    objective: {
      title: "使用双侧数值证据",
      description: "从目标两侧选择附近表格值，估计极限并把目标行与附近趋势分开。",
      successCriteria: [
        "同时选择小于和大于目标的输入。",
        "优先使用最接近目标的可靠数据。",
        "明确说明两侧是否支持同一个趋近值。",
      ],
    },
    hook:
      "一张传感器数据表可能有几十行，但不是每一行都同样重要。求极限时，要像放大目标时刻一样，优先找离目标最近、又分布在两侧的数据。",
    intuition:
      "先把小于目标的输入和大于目标的输入分成两组，再分别从远到近观察输出。两组都稳定靠近同一个数，双侧极限才有依据；目标那一行有没有值，并不决定结论。",
    formalExplanation:
      "估计 lim x→c f(x) 时，要查看小于 c 和大于 c 且逐渐靠近 c 的输入。分别描述两个方向的输出趋势，再判断是否趋近同一个值。即使表中有 f(c)，它也不决定极限。有限表格提供的是估计，其精度应与数据间距相符。",
    prerequisiteConnections: [
      {
        conceptId: "estimating-limits-from-graphs",
        title: "根据图像估计极限",
        connection: "两种表示都关注附近行为，而不是目标处的点值。",
      },
      {
        conceptId: "one-sided-limits",
        title: "单侧极限",
        connection: "目标下方和上方的输入分别提供左侧与右侧证据。",
      },
    ],
    workedExamples: [
      {
        title: "目标行缺失，还能估计吗？",
        setup: "在 x=2 附近，f(1.9)=3.81、f(1.99)=3.9801、f(2.01)=4.0201、f(2.1)=4.41，而 f(2) 缺失。",
        walkthrough: [
          "把小于 2 和大于 2 的输入分开。",
          "左侧输出从 3.81 向约 4 靠近。",
          "右侧输出从 4.41 向约 4 靠近。",
          "因此估计双侧极限为 4；缺少目标行不妨碍该结论。",
        ],
        takeaway: "目标两侧最靠近的行共同支持一个趋近值。",
      },
    ],
    guidedQuestions: [
      {
        prompt: "为什么 x=1.99 和 x=2.01 通常比 x=1 和 x=3 更有用？",
        hint: "极限描述目标附近的局部行为。",
        targetInsight: "更接近 2 的输入提供更相关的附近证据。",
      },
      {
        prompt: "若左侧输出趋近 1、右侧趋近 4，可以得出什么结论？",
        hint: "双侧极限需要一个共同值。",
        targetInsight: "双侧极限不存在，与 f(c) 是否列出无关。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "x=c 所在行给出极限。",
        checkPrompt: "f(c)=9 时，附近两侧能否仍然趋近 4？",
        correction: "可以；此时极限为 4，因为极限由附近行为决定。",
      },
      {
        misconception: "一个方向的表格值足以证明双侧极限。",
        checkPrompt: "还有哪个方向没有检查？",
        correction: "另一方向仍然未知，因此不能得到双侧结论。",
      },
    ],
    reflectionPrompt: {
      prompt: "如果一张表有很多行，请说明你会先圈出哪些数据，以及为什么。",
      sentenceStarter: "我会选择输入 ____，因为它们 ____，并且包含 ____。",
    },
    applicationPrompt: {
      title: "审查体温传感器记录",
      prompt: "一份体温传感器记录在目标时刻附近采样间距不均，其中目标行还是异常值。选出可用于双侧估计的数据，并说明结果应该保留到什么精度。",
      whyItTransfers: "真实测量不会自动排好间距，也可能含异常值；判断局部趋势前必须先筛选证据。",
    },
    keyTakeaways: [
      "有效的极限表格要从目标两侧靠近。",
      "附近行比目标行更重要。",
      "估计精度取决于表格数据的间距和质量。",
    ],
  },
  "algebraic-limit-techniques": {
    title: "得到 0/0 之后，下一步是什么？",
    objective: {
      title: "在保持附近行为的前提下变形",
      description: "使用因式分解、共轭式或三角变形消除不定式，再应用极限法则。",
      successCriteria: [
        "根据表达式结构选择有效技术。",
        "约去因式时说明输入限制。",
        "只有消除不定形式后才再次代入。",
      ],
    },
    hook: "直接代入出现 0/0，不代表答案是 0，也不代表极限不存在。它更像一块路牌：原式把附近趋势藏住了，现在该检查能否因式分解、乘共轭式或做三角变形。",
    intuition: "求极限只看目标点附近。只要两个表达式在所有足够靠近、但不等于目标的输入处相等，就可以暂时换用更简单的那个表达式观察趋势。目标点本身有没有定义，要另行说明。",
    formalExplanation: "直接代入得到 0/0 后要检查结构。多项式公因式适合分解约去；根式之差适合乘分子分母的共轭式；三角表达式可能需要恒等式或标准三角极限。这些变形保持去心邻域中的相等，不保证目标点处有定义。",
    prerequisiteConnections: [
      {
        conceptId: "evaluating-limits-with-limit-laws",
        title: "使用极限法则计算",
        connection: "代入先判断表达式能否直接计算，还是需要继续变形。",
      },
    ],
    workedExamples: [
      {
        title: "一个空点怎样被代数结构揭示？",
        setup: "计算 lim x→3 (x²-9)/(x-3)。",
        walkthrough: [
          "直接代入得到 0/0，因此还不能结束。",
          "把 x²-9 分解为 (x-3)(x+3)。",
          "在附近 x≠3 时约去公因式 x-3。",
          "对剩余表达式 x+3 代入 3，得到 6。",
        ],
        takeaway: "约分说明附近相等，不代表原商在 x=3 已有定义。",
      },
    ],
    guidedQuestions: [
      {
        prompt: "为什么使用共轭式时必须同时乘分子和分母？",
        hint: "变形后的表达式必须与原式等价。",
        targetInsight: "乘以等于 1 的共轭比值才能保持表达式不变。",
      },
      {
        prompt: "约去 x-3 后，是否已经重新定义了原函数在 x=3 的值？",
        hint: "约分只在 x≠3 时成立。",
        targetInsight: "没有；这里只得到用于求极限的附近等价表达式。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "约去因式就填补了原函数的孔。",
        checkPrompt: "原分母在目标点是否仍为 0？",
        correction: "仍然为 0；原函数未定义，只是附近行为被揭示。",
      },
      {
        misconception: "所有 0/0 极限都应该因式分解。",
        checkPrompt: "什么结构更适合共轭式？",
        correction: "根式之差通常适合共轭式，三角结构则可能需要恒等变形。",
      },
    ],
    reflectionPrompt: {
      prompt: "解释为什么附近等价足以保证极限相同。",
      sentenceStarter: "极限忽略 ____，所以在 ____ 相等的表达式具有相同 ____。",
    },
    applicationPrompt: {
      title: "给三类 0/0 表达式分诊",
      prompt: "比较可因式分解的商、根式之差和三角商，分别选择第一步，并指出是哪一个结构线索让你这样选。",
      whyItTransfers: "把 0/0 继续细分，能避免遇到任何题都机械套用同一种变形。",
    },
    keyTakeaways: [
      "0/0 是分析结构的信号。",
      "有效变形要保持附近行为并说明限制。",
      "因式分解、共轭式和三角变形适用于不同结构。",
    ],
  },
  "selecting-limit-procedures": {
    title: "求极限没有万能第一步",
    objective: {
      title: "计算前先选方法",
      description: "根据表示方式、代入结果和表达式结构选择并说明极限方法。",
      successCriteria: [
        "额外计算前先检查直接代入。",
        "把 0/0 的结构匹配到合适变形。",
        "没有公式时诚实使用图像或数值估计。",
      ],
    },
    hook: "有些同学一看到极限就开始因式分解，结果题目明明直接代入就能完成。真正省力的顺序是：先看题目给了什么，再做最简单的检查，最后才处理没有解决的障碍。",
    intuition: "把求极限想成给问题分诊：图像题先读走势，表格题先看两侧，公式题先试代入。代入若得到有限值通常可以结束；若出现 0/0，再根据因式、根式或三角结构选择工具。",
    formalExplanation: "可靠流程是：识别表示方式；检查定义域和单侧要求；有表达式时尝试直接代入；分类代入结果；再使用匹配结构的代数变形或图表估计。方法的有效性来自条件和结构，而不是“算出了一个数”。",
    prerequisiteConnections: [
      {
        conceptId: "evaluating-limits-with-limit-laws",
        title: "使用极限法则计算",
        connection: "极限法则和代入是许多解析极限的高效第一步。",
      },
      {
        conceptId: "algebraic-limit-techniques",
        title: "代数极限技术",
        connection: "每种变形都有提示其适用性的结构线索。",
      },
      {
        conceptId: "estimating-limits-from-tables",
        title: "根据表格估计极限",
        connection: "数值证据的精度声明不同于精确解析论证。",
      },
    ],
    workedExamples: [
      {
        title: "三道题，为什么不能用同一种第一步？",
        setup: "分别处理多项式极限、x→2 时的 (x²-4)/(x-2) 和 x→0 时的 (sqrt(x+1)-1)/x。",
        walkthrough: [
          "多项式连续，因此直接代入即可。",
          "第二式得到 0/0 且有平方差结构，因此因式分解。",
          "第三式得到 0/0 且有根式之差，因此使用共轭式。",
          "分别说明其他额外方法为什么不必要或不匹配。",
        ],
        takeaway: "代入结果缩小范围，表达式结构确定下一步。",
      },
    ],
    guidedQuestions: [
      {
        prompt: "代入得到 7/3 时，为什么通常不需要因式分解？",
        hint: "表达式在目标处已有定义且连续。",
        targetInsight: "直接代入已经给出有依据的极限值。",
      },
      {
        prompt: "只有图像时，结论应怎样描述精度？",
        hint: "图像具有有限尺度和分辨率。",
        targetInsight: "应报告可见行为支持的估计，而不是没有依据的精确值。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "因式分解永远是最安全的第一步。",
        checkPrompt: "若直接代入已得到有限值呢？",
        correction: "此时连续性和代入通常已经完成问题，因式分解只会增加工作。",
      },
      {
        misconception: "只要结果看起来合理，方法就是有效的。",
        checkPrompt: "哪些条件或等价关系支持该结果？",
        correction: "有效解答必须把方法与表示方式、定义域和结构连接起来。",
      },
    ],
    reflectionPrompt: {
      prompt: "写出选择极限方法前应该问的问题。",
      sentenceStarter: "我先识别 ____，再测试 ____；如果看到 ____，就选择 ____。",
    },
    applicationPrompt: {
      title: "制作一张极限分诊单",
      prompt: "面对四个陌生极限，依次记录表示方式、第一条证据、所选方法，以及一个不采用的替代方法和理由。",
      whyItTransfers: "能说明为什么不选另一种方法，才真正表明你理解了适用条件。",
    },
    keyTakeaways: [
      "先检查证据，再选择程序。",
      "优先使用最简单且有依据的方法。",
      "正确的方法选择必须包含理由和适用条件。",
    ],
  },
  "connecting-limit-representations": {
    title: "图像、表格和公式为什么看起来会冲突？",
    objective: {
      title: "转换并交叉检查极限证据",
      description: "在图像、数值、解析、符号和语言形式之间保持同一个数学行为。",
      successCriteria: [
        "在各表示中保持目标输入、方向和趋近输出一致。",
        "表示双侧极限时包含两个方向。",
        "说明每种表示能够证明什么、只能提示什么。",
      ],
    },
    hook: "图像看起来平滑，公式却显示有空点；表格像是在靠近 2，目标行又偏偏写着 9。它们未必真的矛盾，可能只是各自展示了同一函数的不同信息。",
    intuition: "把图像、表格、公式和文字看成四个摄像机。画面角度不同，但都必须对三件事说得通：x 靠近哪里、从哪边靠近、f(x) 靠近什么。点值则要单独记录。",
    formalExplanation: "等价的极限表示必须保持目标输入、趋近方向和输出行为。图像和表格通常用于估计；代数和定理可以给出精确论证。完整转换还要把 f(c) 与 lim x→c f(x) 分开，并在双侧问题中写明方向证据。",
    prerequisiteConnections: [
      {
        conceptId: "estimating-limits-from-graphs",
        title: "根据图像估计极限",
        connection: "图像展示趋近的形状和方向。",
      },
      {
        conceptId: "estimating-limits-from-tables",
        title: "根据表格估计极限",
        connection: "表格显示数值趋近以及抽样限制。",
      },
      {
        conceptId: "selecting-limit-procedures",
        title: "选择极限方法",
        connection: "解析结构决定何时能够得到精确结论。",
      },
    ],
    workedExamples: [
      {
        title: "用四种方式描述一个可去间断",
        setup: "对 x≠1 时的 f(x)=(x²-1)/(x-1)，连接 x=1 附近的公式、表格、图像和极限陈述。",
        walkthrough: [
          "因式分解说明附近公式等于 x+1。",
          "预测 x=1 两侧的表格输出都趋近 2。",
          "描述直线 y=x+1 在 (1,2) 处有孔。",
          "写出 lim x→1 f(x)=2，并说明 f(1) 仍可没有定义。",
        ],
        takeaway: "所有表示保持相同附近目标，而点值始终单独处理。",
      },
    ],
    guidedQuestions: [
      {
        prompt: "为什么图像看似有极限，快速振荡却可能使极限不存在？",
        hint: "考虑目标附近的像素尺度。",
        targetInsight: "有限分辨率可能隐藏解析式或更密集抽样揭示的行为。",
      },
      {
        prompt: "把极限陈述转成表格时，哪些信息必须保持不变？",
        hint: "跟踪输入目标、方向和输出趋势。",
        targetInsight: "表格必须从指定方向靠近同一输入，并支持同一输出行为。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "看起来平滑的图像能证明精确极限。",
        checkPrompt: "图像尺度可能隐藏什么？",
        correction: "图像支持估计；孔、振荡或尺度效应可能需要数值或解析确认。",
      },
      {
        misconception: "目标行必须等于附近表格趋势。",
        checkPrompt: "表中 f(c)=9 时，附近输出能否趋近 2？",
        correction: "可以；这表示极限为 2，而函数值为 9。",
      },
    ],
    reflectionPrompt: {
      prompt: "你会用哪种表示给出精确结论，又会怎样用其他表示检查？",
      sentenceStarter: "____ 表示说明 ____，而 ____ 通过 ____ 进行确认或限定。",
    },
    applicationPrompt: {
      title: "处理一组不一致的证据",
      prompt: "图像似乎支持有限极限，稀疏表格却看不清，公式还含有快速振荡。指出每种证据的局限，决定还需要什么信息，再写出不过度断言的结论。",
      whyItTransfers: "数学判断不仅要看答案，还要判断证据分辨率是否足以支持这个答案。",
    },
    keyTakeaways: [
      "所有表示必须保持同一输入和输出行为。",
      "图像和表格通常估计，解析方法可以精确论证。",
      "交叉检查能暴露隐藏假设和尺度限制。",
    ],
  },
  "classifying-discontinuities": {
    title: "空点、跳跃和渐近线，怎样分类？",
    objective: {
      title: "分类连续性失败",
      description: "区分可去、跳跃和无穷间断，并判断修改一个点能否修复。",
      successCriteria: [
        "用方向性极限和函数值命名间断类型。",
        "说明哪个连续条件失败。",
        "准确判断何时可通过重新定义一点修复。",
      ],
    },
    hook: "图像断开并不只有一种原因：有时只是少了一个点，有时左右两段接不上，还有时曲线沿渐近线无限升高。分类不是背名称，而是找出哪条连续性条件失败了。",
    intuition: "按固定顺序排查：左右两侧有没有有限趋势？两边是否相等？如果相等，函数值是否也匹配？前三个问题的答案会自然把间断分成可去、跳跃或无穷三类。",
    formalExplanation: "可去间断具有有限双侧极限，但 f(c) 缺失或不匹配；跳跃间断的有限单侧极限不相等；无穷间断含有无界单侧行为。只有可去间断能通过把 f(c) 定义为共同极限来修复。",
    prerequisiteConnections: [
      {
        conceptId: "connecting-limit-representations",
        title: "连接极限表示",
        connection: "分类需要综合图表证据、单侧极限和点值。",
      },
      {
        conceptId: "one-sided-limits",
        title: "单侧极限",
        connection: "方向性的一致或分歧区分可去和跳跃行为。",
      },
    ],
    workedExamples: [
      {
        title: "给三张图像体检",
        setup: "图 A 两侧趋近 3 但 f(c)=8；图 B 左侧趋近 1、右侧趋近 4；图 C 从右侧无界增大。",
        walkthrough: [
          "A 有有限共同极限但点值不匹配，因此是可去间断。",
          "定义 f(c)=3 可以修复 A。",
          "B 的有限单侧极限不相等，因此是跳跃间断且不能靠一点修复。",
          "C 有无界方向性行为，因此是无穷间断且不能靠一点修复。",
        ],
        takeaway: "先根据方向性行为分类，再讨论修复。",
      },
    ],
    guidedQuestions: [
      {
        prompt: "为什么两个跳跃值的平均数不是双侧极限？",
        hint: "极限要求两侧实际趋近同一个值。",
        targetInsight: "平均不相等的单侧极限不会创造共同趋近行为。",
      },
      {
        prompt: "间断可去的核心条件是什么？",
        hint: "先检查附近的双侧行为。",
        targetInsight: "必须存在有限双侧极限，随后点值才能与它匹配。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "每个间断都是一个孔。",
        checkPrompt: "两侧能否趋近不同有限值，或出现无界行为？",
        correction: "可以；这些分别是跳跃间断和无穷间断。",
      },
      {
        misconception: "添加实心点可以修复所有间断。",
        checkPrompt: "一个点能让不相等的单侧极限变得相等吗？",
        correction: "不能；点值修改只能匹配已经存在的有限双侧极限。",
      },
    ],
    reflectionPrompt: {
      prompt: "写出一个分类间断的简短决策规则。",
      sentenceStarter: "先比较 ____；若它们 ____，再检查 ____；否则分类为 ____。",
    },
    applicationPrompt: {
      title: "检查分段计费函数的边界",
      prompt: "在分段函数的两个边界分别求或读取单侧极限，分类间断，并判断参数能否修复。",
      whyItTransfers: "阶梯电价、分段计费等模型常在边界处换公式，同一套单侧检查能判断那里是否连续。",
    },
    keyTakeaways: [
      "方向性行为区分可去、跳跃和无穷间断。",
      "只有有限共同双侧极限允许一点修复。",
      "函数值不能修复方向分歧或无界行为。",
    ],
  },
  "continuity-over-intervals": {
    title: "函数在哪些区间连续？",
    objective: {
      title: "用定义域和端点说明区间连续",
      description: "利用常见函数族在定义域上的连续性，并在闭区间端点使用单侧条件。",
      successCriteria: [
        "找出分割连续区间的定义域限制。",
        "在内部点使用双侧连续定义。",
        "在闭区间端点使用正确的单侧条件。",
      ],
    },
    hook: "检查某一个点连续，只能说明一个局部位置。若想使用介值定理，就要保证整段区间没有“断点”。最快的方法通常不是逐点检查，而是先找出公式在哪些输入处失效。",
    intuition: "先认函数家族：多项式处处连续，有理函数只怕分母为 0，根式和对数受定义域限制。把所有排除值标到数轴上，它们自然会把定义域切成若干连续区间。",
    formalExplanation: "多项式在所有实数上连续；有理函数在分母非零处连续；根式和对数必须遵守实数定义域。函数在开区间连续，表示其中每一点连续；在 [a,b] 连续，还要求 (a,b) 内连续、a 处右连续、b 处左连续。",
    prerequisiteConnections: [
      {
        conceptId: "continuity-at-a-point",
        title: "一点处连续",
        connection: "区间连续把局部条件应用到所有相关点，并在端点进行调整。",
      },
    ],
    workedExamples: [
      {
        title: "寻找有理函数的连续区间",
        setup: "确定 r(x)=(x+3)/[(x-2)(x+1)] 在哪里连续。",
        walkthrough: [
          "有理函数在分母非零处连续。",
          "解 (x-2)(x+1)=0，得到排除输入 x=2 和 x=-1。",
          "用这两个排除点分割实数轴。",
          "连续区间为 (-∞,-1)、(-1,2) 和 (2,∞)。",
        ],
        takeaway: "对常见函数族，定义域分析能高效确定连续区间。",
      },
    ],
    guidedQuestions: [
      {
        prompt: "为什么 [a,b] 上连续在 a 处使用右极限？",
        hint: "靠近左端点时，区间内有哪些输入？",
        targetInsight: "只有 a 右侧且属于区间的输入与端点条件有关。",
      },
      {
        prompt: "为什么检查三个样本点不能证明整个区间连续？",
        hint: "该结论覆盖区间内每一点。",
        targetInsight: "未检查的定义域限制或分段边界仍可能造成间断。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "熟悉的公式对所有实数都连续。",
        checkPrompt: "有理函数分母为 0 或对数输入不为正时会怎样？",
        correction: "函数只在其实数定义域上连续，所以必须先找限制。",
      },
      {
        misconception: "闭区间端点需要双侧极限。",
        checkPrompt: "端点外侧输入属于该区间吗？",
        correction: "不属于；每个端点只使用从区间内部靠近的单侧条件。",
      },
    ],
    reflectionPrompt: {
      prompt: "说明如何把定义域信息转化为连续区间。",
      sentenceStarter: "因为 ____ 函数在定义域上连续，所以排除 ____，得到区间 ____。",
    },
    applicationPrompt: {
      title: "为介值定理做一次区间安检",
      prompt: "给定 [0,4] 上的分段函数，列出所有内部换式边界和两个端点需要检查的方向，再判断能否声明整段连续。",
      whyItTransfers: "定理使用的是整个区间上的假设，漏掉一个边界就可能让存在性结论失去依据。",
    },
    keyTakeaways: [
      "常见函数在其定义域上连续。",
      "定义域排除点会把连续性分成多个区间。",
      "闭区间端点使用从区间内部靠近的单侧连续条件。",
    ],
  },
};

export const unit1AlignmentZhLessons =
  completeApCalculusZhLessonLocalizations(unit1AlignmentZhLessonDrafts);
