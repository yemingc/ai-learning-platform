export type LimitSample = {
  x: number;
  y: number;
};

type FiniteHoleVisualization = {
  kind: "finite_hole";
  targetX: number;
  limitY: number;
  functionValueY: number;
  samples: LimitSample[];
};

type NotationVisualization = {
  kind: "notation_mapping";
  targetX: number;
  limitY: number;
  samples: LimitSample[];
};

type OneSidedVisualization = {
  kind: "one_sided_jump";
  targetX: number;
  leftLimit: number;
  rightLimit: number;
  samples: LimitSample[];
};

type InfiniteVisualization = {
  kind: "infinite_asymptote";
  targetX: number;
  leftDirection: "negative_infinity" | "positive_infinity";
  rightDirection: "negative_infinity" | "positive_infinity";
  samples: LimitSample[];
};

type LimitLawVisualization = {
  kind: "limit_law_combination";
  targetX: number;
  limitY: number;
  fLimit: number;
  gLimit: number;
  expression: string;
  samples: LimitSample[];
};

export type SqueezeSample = LimitSample & {
  lowerY: number;
  upperY: number;
};

type SqueezeVisualization = {
  kind: "squeeze_bounds";
  targetX: number;
  limitY: number;
  samples: SqueezeSample[];
};

type ContinuityVisualization = {
  kind: "continuity_point";
  targetX: number;
  limitY: number;
  functionValueY: number;
  samples: LimitSample[];
};

type IntermediateValueVisualization = {
  kind: "intermediate_value";
  targetX: number;
  targetY: number;
  interval: [number, number];
  endpointValues: [number, number];
  samples: LimitSample[];
};

type EndBehaviorVisualization = {
  kind: "end_behavior";
  targetX: number;
  horizontalAsymptoteY: number;
  samples: LimitSample[];
};

export type LessonVisualization =
  | FiniteHoleVisualization
  | NotationVisualization
  | OneSidedVisualization
  | InfiniteVisualization
  | LimitLawVisualization
  | SqueezeVisualization
  | ContinuityVisualization
  | IntermediateValueVisualization
  | EndBehaviorVisualization;

const lessonVisualizations: Record<string, LessonVisualization> = {
  "what-is-a-limit": {
    kind: "finite_hole",
    functionValueY: 1,
    limitY: 4,
    samples: [
      { x: 1.5, y: 3.5 },
      { x: 1.9, y: 3.9 },
      { x: 1.99, y: 3.99 },
      { x: 2.01, y: 4.01 },
      { x: 2.1, y: 4.1 },
      { x: 2.5, y: 4.5 },
    ],
    targetX: 2,
  },
  "limit-notation": {
    kind: "notation_mapping",
    limitY: 7,
    samples: [
      { x: 4.9, y: 6.99 },
      { x: 4.99, y: 6.999 },
      { x: 5.01, y: 7.001 },
      { x: 5.1, y: 7.01 },
    ],
    targetX: 5,
  },
  "estimating-limits-from-graphs": {
    kind: "finite_hole",
    functionValueY: 1,
    limitY: 3,
    samples: [
      { x: 1.5, y: 2.5 },
      { x: 1.9, y: 2.9 },
      { x: 1.99, y: 2.99 },
      { x: 2.01, y: 3.01 },
      { x: 2.1, y: 3.1 },
      { x: 2.5, y: 3.5 },
    ],
    targetX: 2,
  },
  "one-sided-limits": {
    kind: "one_sided_jump",
    leftLimit: 2,
    rightLimit: 5,
    samples: [
      { x: -0.5, y: 2 },
      { x: -0.1, y: 2 },
      { x: -0.01, y: 2 },
      { x: 0.01, y: 5 },
      { x: 0.1, y: 5 },
      { x: 0.5, y: 5 },
    ],
    targetX: 0,
  },
  "infinite-limits": {
    kind: "infinite_asymptote",
    leftDirection: "negative_infinity",
    rightDirection: "positive_infinity",
    samples: [
      { x: 1.5, y: -2 },
      { x: 1.9, y: -10 },
      { x: 1.99, y: -100 },
      { x: 2.01, y: 100 },
      { x: 2.1, y: 10 },
      { x: 2.5, y: 2 },
    ],
    targetX: 2,
  },
  "evaluating-limits-with-limit-laws": {
    expression: "f(x) + 2g(x)",
    fLimit: 3,
    gLimit: 4,
    kind: "limit_law_combination",
    limitY: 11,
    samples: [
      { x: 1.5, y: 10.5 },
      { x: 1.9, y: 10.9 },
      { x: 1.99, y: 10.99 },
      { x: 2.01, y: 11.01 },
      { x: 2.1, y: 11.1 },
      { x: 2.5, y: 11.5 },
    ],
    targetX: 2,
  },
  "squeeze-theorem": {
    kind: "squeeze_bounds",
    limitY: 0,
    samples: [
      { lowerY: -0.25, upperY: 0.25, x: -0.5, y: -0.2273 },
      { lowerY: -0.01, upperY: 0.01, x: -0.1, y: 0.0054 },
      { lowerY: -0.0001, upperY: 0.0001, x: -0.01, y: 0.00005 },
      { lowerY: -0.0001, upperY: 0.0001, x: 0.01, y: -0.00005 },
      { lowerY: -0.01, upperY: 0.01, x: 0.1, y: -0.0054 },
      { lowerY: -0.25, upperY: 0.25, x: 0.5, y: 0.2273 },
    ],
    targetX: 0,
  },
  "continuity-at-a-point": {
    functionValueY: 3,
    kind: "continuity_point",
    limitY: 3,
    samples: [
      { x: 0.5, y: 2.5 },
      { x: 0.9, y: 2.9 },
      { x: 0.99, y: 2.99 },
      { x: 1.01, y: 3.01 },
      { x: 1.1, y: 3.1 },
      { x: 1.5, y: 3.5 },
    ],
    targetX: 1,
  },
  "intermediate-value-theorem": {
    endpointValues: [-2, 4],
    interval: [-1, 2],
    kind: "intermediate_value",
    samples: [
      { x: 0, y: 0 },
      { x: 0.4, y: 0.8 },
      { x: 0.49, y: 0.98 },
      { x: 0.51, y: 1.02 },
      { x: 0.6, y: 1.2 },
      { x: 1, y: 2 },
    ],
    targetX: 0.5,
    targetY: 1,
  },
  "limits-at-infinity": {
    horizontalAsymptoteY: 2,
    kind: "end_behavior",
    samples: [
      { x: -100, y: 1.9998 },
      { x: -20, y: 1.995 },
      { x: -5, y: 1.9286 },
      { x: 5, y: 1.9286 },
      { x: 20, y: 1.995 },
      { x: 100, y: 1.9998 },
    ],
    targetX: 0,
  },
};

export function getLessonVisualization(conceptId: string) {
  return lessonVisualizations[conceptId];
}
