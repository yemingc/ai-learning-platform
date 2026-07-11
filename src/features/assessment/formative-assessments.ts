import type {
  FormativeAssessment,
  FormativeAssessmentFeedback,
  FormativeAssessmentLocale,
  FormativeAssessmentPhase,
  FormativeAssessmentProvider,
} from "@/features/assessment/types";

export type LocalizedText = Record<FormativeAssessmentLocale, string>;

export type AssessmentQuestionDefinition = {
  id: string;
  prompt: LocalizedText;
  options: Array<{
    id: string;
    label: LocalizedText;
  }>;
  correctOptionId: string;
  explanation: LocalizedText;
};

export type ConceptAssessmentDefinition = Record<
  FormativeAssessmentPhase,
  AssessmentQuestionDefinition[]
>;

export type FormativeAssessmentBank = Record<
  string,
  ConceptAssessmentDefinition
>;

const COURSE_ID = "ap-calculus-ab";
const ASSESSMENT_VERSION = "unit-1-formative-v1";

function text(en: string, zh: string): LocalizedText {
  return { en, zh };
}

function question(
  id: string,
  prompt: LocalizedText,
  options: Array<[string, LocalizedText]>,
  correctOptionId: string,
  explanation: LocalizedText,
): AssessmentQuestionDefinition {
  return {
    id,
    prompt,
    options: options.map(([optionId, label]) => ({ id: optionId, label })),
    correctOptionId,
    explanation,
  };
}

const assessmentBank: FormativeAssessmentBank = {
  "what-is-a-limit": {
    diagnostic: [
      question(
        "what-is-a-limit-d1",
        text(
          "What does lim x→2 f(x) = 5 say?",
          "lim x→2 f(x) = 5 表达的是什么？",
        ),
        [
          ["a", text("f(2) must equal 5.", "f(2) 必须等于 5。")],
          [
            "b",
            text(
              "Nearby outputs approach 5 as x approaches 2.",
              "当 x 接近 2 时，附近的函数输出接近 5。",
            ),
          ],
          ["c", text("x eventually equals 5.", "x 最终会等于 5。")],
        ],
        "b",
        text(
          "A limit describes nearby behavior; it does not by itself determine f(2).",
          "极限描述的是附近行为；它本身并不能确定 f(2)。",
        ),
      ),
      question(
        "what-is-a-limit-d2",
        text(
          "A graph has a hole at (3, 7), and both sides approach the hole. What limit is supported?",
          "图像在 (3, 7) 有一个空点，左右两侧都趋近这个空点。可以判断哪个极限？",
        ),
        [
          ["a", text("The limit is 3.", "极限是 3。")],
          ["b", text("The limit does not exist.", "极限不存在。")],
          ["c", text("The limit is 7.", "极限是 7。")],
        ],
        "c",
        text(
          "The missing point does not prevent nearby y-values from approaching 7.",
          "点是否缺失不影响附近的 y 值趋近 7。",
        ),
      ),
    ],
    exit_ticket: [
      question(
        "what-is-a-limit-e1",
        text(
          "If nearby values of g(x) approach -1 as x→4 but g(4)=6, which statement is correct?",
          "当 x→4 时，g(x) 的附近值趋近 -1，但 g(4)=6。哪个说法正确？",
        ),
        [
          ["a", text("The limit is -1.", "极限是 -1。")],
          ["b", text("The limit is 6.", "极限是 6。")],
          ["c", text("No limit can exist.", "极限不可能存在。")],
        ],
        "a",
        text(
          "The limit follows the nearby outputs, even when the function value differs.",
          "极限由附近输出决定，即使函数值与它不同。",
        ),
      ),
      question(
        "what-is-a-limit-e2",
        text(
          "Which evidence is essential for a two-sided finite limit at x=c?",
          "判断 x=c 处存在有限的双侧极限，哪项证据是必要的？",
        ),
        [
          ["a", text("f(c) is defined.", "f(c) 有定义。")],
          [
            "b",
            text(
              "Outputs from both sides approach the same value.",
              "左右两侧的输出趋近同一个值。",
            ),
          ],
          ["c", text("The graph has a filled point.", "图像上有一个实心点。")],
        ],
        "b",
        text(
          "A two-sided limit requires agreement of the left- and right-hand behavior.",
          "双侧极限要求左侧和右侧行为一致。",
        ),
      ),
    ],
  },
  "limit-notation": {
    diagnostic: [
      question(
        "limit-notation-d1",
        text(
          "In lim x→a f(x)=L, what does x→a describe?",
          "在 lim x→a f(x)=L 中，x→a 描述什么？",
        ),
        [
          ["a", text("The input approaches a.", "输入趋近 a。")],
          ["b", text("The output approaches a.", "输出趋近 a。")],
          ["c", text("The input equals L.", "输入等于 L。")],
        ],
        "a",
        text(
          "The expression under the limit arrow tracks the input variable.",
          "极限箭头下方的表达式描述输入变量。",
        ),
      ),
      question(
        "limit-notation-d2",
        text(
          "Which notation asks about behavior only to the left of 3?",
          "哪个记号只考察 3 左侧的行为？",
        ),
        [
          ["a", text("x→3⁺", "x→3⁺")],
          ["b", text("x→3⁻", "x→3⁻")],
          ["c", text("x→∞", "x→∞")],
        ],
        "b",
        text(
          "The superscript minus indicates inputs less than the target.",
          "右上角的负号表示从小于目标值的一侧接近。",
        ),
      ),
    ],
    exit_ticket: [
      question(
        "limit-notation-e1",
        text(
          "Translate lim t→0 h(t)=4 into words.",
          "把 lim t→0 h(t)=4 翻译成文字。",
        ),
        [
          ["a", text("As t approaches 0, h(t) approaches 4.", "当 t 趋近 0 时，h(t) 趋近 4。")],
          ["b", text("As h approaches 0, t approaches 4.", "当 h 趋近 0 时，t 趋近 4。")],
          ["c", text("h(0) and h(4) are equal.", "h(0) 与 h(4) 相等。")],
        ],
        "a",
        text(
          "Read the input approach first and the output destination second.",
          "先读输入的趋近过程，再读输出的目标值。",
        ),
      ),
      question(
        "limit-notation-e2",
        text(
          "What would prove lim x→2 f(x) does not exist?",
          "什么情况可以证明 lim x→2 f(x) 不存在？",
        ),
        [
          ["a", text("f(2) is undefined.", "f(2) 没有定义。")],
          ["b", text("The one-sided limits are unequal.", "两个单侧极限不相等。")],
          ["c", text("The graph has an open point.", "图像上有空点。")],
        ],
        "b",
        text(
          "Unequal one-sided limits prevent a shared two-sided destination.",
          "单侧极限不相等，就不存在共同的双侧目标值。",
        ),
      ),
    ],
  },
  "estimating-limits-from-graphs": {
    diagnostic: [
      question(
        "estimating-limits-from-graphs-d1",
        text(
          "When reading a limit from a graph, what should you trace first?",
          "从图像估计极限时，应该先追踪什么？",
        ),
        [
          ["a", text("The filled point at the target.", "目标位置的实心点。")],
          ["b", text("The curve from both sides of the target.", "目标值左右两侧的曲线。")],
          ["c", text("Only the y-intercept.", "只看 y 轴截距。")],
        ],
        "b",
        text(
          "A graphical limit is determined by the height approached from both sides.",
          "图像极限由左右两侧共同趋近的高度决定。",
        ),
      ),
      question(
        "estimating-limits-from-graphs-d2",
        text(
          "The curve approaches y=2 from both sides at x=1, while a filled point is at y=5. What is the limit?",
          "当 x=1 时，曲线左右两侧都趋近 y=2，但实心点位于 y=5。极限是多少？",
        ),
        [
          ["a", text("1", "1")],
          ["b", text("2", "2")],
          ["c", text("5", "5")],
        ],
        "b",
        text(
          "The approached height is 2; the filled point records only f(1).",
          "趋近的高度是 2；实心点只表示 f(1)。",
        ),
      ),
    ],
    exit_ticket: [
      question(
        "estimating-limits-from-graphs-e1",
        text(
          "A graph approaches y=4 from the left and y=-1 from the right at x=0. What is the two-sided limit?",
          "在 x=0 处，图像左侧趋近 y=4，右侧趋近 y=-1。双侧极限是多少？",
        ),
        [
          ["a", text("4", "4")],
          ["b", text("-1", "-1")],
          ["c", text("It does not exist.", "不存在。")],
        ],
        "c",
        text(
          "The two sides must approach the same height for a two-sided limit to exist.",
          "双侧极限存在要求左右两侧趋近同一高度。",
        ),
      ),
      question(
        "estimating-limits-from-graphs-e2",
        text(
          "Which graph feature can be ignored when estimating lim x→c f(x)?",
          "估计 lim x→c f(x) 时，哪个图像特征可以不决定极限？",
        ),
        [
          ["a", text("The direction of approach on each side.", "左右两侧的趋近方向。")],
          ["b", text("The y-values near c.", "c 附近的 y 值。")],
          ["c", text("Whether the point at c is filled or open.", "c 处是实心点还是空点。")],
        ],
        "c",
        text(
          "Point style affects f(c), while the limit depends on nearby behavior.",
          "点的样式影响 f(c)，而极限取决于附近行为。",
        ),
      ),
    ],
  },
  "one-sided-limits": {
    diagnostic: [
      question(
        "one-sided-limits-d1",
        text(
          "What does x→2⁺ mean?",
          "x→2⁺ 表示什么？",
        ),
        [
          ["a", text("x approaches 2 through values greater than 2.", "x 从大于 2 的一侧趋近 2。")],
          ["b", text("x approaches positive 2 from either side.", "x 从任意一侧趋近正数 2。")],
          ["c", text("f(x) must be positive.", "f(x) 必须为正。")],
        ],
        "a",
        text(
          "The plus sign identifies inputs on the right side of the target.",
          "正号表示目标值右侧的输入。",
        ),
      ),
      question(
        "one-sided-limits-d2",
        text(
          "When does lim x→c f(x) exist as a finite number?",
          "什么时候 lim x→c f(x) 作为有限数存在？",
        ),
        [
          ["a", text("At least one one-sided limit exists.", "至少一个单侧极限存在。")],
          ["b", text("Both one-sided limits exist and are equal.", "两个单侧极限都存在且相等。")],
          ["c", text("f(c) is positive.", "f(c) 为正。")],
        ],
        "b",
        text(
          "A two-sided limit is the shared value of the two one-sided limits.",
          "双侧极限是两个单侧极限的共同值。",
        ),
      ),
    ],
    exit_ticket: [
      question(
        "one-sided-limits-e1",
        text(
          "If lim x→1⁻ f(x)=3 and lim x→1⁺ f(x)=3, what follows?",
          "如果 lim x→1⁻ f(x)=3 且 lim x→1⁺ f(x)=3，可以得到什么结论？",
        ),
        [
          ["a", text("lim x→1 f(x)=3.", "lim x→1 f(x)=3。")],
          ["b", text("f(1)=3 must hold.", "f(1)=3 必须成立。")],
          ["c", text("The limit does not exist.", "极限不存在。")],
        ],
        "a",
        text(
          "Matching one-sided limits establish the two-sided limit, but not the point value.",
          "相等的单侧极限可以确定双侧极限，但不能确定函数值。",
        ),
      ),
      question(
        "one-sided-limits-e2",
        text(
          "At a jump, the left-hand limit is -2 and the right-hand limit is 5. Which statement is precise?",
          "在一个跳跃点，左极限为 -2，右极限为 5。哪个表述准确？",
        ),
        [
          ["a", text("The two-sided limit is 1.5.", "双侧极限是 1.5。")],
          ["b", text("The two-sided limit does not exist because the sides disagree.", "由于两侧不一致，双侧极限不存在。")],
          ["c", text("The right-hand limit overrides the left.", "右极限覆盖左极限。")],
        ],
        "b",
        text(
          "One-sided limits are not averaged or prioritized; they must agree.",
          "单侧极限不能取平均，也没有优先级；它们必须相等。",
        ),
      ),
    ],
  },
  "infinite-limits": {
    diagnostic: [
      question(
        "infinite-limits-d1",
        text(
          "What does lim x→2 f(x)=+∞ describe?",
          "lim x→2 f(x)=+∞ 描述什么？",
        ),
        [
          ["a", text("f(x) grows without bound as x approaches 2.", "当 x 趋近 2 时，f(x) 无界增大。")],
          ["b", text("x grows without bound.", "x 无界增大。")],
          ["c", text("f(2) is the number infinity.", "f(2) 等于无穷这个数。")],
        ],
        "a",
        text(
          "An infinite limit describes unbounded output near a finite input.",
          "无穷极限描述有限输入附近的输出无界变化。",
        ),
      ),
      question(
        "infinite-limits-d2",
        text(
          "If f(x)→-∞ from the left and f(x)→+∞ from the right at x=0, what can be said?",
          "在 x=0 处，f(x) 从左侧趋近 -∞，从右侧趋近 +∞。可以说什么？",
        ),
        [
          ["a", text("The two-sided limit is +∞.", "双侧极限是 +∞。")],
          ["b", text("The two-sided limit does not exist, and x=0 is a vertical asymptote.", "双侧极限不存在，且 x=0 是垂直渐近线。")],
          ["c", text("The two-sided limit is 0.", "双侧极限是 0。")],
        ],
        "b",
        text(
          "Opposite unbounded directions do not form one two-sided limit, though they support a vertical asymptote.",
          "相反的无界方向不能形成同一个双侧极限，但仍说明存在垂直渐近线。",
        ),
      ),
    ],
    exit_ticket: [
      question(
        "infinite-limits-e1",
        text(
          "For f(x)=1/(x-3), what is lim x→3⁺ f(x)?",
          "对于 f(x)=1/(x-3)，lim x→3⁺ f(x) 是多少？",
        ),
        [
          ["a", text("+∞", "+∞")],
          ["b", text("-∞", "-∞")],
          ["c", text("0", "0")],
        ],
        "a",
        text(
          "To the right of 3, the denominator is a tiny positive number, so the quotient is large positive.",
          "在 3 的右侧，分母是很小的正数，因此商为很大的正数。",
        ),
      ),
      question(
        "infinite-limits-e2",
        text(
          "Which fact is sufficient to identify x=c as a vertical asymptote?",
          "哪个事实足以判断 x=c 是垂直渐近线？",
        ),
        [
          ["a", text("At least one one-sided limit is +∞ or -∞.", "至少一个单侧极限是 +∞ 或 -∞。")],
          ["b", text("f(c)=0.", "f(c)=0。")],
          ["c", text("Both sides approach the same finite value.", "两侧趋近同一个有限值。")],
        ],
        "a",
        text(
          "Unbounded behavior from either side is enough for a vertical asymptote.",
          "任意一侧出现无界行为，就足以形成垂直渐近线。",
        ),
      ),
    ],
  },
  "evaluating-limits-with-limit-laws": {
    diagnostic: [
      question(
        "evaluating-limits-with-limit-laws-d1",
        text(
          "When is direct substitution justified for a rational function at x=c?",
          "什么时候可以对有理函数在 x=c 处直接代入？",
        ),
        [
          ["a", text("Whenever the numerator is zero.", "只要分子为零。")],
          ["b", text("When the denominator is nonzero at c.", "当分母在 c 处不为零。")],
          ["c", text("Only when c=0.", "只有 c=0 时。")],
        ],
        "b",
        text(
          "A rational function is continuous where its denominator is nonzero.",
          "有理函数在分母不为零的点连续。",
        ),
      ),
      question(
        "evaluating-limits-with-limit-laws-d2",
        text(
          "Direct substitution produces 0/0. What does that mean?",
          "直接代入得到 0/0。这意味着什么？",
        ),
        [
          ["a", text("The limit is 0.", "极限是 0。")],
          ["b", text("The limit does not exist.", "极限不存在。")],
          ["c", text("The form is indeterminate and more analysis is needed.", "这是未定式，需要进一步分析。")],
        ],
        "c",
        text(
          "The form 0/0 is a diagnostic signal, not a limit value or conclusion.",
          "0/0 是一个诊断信号，不是极限值，也不是最终结论。",
        ),
      ),
    ],
    exit_ticket: [
      question(
        "evaluating-limits-with-limit-laws-e1",
        text(
          "Evaluate lim x→2 (x²+3x) using limit laws.",
          "使用极限定律计算 lim x→2 (x²+3x)。",
        ),
        [
          ["a", text("5", "5")],
          ["b", text("10", "10")],
          ["c", text("It is indeterminate.", "这是未定式。")],
        ],
        "b",
        text(
          "Polynomial continuity and limit laws give 2²+3·2=10.",
          "利用多项式连续性和极限定律，得到 2²+3·2=10。",
        ),
      ),
      question(
        "evaluating-limits-with-limit-laws-e2",
        text(
          "For lim x→1 (x²-1)/(x-1), which next step is justified after substitution gives 0/0?",
          "对于 lim x→1 (x²-1)/(x-1)，代入得到 0/0 后，哪一步合理？",
        ),
        [
          ["a", text("Conclude the limit is zero.", "断定极限为零。")],
          ["b", text("Factor and simplify for x≠1, then reevaluate.", "在 x≠1 时因式分解并约分，然后重新计算。")],
          ["c", text("Replace x by infinity.", "把 x 换成无穷。")],
        ],
        "b",
        text(
          "Factoring exposes the nearby expression x+1, whose limit is 2.",
          "因式分解后可得到附近等价的表达式 x+1，其极限为 2。",
        ),
      ),
    ],
  },
  "squeeze-theorem": {
    diagnostic: [
      question(
        "squeeze-theorem-d1",
        text(
          "What must be true of the lower and upper bounds in the Squeeze Theorem?",
          "夹逼定理中的下界和上界必须满足什么条件？",
        ),
        [
          ["a", text("They have the same function value at c.", "它们在 c 处有相同函数值。")],
          ["b", text("They approach the same limit near c.", "它们在 c 附近趋近同一个极限。")],
          ["c", text("They are both linear.", "它们都是线性函数。")],
        ],
        "b",
        text(
          "The trapped function is forced to the shared limiting value of both bounds.",
          "被夹函数会被迫趋近两个边界共同的极限值。",
        ),
      ),
      question(
        "squeeze-theorem-d2",
        text(
          "Why is f(x)≤x² alone not enough to prove lim x→0 f(x)=0?",
          "为什么只有 f(x)≤x² 不足以证明 lim x→0 f(x)=0？",
        ),
        [
          ["a", text("f(x) could escape far below the upper bound.", "f(x) 可能远远低于这个上界。")],
          ["b", text("x² has no limit.", "x² 没有极限。")],
          ["c", text("Upper bounds are never useful.", "上界从来没有用。")],
        ],
        "a",
        text(
          "A matching lower bound is needed to block escape in the other direction.",
          "还需要一个匹配的下界，阻止函数向另一个方向逃离。",
        ),
      ),
    ],
    exit_ticket: [
      question(
        "squeeze-theorem-e1",
        text(
          "Near x=0, -3x²≤q(x)≤3x². What is lim x→0 q(x)?",
          "在 x=0 附近，-3x²≤q(x)≤3x²。lim x→0 q(x) 是多少？",
        ),
        [
          ["a", text("-3", "-3")],
          ["b", text("0", "0")],
          ["c", text("It cannot be determined.", "无法确定。")],
        ],
        "b",
        text(
          "Both bounds approach 0, so q(x) is squeezed to 0.",
          "两个边界都趋近 0，因此 q(x) 被夹逼到 0。",
        ),
      ),
      question(
        "squeeze-theorem-e2",
        text(
          "Must the trapped function be defined at x=c to use the theorem for lim x→c f(x)?",
          "使用夹逼定理求 lim x→c f(x) 时，被夹函数必须在 x=c 有定义吗？",
        ),
        [
          ["a", text("Yes, always.", "是，必须。")],
          ["b", text("No; the inequalities only need to hold sufficiently near c.", "不需要；不等式只需在 c 的充分近邻成立。")],
          ["c", text("Only if the limit is zero.", "只有极限为零时才不需要。")],
        ],
        "b",
        text(
          "Limits use a deleted neighborhood, so behavior at the target point is not required.",
          "极限使用去心邻域，因此不要求目标点本身的行为。",
        ),
      ),
    ],
  },
  "continuity-at-a-point": {
    diagnostic: [
      question(
        "continuity-at-a-point-d1",
        text(
          "Which three facts establish continuity at x=c?",
          "哪三个事实可以确定函数在 x=c 处连续？",
        ),
        [
          ["a", text("f(c) exists, the two-sided limit exists, and they are equal.", "f(c) 存在、双侧极限存在，并且二者相等。")],
          ["b", text("The graph is increasing, positive, and smooth.", "图像递增、为正且光滑。")],
          ["c", text("Both one-sided derivatives exist.", "两个单侧导数都存在。")],
        ],
        "a",
        text(
          "Continuity is agreement between a defined point value and an existing two-sided limit.",
          "连续性要求有定义的函数值与存在的双侧极限一致。",
        ),
      ),
      question(
        "continuity-at-a-point-d2",
        text(
          "A function has lim x→2 f(x)=4 but f(2) is undefined. Is it continuous at 2?",
          "函数满足 lim x→2 f(x)=4，但 f(2) 没有定义。它在 2 处连续吗？",
        ),
        [
          ["a", text("Yes, because the limit exists.", "是，因为极限存在。")],
          ["b", text("No, because the point-value condition fails.", "否，因为函数值条件不满足。")],
          ["c", text("Only if the graph is increasing.", "只有图像递增时才连续。")],
        ],
        "b",
        text(
          "An existing limit is necessary but not sufficient for continuity.",
          "极限存在是连续的必要条件，但不是充分条件。",
        ),
      ),
    ],
    exit_ticket: [
      question(
        "continuity-at-a-point-e1",
        text(
          "For x≠1, f(x)=(x²-1)/(x-1). What value of f(1) makes f continuous at 1?",
          "当 x≠1 时，f(x)=(x²-1)/(x-1)。f(1) 取什么值能使 f 在 1 处连续？",
        ),
        [
          ["a", text("0", "0")],
          ["b", text("1", "1")],
          ["c", text("2", "2")],
        ],
        "c",
        text(
          "For nearby x, the expression simplifies to x+1, whose limit at 1 is 2.",
          "在附近的 x 上，表达式可化简为 x+1，它在 1 处的极限是 2。",
        ),
      ),
      question(
        "continuity-at-a-point-e2",
        text(
          "If the left- and right-hand limits at c disagree, which continuity condition fails first?",
          "如果 c 处的左极限和右极限不相等，首先失败的是哪个连续性条件？",
        ),
        [
          ["a", text("f(c) must be defined.", "f(c) 必须有定义。")],
          ["b", text("The two-sided limit must exist.", "双侧极限必须存在。")],
          ["c", text("The function must be differentiable.", "函数必须可导。")],
        ],
        "b",
        text(
          "Disagreement of the one-sided limits means the two-sided limit does not exist.",
          "单侧极限不一致意味着双侧极限不存在。",
        ),
      ),
    ],
  },
  "intermediate-value-theorem": {
    diagnostic: [
      question(
        "intermediate-value-theorem-d1",
        text(
          "What hypothesis lets the Intermediate Value Theorem prevent a function from skipping an output?",
          "介值定理依靠哪个条件保证函数不会跳过某个输出值？",
        ),
        [
          ["a", text("The function is continuous on the closed interval.", "函数在闭区间上连续。")],
          ["b", text("The function is always positive.", "函数始终为正。")],
          ["c", text("The endpoints have equal outputs.", "两个端点的函数值相等。")],
        ],
        "a",
        text(
          "Continuity rules out jumps that could skip an intermediate height.",
          "连续性排除了可能跳过中间高度的跳跃。",
        ),
      ),
      question(
        "intermediate-value-theorem-d2",
        text(
          "If f is continuous on [1,4], f(1)=-2, and f(4)=5, what does IVT guarantee?",
          "如果 f 在 [1,4] 上连续，f(1)=-2，f(4)=5，介值定理保证什么？",
        ),
        [
          ["a", text("Exactly one root exists.", "恰好存在一个零点。")],
          ["b", text("At least one c in (1,4) has f(c)=0.", "至少存在一个 c∈(1,4)，使 f(c)=0。")],
          ["c", text("The root is c=2.", "零点是 c=2。")],
        ],
        "b",
        text(
          "Zero lies between the endpoint outputs, so continuity guarantees at least one matching input.",
          "0 位于两个端点输出之间，因此连续性保证至少存在一个对应输入。",
        ),
      ),
    ],
    exit_ticket: [
      question(
        "intermediate-value-theorem-e1",
        text(
          "Which conclusion goes beyond what IVT guarantees?",
          "哪个结论超出了介值定理的保证范围？",
        ),
        [
          ["a", text("At least one input produces the target output.", "至少有一个输入产生目标输出。")],
          ["b", text("There is exactly one such input.", "恰好有一个这样的输入。")],
          ["c", text("The target is attained somewhere in the interval.", "目标值在区间某处可以取得。")],
        ],
        "b",
        text(
          "IVT proves existence, not uniqueness or the exact location.",
          "介值定理证明存在性，但不保证唯一性，也不给出精确位置。",
        ),
      ),
      question(
        "intermediate-value-theorem-e2",
        text(
          "A function has f(0)=-1 and f(2)=3 but has a jump on [0,2]. Can IVT guarantee f(c)=0?",
          "函数满足 f(0)=-1、f(2)=3，但在 [0,2] 上有跳跃。介值定理能保证存在 f(c)=0 吗？",
        ),
        [
          ["a", text("Yes, endpoint signs are enough.", "能，端点异号就足够。")],
          ["b", text("No, continuity on the interval is missing.", "不能，因为缺少区间连续性。")],
          ["c", text("Yes, but only at c=1.", "能，但只能在 c=1。")],
        ],
        "b",
        text(
          "A jump can skip zero, so the continuity hypothesis is essential.",
          "跳跃可能直接越过 0，因此连续性条件不可缺少。",
        ),
      ),
    ],
  },
  "limits-at-infinity": {
    diagnostic: [
      question(
        "limits-at-infinity-d1",
        text(
          "How does a limit at infinity differ from an infinite limit?",
          "无穷远处的极限与无穷极限有什么区别？",
        ),
        [
          ["a", text("A limit at infinity has unbounded input; an infinite limit has unbounded output near a finite input.", "无穷远处的极限是输入无界；无穷极限是在有限输入附近输出无界。")],
          ["b", text("They are two names for the same notation.", "它们只是同一记号的两个名称。")],
          ["c", text("A limit at infinity always equals zero.", "无穷远处的极限总是零。")],
        ],
        "a",
        text(
          "The location of infinity in the notation tells whether the input or output is unbounded.",
          "无穷在记号中的位置决定是输入无界还是输出无界。",
        ),
      ),
      question(
        "limits-at-infinity-d2",
        text(
          "For equal-degree rational functions, what usually determines the limit as x→∞?",
          "对于分子分母同次数的有理函数，通常由什么决定 x→∞ 时的极限？",
        ),
        [
          ["a", text("The ratio of leading coefficients.", "最高次项系数之比。")],
          ["b", text("The ratio of constant terms.", "常数项之比。")],
          ["c", text("The x-intercepts.", "x 轴截距。")],
        ],
        "a",
        text(
          "After division by the dominant power, lower-degree terms vanish.",
          "除以主导幂次后，低次项会趋近于零。",
        ),
      ),
    ],
    exit_ticket: [
      question(
        "limits-at-infinity-e1",
        text(
          "Evaluate lim x→∞ (3x²-1)/(2x²+5).",
          "计算 lim x→∞ (3x²-1)/(2x²+5)。",
        ),
        [
          ["a", text("0", "0")],
          ["b", text("3/2", "3/2")],
          ["c", text("∞", "∞")],
        ],
        "b",
        text(
          "Equal degrees give the ratio 3/2 of the leading coefficients.",
          "分子分母次数相同，极限等于最高次项系数之比 3/2。",
        ),
      ),
      question(
        "limits-at-infinity-e2",
        text(
          "What does lim x→∞ f(x)=4 imply about y=4?",
          "lim x→∞ f(x)=4 对直线 y=4 意味着什么？",
        ),
        [
          ["a", text("It is a horizontal asymptote in that direction, and the graph may cross it.", "它是该方向上的水平渐近线，图像仍可能穿过它。")],
          ["b", text("The graph can never equal 4.", "图像永远不能等于 4。")],
          ["c", text("It is a vertical asymptote.", "它是垂直渐近线。")],
        ],
        "a",
        text(
          "A horizontal asymptote describes long-run behavior, not a barrier at finite inputs.",
          "水平渐近线描述长期趋势，并不是有限输入处不能跨越的屏障。",
        ),
      ),
    ],
  },
};

const phaseCopy: Record<
  FormativeAssessmentLocale,
  Record<FormativeAssessmentPhase, { title: string; description: string }>
> = {
  en: {
    diagnostic: {
      title: "Two-minute diagnostic",
      description:
        "Check your starting model before the lesson. This is evidence for personalization, not a grade.",
    },
    exit_ticket: {
      title: "Exit ticket",
      description:
        "Check whether the key idea now transfers to a fresh situation and measure your learning gain.",
    },
  },
  zh: {
    diagnostic: {
      title: "两分钟课前诊断",
      description:
        "在学习前检查你的初始理解。这些证据用于个性化学习，不是考试成绩。",
    },
    exit_ticket: {
      title: "离堂检查",
      description:
        "用新情境检查关键理解是否能够迁移，并衡量本节课的学习增量。",
    },
  },
};

export class FormativeAssessmentError extends Error {
  readonly code:
    | "assessment_not_found"
    | "incomplete_submission"
    | "invalid_answer";

  constructor(
    message: string,
    code:
      | "assessment_not_found"
      | "incomplete_submission"
      | "invalid_answer",
  ) {
    super(message);
    this.name = "FormativeAssessmentError";
    this.code = code;
  }
}

export function createFormativeAssessmentProvider({
  bank,
  courseId,
  version,
}: {
  bank: FormativeAssessmentBank;
  courseId: string;
  version: string;
}): FormativeAssessmentProvider {
  function getDefinition(
    conceptId: string,
    phase: FormativeAssessmentPhase,
  ) {
    const definition = bank[conceptId]?.[phase];

    if (!definition) {
      throw new FormativeAssessmentError(
        `No ${phase} assessment is registered for concept ${conceptId}.`,
        "assessment_not_found",
      );
    }

    return definition;
  }

  function getAssessment({
    conceptId,
    locale,
    phase,
  }: {
    conceptId: string;
    locale: FormativeAssessmentLocale;
    phase: FormativeAssessmentPhase;
  }): FormativeAssessment {
    const definition = getDefinition(conceptId, phase);
    const localizedPhase = phaseCopy[locale][phase];

    return {
      id: `${courseId}-${conceptId}-${phase}`,
      version,
      courseId,
      conceptId,
      phase,
      title: localizedPhase.title,
      description: localizedPhase.description,
      questions: definition.map((item) => ({
        id: item.id,
        prompt: item.prompt[locale],
        options: item.options.map((option) => ({
          id: option.id,
          label: option.label[locale],
        })),
      })),
    };
  }

  function gradeAssessment({
    answers,
    conceptId,
    locale,
    phase,
  }: {
    answers: Array<{ questionId: string; selectedOptionId: string }>;
    conceptId: string;
    locale: FormativeAssessmentLocale;
    phase: FormativeAssessmentPhase;
  }) {
    const definition = getDefinition(conceptId, phase);
    const answersByQuestion = new Map(
      answers.map((answer) => [answer.questionId, answer.selectedOptionId]),
    );

    if (
      answers.length !== definition.length ||
      definition.some((item) => !answersByQuestion.has(item.id))
    ) {
      throw new FormativeAssessmentError(
        "Submit exactly one answer for every assessment question.",
        "incomplete_submission",
      );
    }

    const feedback: FormativeAssessmentFeedback[] = definition.map((item) => {
      const selectedOptionId = answersByQuestion.get(item.id) ?? "";

      if (!item.options.some((option) => option.id === selectedOptionId)) {
        throw new FormativeAssessmentError(
          `Option ${selectedOptionId} is not valid for question ${item.id}.`,
          "invalid_answer",
        );
      }

      return {
        questionId: item.id,
        selectedOptionId,
        correctOptionId: item.correctOptionId,
        isCorrect: selectedOptionId === item.correctOptionId,
        explanation: item.explanation[locale],
      };
    });
    const correctCount = feedback.filter((item) => item.isCorrect).length;

    return {
      assessment: getAssessment({ conceptId, locale, phase }),
      correctCount,
      questionCount: definition.length,
      score: Math.round((correctCount / definition.length) * 100),
      feedback,
    };
  }

  function getCoverage() {
    return Object.entries(bank).map(([conceptId, phases]) => ({
      conceptId,
      diagnosticQuestionCount: phases.diagnostic.length,
      exitTicketQuestionCount: phases.exit_ticket.length,
    }));
  }

  function getIntegrityIssues() {
    const issues: string[] = [];
    const questionIds = new Set<string>();

    for (const [conceptId, phases] of Object.entries(bank)) {
      for (const phase of ["diagnostic", "exit_ticket"] as const) {
        for (const item of phases[phase]) {
          if (questionIds.has(item.id)) {
            issues.push(`Duplicate question id: ${item.id}`);
          }
          questionIds.add(item.id);

          if (!item.prompt.en.trim() || !item.prompt.zh.trim()) {
            issues.push(`${item.id} is missing a localized prompt.`);
          }
          if (item.prompt.en === item.prompt.zh) {
            issues.push(`${item.id} does not provide a distinct Chinese prompt.`);
          }
          if (!item.explanation.en.trim() || !item.explanation.zh.trim()) {
            issues.push(`${item.id} is missing localized feedback.`);
          }

          const optionIds = item.options.map((option) => option.id);
          if (item.options.length < 2) {
            issues.push(`${item.id} needs at least two options.`);
          }
          if (new Set(optionIds).size !== optionIds.length) {
            issues.push(`${item.id} has duplicate option ids.`);
          }
          if (!optionIds.includes(item.correctOptionId)) {
            issues.push(`${item.id} has an invalid correct option.`);
          }
          if (
            item.options.some(
              (option) => !option.label.en.trim() || !option.label.zh.trim(),
            )
          ) {
            issues.push(`${item.id} has an option without bilingual labels.`);
          }
        }
      }

      if (!phases.diagnostic.length || !phases.exit_ticket.length) {
        issues.push(`${conceptId} is missing an assessment phase.`);
      }
    }

    return issues;
  }

  return {
    getAssessment,
    gradeAssessment,
    getCoverage,
    getIntegrityIssues,
  };
}

export const apCalculusABFormativeAssessments =
  createFormativeAssessmentProvider({
    bank: assessmentBank,
    courseId: COURSE_ID,
    version: ASSESSMENT_VERSION,
  });

export const getFormativeAssessment =
  apCalculusABFormativeAssessments.getAssessment;
export const gradeFormativeAssessment =
  apCalculusABFormativeAssessments.gradeAssessment;
export const getFormativeAssessmentCoverage =
  apCalculusABFormativeAssessments.getCoverage;
export const getFormativeAssessmentIntegrityIssues =
  apCalculusABFormativeAssessments.getIntegrityIssues;
