import type { Language } from "@/components/i18n/language-provider";
import type { LessonContent } from "@/features/lessons/types";
import { unit1ExtensionZhLessons } from "../../curricula/ap-calculus-ab/unit-1-extension-lesson-localization.ts";
import { completeApCalculusZhLessonLocalizations } from "../../curricula/ap-calculus-ab/adaptive-lesson-localization.ts";

const zhLessonDrafts: Record<string, Partial<LessonContent>> = {
  ...unit1ExtensionZhLessons,
  "what-is-a-limit": {
    conceptId: "what-is-a-limit",
    title: "函数靠近一个点时，到底在看什么？",
    objective: {
      title: "理解“正在靠近”的函数行为",
      description:
        "把注意力从目标点本身移到它的附近，判断输入逐渐靠近时，函数输出正在朝哪个值靠近。",
      successCriteria: [
        "能根据附近的输入和输出描述极限。",
        "能分清极限值与目标点处的函数值。",
        "能用图像或表格说明输出正在靠近哪里。",
      ],
    },
    hook:
      "微积分真正开始的地方，不是问“这个点的值是多少”，而是问“函数在这个点附近正在朝哪里走”。",
    intuition:
      "把目标输入想成地铁站口。你可以从两边不断走近站口；门是开着、关着还是暂时检修，并不改变你正在靠近哪个位置。看函数图像也一样：先追踪 x 越来越接近目标时，y 正在靠近哪里。",
    formalExplanation:
      "当我们说 x 趋近于 a 时 f(x) 的极限（limit）是 L，意思是：只要 x 足够接近 a，f(x) 就会足够接近 L。注意，这里不要求 x 必须等于 a；重点是 a 附近的函数行为。",
    prerequisiteConnections: [],
    workedExamples: [
      {
        title: "有空点，但靠近的目标很清楚",
        setup:
          "图像在 (2, 4) 有一个空心点。x 从左边和右边靠近 2 时，曲线都越来越接近 y = 4。",
        walkthrough: [
          "先从左边靠近 x = 2，观察 y 值是不是接近 4。",
          "再从右边靠近 x = 2，观察 y 值是不是也接近 4。",
          "暂时不要被 x = 2 处到底有没有实心点干扰；附近的走势都指向 4。",
        ],
        takeaway:
          "只要两侧的附近行为一致，极限就可以存在；目标点有没有函数值是另一件事。",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "如果 f(2) 没有定义，但图像从两边都靠近 y = 4，我们应该怎样描述这个极限？",
        hint: "先看 x = 2 附近图像正在靠近哪里，不要只盯着 x = 2 这个点。",
        targetInsight:
          "极限是 4，因为附近的 y 值从两边都靠近 4。",
      },
      {
        prompt:
          "为什么只把 x = 2 代进去，不一定能判断极限是否存在？",
        hint: "代入看的是那个点；极限看的是那个点附近。",
        targetInsight:
          "代入检查 f(2)，而极限检查 x 靠近 2 时 f(x) 的走势。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "极限总是等于目标点处的函数值。",
        checkPrompt:
          "如果图像在 x = 2 附近靠近 y = 4，但实心点在 y = 1，会怎样？",
        correction:
          "极限仍然是 4。实心点告诉我们 f(2)，曲线的附近走势才告诉我们极限。",
      },
      {
        misconception: "图像有空点，极限就不存在。",
        checkPrompt: "空心点会阻止图像靠近某个明确的 y 值吗？",
        correction:
          "不会。空点可能说明 f(a) 没有定义，但两侧仍然可以靠近同一个值。",
      },
    ],
    reflectionPrompt: {
      prompt: "如果不能照抄定义，你会怎样用一句话解释极限？",
      sentenceStarter:
        "极限描述的是：当输入 ____ 时，函数输出正在靠近 ____。",
    },
    applicationPrompt: {
      title: "先识别极限，再考虑计算",
      prompt:
        "看到图像、表格或文字描述时，先圈出目标输入，再分别检查附近输出正在靠近哪里。",
      whyItTransfers:
        "很多 AP 极限题在动手计算前，首先考的是你能不能认出题目描述的附近行为。",
    },
    keyTakeaways: [
      "极限描述目标输入附近的函数行为。",
      "目标点的函数值可以与极限不同，也可以不存在。",
      "图像、表格和符号都在表达同一个“靠近”的过程。",
    ],
  },
  "limit-notation": {
    conceptId: "limit-notation",
    title: "怎样读懂极限符号？",
    objective: {
      title: "读懂并写出极限表达式",
      description:
        "把极限符号还原成一句清楚的话：哪个输入在靠近哪里，哪个输出又在靠近什么值。",
      successCriteria: [
        "能指出 x 正在靠近哪个输入。",
        "能指出题目正在观察哪个函数。",
        "能说出函数输出正在靠近哪个目标值。",
      ],
    },
    hook:
      "极限符号看起来像一串密码，其实只是把一句话压缩了：输入往哪里走，输出又往哪里去。",
    intuition:
      "读极限符号时，可以从里到外看：函数告诉我们观察哪个输出，箭头告诉我们 x 正在往哪里靠近，等号右边告诉我们函数值正在靠近哪个结果。",
    formalExplanation:
      "像“当 x 趋近于 a 时，f(x) 的极限是 L”这样的表达，意思是：当 x 取越来越接近 a 的值时，对应的 f(x) 越来越接近 L。箭头表示靠近，不表示等于。",
    prerequisiteConnections: [
      {
        conceptId: "what-is-a-limit",
        title: "极限看的是附近行为",
        connection:
          "如果已经分清附近趋势与目标点取值，符号只是把这层关系写得更精确。",
      },
    ],
    workedExamples: [
      {
        title: "把符号翻译成一句话",
        setup: "考虑这个表达：当 x 趋近于 5 时，f(x) 的极限是 7。",
        walkthrough: [
          "正在观察的函数是 f(x)。",
          "输入值 x 正在靠近 5。",
          "函数值 f(x) 正在靠近 7。",
          "可以读成：当 x 接近 5 时，f(x) 接近 7。",
        ],
        takeaway:
          "读懂极限符号，就是把符号变成关于“输入怎么动、输出往哪去”的清楚句子。",
      },
    ],
    guidedQuestions: [
      {
        prompt:
          "在“当 x 趋近于 3 时，g(x) 的极限是 -2”中，3 描述的是什么？",
        hint: "它跟 x 绑定，而不是跟 g(x) 绑定。",
        targetInsight: "3 是输入变量 x 正在靠近的目标。",
      },
      {
        prompt: "为什么箭头不表示 x 等于目标值？",
        hint: "极限符号研究的是附近输入值，而不只是目标点本身。",
        targetInsight:
          "箭头表示 x 越来越接近目标值，不要求 x 正好等于它。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "箭头表示 x 等于目标值。",
        checkPrompt:
          "如果只是让 x 等于目标值，为什么不直接写 f(a)，还要写极限符号？",
        correction:
          "箭头表示靠近。极限符号研究目标点周围的函数行为，这可能和 f(a) 本身不同。",
      },
      {
        misconception: "等号右边的数表示 x 要靠近的输入。",
        checkPrompt:
          "哪一部分描述输入值怎么移动？哪一部分描述输出值靠近哪里？",
        correction:
          "下标描述 x 靠近哪个输入值；等号右边描述函数值靠近哪个输出值。",
      },
    ],
    reflectionPrompt: {
      prompt: "把一个极限表达式改写成普通中文，并标出输入运动和输出目标。",
      sentenceStarter: "当 x 趋近于 ____ 时，____ 的值趋近于 ____。",
    },
    applicationPrompt: {
      title: "把图像观察写成符号",
      prompt:
        "如果图像在 x 趋近于 1 时靠近 y = -2，请写出对应的极限表达式，并解释每一部分。",
      whyItTransfers:
        "AP 题经常要求你在图像、文字和符号之间来回转换；读错任何一个位置都会改变整句含义。",
    },
    keyTakeaways: [
      "极限符号同时描述输入的运动和输出的目标。",
      "箭头表示靠近，不表示等于。",
      "精确读符号能避免很多早期极限错误。",
    ],
  },
  "estimating-limits-from-graphs": {
    conceptId: "estimating-limits-from-graphs",
    title: "怎样从图像读出极限？",
    objective: {
      title: "用图像行为估计极限",
      description:
        "沿着目标输入左右两侧的曲线分别靠近，判断它们是否指向同一个高度。",
      successCriteria: [
        "能从左侧和右侧分别追踪图像。",
        "能看被靠近的 y 值，而不是只看实心点。",
        "能解释双侧极限什么时候存在，什么时候不存在。",
      ],
    },
    hook:
      "看图求极限时，先别找公式，也别急着看实心点。让视线沿曲线从左、右两边走向目标，答案藏在曲线要去的高度里。",
    intuition:
      "把手指放在曲线左侧，沿图像滑向目标，再从右侧重复一次。两次都指向同一高度，才有一个共同的双侧极限。",
    formalExplanation:
      "当图像在 x = a 左侧和右侧都靠近同一个 y 值时，双侧极限（two-sided limit）存在。x = a 处画出来的点可能支持这个结论，也可能干扰你，甚至和极限无关。",
    prerequisiteConnections: [
      {
        conceptId: "what-is-a-limit",
        title: "极限看的是附近行为",
        connection:
          "从图像估计极限时，要把曲线的附近走势与目标点的取值分开。",
      },
      {
        conceptId: "limit-notation",
        title: "极限符号",
        connection:
          "符号能把你在图像上看到的行为表达得更准确。",
      },
    ],
    workedExamples: [
      {
        title: "空心点和实心点同时出现",
        setup:
          "在 x = 2 附近，图像从两侧都靠近 y = 3 的空心点，但在 y = 1 有一个实心点。",
        walkthrough: [
          "从左侧追踪到 x = 2，看到 y 值靠近 3。",
          "从右侧追踪到 x = 2，看到 y 值也靠近 3。",
          "注意实心点给的是 f(2)，不一定是极限。",
          "所以这个极限是 3。",
        ],
        takeaway:
          "决定极限的是图像的靠近行为，而不是最显眼的那个点。",
      },
    ],
    guidedQuestions: [
      {
        prompt: "从图像怎么看双侧极限是否存在？你应该比较什么？",
        hint: "想想左侧和右侧。",
        targetInsight: "比较目标输入值左侧和右侧分别靠近的 y 值。",
      },
      {
        prompt:
          "如果实心点在 y = 1，但两侧曲线都靠近 y = 3，哪个值属于极限？",
        hint: "实心点是 f(a)，不一定是极限。",
        targetInsight: "极限是 3，因为两侧的附近走势都指向 3。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "图上最显眼的实心点一定就是极限。",
        checkPrompt: "实心点告诉你什么？附近图像行为告诉你什么？",
        correction:
          "实心点告诉你函数值；两侧曲线的附近走势才告诉你极限。",
      },
      {
        misconception: "目标位置只要画了点，极限就一定存在。",
        checkPrompt: "如果左侧靠近 y = 2，右侧靠近 y = 5，会怎样？",
        correction:
          "两侧靠近不同的值时，没有共同目标，因此双侧极限不存在。",
      },
    ],
    reflectionPrompt: {
      prompt: "从图像估计极限时，你的眼睛应该做哪两个动作？",
      sentenceStarter: "我先从 ____ 追踪图像，再从 ____ 追踪。",
    },
    applicationPrompt: {
      title: "先估计，再写符号",
      prompt:
        "给定一个标出目标 x 值的图像，先分别写出左侧、右侧靠近的高度，再给出双侧结论。",
      whyItTransfers:
        "这训练的是 AP 图像解读能力，而不是机械选答案。",
    },
    keyTakeaways: [
      "估计图像极限时要分别看两侧。",
      "实心点表示 f(a)，不一定表示极限。",
      "双侧极限要求左侧和右侧靠近同一个值。",
    ],
  },
  "one-sided-limits": {
    conceptId: "one-sided-limits",
    title: "从左边看，还是从右边看？",
    objective: {
      title: "分析左侧和右侧的函数行为",
      description:
        "分别描述 x 从左侧或右侧靠近目标值时的函数行为，再判断两侧能否合成一个双侧极限。",
      successCriteria: [
        "能读懂左极限和右极限的符号。",
        "能区分靠近方向和输出值正负。",
        "能用单侧极限判断双侧极限是否存在。",
      ],
    },
    hook:
      "同一个路口，从东边来和从西边来可能看到完全不同的路况。函数在目标点两侧也可能给出不同答案，所以要先把两边分开看。",
    intuition:
      "从左侧靠近，表示 x 的值小于目标值并向它移动；从右侧靠近，表示 x 的值大于目标值并向它移动。符号里的 + 和 - 说的是方向，不是答案的正负。",
    formalExplanation:
      "左极限（left-hand limit）描述 x 从小于 a 的值靠近 a 时 f(x) 的行为；右极限（right-hand limit）描述 x 从大于 a 的值靠近 a 时 f(x) 的行为。只有两个单侧极限都存在且相等，双侧极限（two-sided limit）才存在。",
    prerequisiteConnections: [
      {
        conceptId: "what-is-a-limit",
        title: "极限看的是靠近过程",
        connection:
          "单侧极限是在同一个“靠近”的想法上，加上方向这一层信息。",
      },
      {
        conceptId: "limit-notation",
        title: "极限符号",
        connection: "上标 + 和 - 是必须读准确的符号细节。",
      },
      {
        conceptId: "estimating-limits-from-graphs",
        title: "从图像估计极限",
        connection: "图像追踪是比较单侧行为最直观的方法。",
      },
    ],
    workedExamples: [
      {
        title: "跳跃处的两侧行为",
        setup:
          "当 x 从左侧靠近 0 时，图像靠近 y = 2；当 x 从右侧靠近 0 时，图像靠近 y = 5。",
        walkthrough: [
          "先记录左极限为 2。",
          "再记录右极限为 5。",
          "比较两个单侧值。",
          "因为它们不同，所以双侧极限不存在。",
        ],
        takeaway:
          "单侧极限不仅告诉我们双侧极限不存在，还解释了为什么不存在。",
      },
    ],
    guidedQuestions: [
      {
        prompt: "在右极限符号中，右上角的 + 号描述什么？",
        hint: "它描述 x 从哪一侧来。",
        targetInsight: "+ 号表示 x 从大于目标值的一侧靠近。",
      },
      {
        prompt:
          "要让双侧极限存在，左极限和右极限必须满足什么？",
        hint: "两侧需要讲同一个故事。",
        targetInsight: "它们都必须存在，并且靠近同一个值。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "右上角的 + 号表示极限值一定为正。",
        checkPrompt: "从右侧靠近时，函数能不能趋近一个负数？",
        correction: "可以。+ 号描述的是从右侧靠近，不是输出值的正负。",
      },
      {
        misconception:
          "左右两个单侧极限不同，双侧极限仍然可以存在。",
        checkPrompt: "如果一侧靠近 2，另一侧靠近 5，整体正在靠近哪个单一值？",
        correction:
          "没有共同靠近的单一值，所以双侧极限不存在。",
      },
    ],
    reflectionPrompt: {
      prompt: "你会怎样解释“靠近方向”和“输出值”的区别？",
      sentenceStarter: "方向告诉我 ____，输出值告诉我 ____。",
    },
    applicationPrompt: {
      title: "诊断双侧极限",
      prompt:
        "给定目标输入附近的左右图像行为，先分别写出两个单侧极限，再判断双侧极限是否存在。",
      whyItTransfers:
        "分段函数和跳跃间断题都要求先把左右两侧分开，再作整体判断。",
    },
    keyTakeaways: [
      "单侧极限只看一个方向的行为。",
      "+ 和 - 描述输入方向，不描述答案正负。",
      "双侧极限只有在左右两侧一致时才存在。",
    ],
  },
  "infinite-limits": {
    conceptId: "infinite-limits",
    title: "函数值会“冲向无穷”吗？",
    objective: {
      title: "描述无界的函数行为",
      description:
        "识别函数值在目标输入附近无界增大或无界减小的趋势，并把它与垂直渐近线联系起来。",
      successCriteria: [
        "能用“无界”描述行为，而不是把无穷当作普通数字。",
        "能从图像识别向上和向下的无界趋势。",
        "能分别说明垂直渐近线两侧的函数行为。",
      ],
    },
    hook:
      "有些极限不会靠近某个有限高度。图像会向上或向下冲得越来越远，而这种无界行为依然能表达很精确的信息。",
    intuition:
      "想象电梯楼层不断上升，显示屏上的数字越来越大，却没有出现一个叫“无穷”的终点。无穷极限描述的正是这种没有上界或下界的方向。",
    formalExplanation:
      "无穷极限（infinite limit）描述的是：当 x 靠近某个目标值时，f(x) 无限增大或无限减小。符号里可能写正无穷或负无穷，但无穷（infinity）不是一个实数输出。",
    prerequisiteConnections: [
      {
        conceptId: "what-is-a-limit",
        title: "极限描述趋近过程",
        connection:
          "这里仍然需要“靠近”的想法，只是输出值不再靠近某个有限数。",
      },
      {
        conceptId: "limit-notation",
        title: "极限符号",
        connection:
          "符号帮助区分正在靠近的输入值和输出值的无界方向。",
      },
      {
        conceptId: "one-sided-limits",
        title: "单侧极限",
        connection:
          "垂直渐近线两侧的无界方向可能完全不同。",
      },
    ],
    workedExamples: [
      {
        title: "垂直渐近线两侧方向不同",
        setup:
          "在 x = 2 附近，图像从左侧无限下降，从右侧无限上升。",
        walkthrough: [
          "从左侧靠近 x = 2，观察 y 值无限减小。",
          "从右侧靠近 x = 2，观察 y 值无限增大。",
          "把两个单侧行为分开说。",
          "不要说函数值等于无穷；要说函数值呈现无界趋势。",
        ],
        takeaway:
          "无穷极限描述的是无界变化的方向，常出现在垂直渐近线附近。",
      },
    ],
    guidedQuestions: [
      {
        prompt: "为什么不要说“函数最后等于无穷”？",
        hint: "无穷不是一个实数输出。",
        targetInsight:
          "函数值是在无界增长或无界下降，而不是到达一个叫无穷的数字。",
      },
      {
        prompt: "为什么在垂直渐近线附近常常要分别看左右两侧？",
        hint: "两侧可能朝不同方向走。",
        targetInsight:
          "一侧可能趋向正无穷，另一侧可能趋向负无穷。",
      },
    ],
    misconceptionChecks: [
      {
        misconception: "无穷是函数最终到达的一个数。",
        checkPrompt: "图像能像到达 y = 4 一样到达无穷吗？",
        correction:
          "不能。无穷极限符号描述的是无界增长或下降，不是到达某个 y 值。",
      },
      {
        misconception:
          "只要有垂直渐近线，两侧都一定向上趋向正无穷。",
        checkPrompt: "如果图像左侧下降、右侧上升，会怎样？",
        correction:
          "必须分别检查每一侧。无界行为可能是正的、负的，也可能左右不同。",
      },
    ],
    reflectionPrompt: {
      prompt: "怎样描述无穷极限，同时不把无穷当成普通函数值？",
      sentenceStarter: "当 x 趋近于 ____ 时，函数值不断 ____，而且没有界限。",
    },
    applicationPrompt: {
      title: "读懂渐近线附近的行为",
      prompt:
        "给定一个有垂直渐近线的图像，先用文字描述左右两侧的无界方向，再写出相应符号。",
      whyItTransfers:
        "先说清方向，再处理有理函数的符号和代数，可以避免把左右两侧混在一起。",
    },
    keyTakeaways: [
      "无穷极限描述函数值的无界趋势。",
      "无穷不是函数实际取到的某个数。",
      "垂直渐近线附近尤其要分别检查左右两侧。",
    ],
  },
};

export const zhLessons =
  completeApCalculusZhLessonLocalizations(zhLessonDrafts);

export function getLocalizedLessonContent(
  lesson: LessonContent,
  language: Language,
) {
  if (language === "en") {
    return lesson;
  }

  return {
    ...lesson,
    ...zhLessons[lesson.conceptId],
  };
}
