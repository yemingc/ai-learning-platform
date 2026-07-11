import assert from "node:assert/strict";
import test from "node:test";
import {
  getActiveMisconceptions,
  getResolvedMisconceptions,
  MISCONCEPTION_RESOLUTION_EXIT_SCORE,
  resolveMisconceptionsFromAssessment,
} from "../src/features/memory/misconception-lifecycle.ts";
import type { MisconceptionMemory } from "../src/features/memory/types.ts";

function createMisconception(
  id: string,
  overrides: Partial<MisconceptionMemory> = {},
): MisconceptionMemory {
  return {
    conceptId: "what-is-a-limit",
    count: 1,
    firstSeenAt: "2026-01-01T00:00:00.000Z",
    id,
    lastSeenAt: "2026-01-01T00:00:00.000Z",
    sourceSection: "Common trap",
    text: "The limit must equal the function value.",
    ...overrides,
  };
}

test("keeps misconception history while exposing only active items", () => {
  const active = createMisconception("active");
  const resolved = createMisconception("resolved", {
    resolutionEvidenceId: "assessment-1",
    resolutionSource: "exit_ticket",
    resolvedAt: "2026-01-02T00:00:00.000Z",
  });

  assert.deepEqual(getActiveMisconceptions([active, resolved]), [active]);
  assert.deepEqual(getResolvedMisconceptions([active, resolved]), [resolved]);
});

test("does not resolve misconceptions from diagnostics or weak exit evidence", () => {
  const misconception = createMisconception("active");

  assert.equal(
    resolveMisconceptionsFromAssessment({
      assessmentId: "diagnostic-1",
      misconceptions: [misconception],
      phase: "diagnostic",
      resolvedAt: "2026-01-02T00:00:00.000Z",
      score: 100,
    })[0]?.resolvedAt,
    undefined,
  );
  assert.equal(
    resolveMisconceptionsFromAssessment({
      assessmentId: "exit-1",
      misconceptions: [misconception],
      phase: "exit_ticket",
      resolvedAt: "2026-01-02T00:00:00.000Z",
      score: MISCONCEPTION_RESOLUTION_EXIT_SCORE - 1,
    })[0]?.resolvedAt,
    undefined,
  );
});

test("strong exit evidence resolves active misconceptions with an audit trail", () => {
  const resolvedAt = "2026-01-02T00:00:00.000Z";
  const result = resolveMisconceptionsFromAssessment({
    assessmentId: "exit-1",
    misconceptions: [createMisconception("active")],
    phase: "exit_ticket",
    resolvedAt,
    score: MISCONCEPTION_RESOLUTION_EXIT_SCORE,
  });

  assert.deepEqual(result[0], {
    ...createMisconception("active"),
    resolutionEvidenceId: "exit-1",
    resolutionSource: "exit_ticket",
    resolvedAt,
  });
  assert.equal(getActiveMisconceptions(result).length, 0);
});
