import nextEnvironment from "@next/env";
import { resolve } from "node:path";
import {
  buildDemoAssessmentAnswers,
  DEMO_LEARNING_SCENARIO,
} from "../src/features/application/demo-learning-scenario.ts";
import { parseDemoAccountCredentials } from "../src/features/application/public-demo-account.ts";

const { loadEnvConfig } = nextEnvironment;
const envFileArgumentIndex = process.argv.findIndex(
  (argument) => argument === "--env-file" || argument.startsWith("--env-file="),
);

if (envFileArgumentIndex >= 0) {
  const argument = process.argv[envFileArgumentIndex];
  const envFile = argument.includes("=")
    ? argument.slice(argument.indexOf("=") + 1)
    : process.argv[envFileArgumentIndex + 1];

  if (!envFile) {
    throw new Error("--env-file requires a file path.");
  }

  process.loadEnvFile(resolve(process.cwd(), envFile));
}

loadEnvConfig(process.cwd());

const COURSE_ID = "ap-calculus-ab";
const LOCALE = "en";
const BASE_URL = (process.env.DEMO_BASE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

class CookieJar {
  constructor() {
    this.cookies = new Map();
  }

  addFromResponse(response) {
    for (const cookie of response.headers.getSetCookie?.() ?? []) {
      const [pair] = cookie.split(";");
      const equalsIndex = pair.indexOf("=");

      if (equalsIndex > 0) {
        this.cookies.set(
          pair.slice(0, equalsIndex).trim(),
          pair.slice(equalsIndex + 1).trim(),
        );
      }
    }
  }

  headerValue() {
    return Array.from(this.cookies.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join("; ");
  }
}

function assertSafeTarget() {
  const target = new URL(BASE_URL);
  const isLocal = ["localhost", "127.0.0.1", "::1"].includes(
    target.hostname,
  );

  if (target.protocol !== "https:" && !isLocal) {
    throw new Error(
      "DEMO_BASE_URL must use HTTPS unless it targets the local machine.",
    );
  }
}

async function request(path, options = {}, jar) {
  const headers = new Headers(options.headers ?? {});
  const cookie = jar?.headerValue();

  if (cookie) {
    headers.set("cookie", cookie);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    redirect: "manual",
  });

  jar?.addFromResponse(response);
  return response;
}

async function readJson(response, label, expectedStatuses = [200]) {
  const text = await response.text();
  let body;

  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = undefined;
  }

  if (!expectedStatuses.includes(response.status)) {
    throw new Error(
      `${label} failed with HTTP ${response.status}: ${text.slice(0, 300)}`,
    );
  }

  return body;
}

async function registerOrReuseAccount(account) {
  const response = await request("/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: account.email,
      name: account.name,
      password: account.password,
    }),
  });

  await readJson(response, "Demo account registration", [201, 409]);
  return response.status === 201 ? "created" : "reused";
}

async function login(account) {
  const jar = new CookieJar();
  const csrfResponse = await request("/api/auth/csrf", {}, jar);
  const csrf = await readJson(csrfResponse, "Auth CSRF request");

  if (!csrf?.csrfToken) {
    throw new Error("Auth CSRF response did not include a token.");
  }

  const callbackResponse = await request(
    "/api/auth/callback/credentials",
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        callbackUrl: `${BASE_URL}/dashboard`,
        csrfToken: csrf.csrfToken,
        email: account.email,
        password: account.password,
      }).toString(),
    },
    jar,
  );
  const location = callbackResponse.headers.get("location") ?? "";

  if (
    ![302, 303].includes(callbackResponse.status) ||
    location.includes("error=CredentialsSignin")
  ) {
    throw new Error(
      "Demo account login failed. If the account already exists, verify DEMO_ACCOUNT_PASSWORD.",
    );
  }

  const sessionResponse = await request("/api/auth/session", {}, jar);
  const session = await readJson(sessionResponse, "Authenticated session");

  if (session?.user?.email !== account.email) {
    throw new Error("Authenticated session does not match the demo account.");
  }

  return jar;
}

function assessmentPath(step) {
  const query = new URLSearchParams({
    conceptId: step.conceptId,
    courseId: COURSE_ID,
    locale: LOCALE,
    phase: step.phase,
  });

  return `/api/formative-assessment?${query}`;
}

async function submitAssessment(step, answers, jar) {
  const response = await request(
    "/api/formative-assessment",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        answers,
        conceptId: step.conceptId,
        courseId: COURSE_ID,
        locale: LOCALE,
        phase: step.phase,
      }),
    },
    jar,
  );

  return readJson(
    response,
    `${step.conceptId} ${step.phase} assessment submission`,
  );
}

async function discoverAnswerKeys(jar) {
  const discovered = [];

  for (const step of DEMO_LEARNING_SCENARIO) {
    const assessmentResponse = await request(assessmentPath(step), {}, jar);
    const assessmentBody = await readJson(
      assessmentResponse,
      `${step.conceptId} ${step.phase} assessment read`,
    );
    const assessment = assessmentBody?.assessment;

    if (!assessment?.questions?.length) {
      throw new Error(`${step.conceptId} ${step.phase} has no questions.`);
    }

    const probeAnswers = assessment.questions.map((question) => ({
      questionId: question.id,
      selectedOptionId: question.options[0]?.id,
    }));

    if (probeAnswers.some((answer) => !answer.selectedOptionId)) {
      throw new Error(`${step.conceptId} ${step.phase} has an empty option set.`);
    }

    const result = await submitAssessment(step, probeAnswers, jar);
    const answerKey = result?.feedback?.map((item) => ({
      questionId: item.questionId,
      correctOptionId: item.correctOptionId,
    }));

    if (answerKey?.length !== assessment.questions.length) {
      throw new Error(
        `${step.conceptId} ${step.phase} did not return a complete trusted answer key.`,
      );
    }

    discovered.push({ answerKey, assessment, step });
  }

  return discovered;
}

async function resetLearningEvidence(jar) {
  const response = await request(
    `/api/memory?courseId=${COURSE_ID}`,
    { method: "DELETE" },
    jar,
  );

  await readJson(response, "Demo learner memory reset");
}

async function writeFinalScenario(discovered, jar) {
  const outcomes = [];

  for (const { answerKey, assessment, step } of discovered) {
    const answers = buildDemoAssessmentAnswers({
      answerKey,
      correctAnswerCount: step.correctAnswerCount,
      questions: assessment.questions,
    });
    const result = await submitAssessment(step, answers, jar);
    const expectedScore = Math.round(
      (step.correctAnswerCount / assessment.questions.length) * 100,
    );

    if (result?.attempt?.score !== expectedScore) {
      throw new Error(
        `${step.conceptId} ${step.phase} expected score ${expectedScore}, got ${result?.attempt?.score}.`,
      );
    }

    outcomes.push({
      conceptId: step.conceptId,
      evidenceLevel: result.progress?.evidenceLevel,
      learningGain: result.progress?.learningGain,
      phase: step.phase,
      readiness: result.readiness,
      score: result.attempt.score,
      status: result.status,
    });
  }

  return outcomes;
}

async function verifyScenario(jar) {
  const memoryResponse = await request(
    `/api/memory?courseId=${COURSE_ID}`,
    {},
    jar,
  );
  const memoryBody = await readJson(memoryResponse, "Demo memory verification");
  const conceptMemories = Object.values(
    memoryBody?.memory?.conceptMemories ?? {},
  );
  const attemptCount = conceptMemories.reduce(
    (sum, concept) => sum + (concept.assessmentAttempts?.length ?? 0),
    0,
  );

  if (attemptCount !== DEMO_LEARNING_SCENARIO.length) {
    throw new Error(
      `Demo verification expected ${DEMO_LEARNING_SCENARIO.length} final attempts, found ${attemptCount}.`,
    );
  }

  const planResponse = await request("/plan", {}, jar);

  if (planResponse.status !== 200) {
    throw new Error(`Demo adaptive plan returned HTTP ${planResponse.status}.`);
  }

  return {
    attemptCount,
    conceptCount: conceptMemories.length,
    planReady: true,
  };
}

async function main() {
  assertSafeTarget();
  const account = parseDemoAccountCredentials(process.env);

  if (!account) {
    throw new Error(
      "Set DEMO_ACCOUNT_EMAIL to an example.com address and DEMO_ACCOUNT_PASSWORD to a unique 12+ character non-placeholder value. Do not reuse a privileged secret.",
    );
  }

  const accountState = await registerOrReuseAccount(account);
  const jar = await login(account);
  const discovered = await discoverAnswerKeys(jar);

  await resetLearningEvidence(jar);
  const outcomes = await writeFinalScenario(discovered, jar);
  const verification = await verifyScenario(jar);

  console.log(
    JSON.stringify(
      {
        account: {
          email: account.email,
          name: account.name,
          state: accountState,
        },
        baseUrl: BASE_URL,
        disclaimer:
          "Synthetic formative evidence only; no live-model or human-review records were created.",
        outcomes,
        routes: ["/dashboard", "/plan", "/learn/what-is-a-limit"],
        seedVersion: "portfolio-demo-learning-v1",
        verification,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(`Demo seed failed: ${error.message}`);
  process.exitCode = 1;
});
