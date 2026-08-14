import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateHybridRetrievalScore,
  DEFAULT_HYBRID_RETRIEVAL_WEIGHTS,
  DEFAULT_MINIMUM_RETRIEVAL_SCORES,
  resolveMinimumRetrievalScore,
  resolveHybridRetrievalWeights,
  selectDiverseRetrievalResults,
} from "../src/features/rag/retrieval-policy.ts";

test("uses calibrated retrieval thresholds by mode", () => {
  assert.deepEqual(DEFAULT_MINIMUM_RETRIEVAL_SCORES, {
    embedding: 48,
    hybrid: 20,
    keyword: 4,
  });
});

test("accepts bounded overrides and rejects invalid threshold configuration", () => {
  assert.equal(
    resolveMinimumRetrievalScore({ mode: "embedding", value: "52.5" }),
    52.5,
  );
  assert.equal(
    resolveMinimumRetrievalScore({ mode: "embedding", value: "not-a-number" }),
    48,
  );
  assert.equal(
    resolveMinimumRetrievalScore({ mode: "hybrid", value: "101" }),
    20,
  );
});

test("uses calibrated hybrid weights and rejects incomplete overrides", () => {
  assert.deepEqual(DEFAULT_HYBRID_RETRIEVAL_WEIGHTS, {
    embedding: 35,
    keyword: 65,
  });
  assert.deepEqual(
    resolveHybridRetrievalWeights({
      embeddingValue: "40",
      keywordValue: "60",
    }),
    { embedding: 40, keyword: 60 },
  );
  assert.deepEqual(
    resolveHybridRetrievalWeights({
      embeddingValue: "40",
      keywordValue: "40",
    }),
    DEFAULT_HYBRID_RETRIEVAL_WEIGHTS,
  );
});

test("keeps hybrid score contributions explainable", () => {
  assert.deepEqual(
    calculateHybridRetrievalScore({
      embeddingScore: 80,
      keywordScore: 100,
    }),
    {
      embeddingContribution: 28,
      keywordContribution: 65,
      score: 93,
    },
  );
});

test("caps repeated concepts while preserving ranked order", () => {
  const results = selectDiverseRetrievalResults({
    limit: 5,
    results: [
      { conceptId: "a", id: "a-1" },
      { conceptId: "a", id: "a-2" },
      { conceptId: "a", id: "a-3" },
      { conceptId: "a", id: "a-4" },
      { conceptId: "b", id: "b-1" },
      { conceptId: "c", id: "c-1" },
    ],
  });

  assert.deepEqual(
    results.map((result) => result.id),
    ["a-1", "a-2", "a-3", "b-1", "c-1"],
  );
  assert.deepEqual(
    selectDiverseRetrievalResults({ limit: 0, results }),
    [],
  );
});
