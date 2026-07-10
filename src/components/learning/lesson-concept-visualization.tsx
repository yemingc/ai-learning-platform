"use client";

import { useId, useState } from "react";
import { ArrowLeft, ArrowRight, BetweenHorizontalEnd, ChartNoAxesCombined, Table2 } from "lucide-react";
import type { Language } from "@/components/i18n/language-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getLessonVisualization,
  type LessonVisualization,
  type LimitSample,
} from "@/features/lessons/lesson-visualizations";

type ApproachSide = "both" | "left" | "right";

const copy = {
  en: {
    both: "Both sides",
    direction: "Approach",
    fromLeft: "from left",
    fromRight: "from right",
    graph: "Graphical representation",
    left: "Left",
    noTwoSided: "The one-sided values disagree, so there is no two-sided limit.",
    numerical: "Numerical representation",
    negativeInfinity: "x → −∞",
    observation: "What the representations show",
    positiveInfinity: "x → +∞",
    right: "Right",
    tableCaption: "Nearby input and output values",
    title: "See the limit, then read the evidence.",
  },
  zh: {
    both: "同时看两侧",
    direction: "趋近方向",
    fromLeft: "从左侧",
    fromRight: "从右侧",
    graph: "图像表示",
    left: "左侧",
    noTwoSided: "两个单侧值不同，所以双侧极限不存在。",
    numerical: "数值表示",
    negativeInfinity: "x → −∞",
    observation: "图像与表格共同说明",
    positiveInfinity: "x → +∞",
    right: "右侧",
    tableCaption: "目标点附近的输入值与输出值",
    title: "先看见极限，再读懂证据。",
  },
} satisfies Record<Language, Record<string, string>>;

const descriptions: Record<string, Record<Language, string>> = {
  "what-is-a-limit": {
    en: "Nearby values approach the open point even though the actual function value is somewhere else.",
    zh: "附近的函数值都靠近空心点，即使目标点处的实际函数值在别的位置。",
  },
  "limit-notation": {
    en: "The input movement x → a and output behavior f(x) → L describe two linked motions.",
    zh: "输入运动 x → a 与输出行为 f(x) → L 是两件相互关联的事。",
  },
  "estimating-limits-from-graphs": {
    en: "Trace the curve from each side and compare the heights it approaches before looking at the filled point.",
    zh: "先分别追踪曲线两侧靠近的高度，再判断实心点是否与极限有关。",
  },
  "one-sided-limits": {
    en: "Switch sides to isolate the left-hand and right-hand behavior at the jump.",
    zh: "切换左右方向，分别观察跳跃点两侧的单侧行为。",
  },
  "infinite-limits": {
    en: "Values become unbounded in opposite directions near the vertical asymptote.",
    zh: "函数值在垂直渐近线两侧沿相反方向变得无界。",
  },
  "evaluating-limits-with-limit-laws": {
    en: "The component limits combine through the same valid algebraic structure, so f(x) + 2g(x) approaches 11.",
    zh: "分量极限通过同样的有效代数结构组合，因此 f(x) + 2g(x) 趋近于 11。",
  },
  "squeeze-theorem": {
    en: "The oscillating middle function remains inside bounds whose vertical gap shrinks to zero.",
    zh: "中间函数虽然持续振荡，但始终被夹在垂直间距缩小到 0 的上下界之间。",
  },
  "continuity-at-a-point": {
    en: "Nearby values approach 3 and the assigned value f(1) is also 3, so all three continuity conditions agree.",
    zh: "附近函数值趋近于 3，而且 f(1) 也等于 3，因此连续性的三个条件一致。",
  },
  "intermediate-value-theorem": {
    en: "A continuous curve moving from -2 to 4 cannot skip the intermediate height y = 1.",
    zh: "连续曲线从 -2 变化到 4 时，不可能跳过中间高度 y = 1。",
  },
  "limits-at-infinity": {
    en: "At both ends, the rational function settles toward y = 2 as reciprocal-power terms fade toward zero.",
    zh: "在图像两端，倒数幂项趋近于 0，因此这个有理函数逐渐靠近 y = 2。",
  },
};

function formatNumber(value: number) {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return String(Number(value.toFixed(4)));
}

function getSampleSide(sample: LimitSample, targetX: number) {
  return sample.x < targetX ? "left" : "right";
}

function GraphAxes({ targetX }: { targetX: number }) {
  return (
    <g aria-hidden="true">
      {[80, 140, 200].map((y) => (
        <line
          key={y}
          stroke="var(--border)"
          strokeWidth="1"
          x1="45"
          x2="475"
          y1={y}
          y2={y}
        />
      ))}
      <line stroke="var(--muted-foreground)" x1="45" x2="475" y1="240" y2="240" />
      <line stroke="var(--muted-foreground)" x1="260" x2="260" y1="30" y2="260" />
      <text fill="currentColor" fontSize="13" x="468" y="258">x</text>
      <text fill="currentColor" fontSize="13" x="270" y="42">f(x)</text>
      <text fill="currentColor" fontSize="13" textAnchor="middle" x="260" y="278">
        {targetX}
      </text>
    </g>
  );
}

function FiniteHoleGraph({
  activeSide,
  description,
  spec,
  titleId,
}: {
  activeSide: ApproachSide;
  description: string;
  spec: Extract<LessonVisualization, { kind: "finite_hole" }>;
  titleId: string;
}) {
  const leftOpacity = activeSide === "right" ? 0.18 : 1;
  const rightOpacity = activeSide === "left" ? 0.18 : 1;

  return (
    <svg
      aria-describedby={`${titleId}-description`}
      aria-labelledby={`${titleId}-title`}
      className="h-auto w-full text-foreground"
      role="img"
      viewBox="0 0 520 300"
    >
      <title id={`${titleId}-title`}>Finite limit with an open point</title>
      <desc id={`${titleId}-description`}>{description}</desc>
      <GraphAxes targetX={spec.targetX} />
      <path
        d="M55 215 C120 200 190 125 252 86"
        fill="none"
        opacity={leftOpacity}
        stroke="var(--learning-blue)"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <path
        d="M268 82 C330 72 400 60 465 48"
        fill="none"
        opacity={rightOpacity}
        stroke="var(--learning-mint)"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <text fill="var(--learning-blue)" fontSize="13" fontWeight="600" x="92" y="188">
        x &lt; a
      </text>
      <text fill="var(--learning-mint)" fontSize="13" fontWeight="600" x="398" y="188">
        x &gt; a
      </text>
      <line
        stroke="var(--learning-amber)"
        strokeDasharray="5 5"
        x1="260"
        x2="260"
        y1="88"
        y2="205"
      />
      <circle
        cx="260"
        cy="86"
        fill="var(--background)"
        r="9"
        stroke="var(--learning-amber)"
        strokeWidth="4"
      />
      <circle cx="260" cy="205" fill="var(--learning-amber)" r="8" />
      <text fill="currentColor" fontSize="13" x="276" y="82">
        limit = {formatNumber(spec.limitY)}
      </text>
      <text fill="currentColor" fontSize="13" x="276" y="210">
        f({formatNumber(spec.targetX)}) = {formatNumber(spec.functionValueY)}
      </text>
    </svg>
  );
}

function NotationMappingGraph({
  activeSide,
  description,
  spec,
  titleId,
}: {
  activeSide: ApproachSide;
  description: string;
  spec: Extract<LessonVisualization, { kind: "notation_mapping" }>;
  titleId: string;
}) {
  const leftOpacity = activeSide === "right" ? 0.18 : 1;
  const rightOpacity = activeSide === "left" ? 0.18 : 1;

  return (
    <svg
      aria-describedby={`${titleId}-description`}
      aria-labelledby={`${titleId}-title`}
      className="h-auto w-full text-foreground"
      role="img"
      viewBox="0 0 520 300"
    >
      <title id={`${titleId}-title`}>Input and output approach mapping</title>
      <desc id={`${titleId}-description`}>{description}</desc>
      <text fill="currentColor" fontSize="15" fontWeight="700" x="40" y="48">input: x → a</text>
      <line stroke="var(--muted-foreground)" strokeWidth="2" x1="65" x2="455" y1="92" y2="92" />
      <path d="M90 92 L238 92" opacity={leftOpacity} stroke="var(--learning-blue)" strokeWidth="6" />
      <path d="M430 92 L282 92" opacity={rightOpacity} stroke="var(--learning-mint)" strokeWidth="6" />
      <path d="M238 92 L225 84 M238 92 L225 100" fill="none" opacity={leftOpacity} stroke="var(--learning-blue)" strokeWidth="4" />
      <path d="M282 92 L295 84 M282 92 L295 100" fill="none" opacity={rightOpacity} stroke="var(--learning-mint)" strokeWidth="4" />
      <circle cx="260" cy="92" fill="var(--background)" r="8" stroke="var(--learning-amber)" strokeWidth="4" />
      <text fill="currentColor" fontSize="13" textAnchor="middle" x="260" y="122">a = {formatNumber(spec.targetX)}</text>

      <text fill="currentColor" fontSize="15" fontWeight="700" x="40" y="174">output: f(x) → L</text>
      <line stroke="var(--muted-foreground)" strokeWidth="2" x1="65" x2="455" y1="218" y2="218" />
      <path d="M90 218 L238 218" opacity={leftOpacity} stroke="var(--learning-blue)" strokeWidth="6" />
      <path d="M430 218 L282 218" opacity={rightOpacity} stroke="var(--learning-mint)" strokeWidth="6" />
      <circle cx="260" cy="218" fill="var(--learning-amber)" r="8" />
      <text fill="currentColor" fontSize="13" textAnchor="middle" x="260" y="250">L = {formatNumber(spec.limitY)}</text>
    </svg>
  );
}

function OneSidedGraph({
  activeSide,
  description,
  spec,
  titleId,
}: {
  activeSide: ApproachSide;
  description: string;
  spec: Extract<LessonVisualization, { kind: "one_sided_jump" }>;
  titleId: string;
}) {
  const leftOpacity = activeSide === "right" ? 0.18 : 1;
  const rightOpacity = activeSide === "left" ? 0.18 : 1;

  return (
    <svg
      aria-describedby={`${titleId}-description`}
      aria-labelledby={`${titleId}-title`}
      className="h-auto w-full text-foreground"
      role="img"
      viewBox="0 0 520 300"
    >
      <title id={`${titleId}-title`}>One-sided limits at a jump</title>
      <desc id={`${titleId}-description`}>{description}</desc>
      <GraphAxes targetX={spec.targetX} />
      <path
        d="M60 160 L252 160"
        fill="none"
        opacity={leftOpacity}
        stroke="var(--learning-blue)"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <path
        d="M268 72 L465 72"
        fill="none"
        opacity={rightOpacity}
        stroke="var(--learning-mint)"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <circle cx="260" cy="160" fill="var(--background)" opacity={leftOpacity} r="9" stroke="var(--learning-blue)" strokeWidth="4" />
      <circle cx="260" cy="72" fill="var(--background)" opacity={rightOpacity} r="9" stroke="var(--learning-mint)" strokeWidth="4" />
      <text fill="var(--learning-blue)" fontSize="13" fontWeight="700" x="115" y="150">x &lt; {formatNumber(spec.targetX)} → {formatNumber(spec.leftLimit)}</text>
      <text fill="var(--learning-mint)" fontSize="13" fontWeight="700" x="320" y="62">{formatNumber(spec.rightLimit)} ← x &gt; {formatNumber(spec.targetX)}</text>
    </svg>
  );
}

function InfiniteGraph({
  activeSide,
  description,
  spec,
  titleId,
}: {
  activeSide: ApproachSide;
  description: string;
  spec: Extract<LessonVisualization, { kind: "infinite_asymptote" }>;
  titleId: string;
}) {
  const leftOpacity = activeSide === "right" ? 0.18 : 1;
  const rightOpacity = activeSide === "left" ? 0.18 : 1;

  return (
    <svg
      aria-describedby={`${titleId}-description`}
      aria-labelledby={`${titleId}-title`}
      className="h-auto w-full text-foreground"
      role="img"
      viewBox="0 0 520 300"
    >
      <title id={`${titleId}-title`}>Infinite limits near a vertical asymptote</title>
      <desc id={`${titleId}-description`}>{description}</desc>
      <g aria-hidden="true">
        <line stroke="var(--muted-foreground)" x1="45" x2="475" y1="150" y2="150" />
        <line stroke="var(--muted-foreground)" x1="60" x2="60" y1="30" y2="270" />
        <text fill="currentColor" fontSize="13" x="468" y="168">x</text>
        <text fill="currentColor" fontSize="13" x="70" y="42">f(x)</text>
        <text fill="currentColor" fontSize="13" textAnchor="middle" x="260" y="168">
          {spec.targetX}
        </text>
      </g>
      <line
        stroke="var(--learning-amber)"
        strokeDasharray="8 6"
        strokeWidth="3"
        x1="260"
        x2="260"
        y1="28"
        y2="260"
      />
      <path
        d="M55 205 C155 210 225 230 252 270"
        fill="none"
        opacity={leftOpacity}
        stroke="var(--learning-blue)"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <path
        d="M268 30 C292 70 365 90 465 105"
        fill="none"
        opacity={rightOpacity}
        stroke="var(--learning-mint)"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <text fill="var(--learning-blue)" fontSize="14" fontWeight="700" x="130" y="225">x &lt; {spec.targetX} → −∞</text>
      <text fill="var(--learning-mint)" fontSize="14" fontWeight="700" x="320" y="82">+∞ ← x &gt; {spec.targetX}</text>
      <text fill="var(--learning-amber)" fontSize="13" fontWeight="700" x="274" y="286">x = {spec.targetX}</text>
    </svg>
  );
}

function LimitLawGraph({
  activeSide,
  description,
  spec,
  titleId,
}: {
  activeSide: ApproachSide;
  description: string;
  spec: Extract<LessonVisualization, { kind: "limit_law_combination" }>;
  titleId: string;
}) {
  const leftOpacity = activeSide === "right" ? 0.2 : 1;
  const rightOpacity = activeSide === "left" ? 0.2 : 1;

  return (
    <svg
      aria-describedby={`${titleId}-description`}
      aria-labelledby={`${titleId}-title`}
      className="h-auto w-full text-foreground"
      role="img"
      viewBox="0 0 520 300"
    >
      <title id={`${titleId}-title`}>Limit laws combine known limits</title>
      <desc id={`${titleId}-description`}>{description}</desc>
      <text fill="currentColor" fontSize="16" fontWeight="700" textAnchor="middle" x="260" y="38">
        as x → {spec.targetX}
      </text>
      <rect fill="var(--learning-blue)" fillOpacity="0.12" height="74" rx="12" stroke="var(--learning-blue)" width="150" x="42" y="70" />
      <text fill="currentColor" fontSize="15" fontWeight="700" textAnchor="middle" x="117" y="101">f(x) → {spec.fLimit}</text>
      <text fill="var(--muted-foreground)" fontSize="13" textAnchor="middle" x="117" y="125">known limit</text>
      <rect fill="var(--learning-mint)" fillOpacity="0.14" height="74" rx="12" stroke="var(--learning-mint)" width="150" x="328" y="70" />
      <text fill="currentColor" fontSize="15" fontWeight="700" textAnchor="middle" x="403" y="101">g(x) → {spec.gLimit}</text>
      <text fill="var(--muted-foreground)" fontSize="13" textAnchor="middle" x="403" y="125">known limit</text>
      <path d="M117 154 C135 200 190 214 238 218" fill="none" opacity={leftOpacity} stroke="var(--learning-blue)" strokeWidth="5" />
      <path d="M403 154 C385 200 330 214 282 218" fill="none" opacity={rightOpacity} stroke="var(--learning-mint)" strokeWidth="5" />
      <path d="M238 218 L225 210 M238 218 L225 226" fill="none" opacity={leftOpacity} stroke="var(--learning-blue)" strokeWidth="4" />
      <path d="M282 218 L295 210 M282 218 L295 226" fill="none" opacity={rightOpacity} stroke="var(--learning-mint)" strokeWidth="4" />
      <rect fill="var(--learning-amber)" fillOpacity="0.18" height="58" rx="12" stroke="var(--learning-amber)" strokeWidth="2" width="250" x="135" y="222" />
      <text fill="currentColor" fontSize="15" fontWeight="700" textAnchor="middle" x="260" y="246">{spec.expression} → {spec.limitY}</text>
      <text fill="var(--muted-foreground)" fontSize="12" textAnchor="middle" x="260" y="267">{spec.fLimit} + 2({spec.gLimit}) = {spec.limitY}</text>
    </svg>
  );
}

function SqueezeGraph({
  activeSide,
  description,
  spec,
  titleId,
}: {
  activeSide: ApproachSide;
  description: string;
  spec: Extract<LessonVisualization, { kind: "squeeze_bounds" }>;
  titleId: string;
}) {
  const leftOpacity = activeSide === "right" ? 0.18 : 1;
  const rightOpacity = activeSide === "left" ? 0.18 : 1;

  return (
    <svg
      aria-describedby={`${titleId}-description`}
      aria-labelledby={`${titleId}-title`}
      className="h-auto w-full text-foreground"
      role="img"
      viewBox="0 0 520 300"
    >
      <title id={`${titleId}-title`}>A function squeezed between matching bounds</title>
      <desc id={`${titleId}-description`}>{description}</desc>
      <GraphAxes targetX={spec.targetX} />
      <path d="M55 55 Q150 118 252 148" fill="none" opacity={leftOpacity} stroke="var(--learning-mint)" strokeWidth="4" />
      <path d="M268 148 Q370 118 465 55" fill="none" opacity={rightOpacity} stroke="var(--learning-mint)" strokeWidth="4" />
      <path d="M55 245 Q150 182 252 152" fill="none" opacity={leftOpacity} stroke="var(--learning-blue)" strokeWidth="4" />
      <path d="M268 152 Q370 182 465 245" fill="none" opacity={rightOpacity} stroke="var(--learning-blue)" strokeWidth="4" />
      <path d="M55 170 C85 70 115 230 145 130 C175 55 205 218 235 145 C247 125 252 165 260 150" fill="none" opacity={leftOpacity} stroke="var(--learning-amber)" strokeWidth="4" />
      <path d="M260 150 C268 135 273 175 285 155 C315 82 345 245 375 170 C405 70 435 230 465 130" fill="none" opacity={rightOpacity} stroke="var(--learning-amber)" strokeWidth="4" />
      <circle cx="260" cy="150" fill="var(--learning-amber)" r="7" />
      <text fill="var(--learning-mint)" fontSize="13" fontWeight="700" x="370" y="86">upper: x²</text>
      <text fill="var(--learning-amber)" fontSize="13" fontWeight="700" x="345" y="145">x² sin(1/x)</text>
      <text fill="var(--learning-blue)" fontSize="13" fontWeight="700" x="370" y="228">lower: −x²</text>
    </svg>
  );
}

function ContinuityGraph({
  activeSide,
  description,
  spec,
  titleId,
}: {
  activeSide: ApproachSide;
  description: string;
  spec: Extract<LessonVisualization, { kind: "continuity_point" }>;
  titleId: string;
}) {
  const leftOpacity = activeSide === "right" ? 0.18 : 1;
  const rightOpacity = activeSide === "left" ? 0.18 : 1;

  return (
    <svg
      aria-describedby={`${titleId}-description`}
      aria-labelledby={`${titleId}-title`}
      className="h-auto w-full text-foreground"
      role="img"
      viewBox="0 0 520 300"
    >
      <title id={`${titleId}-title`}>Three conditions for continuity at a point</title>
      <desc id={`${titleId}-description`}>{description}</desc>
      <GraphAxes targetX={spec.targetX} />
      <path d="M55 220 L260 112" fill="none" opacity={leftOpacity} stroke="var(--learning-blue)" strokeLinecap="round" strokeWidth="5" />
      <path d="M260 112 L465 52" fill="none" opacity={rightOpacity} stroke="var(--learning-mint)" strokeLinecap="round" strokeWidth="5" />
      <circle cx="260" cy="112" fill="var(--learning-amber)" r="9" stroke="var(--background)" strokeWidth="3" />
      <rect fill="var(--background)" fillOpacity="0.94" height="91" rx="10" stroke="var(--border)" width="210" x="284" y="170" />
      <text fill="currentColor" fontSize="13" fontWeight="700" x="300" y="194">✓ f({spec.targetX}) = {spec.functionValueY}</text>
      <text fill="currentColor" fontSize="13" fontWeight="700" x="300" y="220">✓ lim f(x) = {spec.limitY}</text>
      <text fill="currentColor" fontSize="13" fontWeight="700" x="300" y="246">✓ limit = function value</text>
    </svg>
  );
}

function IntermediateValueGraph({
  activeSide,
  description,
  spec,
  titleId,
}: {
  activeSide: ApproachSide;
  description: string;
  spec: Extract<LessonVisualization, { kind: "intermediate_value" }>;
  titleId: string;
}) {
  const leftOpacity = activeSide === "right" ? 0.2 : 1;
  const rightOpacity = activeSide === "left" ? 0.2 : 1;

  return (
    <svg
      aria-describedby={`${titleId}-description`}
      aria-labelledby={`${titleId}-title`}
      className="h-auto w-full text-foreground"
      role="img"
      viewBox="0 0 520 300"
    >
      <title id={`${titleId}-title`}>Intermediate Value Theorem crossing guarantee</title>
      <desc id={`${titleId}-description`}>{description}</desc>
      <line stroke="var(--muted-foreground)" x1="45" x2="475" y1="245" y2="245" />
      <line stroke="var(--muted-foreground)" x1="70" x2="70" y1="30" y2="265" />
      <line stroke="var(--learning-amber)" strokeDasharray="7 5" strokeWidth="3" x1="55" x2="465" y1="142" y2="142" />
      <text fill="var(--learning-amber)" fontSize="13" fontWeight="700" x="386" y="134">target y = {spec.targetY}</text>
      <path d="M80 228 C135 220 180 198 260 142" fill="none" opacity={leftOpacity} stroke="var(--learning-blue)" strokeWidth="5" />
      <path d="M260 142 C335 88 390 70 455 48" fill="none" opacity={rightOpacity} stroke="var(--learning-mint)" strokeWidth="5" />
      <circle cx="80" cy="228" fill="var(--learning-blue)" r="7" />
      <circle cx="260" cy="142" fill="var(--learning-amber)" r="8" />
      <circle cx="455" cy="48" fill="var(--learning-mint)" r="7" />
      <text fill="currentColor" fontSize="12" x="78" y="260">a = {spec.interval[0]}, f(a) = {spec.endpointValues[0]}</text>
      <text fill="currentColor" fontSize="12" textAnchor="end" x="458" y="78">b = {spec.interval[1]}, f(b) = {spec.endpointValues[1]}</text>
      <text fill="currentColor" fontSize="12" fontWeight="700" textAnchor="middle" x="260" y="128">at least one c</text>
    </svg>
  );
}

function EndBehaviorGraph({
  activeSide,
  description,
  spec,
  titleId,
}: {
  activeSide: ApproachSide;
  description: string;
  spec: Extract<LessonVisualization, { kind: "end_behavior" }>;
  titleId: string;
}) {
  const leftOpacity = activeSide === "right" ? 0.18 : 1;
  const rightOpacity = activeSide === "left" ? 0.18 : 1;

  return (
    <svg
      aria-describedby={`${titleId}-description`}
      aria-labelledby={`${titleId}-title`}
      className="h-auto w-full text-foreground"
      role="img"
      viewBox="0 0 520 300"
    >
      <title id={`${titleId}-title`}>End behavior approaching a horizontal asymptote</title>
      <desc id={`${titleId}-description`}>{description}</desc>
      <line stroke="var(--muted-foreground)" x1="45" x2="475" y1="240" y2="240" />
      <line stroke="var(--muted-foreground)" x1="260" x2="260" y1="28" y2="265" />
      <line stroke="var(--learning-amber)" strokeDasharray="8 6" strokeWidth="3" x1="45" x2="475" y1="112" y2="112" />
      <path d="M48 116 C105 126 170 168 245 222" fill="none" opacity={leftOpacity} stroke="var(--learning-blue)" strokeLinecap="round" strokeWidth="5" />
      <path d="M275 222 C350 168 415 126 472 116" fill="none" opacity={rightOpacity} stroke="var(--learning-mint)" strokeLinecap="round" strokeWidth="5" />
      <text fill="var(--learning-amber)" fontSize="13" fontWeight="700" x="355" y="102">y = {spec.horizontalAsymptoteY}</text>
      <text fill="var(--learning-blue)" fontSize="13" fontWeight="700" x="55" y="144">x → −∞</text>
      <text fill="var(--learning-mint)" fontSize="13" fontWeight="700" x="402" y="144">x → +∞</text>
      <text fill="currentColor" fontSize="13" textAnchor="middle" x="260" y="286">unbounded inputs, finite output trend</text>
    </svg>
  );
}

function SampleTable({
  activeSide,
  isEndBehavior,
  language,
  samples,
  targetX,
}: {
  activeSide: ApproachSide;
  isEndBehavior: boolean;
  language: Language;
  samples: LimitSample[];
  targetX: number;
}) {
  const activeCopy = copy[language];
  const visibleSamples = samples.filter((sample) => {
    if (activeSide === "both") {
      return true;
    }

    return getSampleSide(sample, targetX) === activeSide;
  });

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background/80">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{activeCopy.tableCaption}</caption>
        <thead className="bg-muted/70 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-3 py-2" scope="col">x</th>
            <th className="px-3 py-2" scope="col">f(x)</th>
            <th className="px-3 py-2" scope="col">{activeCopy.direction}</th>
          </tr>
        </thead>
        <tbody>
          {visibleSamples.map((sample) => {
            const side = getSampleSide(sample, targetX);

            return (
              <tr className="border-t border-border" key={`${sample.x}-${sample.y}`}>
                <td className="px-3 py-2 font-mono">{formatNumber(sample.x)}</td>
                <td className="px-3 py-2 font-mono">{formatNumber(sample.y)}</td>
                <td className="px-3 py-2 text-muted-foreground">
                  {side === "left"
                    ? isEndBehavior
                      ? activeCopy.negativeInfinity
                      : activeCopy.fromLeft
                    : isEndBehavior
                      ? activeCopy.positiveInfinity
                      : activeCopy.fromRight}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function getObservation(spec: LessonVisualization, language: Language) {
  if (spec.kind === "finite_hole") {
    return language === "zh"
      ? `两侧都靠近 ${formatNumber(spec.limitY)}，所以极限是 ${formatNumber(spec.limitY)}；实心点只说明 f(${formatNumber(spec.targetX)}) = ${formatNumber(spec.functionValueY)}。`
      : `Both sides approach ${formatNumber(spec.limitY)}, so the limit is ${formatNumber(spec.limitY)}; the filled point only says f(${formatNumber(spec.targetX)}) = ${formatNumber(spec.functionValueY)}.`;
  }

  if (spec.kind === "notation_mapping") {
    return language === "zh"
      ? `当输入 x 靠近 ${formatNumber(spec.targetX)} 时，输出 f(x) 靠近 ${formatNumber(spec.limitY)}。箭头描述靠近，不要求 x 等于目标值。`
      : `As input x approaches ${formatNumber(spec.targetX)}, output f(x) approaches ${formatNumber(spec.limitY)}. The arrows describe approach, not equality.`;
  }

  if (spec.kind === "one_sided_jump") {
    return language === "zh"
      ? `左极限是 ${formatNumber(spec.leftLimit)}，右极限是 ${formatNumber(spec.rightLimit)}。${copy.zh.noTwoSided}`
      : `The left-hand limit is ${formatNumber(spec.leftLimit)} and the right-hand limit is ${formatNumber(spec.rightLimit)}. ${copy.en.noTwoSided}`;
  }

  if (spec.kind === "limit_law_combination") {
    return language === "zh"
      ? `当 f(x) → ${formatNumber(spec.fLimit)} 且 g(x) → ${formatNumber(spec.gLimit)} 时，和法则与常数倍法则给出 ${spec.expression} → ${formatNumber(spec.limitY)}。`
      : `Because f(x) → ${formatNumber(spec.fLimit)} and g(x) → ${formatNumber(spec.gLimit)}, the sum and constant-multiple laws give ${spec.expression} → ${formatNumber(spec.limitY)}.`;
  }

  if (spec.kind === "squeeze_bounds") {
    return language === "zh"
      ? `-x² 和 x² 都趋近于 ${formatNumber(spec.limitY)}；中间的 x²sin(1/x) 无法逃出逐渐收紧的边界。`
      : `Both -x² and x² approach ${formatNumber(spec.limitY)}; the middle function x²sin(1/x) cannot escape the narrowing bounds.`;
  }

  if (spec.kind === "continuity_point") {
    return language === "zh"
      ? `f(${formatNumber(spec.targetX)}) = ${formatNumber(spec.functionValueY)}，双侧极限也是 ${formatNumber(spec.limitY)}，所以三个连续条件都成立。`
      : `f(${formatNumber(spec.targetX)}) = ${formatNumber(spec.functionValueY)} and the two-sided limit is also ${formatNumber(spec.limitY)}, so all three continuity conditions hold.`;
  }

  if (spec.kind === "intermediate_value") {
    return language === "zh"
      ? `目标值 ${formatNumber(spec.targetY)} 位于端点输出 ${formatNumber(spec.endpointValues[0])} 与 ${formatNumber(spec.endpointValues[1])} 之间；连续性保证至少存在一个 c。`
      : `The target ${formatNumber(spec.targetY)} lies between endpoint outputs ${formatNumber(spec.endpointValues[0])} and ${formatNumber(spec.endpointValues[1])}; continuity guarantees at least one c.`;
  }

  if (spec.kind === "end_behavior") {
    return language === "zh"
      ? `当 x → −∞ 或 x → +∞ 时，函数值都趋近于 ${formatNumber(spec.horizontalAsymptoteY)}；这是水平渐近线描述的端行为。`
      : `As x → −∞ or x → +∞, the outputs approach ${formatNumber(spec.horizontalAsymptoteY)}; this is the end behavior described by a horizontal asymptote.`;
  }

  return language === "zh"
    ? `x 从左侧靠近 ${formatNumber(spec.targetX)} 时 f(x) → −∞；从右侧靠近时 f(x) → +∞。无穷描述无界方向，不是函数到达的数。`
    : `As x approaches ${formatNumber(spec.targetX)} from the left, f(x) → −∞; from the right, f(x) → +∞. Infinity describes an unbounded direction, not a reached value.`;
}

export function LessonConceptVisualization({
  conceptId,
  language,
}: {
  conceptId: string;
  language: Language;
}) {
  const titleId = useId();
  const [activeSide, setActiveSide] = useState<ApproachSide>("both");
  const visualization = getLessonVisualization(conceptId);

  if (!visualization) {
    return null;
  }

  const activeCopy = copy[language];
  const description = descriptions[conceptId]?.[language] ?? activeCopy.title;
  const isEndBehavior = visualization.kind === "end_behavior";
  const sideOptions: Array<{
    icon: typeof ArrowLeft;
    label: string;
    value: ApproachSide;
  }> = [
    { icon: BetweenHorizontalEnd, label: activeCopy.both, value: "both" },
    {
      icon: ArrowLeft,
      label: isEndBehavior ? activeCopy.negativeInfinity : activeCopy.left,
      value: "left",
    },
    {
      icon: ArrowRight,
      label: isEndBehavior ? activeCopy.positiveInfinity : activeCopy.right,
      value: "right",
    },
  ];

  return (
    <Card className="mt-6 overflow-hidden border-learning-blue/25 bg-learning-blue/5">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            <ChartNoAxesCombined />
            {activeCopy.graph}
          </Badge>
          <Badge variant="outline">
            <Table2 />
            {activeCopy.numerical}
          </Badge>
        </div>
        <CardTitle>{activeCopy.title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div aria-label={activeCopy.direction} className="flex flex-wrap gap-2 pt-2" role="group">
          {sideOptions.map((option) => {
            const Icon = option.icon;

            return (
              <Button
                aria-pressed={activeSide === option.value}
                key={option.value}
                onClick={() => setActiveSide(option.value)}
                size="sm"
                type="button"
                variant={activeSide === option.value ? "secondary" : "outline"}
              >
                <Icon />
                {option.label}
              </Button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(15rem,0.65fr)]">
        <div className="rounded-lg border border-border bg-background/80 p-3">
          {visualization.kind === "finite_hole" && (
            <FiniteHoleGraph activeSide={activeSide} description={description} spec={visualization} titleId={titleId} />
          )}
          {visualization.kind === "notation_mapping" && (
            <NotationMappingGraph activeSide={activeSide} description={description} spec={visualization} titleId={titleId} />
          )}
          {visualization.kind === "one_sided_jump" && (
            <OneSidedGraph activeSide={activeSide} description={description} spec={visualization} titleId={titleId} />
          )}
          {visualization.kind === "infinite_asymptote" && (
            <InfiniteGraph activeSide={activeSide} description={description} spec={visualization} titleId={titleId} />
          )}
          {visualization.kind === "limit_law_combination" && (
            <LimitLawGraph activeSide={activeSide} description={description} spec={visualization} titleId={titleId} />
          )}
          {visualization.kind === "squeeze_bounds" && (
            <SqueezeGraph activeSide={activeSide} description={description} spec={visualization} titleId={titleId} />
          )}
          {visualization.kind === "continuity_point" && (
            <ContinuityGraph activeSide={activeSide} description={description} spec={visualization} titleId={titleId} />
          )}
          {visualization.kind === "intermediate_value" && (
            <IntermediateValueGraph activeSide={activeSide} description={description} spec={visualization} titleId={titleId} />
          )}
          {visualization.kind === "end_behavior" && (
            <EndBehaviorGraph activeSide={activeSide} description={description} spec={visualization} titleId={titleId} />
          )}
        </div>
        <div className="space-y-4">
          <SampleTable
            activeSide={activeSide}
            isEndBehavior={isEndBehavior}
            language={language}
            samples={visualization.samples}
            targetX={visualization.targetX}
          />
          <div className="rounded-lg border border-learning-mint/30 bg-learning-mint/10 p-4 text-sm leading-6">
            <p className="font-semibold">{activeCopy.observation}</p>
            <p className="mt-2 text-muted-foreground">
              {getObservation(visualization, language)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
