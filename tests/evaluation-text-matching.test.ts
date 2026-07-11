import assert from "node:assert/strict";
import test from "node:test";
import {
  avoidsEvaluationPatterns,
  containsEvaluationPattern,
} from "../src/features/ai-teacher/evaluation/evaluation-text-matching.ts";

test("matches standalone English policy words without substring false positives", () => {
  assert.equal(containsEvaluationPattern("You receive five points.", "points"), true);
  assert.equal(containsEvaluationPattern("Check the endpoint outputs.", "points"), false);
  assert.equal(containsEvaluationPattern("This is ungraded.", "grade"), false);
  assert.equal(containsEvaluationPattern("I will grade this.", "grade"), true);
});

test("matches phrases, symbols, and Chinese policy patterns", () => {
  assert.equal(containsEvaluationPattern("Open the answer key now.", "answer key"), true);
  assert.equal(containsEvaluationPattern("0/0 is indeterminate.", "0/0"), true);
  assert.equal(containsEvaluationPattern("不要把课程变成题库。", "题库"), true);
  assert.equal(
    avoidsEvaluationPatterns("Use endpoint outputs.", ["points", "grade"]),
    true,
  );
});
