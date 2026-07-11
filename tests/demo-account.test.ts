import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDemoAssessmentAnswers,
  DEMO_LEARNING_SCENARIO,
} from "../src/features/application/demo-learning-scenario.ts";
import {
  parseDemoAccountCredentials,
  parsePublicDemoAccountConfig,
} from "../src/features/application/public-demo-account.ts";

const validEnvironment = {
  DEMO_ACCOUNT_EMAIL: "Demo.Learner@example.com",
  DEMO_ACCOUNT_NAME: "Demo Learner",
  DEMO_ACCOUNT_PASSWORD: "DemoPassword123!",
  ENABLE_PUBLIC_DEMO_ACCOUNT: "true",
};

test("public demo account is opt-in and restricted to reserved example domains", () => {
  assert.equal(
    parsePublicDemoAccountConfig({
      ...validEnvironment,
      ENABLE_PUBLIC_DEMO_ACCOUNT: "false",
    }),
    undefined,
  );
  assert.equal(
    parsePublicDemoAccountConfig({
      ...validEnvironment,
      DEMO_ACCOUNT_EMAIL: "@example.com",
    }),
    undefined,
  );
  assert.equal(
    parsePublicDemoAccountConfig({
      ...validEnvironment,
      DEMO_ACCOUNT_EMAIL: "demo@real-company.com",
    }),
    undefined,
  );
  assert.deepEqual(parsePublicDemoAccountConfig(validEnvironment), {
    email: "demo.learner@example.com",
    name: "Demo Learner",
    password: "DemoPassword123!",
  });
});

test("demo credentials reject placeholders and privileged-secret reuse", () => {
  assert.equal(
    parseDemoAccountCredentials({
      ...validEnvironment,
      DEMO_ACCOUNT_PASSWORD: "change_me_demo_password",
    }),
    undefined,
  );
  assert.equal(
    parseDemoAccountCredentials({
      ...validEnvironment,
      AUTH_SECRET: "DemoPassword123!",
    }),
    undefined,
  );
  assert.equal(
    parseDemoAccountCredentials({
      ...validEnvironment,
      DEEPSEEK_API_KEY: "DemoPassword123!",
    }),
    undefined,
  );
});

test("demo scenario produces an exact, deterministic score shape", () => {
  const answers = buildDemoAssessmentAnswers({
    answerKey: [
      { questionId: "q1", correctOptionId: "b" },
      { questionId: "q2", correctOptionId: "a" },
    ],
    correctAnswerCount: 1,
    questions: [
      { id: "q1", options: [{ id: "a" }, { id: "b" }] },
      { id: "q2", options: [{ id: "a" }, { id: "b" }] },
    ],
  });

  assert.deepEqual(answers, [
    { questionId: "q1", selectedOptionId: "b" },
    { questionId: "q2", selectedOptionId: "b" },
  ]);
  assert.deepEqual(
    DEMO_LEARNING_SCENARIO.map((step) => step.correctAnswerCount),
    [0, 2, 1, 1, 0],
  );
});
