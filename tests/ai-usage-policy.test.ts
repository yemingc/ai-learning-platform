import assert from "node:assert/strict";
import test from "node:test";
import { evaluateAiUsagePolicy } from "../src/features/ai-teacher/ai-usage-policy.ts";

const config = {
  burstLimit: 3,
  burstWindowMs: 10 * 60 * 1000,
  dailyLimit: 5,
  dailyWindowMs: 24 * 60 * 60 * 1000,
};
const now = Date.UTC(2026, 0, 2, 12, 0, 0);

test("allows a request and reports remaining quotas", () => {
  const decision = evaluateAiUsagePolicy({
    config,
    eventTimestamps: [now - 60_000],
    now,
  });

  assert.deepEqual(decision, {
    allowed: true,
    remainingBurst: 1,
    remainingDaily: 3,
  });
});

test("rejects a burst and computes retry-after from the oldest event", () => {
  const decision = evaluateAiUsagePolicy({
    config,
    eventTimestamps: [
      now - 9 * 60_000,
      now - 5 * 60_000,
      now - 60_000,
    ],
    now,
  });

  assert.equal(decision.allowed, false);
  assert.equal(decision.reason, "burst");
  assert.equal(decision.retryAfterSeconds, 60);
  assert.equal(decision.remainingBurst, 0);
});

test("rejects the rolling daily limit after the burst window clears", () => {
  const decision = evaluateAiUsagePolicy({
    config,
    eventTimestamps: [
      now - 23 * 60 * 60_000,
      now - 20 * 60 * 60_000,
      now - 16 * 60 * 60_000,
      now - 12 * 60 * 60_000,
      now - 2 * 60 * 60_000,
    ],
    now,
  });

  assert.equal(decision.allowed, false);
  assert.equal(decision.reason, "daily");
  assert.equal(decision.retryAfterSeconds, 60 * 60);
  assert.equal(decision.remainingDaily, 0);
});
