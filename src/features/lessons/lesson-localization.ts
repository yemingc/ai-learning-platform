import type { Language } from "@/components/i18n/language-provider";
import type { LessonContent } from "@/features/lessons/types";

const zhLessons: Record<string, LessonContent> = {
  "what-is-a-limit": {
    conceptId: "what-is-a-limit",
    title: "什么是极限（limit）？",
    objective: {
      title: "解释趋近行为（approaching behavior）",
      description:
        "把极限（limit）理解为函数（function）在输入值（input value）附近趋近的值，即使该点的函数值（function value）不同或不存在。",
      successCriteria: [
        "用附近输入值（nearby input values）描述极限（limit）。",
        "区分极限值（limit value）和实际函数值（function value）。",
        "用图像（graph）或表格（table）作为趋近行为（approach behavior）的证据。",
      ],
    },
    hook:
      "微积分（calculus）开始于一个转变：我们不只问某一点发生了什么，而是问函数（function）在这个点附近正在怎样变化。",
    intuition:
      "想象你从走廊两侧走向同一扇门。极限（limit）关心的是你的路径正在走向哪里，而不是门此刻是开着、锁着，还是根本缺失。在图像（graph）上，我们观察 x 值（x-values）越来越接近目标时，y 值（y-values）正在靠近哪里。",
    formalExplanation:
      "“当 x 趋近 a 时，f(x) 的极限（limit）是 L”表示：只要把 x 值（x-values）选得足够接近 a，输出值（outputs）f(x) 就能足够接近 L；这并不要求 x 等于 a。重点是 a 附近的行为（nearby behavior）。",
    prerequisiteConnections: [],
    workedExamples: [
      {
        title: "一个有清晰趋近值（approach value）的空点（hole）",
        setup:
          "图像（graph）在 (2, 4) 有一个空心圆点（open circle）。当 x 从左侧和右侧趋近 2 时，图像都越来越接近 y = 4。",
        walkthrough: [
          "从左侧靠近 x = 2，观察 y 值（y-values）趋近 4。",
          "从右侧靠近 x = 2，观察 y 值（y-values）同样趋近 4。",
          "暂时忽略 x = 2 处是实心点（filled point）、空心点（open point）还是缺失；附近行为（nearby behavior）指向 4。",
        ],
        takeaway:
          "只要附近行为（nearby behavior）一致，极限（limit）就可以存在，即使目标点的函数值（function value）没有定义。",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "如果 f(2) 没有定义，但图像（graph）从两侧都趋近 y = 4，我们应该怎样描述这个极限（limit）？",
        hint: "关注 x = 2 附近图像（graph）趋近哪里，而不是正好在 x = 2 发生什么。",
        targetInsight:
          "极限（limit）是 4，因为附近的 y 值（y-values）从两侧都趋近 4。",
      },
      {
        prompt:
          "为什么只把 x = 2 代入（substitution）不足以判断极限（limit）是否存在？",
        hint: "极限（limit）研究附近值（nearby values），不只研究目标点的值。",
        targetInsight:
          "代入（substitution）检查的是 f(2)，而极限（limit）检查的是 x 靠近 2 时 f(x) 的模式。",
      },
    ],
    misconceptionChecks: [
      {
        misconception:
          "极限（limit）总是等于函数值（function value）。",
        checkPrompt:
          "如果图像（graph）在 x = 2 附近趋近 y = 4，但实心点（filled point）在 y = 1，会怎样？",
        correction:
          "极限（limit）仍然是 4。实心点（filled point）告诉我们 f(2)，极限（limit）告诉我们附近行为（nearby behavior）。",
      },
      {
        misconception: "只要图像（graph）有空点（hole），极限（limit）就不存在。",
        checkPrompt:
          "空心圆点（open circle）会阻止图像（graph）趋近某个清晰的 y 值（y-value）吗？",
        correction:
          "不会。空点（hole）可能表示 f(a) 缺失，但极限（limit）仍然可以存在。",
      },
    ],
    reflectionPrompt: {
      prompt: "不用“答案”这个词，你会用一句话怎样解释极限（limit）？",
      sentenceStarter:
        "极限（limit）描述的是当 ____ 时，函数值（function values）正在趋近 ____。",
    },
    applicationPrompt: {
      title: "先识别极限（limit），再计算",
      prompt:
        "观察图像（graph）、表格（table）或文字描述，判断输出值（outputs）在目标输入值（target input）附近看起来趋近哪里。",
      whyItTransfers:
        "多数 AP 极限题（limit tasks）会在学生先识别被描述的行为之后变得更清晰。",
    },
    keyTakeaways: [
      "极限（limit）描述附近行为（nearby behavior）。",
      "函数值（function value）和极限值（limit value）可以不同。",
      "图像（graph）、表格（table）和符号（notation）是同一个趋近思想（approaching idea）的不同表达。",
    ],
  },
  "limit-notation": {
    conceptId: "limit-notation",
    title: "极限符号（limit notation）",
    objective: {
      title: "读写极限表达式（limit statements）",
      description:
        "把极限符号（limit notation）翻译成关于输入值（input values）趋近目标、输出值（output values）趋近结果的精确语言。",
      successCriteria: [
        "识别正在趋近的输入值（approaching input value）。",
        "识别正在被观察的函数（function）。",
        "说出输出值（output value）正在趋近哪里。",
      ],
    },
    hook:
      "极限符号（limit notation）是一句压缩后的数学句子。一旦能流畅阅读，符号就不再像密码，而像清晰的方向指令。",
    intuition:
      "从里到外阅读极限符号（limit notation）：函数（function）告诉我们观察哪个输出，箭头（arrow）告诉我们 x 正在移动到哪里，等号后的值告诉我们输出值（outputs）正在趋近哪里。",
    formalExplanation:
      "像 “lim as x approaches a of f(x) = L” 这样的陈述表示：当 x 取接近 a 的值时，对应的 f(x) 值趋近 L。箭头（arrow）表示趋近（approach），不是相等（equality）。",
    prerequisiteConnections: [
      {
        conceptId: "what-is-a-limit",
        title: "什么是极限（limit）？",
        connection:
          "只有先把极限（limit）看成趋近行为（approaching behavior），而不是直接代入（direct substitution），符号才有意义。",
      },
    ],
    workedExamples: [
      {
        title: "把符号（symbols）翻译成一句话",
        setup: "考虑陈述：lim as x approaches 5 of f(x) = 7。",
        walkthrough: [
          "正在观察的函数（function）是 f(x)。",
          "输入值（input value）x 正在趋近 5。",
          "输出值（output values）正在趋近 7。",
          "大声说出来：当 x 接近 5 时，f(x) 接近 7。",
        ],
        takeaway:
          "准确阅读符号（notation）会把数学符号变成关于运动（motion）和行为（behavior）的清晰陈述。",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "在表达式 lim as x approaches 3 of g(x) = -2 中，3 描述的是什么？",
        hint: "它和 x 绑定，而不是和 g(x) 绑定。",
        targetInsight: "3 是 x 正在趋近的输入值（input value）。",
      },
      {
        prompt: "为什么箭头（arrow）不表示 x 等于目标值（target value）？",
        hint: "极限符号（limit notation）研究附近输入值（nearby inputs）。",
        targetInsight:
          "箭头（arrow）表示 x 接近目标值，不要求 x 正好等于它。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "箭头（arrow）表示 x 等于目标值（target value）。",
        checkPrompt:
          "如果 x 只需要等于目标值，为什么不直接写 f(a)，还需要极限符号（limit notation）？",
        correction:
          "箭头（arrow）表示趋近（approach）。极限符号（limit notation）研究目标周围的值，这能揭示 f(a) 本身看不到的行为。",
      },
      {
        misconception:
          "被趋近的输出值（approached output）应该写在 limit 符号下面和 x 放在一起。",
        checkPrompt:
          "符号的哪一部分描述输入移动（input movement），哪一部分描述输出目标（output destination）？",
        correction:
          "下标描述 x 趋近目标输入值（target input）；等号后的表达式描述输出值（output value）趋近哪里。",
      },
    ],
    reflectionPrompt: {
      prompt:
        "把一个极限表达式（limit statement）改写成普通语言，并标出输入移动（input movement）和输出目标（output destination）。",
      sentenceStarter:
        "当 x 趋近 ____ 时，____ 的值趋近 ____。",
    },
    applicationPrompt: {
      title: "把图像观察（graph observation）转换成符号",
      prompt:
        "如果图像（graph）在 x 趋近 1 时趋近 y = -2，写出对应的极限表达式（limit statement），并解释每一部分。",
      whyItTransfers:
        "AP 题经常要求学生在图像（graphs）、文字（words）和符号（notation）之间转换。",
    },
    keyTakeaways: [
      "极限符号（limit notation）是一句关于输入移动（input movement）和输出行为（output behavior）的句子。",
      "箭头（arrow）表示趋近（approach），不是相等（equality）。",
      "精确阅读符号（notation）能避免许多早期极限错误（limit errors）。",
    ],
  },
  "estimating-limits-from-graphs": {
    conceptId: "estimating-limits-from-graphs",
    title: "从图像估计极限（estimating limits from graphs）",
    objective: {
      title: "用图像行为（graph behavior）估计极限（limits）",
      description:
        "判断图像（graph）是否从目标输入值（target input）的两侧趋近同一个输出值（output value）。",
      successCriteria: [
        "从左侧和右侧追踪图像（trace the graph）。",
        "使用被趋近的 y 值（approached y-values），不要只看实心点（filled point）。",
        "解释双侧极限（two-sided limit）何时存在或不存在。",
      ],
    },
    hook:
      "图像（graph）能让你看到极限（limit）正在发生。不是先计算，而是沿着曲线走，问它正在朝哪里去。",
    intuition:
      "从左侧靠近目标 x 值（target x-value），观察图像高度（height）。再从右侧靠近。如果两侧都朝同一个高度前进，双侧极限（two-sided limit）存在。",
    formalExplanation:
      "当图像（graph）在 x = a 左侧行为（left-hand behavior）和右侧行为（right-hand behavior）都趋近同一个 y 值（y-value）时，双侧极限（two-sided limit）存在。x = a 处实际画出的点可能支持、干扰，或与极限无关。",
    prerequisiteConnections: [
      {
        conceptId: "what-is-a-limit",
        title: "什么是极限（limit）？",
        connection:
          "从图像估计（graph estimation）依赖于理解极限（limit）关心附近行为（nearby behavior）。",
      },
      {
        conceptId: "limit-notation",
        title: "极限符号（limit notation）",
        connection:
          "符号（notation）提供了精确表达图像行为（graphical behavior）的方式。",
      },
    ],
    workedExamples: [
      {
        title: "空点（open point）和实心点（filled point）",
        setup:
          "在 x = 2 附近，图像（graph）从两侧趋近 y = 3 的空心圆点（open circle），但在 y = 1 有一个实心点（filled point）。",
        walkthrough: [
          "从左侧追踪到 x = 2，观察 y 趋近 3。",
          "从右侧追踪到 x = 2，观察 y 也趋近 3。",
          "注意实心点（filled point）给出的是 f(2)，不是极限（limit）。",
          "得出结论：极限（limit）是 3。",
        ],
        takeaway:
          "决定极限（limit）的是图像的趋近行为（approach behavior），不是最显眼的那个点。",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "从图像（graph）判断双侧极限（two-sided limit）是否存在时，你应该比较什么？",
        hint: "想想左侧（left side）和右侧（right side）。",
        targetInsight:
          "比较目标输入值（target input）左侧和右侧所趋近的 y 值（y-values）。",
      },
      {
        prompt:
          "如果图像（graph）有一个 y = 1 的实心点（filled point），但两侧都趋近 y = 3，哪个值属于极限（limit）？",
        hint: "实心点（filled point）是 f(a)，不一定是极限（limit）。",
        targetInsight: "极限（limit）是 3，因为两侧都趋近 3。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "实心点（filled point）总是决定极限（limit）。",
        checkPrompt:
          "实心点（filled point）告诉你什么？附近图像行为（nearby graph behavior）告诉你什么？",
        correction:
          "实心点（filled point）告诉函数值（function value）。附近图像行为（nearby graph behavior）告诉极限（limit）。",
      },
      {
        misconception:
          "只要目标点（target point）有任何点，极限（limit）就一定存在。",
        checkPrompt:
          "如果左侧趋近 y = 2，右侧趋近 y = 5，会怎样？",
        correction:
          "如果两侧趋近不同的值，双侧极限（two-sided limit）不存在。",
      },
    ],
    reflectionPrompt: {
      prompt:
        "描述你从图像估计极限（estimating a limit from a graph）时，眼睛应该做的两个动作。",
      sentenceStarter:
        "我先从 ____ 追踪图像（graph），再从 ____ 追踪。",
    },
    applicationPrompt: {
      title: "先估计（estimate），再写符号（symbolize）",
      prompt:
        "给定一个标出目标 x 值（target x-value）的图像（graph），先估计左侧行为（left behavior）、右侧行为（right behavior），再给出双侧结论（two-sided conclusion）。",
      whyItTransfers:
        "这能训练 AP 图像解读（graph interpretation），而不会把任务变成机械选答案。",
    },
    keyTakeaways: [
      "通过追踪两侧（both sides）来估计图像极限（graph limits）。",
      "实心点（filled point）可能表示 f(a)，不是极限（limit）。",
      "双侧极限（two-sided limits）要求左侧和右侧一致（left and right agreement）。",
    ],
  },
  "one-sided-limits": {
    conceptId: "one-sided-limits",
    title: "单侧极限（one-sided limits）",
    objective: {
      title: "分析左侧行为（left-hand behavior）和右侧行为（right-hand behavior）",
      description:
        "解释 x 只从一个方向趋近目标时的函数行为（function behavior），并用单侧极限（one-sided limits）判断双侧极限（two-sided limit）。",
      successCriteria: [
        "解释左极限（left-hand limit）和右极限（right-hand limit）符号。",
        "区分趋近方向（approach direction）和输出符号（output sign）。",
        "用单侧极限（one-sided limits）判断双侧极限（two-sided limit）是否存在。",
      ],
    },
    hook:
      "有时候图像（graph）的两侧会讲不同的故事。单侧极限（one-sided limits）让你分别听清每一侧。",
    intuition:
      "从左侧趋近表示 x 值（x-values）小于目标并向它移动；从右侧趋近表示 x 值大于目标并向它移动。符号里的正负号描述方向（direction），不是答案是正数还是负数。",
    formalExplanation:
      "左极限（left-hand limit）描述 x 从小于 a 的值趋近 a 时 f(x) 的行为。右极限（right-hand limit）描述 x 从大于 a 的值趋近 a 时 f(x) 的行为。只有两个单侧极限（one-sided limits）都存在且相等时，双侧极限（two-sided limit）才存在。",
    prerequisiteConnections: [
      {
        conceptId: "what-is-a-limit",
        title: "什么是极限（limit）？",
        connection:
          "单侧极限（one-sided limits）是在同一个趋近思想（approaching idea）上增加方向（direction）。",
      },
      {
        conceptId: "limit-notation",
        title: "极限符号（limit notation）",
        connection:
          "上标的加号和减号（plus and minus superscripts）是需要准确阅读的符号细节。",
      },
      {
        conceptId: "estimating-limits-from-graphs",
        title: "从图像估计极限（estimating limits from graphs）",
        connection:
          "追踪图像（graph tracing）是比较单侧行为（one-sided behavior）的主要视觉习惯。",
      },
    ],
    workedExamples: [
      {
        title: "边界处的跳跃（jump）",
        setup:
          "当 x 从左侧趋近 0 时，图像（graph）趋近 y = 2；当 x 从右侧趋近 0 时，图像趋近 y = 5。",
        walkthrough: [
          "把左极限（left-hand limit）记为 2。",
          "把右极限（right-hand limit）记为 5。",
          "比较两个单侧值（one-sided values）。",
          "因为它们不同，双侧极限（two-sided limit）不存在。",
        ],
        takeaway:
          "单侧极限（one-sided limits）不仅告诉我们双侧极限不存在，还解释它为什么失败。",
      },
    ],
    guidedQuestions: [
      {
        prompt: "在右极限（right-hand limit）符号中，加号描述什么？",
        hint: "它描述 x 从哪一侧来。",
        targetInsight:
          "加号表示 x 从大于目标值（values greater than the target）的右侧趋近。",
      },
      {
        prompt:
          "要让双侧极限（two-sided limit）存在，左极限（left-hand limit）和右极限（right-hand limit）必须满足什么？",
        hint: "两侧需要讲同一个故事。",
        targetInsight:
          "它们都必须存在，并且趋近同一个值（same value）。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "加号表示极限值（limit value）是正的。",
        checkPrompt: "右极限（right-hand limit）能趋近一个负的 y 值吗？",
        correction:
          "可以。加号描述从右侧趋近（approaching from the right），不是输出值（output）的正负。",
      },
      {
        misconception:
          "当两个单侧极限（one-sided limits）不同，双侧极限（two-sided limit）仍然可以存在。",
        checkPrompt:
          "如果一侧趋近 2，另一侧趋近 5，函数整体正在趋近哪一个单一值？",
        correction:
          "没有单一的趋近值（single approached value），所以双侧极限（two-sided limit）不存在。",
      },
    ],
    reflectionPrompt: {
      prompt: "你会怎样解释趋近方向（approach direction）和输出值（output value）的区别？",
      sentenceStarter:
        "方向（direction）告诉我 ____，而输出值（output value）告诉我 ____。",
    },
    applicationPrompt: {
      title: "诊断双侧极限（two-sided limit）",
      prompt:
        "给定目标输入值（target input）附近的左侧和右侧图像行为（graph behavior），判断双侧极限（two-sided limit）是否存在，并说明理由。",
      whyItTransfers:
        "这是许多 AP 分段函数（piecewise functions）和跳跃间断（jump discontinuities）题背后的推理。",
    },
    keyTakeaways: [
      "单侧极限（one-sided limits）隔离某一个方向的行为。",
      "正负号描述输入方向（input direction）。",
      "双侧极限（two-sided limit）只有在两侧一致时才存在。",
    ],
  },
  "infinite-limits": {
    conceptId: "infinite-limits",
    title: "无穷极限（infinite limits）",
    objective: {
      title: "描述无界极限行为（unbounded limit behavior）",
      description:
        "识别函数值（function values）在目标输入值（target input）附近无限增大或无限减小的情况，尤其是垂直渐近线（vertical asymptotes）附近。",
      successCriteria: [
        "使用无界（unbounded）的语言，而不是把无穷（infinity）当作数字。",
        "从图像（graph）识别正无穷（positive infinity）和负无穷（negative infinity）行为。",
        "把方向性行为（directional behavior）和垂直渐近线（vertical asymptotes）联系起来。",
      ],
    },
    hook:
      "有些极限（limits）不会停在一个有限高度（finite height）附近。图像（graph）会向上或向下无界延伸，而这种行为仍然表达了精确的信息。",
    intuition:
      "想象走向悬崖边，图像（graph）陡峭上升到无论你看多高它还在继续。无穷极限（infinite limits）描述的是这种无界方向（unbounded direction），不是函数最终到达的某个数字。",
    formalExplanation:
      "无穷极限（infinite limit）描述当 x 趋近目标值（target value）时，f(x) 无界增大（increasing without bound）或无界减小（decreasing without bound）。符号可能使用正无穷或负无穷表示无界行为的方向，但无穷（infinity）不是实数输出（real number output）。",
    prerequisiteConnections: [
      {
        conceptId: "what-is-a-limit",
        title: "什么是极限（limit）？",
        connection:
          "学生仍然需要趋近思想（approaching idea），只是现在输出值（outputs）不趋近某个有限数（finite number）。",
      },
      {
        conceptId: "limit-notation",
        title: "极限符号（limit notation）",
        connection:
          "符号（notation）帮助区分正在趋近的输入（approaching input）和无界输出（unbounded output）的方向。",
      },
      {
        conceptId: "one-sided-limits",
        title: "单侧极限（one-sided limits）",
        connection:
          "垂直渐近线（vertical asymptote）两侧的无穷行为（infinite behavior）可能不同。",
      },
    ],
    workedExamples: [
      {
        title: "垂直渐近线（vertical asymptote）的两侧",
        setup:
          "在 x = 2 附近，图像（graph）从左侧无界下降，从右侧无界上升。",
        walkthrough: [
          "从左侧趋近 x = 2，观察 y 值（y-values）无界减小（decreasing without bound）。",
          "从右侧趋近 x = 2，观察 y 值（y-values）无界增大（increasing without bound）。",
          "分别陈述两个单侧行为（one-sided behaviors）。",
          "不要把无穷（infinity）叫作函数值（function value）；要描述无界趋势（unbounded trend）。",
        ],
        takeaway:
          "无穷极限（infinite limits）是对无界行为（unbounded behavior）的方向性描述，常出现在垂直渐近线（vertical asymptotes）附近。",
      },
    ],
    guidedQuestions: [
      {
        prompt: "为什么应避免说函数（function）等于无穷（infinity）？",
        hint: "无穷（infinity）不是实数输出（real number output）。",
        targetInsight:
          "函数值（function values）是无界增长（grow without bound），不是到达无穷这个数字。",
      },
      {
        prompt:
          "为什么在垂直渐近线（vertical asymptote）附近，单侧符号（one-sided notation）很重要？",
        hint: "两侧可能朝不同方向走。",
        targetInsight:
          "一侧可能趋近正无穷（positive infinity），另一侧可能趋近负无穷（negative infinity）。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "无穷（infinity）是函数最终到达的一个数字。",
        checkPrompt:
          "图像（graph）能像到达 y = 4 一样到达无穷（infinity）吗？",
        correction:
          "不能。无穷极限符号（infinite limit notation）描述无界增长或下降，不是到达某个 y 值（y-value）。",
      },
      {
        misconception:
          "垂直渐近线（vertical asymptote）表示两侧都趋近正无穷（positive infinity）。",
        checkPrompt:
          "如果图像（graph）左侧下降、右侧上升，会怎样？",
        correction:
          "必须分别检查每一侧。无穷行为（infinite behavior）可以是正的、负的，也可以左右不同。",
      },
    ],
    reflectionPrompt: {
      prompt:
        "你会怎样描述无穷极限（infinite limit），同时不把无穷（infinity）当作普通输出？",
      sentenceStarter:
        "当 x 趋近 ____ 时，函数值（function values）变得 ____。",
    },
    applicationPrompt: {
      title: "读取渐近线行为（asymptote behavior）",
      prompt:
        "给定一个有垂直渐近线（vertical asymptote）的图像（graph），先用文字描述左极限（left-hand limit）和右极限（right-hand limit）的无穷行为，再写符号。",
      whyItTransfers:
        "这会建立学生处理有理函数极限（rational-function limits）前所需的概念语言（conceptual language）。",
    },
    keyTakeaways: [
      "无穷极限（infinite limits）描述无界行为（unbounded behavior）。",
      "无穷（infinity）不是函数值（function value）。",
      "在垂直渐近线（vertical asymptotes）附近，单侧行为（one-sided behavior）非常关键。",
    ],
  },
};

export function getLocalizedLessonContent(
  lesson: LessonContent,
  language: Language,
) {
  if (language === "en") {
    return lesson;
  }

  return zhLessons[lesson.conceptId] ?? lesson;
}
