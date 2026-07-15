import type {
  AssessmentQuestionDefinition,
  FormativeAssessmentBank,
  LocalizedText,
} from "@/features/assessment/formative-assessments";

function localized(en: string, zh: string): LocalizedText {
  return { en, zh };
}

function item(
  id: string,
  enPrompt: string,
  zhPrompt: string,
  options: Array<[string, string, string]>,
  correctOptionId: string,
  enExplanation: string,
  zhExplanation: string,
): AssessmentQuestionDefinition {
  return {
    id,
    prompt: localized(enPrompt, zhPrompt),
    options: options.map(([optionId, en, zh]) => ({
      id: optionId,
      label: localized(en, zh),
    })),
    correctOptionId,
    explanation: localized(enExplanation, zhExplanation),
  };
}

export const apCalculusABUnit1AlignmentAssessmentBank: FormativeAssessmentBank = {
  "instantaneous-change-motivation": {
    diagnostic: [
      item(
        "instantaneous-change-motivation-d1",
        "Which expression is an average rate of change of s over [a,b], with a≠b?",
        "行程记录用 s(t) 表示 t 时刻的累计路程。若 a≠b，哪个算式能算出从 a 到 b 这段时间内的平均速度？",
        [
          ["a", "(s(b)-s(a))/(b-a)", "(s(b)-s(a))/(b-a)"],
          ["b", "(s(a)+s(b))/2", "(s(a)+s(b))/2"],
          ["c", "s(a)/(b-a)", "s(a)/(b-a)"],
        ],
        "a",
        "Average rate is output change divided by the corresponding nonzero input change.",
        "先求路程变化 s(b)-s(a)，再除以对应的非零时间变化 b-a，得到的才是这段时间内的平均速度。",
      ),
      item(
        "instantaneous-change-motivation-d2",
        "Why is a zero-length interval not used directly for an instantaneous rate?",
        "有同学说：“要算某一刻的速度，就把时间间隔直接设成 0。”这个做法的问题在哪里？",
        [
          ["a", "It makes the output change negative.", "路程变化量一定会变成负数。"],
          ["b", "It creates division by zero.", "差商的分母会变成 0，算式没有定义。"],
          ["c", "It changes the measurement units.", "速度单位会自动变成另一种单位。"],
        ],
        "b",
        "A difference quotient needs a nonzero input interval; limits use intervals approaching zero instead.",
        "差商只能在时间间隔非零时计算。极限做的是让非零的间隔无限靠近 0，而不是把它直接改成 0。",
      ),
    ],
    exit_ticket: [
      item(
        "instantaneous-change-motivation-e1",
        "Average speeds over intervals of length 1, 0.1, and 0.01 hour are 31, 29.2, and 29.02 km/h. What instantaneous-speed estimate is best supported?",
        "一辆长途客车行驶到某个时刻。把之后的观察窗口从 1 小时缩短到 0.1 小时、0.01 小时，算得平均速度依次为 31、29.2、29.02 km/h。此刻速度估计成多少最有根据？",
        [
          ["a", "About 29 km/h", "约 29 km/h"],
          ["b", "Exactly 31 km/h", "正好 31 km/h"],
          ["c", "0 km/h", "0 km/h"],
        ],
        "a",
        "The rates over shrinking intervals stabilize near 29 km/h.",
        "窗口越短，平均速度越稳定地靠近 29 km/h；因此约 29 km/h 是这组数据共同支持的局部估计。",
      ),
      item(
        "instantaneous-change-motivation-e2",
        "Which statement correctly interprets -3 liters per minute at t=5?",
        "一个储水罐在 t=5 分钟时的局部变化率是 -3 L/min。怎样解释才完整？",
        [
          ["a", "The quantity is locally decreasing by about 3 liters per minute.", "在 t=5 分钟附近，水量正以约 3 L/min 的速度减少。"],
          ["b", "Time is decreasing by 3 minutes.", "时间正以每分钟 3 分钟的速度减少。"],
          ["c", "The quantity equals -3 liters.", "此时储水罐里共有 -3 L 水。"],
        ],
        "a",
        "The sign gives change direction and the units describe output change per input unit.",
        "负号说明水量在减少，L/min 说明每过 1 分钟水量约减少多少升；方向和单位缺一不可。",
      ),
    ],
  },
  "estimating-limits-from-tables": {
    diagnostic: [
      item(
        "estimating-limits-from-tables-d1",
        "Which inputs are most useful for estimating a two-sided limit at x=2?",
        "估计 x=2 处的双侧极限时，哪组输入最有用？",
        [
          ["a", "1.99 and 2.01", "1.99 和 2.01"],
          ["b", "0 and 1", "0 和 1"],
          ["c", "2 only", "只有 2"],
        ],
        "a",
        "Nearby inputs on opposite sides give the strongest local two-sided evidence.",
        "目标两侧的邻近输入提供最有力的局部双侧证据。",
      ),
      item(
        "estimating-limits-from-tables-d2",
        "If f(c)=9 but nearby table values on both sides approach 4, what limit does the table suggest?",
        "若 f(c)=9，但表格中目标两侧的附近值都趋近 4，表格提示的极限是多少？",
        [
          ["a", "4", "4"],
          ["b", "9", "9"],
          ["c", "13", "13"],
        ],
        "a",
        "The limit follows nearby behavior, not the target-row function value.",
        "极限由附近行为决定，而不是由目标行的函数值决定。",
      ),
    ],
    exit_ticket: [
      item(
        "estimating-limits-from-tables-e1",
        "Below x=3, outputs approach 5; above x=3, outputs also approach 5. What does the table support?",
        "x=3 左侧输出趋近 5，右侧输出也趋近 5。表格支持什么结论？",
        [
          ["a", "The two-sided limit is approximately 5.", "双侧极限约为 5。"],
          ["b", "The limit does not exist.", "极限不存在。"],
          ["c", "f(3) must equal 5.", "f(3) 必须等于 5。"],
        ],
        "a",
        "Matching directional trends support a two-sided estimate, without determining f(3).",
        "两个方向趋势一致，支持双侧估计，但不能决定 f(3)。",
      ),
      item(
        "estimating-limits-from-tables-e2",
        "Left-side values approach 1 while right-side values approach 4. Which conclusion is justified?",
        "左侧值趋近 1，右侧值趋近 4。哪个结论有依据？",
        [
          ["a", "The two-sided limit is 2.5.", "双侧极限为 2.5。"],
          ["b", "The two-sided limit does not exist.", "双侧极限不存在。"],
          ["c", "The two-sided limit is 4.", "双侧极限为 4。"],
        ],
        "b",
        "Unequal one-sided trends cannot produce one two-sided limit.",
        "不相等的单侧趋势不能产生一个共同双侧极限。",
      ),
    ],
  },
  "algebraic-limit-techniques": {
    diagnostic: [
      item(
        "algebraic-limit-techniques-d1",
        "Direct substitution in (x²-9)/(x-3) at x=3 gives 0/0. Which next step matches the structure?",
        "在 x=3 处直接代入 (x²-9)/(x-3) 得到 0/0。哪个下一步匹配该结构？",
        [
          ["a", "Factor x²-9.", "因式分解 x²-9。"],
          ["b", "Average numerator and denominator.", "求分子和分母的平均数。"],
          ["c", "Declare the limit zero.", "直接宣布极限为零。"],
        ],
        "a",
        "A difference of squares exposes the common factor x-3 for nearby x.",
        "平方差会揭示附近 x 可约去的公因式 x-3。",
      ),
      item(
        "algebraic-limit-techniques-d2",
        "What technique is suggested by a numerator sqrt(x+4)-2 that produces 0/0?",
        "分子 sqrt(x+4)-2 产生 0/0 时，适合使用什么技术？",
        [
          ["a", "Multiply by the conjugate ratio.", "乘以共轭式比值。"],
          ["b", "Delete the radical.", "直接删除根号。"],
          ["c", "Use only a graph.", "只使用图像。"],
        ],
        "a",
        "The conjugate converts a radical difference into an algebraic factor while preserving equivalence.",
        "共轭式把根式之差转化为代数因式，同时保持等价。",
      ),
    ],
    exit_ticket: [
      item(
        "algebraic-limit-techniques-e1",
        "What is lim x→3 (x²-9)/(x-3)?",
        "lim x→3 (x²-9)/(x-3) 等于多少？",
        [
          ["a", "0", "0"],
          ["b", "6", "6"],
          ["c", "It must not exist.", "一定不存在。"],
        ],
        "b",
        "For x≠3, factor and cancel to get x+3, whose limit is 6.",
        "在 x≠3 时因式分解并约分得到 x+3，其极限为 6。",
      ),
      item(
        "algebraic-limit-techniques-e2",
        "After canceling x-3 for nearby x, which statement remains true?",
        "在附近 x 约去 x-3 后，哪个说法仍然正确？",
        [
          ["a", "The original quotient may still be undefined at x=3.", "原商在 x=3 处仍可能无定义。"],
          ["b", "The original function has been redefined automatically.", "原函数已被自动重新定义。"],
          ["c", "The target value is no longer relevant to the limit.", "目标输入与极限已完全无关。"],
        ],
        "a",
        "Cancellation establishes nearby equivalence; it does not assign the original function a target value.",
        "约分建立附近等价，但不会给原函数分配目标点值。",
      ),
    ],
  },
  "selecting-limit-procedures": {
    diagnostic: [
      item(
        "selecting-limit-procedures-d1",
        "What should usually be checked first for a limit of a polynomial at a finite input?",
        "求多项式在有限输入处的极限时，通常先检查什么？",
        [
          ["a", "Direct substitution", "直接代入"],
          ["b", "A conjugate", "共轭式"],
          ["c", "A vertical asymptote", "垂直渐近线"],
        ],
        "a",
        "Polynomials are continuous, so direct substitution is the efficient justified first method.",
        "多项式连续，因此直接代入是高效且有依据的第一种方法。",
      ),
      item(
        "selecting-limit-procedures-d2",
        "If only a graph is provided, which claim is most appropriate?",
        "若题目只提供图像，哪个结论最合适？",
        [
          ["a", "An estimate consistent with the graph's scale", "与图像尺度相符的估计"],
          ["b", "An exact algebraic proof from unseen formulas", "根据看不见的公式给出精确代数证明"],
          ["c", "The filled point always gives the limit", "实心点总是给出极限"],
        ],
        "a",
        "Graphical evidence supports an estimate whose precision is limited by the representation.",
        "图像证据支持估计，其精度受表示方式限制。",
      ),
    ],
    exit_ticket: [
      item(
        "selecting-limit-procedures-e1",
        "Substitution gives 7/3 with a nonzero denominator. What is the best next step?",
        "直接代入得到 7/3，且分母不为零。最佳下一步是什么？",
        [
          ["a", "Accept 7/3 using continuity and limit laws.", "根据连续性和极限法则得到 7/3。"],
          ["b", "Factor until a term cancels.", "继续因式分解直到约去一项。"],
          ["c", "Replace the result with 0/0.", "把结果替换成 0/0。"],
        ],
        "a",
        "A finite substitution with a valid denominator needs no extra algebraic repair.",
        "分母有效且代入为有限值时，不需要额外代数修复。",
      ),
      item(
        "selecting-limit-procedures-e2",
        "Which first-step pairing is correct?",
        "哪组第一步匹配正确？",
        [
          ["a", "Factorable 0/0 quotient → factor; radical difference → conjugate", "可因式分解的 0/0 商→因式分解；根式之差→共轭式"],
          ["b", "Every 0/0 form → declare no limit", "所有 0/0→宣布无极限"],
          ["c", "Polynomial → always use a table", "多项式→总是使用表格"],
        ],
        "a",
        "The expression's structural cue selects the appropriate repair technique.",
        "表达式的结构线索决定合适的修复技术。",
      ),
    ],
  },
  "connecting-limit-representations": {
    diagnostic: [
      item(
        "connecting-limit-representations-d1",
        "A graph has a hole at (1,2) and approaches y=2 from both sides. Which symbolic statement matches?",
        "图像在 (1,2) 有孔，且两侧都趋近 y=2。哪个符号陈述匹配？",
        [
          ["a", "lim x→1 f(x)=2", "lim x→1 f(x)=2"],
          ["b", "f(1) must equal 2", "f(1) 必须等于 2"],
          ["c", "lim x→2 f(x)=1", "lim x→2 f(x)=1"],
        ],
        "a",
        "The target input is 1 and the approached output is 2; the hole does not determine f(1).",
        "目标输入为 1、趋近输出为 2；孔不能决定 f(1)。",
      ),
      item(
        "connecting-limit-representations-d2",
        "What is a limitation of a coarse graph near a target?",
        "目标附近的粗糙图像有什么限制？",
        [
          ["a", "It may hide holes or rapid oscillation.", "它可能隐藏孔或快速振荡。"],
          ["b", "It always shows more precision than a formula.", "它总比公式更精确。"],
          ["c", "It makes one-sided behavior irrelevant.", "它使单侧行为变得无关。"],
        ],
        "a",
        "Finite visual resolution can hide local behavior that another representation reveals.",
        "有限的视觉分辨率可能隐藏其他表示才能揭示的局部行为。",
      ),
    ],
    exit_ticket: [
      item(
        "connecting-limit-representations-e1",
        "For x≠1, f(x)=(x²-1)/(x-1). Which table pattern matches the analytical simplification?",
        "当 x≠1 时，f(x)=(x²-1)/(x-1)。哪个表格趋势与解析化简匹配？",
        [
          ["a", "Outputs approach 2 from both sides of 1.", "输出从 1 的两侧趋近 2。"],
          ["b", "Outputs approach different values on each side.", "两侧输出趋近不同值。"],
          ["c", "All nearby outputs equal 0.", "所有附近输出都等于 0。"],
        ],
        "a",
        "The nearby expression equals x+1, so outputs approach 2 as x approaches 1.",
        "附近表达式等于 x+1，因此 x 趋近 1 时输出趋近 2。",
      ),
      item(
        "connecting-limit-representations-e2",
        "A sparse table suggests 3, but an exact formula reveals values oscillating without settling. Which conclusion is strongest?",
        "稀疏表格提示 3，但精确公式揭示函数值不断振荡且不稳定。哪个结论最有力？",
        [
          ["a", "The sparse estimate is insufficient; the analytical evidence rules out the claimed limit.", "稀疏估计不足；解析证据否定该极限。"],
          ["b", "The table always overrides the formula.", "表格总是优先于公式。"],
          ["c", "Average the two conclusions.", "对两个结论取平均。"],
        ],
        "a",
        "Representation evidence must be evaluated by what it can resolve and justify.",
        "必须根据表示能够分辨和证明的内容来评价证据。",
      ),
    ],
  },
  "classifying-discontinuities": {
    diagnostic: [
      item(
        "classifying-discontinuities-d1",
        "Both one-sided limits equal 4, but f(c) is missing. What type of discontinuity occurs?",
        "两个单侧极限都等于 4，但 f(c) 缺失。发生哪类间断？",
        [
          ["a", "Removable", "可去间断"],
          ["b", "Jump", "跳跃间断"],
          ["c", "Infinite", "无穷间断"],
        ],
        "a",
        "A finite shared limit with a missing or mismatched point value is removable.",
        "有限共同极限加缺失或不匹配的点值构成可去间断。",
      ),
      item(
        "classifying-discontinuities-d2",
        "Finite left- and right-hand limits exist but are unequal. What type occurs?",
        "有限的左右极限都存在但不相等。发生哪类间断？",
        [
          ["a", "Removable", "可去间断"],
          ["b", "Jump", "跳跃间断"],
          ["c", "No discontinuity", "没有间断"],
        ],
        "b",
        "Unequal finite one-sided limits define jump behavior.",
        "不相等的有限单侧极限构成跳跃行为。",
      ),
    ],
    exit_ticket: [
      item(
        "classifying-discontinuities-e1",
        "Which discontinuity can be repaired by changing only f(c)?",
        "哪类间断可以只修改 f(c) 来修复？",
        [
          ["a", "A removable discontinuity with a finite two-sided limit", "具有有限双侧极限的可去间断"],
          ["b", "A jump discontinuity", "跳跃间断"],
          ["c", "An infinite discontinuity", "无穷间断"],
        ],
        "a",
        "Set f(c) equal to the existing finite limit; a point change cannot repair directional disagreement or unbounded behavior.",
        "把 f(c) 设为已有有限极限；一个点不能修复方向分歧或无界行为。",
      ),
      item(
        "classifying-discontinuities-e2",
        "A graph grows without bound as x approaches c from the right. Which classification is supported?",
        "当 x 从右侧趋近 c 时，图像无界增大。支持哪种分类？",
        [
          ["a", "Infinite discontinuity", "无穷间断"],
          ["b", "Removable discontinuity", "可去间断"],
          ["c", "Continuous point", "连续点"],
        ],
        "a",
        "Unbounded one-sided behavior is evidence of an infinite discontinuity.",
        "无界单侧行为是无穷间断的证据。",
      ),
    ],
  },
  "continuity-over-intervals": {
    diagnostic: [
      item(
        "continuity-over-intervals-d1",
        "Where is a rational function continuous?",
        "有理函数在哪里连续？",
        [
          ["a", "Where its denominator is nonzero", "分母不为零处"],
          ["b", "Only at integer inputs", "只在整数输入处"],
          ["c", "At every real input regardless of domain", "无论定义域如何都在所有实数处"],
        ],
        "a",
        "Rational functions are continuous throughout their domains, excluding denominator zeros.",
        "有理函数在其定义域内连续，需要排除分母零点。",
      ),
      item(
        "continuity-over-intervals-d2",
        "Which endpoint condition is used at the left endpoint a of [a,b]?",
        "在闭区间 [a,b] 的左端点 a 使用哪个条件？",
        [
          ["a", "The right-hand limit equals f(a).", "右极限等于 f(a)。"],
          ["b", "The left-hand limit outside the interval equals f(a).", "区间外的左极限等于 f(a)。"],
          ["c", "No function value is needed.", "不需要函数值。"],
        ],
        "a",
        "At the left endpoint, continuity is checked from within the interval, on the right.",
        "在左端点要从区间内部，也就是右侧检查连续性。",
      ),
    ],
    exit_ticket: [
      item(
        "continuity-over-intervals-e1",
        "On which intervals is (x+3)/[(x-2)(x+1)] continuous?",
        "(x+3)/[(x-2)(x+1)] 在哪些区间连续？",
        [
          ["a", "(-∞,-1), (-1,2), and (2,∞)", "(-∞,-1)、(-1,2) 和 (2,∞)"],
          ["b", "All real numbers", "所有实数"],
          ["c", "Only [-1,2]", "只有 [-1,2]"],
        ],
        "a",
        "The denominator is zero at -1 and 2, splitting the domain into three continuity intervals.",
        "分母在 -1 和 2 处为零，将定义域分成三个连续区间。",
      ),
      item(
        "continuity-over-intervals-e2",
        "What must be checked before applying an interval theorem on [0,4] to a piecewise function?",
        "对 [0,4] 上的分段函数使用区间定理前，必须检查什么？",
        [
          ["a", "Continuity at every interior boundary and appropriate endpoint behavior", "每个内部边界的连续性和正确的端点行为"],
          ["b", "Only f(0)", "只有 f(0)"],
          ["c", "Only three sample points", "只有三个样本点"],
        ],
        "a",
        "Interval continuity is a statement about every point, including piecewise boundaries and included endpoints.",
        "区间连续覆盖每一点，包括分段边界和闭区间端点。",
      ),
    ],
  },
};
