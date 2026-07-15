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

export const apCalculusABUnit2AssessmentBank: FormativeAssessmentBank = {
  "average-and-instantaneous-rates-of-change": {
    diagnostic: [
      item(
        "average-and-instantaneous-rates-of-change-d1",
        "Which expression is the average rate of change of f on [a,b], where a≠b?",
        "当 a≠b 时，哪个表达式是 f 在 [a,b] 上的平均变化率？",
        [
          ["a", "(f(a)+f(b))/2", "(f(a)+f(b))/2"],
          ["b", "(f(b)-f(a))/(b-a)", "(f(b)-f(a))/(b-a)"],
          ["c", "f(b)-f(a)", "f(b)-f(a)"],
        ],
        "b",
        "Average rate divides output change by the corresponding nonzero input change.",
        "平均变化率等于输出变化量除以对应的非零输入变化量。",
      ),
      item(
        "average-and-instantaneous-rates-of-change-d2",
        "How is an instantaneous rate at x=a obtained from (f(a+h)-f(a))/h?",
        "怎样由 (f(a+h)-f(a))/h 得到 x=a 处的瞬时变化率？",
        [
          ["a", "Set h=0 directly.", "直接令 h=0。"],
          ["b", "Take the limit as nonzero h approaches 0.", "让非零 h 趋近于 0 并取极限。"],
          ["c", "Average f(a+h) and f(a).", "求 f(a+h) 与 f(a) 的平均数。"],
        ],
        "b",
        "The quotient stays defined for h≠0, and its limiting value gives the instantaneous rate.",
        "差商在 h≠0 时有定义，它的极限值给出瞬时变化率。",
      ),
    ],
    exit_ticket: [
      item(
        "average-and-instantaneous-rates-of-change-e1",
        "For f(x)=x², what is the average rate of change on [1,3]?",
        "对 f(x)=x²，它在 [1,3] 上的平均变化率是多少？",
        [
          ["a", "2", "2"],
          ["b", "4", "4"],
          ["c", "5", "5"],
        ],
        "b",
        "(f(3)-f(1))/(3-1)=(9-1)/2=4.",
        "(f(3)-f(1))/(3-1)=(9-1)/2=4。",
      ),
      item(
        "average-and-instantaneous-rates-of-change-e2",
        "A centered secant estimate for a rate at t=5 uses s(4.9)=10.2 and s(5.1)=10.8. What is the estimated rate?",
        "用 s(4.9)=10.2、s(5.1)=10.8 做中心割线估计，t=5 处的变化率约为多少？",
        [
          ["a", "0.3", "0.3"],
          ["b", "3", "3"],
          ["c", "10.5", "10.5"],
        ],
        "b",
        "(10.8-10.2)/(5.1-4.9)=0.6/0.2=3.",
        "(10.8-10.2)/(5.1-4.9)=0.6/0.2=3。",
      ),
    ],
  },
  "derivative-as-a-limit-and-tangent-slope": {
    diagnostic: [
      item(
        "derivative-as-a-limit-and-tangent-slope-d1",
        "Which limit represents f'(a)?",
        "哪个极限表示 f'(a)？",
        [
          ["a", "lim h→0 (f(a+h)-f(a))/h", "lim h→0 (f(a+h)-f(a))/h"],
          ["b", "lim h→0 (f(a+h)+f(a))/h", "lim h→0 (f(a+h)+f(a))/h"],
          ["c", "lim h→a (f(h)-f(a))/h", "lim h→a (f(h)-f(a))/h"],
        ],
        "a",
        "The point-based h-definition uses output change over h as h approaches zero.",
        "一点处的 h 形式用输出变化量除以 h，并令 h 趋近于 0。",
      ),
      item(
        "derivative-as-a-limit-and-tangent-slope-d2",
        "What does f'(2) give for the graph of y=f(x)?",
        "对图像 y=f(x)，f'(2) 给出什么？",
        [
          ["a", "The y-coordinate f(2)", "纵坐标 f(2)"],
          ["b", "The tangent-line slope at x=2", "x=2 处的切线斜率"],
          ["c", "The tangent-line y-intercept", "切线的 y 轴截距"],
        ],
        "b",
        "A derivative value is the instantaneous rate and tangent slope at that input.",
        "导数值是该输入处的瞬时变化率和切线斜率。",
      ),
    ],
    exit_ticket: [
      item(
        "derivative-as-a-limit-and-tangent-slope-e1",
        "If f(3)=9 and f'(3)=6, which equation is the tangent line at x=3?",
        "若 f(3)=9、f'(3)=6，哪个方程是 x=3 处的切线？",
        [
          ["a", "y-9=6(x-3)", "y-9=6(x-3)"],
          ["b", "y-6=9(x-3)", "y-6=9(x-3)"],
          ["c", "y-3=6(x-9)", "y-3=6(x-9)"],
        ],
        "a",
        "Use slope f'(3)=6 through the point (3,f(3))=(3,9).",
        "使用斜率 f'(3)=6，并通过点 (3,f(3))=(3,9)。",
      ),
      item(
        "derivative-as-a-limit-and-tangent-slope-e2",
        "Evaluate lim h→0 ((4+h)³-64)/h by recognizing a derivative.",
        "把它识别为导数，计算 lim h→0 ((4+h)³-64)/h。",
        [
          ["a", "12", "12"],
          ["b", "48", "48"],
          ["c", "64", "64"],
        ],
        "b",
        "The limit is the derivative of x³ at x=4, so it equals 3(4²)=48.",
        "该极限是 x³ 在 x=4 处的导数，因此等于 3(4²)=48。",
      ),
    ],
  },
  "estimating-derivatives-at-a-point": {
    diagnostic: [
      item(
        "estimating-derivatives-at-a-point-d1",
        "Which pair usually gives the strongest table estimate of f'(5)?",
        "哪一组数据通常能给出最可靠的 f'(5) 表格估计？",
        [
          ["a", "x=1 and x=9", "x=1 与 x=9"],
          ["b", "x=4.9 and x=5.1", "x=4.9 与 x=5.1"],
          ["c", "x=0 and x=5", "x=0 与 x=5"],
        ],
        "b",
        "Nearby points on opposite sides form a local centered secant around the target.",
        "目标两侧的邻近点构成局部中心割线。",
      ),
      item(
        "estimating-derivatives-at-a-point-d2",
        "When estimating f'(a) from a graph, which slope should be approximated?",
        "根据图像估计 f'(a) 时，应近似哪条线的斜率？",
        [
          ["a", "The tangent line at x=a", "x=a 处的切线"],
          ["b", "The x-axis", "x 轴"],
          ["c", "A line from the origin to the point", "从原点到该点的连线"],
        ],
        "a",
        "The derivative at a point is the slope of the local tangent line.",
        "一点处的导数就是局部切线的斜率。",
      ),
    ],
    exit_ticket: [
      item(
        "estimating-derivatives-at-a-point-e1",
        "A table gives f(1.9)=3.61 and f(2.1)=4.41. What centered estimate does it give for f'(2)?",
        "表格给出 f(1.9)=3.61、f(2.1)=4.41，它对 f'(2) 给出什么中心估计？",
        [
          ["a", "0.4", "0.4"],
          ["b", "4", "4"],
          ["c", "8", "8"],
        ],
        "b",
        "(4.41-3.61)/(2.1-1.9)=0.8/0.2=4.",
        "(4.41-3.61)/(2.1-1.9)=0.8/0.2=4。",
      ),
      item(
        "estimating-derivatives-at-a-point-e2",
        "A tangent estimate falls 6 units while moving 4 units right. What derivative estimate does it support?",
        "一条切线估计线向右移动 4 个单位时下降 6 个单位，它支持怎样的导数估计？",
        [
          ["a", "-3/2", "-3/2"],
          ["b", "2/3", "2/3"],
          ["c", "3/2", "3/2"],
        ],
        "a",
        "Rise over run is -6/4=-3/2.",
        "升高量/水平变化量为 -6/4=-3/2。",
      ),
    ],
  },
  "differentiability-and-continuity": {
    diagnostic: [
      item(
        "differentiability-and-continuity-d1",
        "Which implication is always valid at a point?",
        "在一点处，哪个蕴含关系总是成立？",
        [
          ["a", "Continuous implies differentiable.", "连续蕴含可导。"],
          ["b", "Differentiable implies continuous.", "可导蕴含连续。"],
          ["c", "Defined implies differentiable.", "有定义蕴含可导。"],
        ],
        "b",
        "Differentiability guarantees continuity, but a continuous function may have a corner or vertical tangent.",
        "可导保证连续，但连续函数仍可能有尖角或垂直切线。",
      ),
      item(
        "differentiability-and-continuity-d2",
        "Why is f(x)=|x| not differentiable at x=0?",
        "为什么 f(x)=|x| 在 x=0 处不可导？",
        [
          ["a", "It is discontinuous there.", "它在那里不连续。"],
          ["b", "Its one-sided slopes -1 and 1 disagree.", "它的左右斜率 -1 与 1 不相等。"],
          ["c", "Its function value is missing.", "它的函数值缺失。"],
        ],
        "b",
        "|x| is continuous at zero, but the one-sided derivative limits are unequal.",
        "|x| 在 0 处连续，但两个单侧导数极限不相等。",
      ),
    ],
    exit_ticket: [
      item(
        "differentiability-and-continuity-e1",
        "A function is continuous at c and has a vertical tangent there. Which statement is accurate?",
        "函数在 c 处连续且有垂直切线。哪个说法准确？",
        [
          ["a", "It has derivative 0.", "它的导数为 0。"],
          ["b", "It has no finite derivative at c.", "它在 c 处没有有限导数。"],
          ["c", "It must be discontinuous.", "它一定不连续。"],
        ],
        "b",
        "A vertical tangent has unbounded rather than finite slope.",
        "垂直切线的斜率无界，而不是有限值。",
      ),
      item(
        "differentiability-and-continuity-e2",
        "If f has a jump discontinuity at x=2, what can be concluded?",
        "若 f 在 x=2 处有跳跃间断，可以得出什么结论？",
        [
          ["a", "f is not differentiable at 2.", "f 在 2 处不可导。"],
          ["b", "f'(2)=0.", "f'(2)=0。"],
          ["c", "The one-sided derivatives must agree.", "两个单侧导数一定相等。"],
        ],
        "a",
        "A discontinuity rules out differentiability at that point.",
        "间断会直接排除该点的可导性。",
      ),
    ],
  },
  "power-rule": {
    diagnostic: [
      item(
        "power-rule-d1",
        "What is d/dx(x⁵)?",
        "d/dx(x⁵) 是多少？",
        [
          ["a", "x⁴", "x⁴"],
          ["b", "5x⁴", "5x⁴"],
          ["c", "5x⁵", "5x⁵"],
        ],
        "b",
        "The exponent becomes the coefficient and then decreases by one.",
        "原指数先变成系数，再减 1。",
      ),
      item(
        "power-rule-d2",
        "What is d/dx(x⁻²)?",
        "d/dx(x⁻²) 是多少？",
        [
          ["a", "-2x⁻³", "-2x⁻³"],
          ["b", "2x⁻¹", "2x⁻¹"],
          ["c", "x⁻³", "x⁻³"],
        ],
        "a",
        "Apply r x^(r-1) with r=-2 to get -2x^-3.",
        "取 r=-2，使用 r x^(r-1)，得到 -2x^-3。",
      ),
    ],
    exit_ticket: [
      item(
        "power-rule-e1",
        "What is d/dx(sqrt(x)) for x>0?",
        "当 x>0 时，d/dx(sqrt(x)) 是多少？",
        [
          ["a", "1/(2sqrt(x))", "1/(2sqrt(x))"],
          ["b", "sqrt(x)/2", "sqrt(x)/2"],
          ["c", "2sqrt(x)", "2sqrt(x)"],
        ],
        "a",
        "Rewrite sqrt(x)=x^(1/2), then differentiate to (1/2)x^(-1/2).",
        "把 sqrt(x) 写成 x^(1/2)，求导得 (1/2)x^(-1/2)。",
      ),
      item(
        "power-rule-e2",
        "For f(x)=1/x², which domain restriction remains after differentiating?",
        "对 f(x)=1/x²，求导后仍需保留哪个定义域限制？",
        [
          ["a", "x>0 only", "只能 x>0"],
          ["b", "x≠0", "x≠0"],
          ["c", "No restriction", "没有限制"],
        ],
        "b",
        "The original reciprocal function and its derivative are undefined at x=0.",
        "原倒数函数及其导数在 x=0 处都无定义。",
      ),
    ],
  },
  "linearity-rules-for-derivatives": {
    diagnostic: [
      item(
        "linearity-rules-for-derivatives-d1",
        "What is the derivative of the constant function f(x)=7?",
        "常数函数 f(x)=7 的导数是什么？",
        [
          ["a", "0", "0"],
          ["b", "1", "1"],
          ["c", "7", "7"],
        ],
        "a",
        "A constant function has no output change, so its slope is zero.",
        "常数函数没有输出变化，因此斜率为 0。",
      ),
      item(
        "linearity-rules-for-derivatives-d2",
        "What is d/dx(3x⁴-2x+7)?",
        "d/dx(3x⁴-2x+7) 是多少？",
        [
          ["a", "12x³-2", "12x³-2"],
          ["b", "12x³-2x", "12x³-2x"],
          ["c", "3x³-2", "3x³-2"],
        ],
        "a",
        "Differentiate term by term: 3x⁴→12x³, -2x→-2, and 7→0.",
        "逐项求导：3x⁴→12x³，-2x→-2，7→0。",
      ),
    ],
    exit_ticket: [
      item(
        "linearity-rules-for-derivatives-e1",
        "If f'(a)=2 and g'(a)=-1, what is (3f-4g)'(a)?",
        "若 f'(a)=2、g'(a)=-1，(3f-4g)'(a) 是多少？",
        [
          ["a", "2", "2"],
          ["b", "10", "10"],
          ["c", "14", "14"],
        ],
        "b",
        "Linearity gives 3f'(a)-4g'(a)=3(2)-4(-1)=10.",
        "线性法则给出 3f'(a)-4g'(a)=3(2)-4(-1)=10。",
      ),
      item(
        "linearity-rules-for-derivatives-e2",
        "Which expression cannot be differentiated by simple term-by-term linearity before rewriting?",
        "哪个表达式在改写前不能只靠逐项线性法则求导？",
        [
          ["a", "4f(x)-3g(x)", "4f(x)-3g(x)"],
          ["b", "f(x)g(x)", "f(x)g(x)"],
          ["c", "f(x)+7", "f(x)+7"],
        ],
        "b",
        "A product of two changing functions requires the product rule or valid algebraic rewriting.",
        "两个变化函数的乘积需要乘积法则，或先做有效代数改写。",
      ),
    ],
  },
  "basic-transcendental-derivatives": {
    diagnostic: [
      item(
        "basic-transcendental-derivatives-d1",
        "What is d/dx(cos x) when x is measured in radians?",
        "当 x 使用弧度制时，d/dx(cos x) 是多少？",
        [
          ["a", "sin x", "sin x"],
          ["b", "-sin x", "-sin x"],
          ["c", "cos x", "cos x"],
        ],
        "b",
        "Cosine decreases where sine is positive, so its derivative is -sin x.",
        "正弦为正时余弦递减，因此它的导数为 -sin x。",
      ),
      item(
        "basic-transcendental-derivatives-d2",
        "What is d/dx(ln x) for x>0?",
        "当 x>0 时，d/dx(ln x) 是多少？",
        [
          ["a", "ln x", "ln x"],
          ["b", "1/x", "1/x"],
          ["c", "eˣ", "eˣ"],
        ],
        "b",
        "The natural logarithm has reciprocal derivative 1/x on its domain.",
        "自然对数在其定义域内的导数是倒数 1/x。",
      ),
    ],
    exit_ticket: [
      item(
        "basic-transcendental-derivatives-e1",
        "What is d/dx(2sin x-3eˣ+ln x)?",
        "d/dx(2sin x-3eˣ+ln x) 是多少？",
        [
          ["a", "2cos x-3eˣ+1/x", "2cos x-3eˣ+1/x"],
          ["b", "-2sin x-3eˣ+ln x", "-2sin x-3eˣ+ln x"],
          ["c", "2cos x-3eˣ+x", "2cos x-3eˣ+x"],
        ],
        "a",
        "Apply the known derivatives and linearity, preserving the logarithm's domain x>0.",
        "使用已知求导公式和线性法则，并保留对数定义域 x>0。",
      ),
      item(
        "basic-transcendental-derivatives-e2",
        "What is lim h→0 sin(h)/h?",
        "lim h→0 sin(h)/h 是多少？",
        [
          ["a", "0", "0"],
          ["b", "1", "1"],
          ["c", "It does not exist.", "不存在。"],
        ],
        "b",
        "This is the derivative of sin x at x=0, equal to cos 0=1.",
        "这是 sin x 在 x=0 处的导数，等于 cos 0=1。",
      ),
    ],
  },
  "product-rule": {
    diagnostic: [
      item(
        "product-rule-d1",
        "Which formula is the product rule?",
        "哪个公式是乘积法则？",
        [
          ["a", "(fg)'=f'g'", "(fg)'=f'g'"],
          ["b", "(fg)'=f'g+fg'", "(fg)'=f'g+fg'"],
          ["c", "(fg)'=f'+g'", "(fg)'=f'+g'"],
        ],
        "b",
        "Both changing factors contribute, one differentiated at a time.",
        "两个变化因子都要贡献，每一项只对一个因子求导。",
      ),
      item(
        "product-rule-d2",
        "If f(1)=2, f'(1)=3, g(1)=-1, and g'(1)=4, what is (fg)'(1)?",
        "若 f(1)=2、f'(1)=3、g(1)=-1、g'(1)=4，(fg)'(1) 是多少？",
        [
          ["a", "-12", "-12"],
          ["b", "5", "5"],
          ["c", "12", "12"],
        ],
        "b",
        "f'(1)g(1)+f(1)g'(1)=3(-1)+2(4)=5.",
        "f'(1)g(1)+f(1)g'(1)=3(-1)+2(4)=5。",
      ),
    ],
    exit_ticket: [
      item(
        "product-rule-e1",
        "For h(x)=x²eˣ, what is h'(x)?",
        "对 h(x)=x²eˣ，h'(x) 是多少？",
        [
          ["a", "2xeˣ+x²eˣ", "2xeˣ+x²eˣ"],
          ["b", "2xeˣ", "2xeˣ"],
          ["c", "x²eˣ", "x²eˣ"],
        ],
        "a",
        "Differentiate one factor in each term: (2x)eˣ+x²(eˣ).",
        "每一项对一个因子求导：(2x)eˣ+x²(eˣ)。",
      ),
      item(
        "product-rule-e2",
        "Which rule is most direct for d/dx[7f(x)]?",
        "求 d/dx[7f(x)] 时，哪个法则最直接？",
        [
          ["a", "Constant-multiple rule", "常数倍法则"],
          ["b", "Full quotient rule", "完整商法则"],
          ["c", "No derivative rule applies", "没有适用的求导法则"],
        ],
        "a",
        "Seven is constant, so d/dx[7f(x)]=7f'(x).",
        "7 是常数，因此 d/dx[7f(x)]=7f'(x)。",
      ),
    ],
  },
  "quotient-rule": {
    diagnostic: [
      item(
        "quotient-rule-d1",
        "Which formula is the quotient rule for f/g?",
        "哪个公式是 f/g 的商法则？",
        [
          ["a", "(f'g-fg')/g²", "(f'g-fg')/g²"],
          ["b", "f'/g'", "f'/g'"],
          ["c", "(f'g+fg')/g", "(f'g+fg')/g"],
        ],
        "a",
        "The numerator is an ordered difference and the original denominator is squared.",
        "分子是有固定次序的差，分母是原分母的平方。",
      ),
      item(
        "quotient-rule-d2",
        "What condition is required at x=a before evaluating (f/g)'(a)?",
        "计算 (f/g)'(a) 前必须满足什么条件？",
        [
          ["a", "f(a)=0", "f(a)=0"],
          ["b", "g(a)≠0", "g(a)≠0"],
          ["c", "f'(a)=g'(a)", "f'(a)=g'(a)"],
        ],
        "b",
        "The original quotient and quotient-rule denominator require g(a) to be nonzero.",
        "原商函数和商法则分母都要求 g(a) 不为 0。",
      ),
    ],
    exit_ticket: [
      item(
        "quotient-rule-e1",
        "If f(a)=4, f'(a)=1, g(a)=2, and g'(a)=3, what is (f/g)'(a)?",
        "若 f(a)=4、f'(a)=1、g(a)=2、g'(a)=3，(f/g)'(a) 是多少？",
        [
          ["a", "-5/2", "-5/2"],
          ["b", "5/2", "5/2"],
          ["c", "1/3", "1/3"],
        ],
        "a",
        "(1·2-4·3)/2²=-10/4=-5/2.",
        "(1·2-4·3)/2²=-10/4=-5/2。",
      ),
      item(
        "quotient-rule-e2",
        "What is the most efficient first step for differentiating 5/x³?",
        "求 5/x³ 的导数时，最有效的第一步是什么？",
        [
          ["a", "Rewrite it as 5x⁻³.", "改写为 5x⁻³。"],
          ["b", "Set x=0.", "令 x=0。"],
          ["c", "Replace it with 5x³.", "改写为 5x³。"],
        ],
        "a",
        "The power rewrite allows the constant-multiple and power rules, while x≠0 remains.",
        "幂形式可直接使用常数倍和幂法则，同时保留 x≠0。",
      ),
    ],
  },
  "remaining-trigonometric-derivatives": {
    diagnostic: [
      item(
        "remaining-trigonometric-derivatives-d1",
        "What is d/dx(tan x)?",
        "d/dx(tan x) 是多少？",
        [
          ["a", "sec²x", "sec²x"],
          ["b", "-csc²x", "-csc²x"],
          ["c", "sec x tan x", "sec x tan x"],
        ],
        "a",
        "Differentiating sin x/cos x gives sec²x.",
        "对 sin x/cos x 使用商法则可得 sec²x。",
      ),
      item(
        "remaining-trigonometric-derivatives-d2",
        "What is d/dx(csc x)?",
        "d/dx(csc x) 是多少？",
        [
          ["a", "csc x cot x", "csc x cot x"],
          ["b", "-csc x cot x", "-csc x cot x"],
          ["c", "-csc²x", "-csc²x"],
        ],
        "b",
        "The cosecant derivative keeps both csc and cot factors and carries a negative sign.",
        "余割导数保留 csc 与 cot 两个因子，并带负号。",
      ),
    ],
    exit_ticket: [
      item(
        "remaining-trigonometric-derivatives-e1",
        "What is d/dx(2tan x-3csc x)?",
        "d/dx(2tan x-3csc x) 是多少？",
        [
          ["a", "2sec²x+3csc x cot x", "2sec²x+3csc x cot x"],
          ["b", "2sec x tan x-3csc²x", "2sec x tan x-3csc²x"],
          ["c", "2tan x+3csc x", "2tan x+3csc x"],
        ],
        "a",
        "Differentiate tan to sec² and csc to -csc cot; the outer -3 makes the second term positive.",
        "tan 的导数为 sec²，csc 的导数为 -csc cot；外部 -3 使第二项为正。",
      ),
      item(
        "remaining-trigonometric-derivatives-e2",
        "Which identity is a direct starting point for deriving (cot x)'?",
        "推导 (cot x)' 时，哪个恒等式可作为直接起点？",
        [
          ["a", "cot x=cos x/sin x", "cot x=cos x/sin x"],
          ["b", "cot x=sin x/cos x", "cot x=sin x/cos x"],
          ["c", "cot x=1+tan²x", "cot x=1+tan²x"],
        ],
        "a",
        "Applying the quotient rule to cos x/sin x yields -csc²x where sin x≠0.",
        "对 cos x/sin x 使用商法则，在 sin x≠0 处得到 -csc²x。",
      ),
    ],
  },
};
