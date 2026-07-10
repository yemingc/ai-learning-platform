import assert from "node:assert/strict";
import test from "node:test";
import { getLessonVisualization } from "../src/features/lessons/lesson-visualizations.ts";

const conceptIds = [
  "what-is-a-limit",
  "limit-notation",
  "estimating-limits-from-graphs",
  "one-sided-limits",
  "infinite-limits",
  "evaluating-limits-with-limit-laws",
  "squeeze-theorem",
  "continuity-at-a-point",
  "intermediate-value-theorem",
  "limits-at-infinity",
];

test("provides numerical evidence on both sides for every Unit 1 lesson", () => {
  for (const conceptId of conceptIds) {
    const visualization = getLessonVisualization(conceptId);

    assert.ok(visualization, `Missing visualization for ${conceptId}`);
    assert.ok(
      visualization.samples.some((sample) => sample.x < visualization.targetX),
      `${conceptId} needs left-hand samples`,
    );
    assert.ok(
      visualization.samples.some((sample) => sample.x > visualization.targetX),
      `${conceptId} needs right-hand samples`,
    );
    assert.equal(
      visualization.samples.some((sample) => sample.x === visualization.targetX),
      false,
      `${conceptId} nearby-value evidence must not substitute the target input`,
    );
  }
});

test("new lesson visualizations encode the claimed mathematical evidence", () => {
  const laws = getLessonVisualization("evaluating-limits-with-limit-laws");
  assert.ok(laws?.kind === "limit_law_combination");
  assert.equal(laws.fLimit + 2 * laws.gLimit, laws.limitY);

  const squeeze = getLessonVisualization("squeeze-theorem");
  assert.ok(squeeze?.kind === "squeeze_bounds");
  assert.ok(
    squeeze.samples.every(
      (sample) => sample.lowerY <= sample.y && sample.y <= sample.upperY,
    ),
  );
  const squeezeByDistance = [...squeeze.samples].sort(
    (a, b) => Math.abs(a.x) - Math.abs(b.x),
  );
  const narrowestSqueeze = squeezeByDistance[0];
  const widestSqueeze = squeezeByDistance.at(-1);
  assert.ok(narrowestSqueeze && widestSqueeze);
  assert.ok(
    narrowestSqueeze.upperY - narrowestSqueeze.lowerY <
      widestSqueeze.upperY - widestSqueeze.lowerY,
  );

  const continuity = getLessonVisualization("continuity-at-a-point");
  assert.ok(continuity?.kind === "continuity_point");
  assert.equal(continuity.functionValueY, continuity.limitY);

  const ivt = getLessonVisualization("intermediate-value-theorem");
  assert.ok(ivt?.kind === "intermediate_value");
  assert.ok(
    ivt.targetY > Math.min(...ivt.endpointValues) &&
      ivt.targetY < Math.max(...ivt.endpointValues),
  );
  assert.ok(ivt.targetX > ivt.interval[0] && ivt.targetX < ivt.interval[1]);

  const endBehavior = getLessonVisualization("limits-at-infinity");
  assert.ok(endBehavior?.kind === "end_behavior");
  const byMagnitude = [...endBehavior.samples].sort(
    (a, b) => Math.abs(a.x) - Math.abs(b.x),
  );
  const nearestEndSample = byMagnitude[0];
  const farthestEndSample = byMagnitude.at(-1);
  assert.ok(nearestEndSample && farthestEndSample);
  assert.ok(
    Math.abs(farthestEndSample.y - endBehavior.horizontalAsymptoteY) <
      Math.abs(nearestEndSample.y - endBehavior.horizontalAsymptoteY),
  );
});

test("finite and notation samples get closer to the stated limit near the target", () => {
  for (const conceptId of [
    "what-is-a-limit",
    "limit-notation",
    "estimating-limits-from-graphs",
  ]) {
    const visualization = getLessonVisualization(conceptId);

    assert.ok(
      visualization?.kind === "finite_hole" ||
        visualization?.kind === "notation_mapping",
    );

    for (const side of ["left", "right"] as const) {
      const samples = visualization.samples
        .filter((sample) =>
          side === "left"
            ? sample.x < visualization.targetX
            : sample.x > visualization.targetX,
        )
        .sort(
          (a, b) =>
            Math.abs(a.x - visualization.targetX) -
            Math.abs(b.x - visualization.targetX),
        );
      const nearestError = Math.abs((samples[0]?.y ?? 0) - visualization.limitY);
      const farthestError = Math.abs(
        (samples.at(-1)?.y ?? 0) - visualization.limitY,
      );

      assert.ok(
        nearestError < farthestError,
        `${conceptId} ${side} samples should converge toward the limit`,
      );
    }
  }
});

test("one-sided and infinite samples match their stated directional behavior", () => {
  const oneSided = getLessonVisualization("one-sided-limits");
  assert.ok(oneSided?.kind === "one_sided_jump");
  assert.ok(
    oneSided.samples
      .filter((sample) => sample.x < oneSided.targetX)
      .every((sample) => sample.y === oneSided.leftLimit),
  );
  assert.ok(
    oneSided.samples
      .filter((sample) => sample.x > oneSided.targetX)
      .every((sample) => sample.y === oneSided.rightLimit),
  );

  const infinite = getLessonVisualization("infinite-limits");
  assert.ok(infinite?.kind === "infinite_asymptote");
  const left = infinite.samples
    .filter((sample) => sample.x < infinite.targetX)
    .sort((a, b) => b.x - a.x);
  const right = infinite.samples
    .filter((sample) => sample.x > infinite.targetX)
    .sort((a, b) => a.x - b.x);

  assert.ok((left[0]?.y ?? 0) < (left.at(-1)?.y ?? 0));
  assert.ok((right[0]?.y ?? 0) > (right.at(-1)?.y ?? 0));
});
