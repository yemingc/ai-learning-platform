const BASE_URL = process.env.AUTH_TEST_BASE_URL ?? "http://localhost:3000";
const DEVELOPER_MODE_PASSWORD =
  process.env.AUTH_TEST_DEVELOPER_MODE_PASSWORD?.trim();
const EVALUATION_REPORT_SECRET =
  process.env.AUTH_TEST_EVALUATION_REPORT_SECRET?.trim();
const EXPECT_PRODUCTION_REPORT_AUTH =
  process.env.AUTH_TEST_EXPECT_PRODUCTION_REPORT_AUTH === "true";

class CookieJar {
  constructor() {
    this.cookies = new Map();
  }

  addFromResponse(response) {
    const setCookie = response.headers.getSetCookie?.() ?? [];

    for (const cookie of setCookie) {
      const first = cookie.split(";")[0];
      const equalsIndex = first.indexOf("=");

      if (equalsIndex <= 0) {
        continue;
      }

      const key = first.slice(0, equalsIndex).trim();
      const value = first.slice(equalsIndex + 1).trim();
      this.cookies.set(key, value);
    }
  }

  headerValue() {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }
}

async function request(path, options = {}, jar) {
  const headers = new Headers(options.headers ?? {});

  if (jar) {
    const cookie = jar.headerValue();

    if (cookie) {
      headers.set("cookie", cookie);
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    redirect: "manual",
  });

  if (jar) {
    jar.addFromResponse(response);
  }

  return response;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function getJson(path, jar) {
  const res = await request(path, { method: "GET" }, jar);
  const bodyText = await res.text();
  let bodyJson;

  try {
    bodyJson = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    bodyJson = null;
  }

  return { bodyJson, bodyText, res };
}

async function checkProtectedRedirect(path) {
  const res = await request(path);
  const location = res.headers.get("location") ?? "";
  assert(res.status === 307, `${path} expected 307, got ${res.status}`);
  assert(location.startsWith("/login"), `${path} expected /login redirect, got ${location}`);
  console.log(`PASS redirect ${path} -> ${location}`);
}

async function checkLegacyRedirect(path, expectedLocation) {
  const res = await request(path);
  const location = res.headers.get("location") ?? "";
  assert(res.status === 307, `${path} expected 307, got ${res.status}`);
  assert(
    location === expectedLocation,
    `${path} expected ${expectedLocation} redirect, got ${location}`,
  );
  console.log(`PASS legacy redirect ${path} -> ${location}`);
}

async function checkDeveloperRedirect(path, jar) {
  const res = await request(path, { method: "GET" }, jar);
  const location = res.headers.get("location") ?? "";
  assert(res.status === 307, `${path} expected 307, got ${res.status}`);
  assert(
    location.startsWith("/developer"),
    `${path} expected /developer redirect, got ${location}`,
  );
  console.log(`PASS developer gate ${path} -> ${location}`);
}

async function checkPublicPages() {
  const login = await request("/login");
  const loginHtml = await login.text();
  assert(login.status === 200, `/login expected 200, got ${login.status}`);
  assert(loginHtml.includes("Log in"), "/login page did not render login form content");

  const register = await request("/register");
  const registerHtml = await register.text();
  assert(register.status === 200, `/register expected 200, got ${register.status}`);
  assert(registerHtml.includes("Create account"), "/register page did not render register form content");

  console.log("PASS public auth pages /login and /register");
}

async function checkHealth() {
  const { bodyJson, bodyText, res } = await getJson("/api/health");
  assert(res.status === 200, `/api/health expected 200, got ${res.status}`);
  assert(
    bodyJson?.status === "ok" && bodyJson?.checks?.database === "ok",
    `/api/health expected a ready database, got ${bodyText}`,
  );
  assert(
    res.headers.get("cache-control")?.includes("no-store"),
    "/api/health must not be cached",
  );
  assert(
    !/secret|api[_-]?key|password|model/i.test(bodyText),
    "/api/health must not expose configuration or credentials",
  );
  console.log("PASS public health check is ready, uncached, and minimal");
}

async function checkEvaluationReportBearerAccess() {
  if (!EVALUATION_REPORT_SECRET) {
    return;
  }

  if (EXPECT_PRODUCTION_REPORT_AUTH) {
    const unauthorized = await request(
      "/api/developer/evaluation-report?format=json",
    );
    assert(
      unauthorized.status === 403,
      `unauthorized evaluation report expected 403, got ${unauthorized.status}`,
    );
    console.log("PASS production evaluation report rejects missing credentials");
  }

  const authorization = `Bearer ${EVALUATION_REPORT_SECRET}`;
  const jsonReport = await request(
    "/api/developer/evaluation-report?format=json",
    { headers: { authorization } },
  );
  const jsonReportText = await jsonReport.text();
  const jsonReportBody = JSON.parse(jsonReportText);
  const deterministicTotalCases = jsonReportBody?.deterministic?.totalCases;
  assert(
    jsonReport.status === 200 &&
      jsonReportBody?.schemaVersion === "ai-evaluation-governance-report-v1" &&
      deterministicTotalCases > 0 &&
      jsonReportBody?.deterministic?.passedCases === deterministicTotalCases &&
      deterministicTotalCases === jsonReportBody?.suite?.totalCases &&
      jsonReportBody?.decision?.status === "pass" &&
      jsonReportBody?.decision?.evidenceLevel === "deterministic_only" &&
      jsonReport.headers.get("x-evaluation-gate-status") === "pass" &&
      !jsonReportText.includes('"assistantMessage":'),
    "bearer JSON report should be privacy-safe deterministic-only evidence",
  );
  console.log("PASS bearer JSON evaluation report is deterministic-only and privacy-safe");

  const strictReport = await request(
    "/api/developer/evaluation-report?format=json&requireLive=true",
    { headers: { authorization } },
  );
  const strictReportBody = await strictReport.json();
  assert(
    strictReport.status === 200 &&
      strictReportBody?.decision?.status === "fail" &&
      strictReport.headers.get("x-evaluation-gate-status") === "fail",
    "requireLive report should remain downloadable while exposing a failed CI gate",
  );
  console.log("PASS strict evaluation report fails closed without live evidence");

  const markdownReport = await request(
    "/api/developer/evaluation-report?format=markdown",
    { headers: { authorization } },
  );
  const markdown = await markdownReport.text();
  assert(
    markdownReport.status === 200 &&
      markdownReport.headers.get("content-type")?.startsWith("text/markdown") &&
      markdown.includes("# AI Evaluation Governance Report") &&
      markdown.includes("Decision: **PASS**"),
    "bearer Markdown report should render a stable governance artifact",
  );
  console.log("PASS bearer Markdown evaluation report renders");

  const invalidReportQuery = await request(
    "/api/developer/evaluation-report?format=csv",
    { headers: { authorization } },
  );
  assert(
    invalidReportQuery.status === 400,
    `invalid evaluation report query expected 400, got ${invalidReportQuery.status}`,
  );
}

async function run() {
  console.log(`Auth regression start: ${BASE_URL}`);

  await checkHealth();
  await checkPublicPages();
  await checkEvaluationReportBearerAccess();
  await checkLegacyRedirect("/memory", "/dashboard");
  await checkLegacyRedirect("/memory/ap-calculus-ab", "/dashboard/ap-calculus-ab");
  await checkProtectedRedirect("/dashboard");
  await checkProtectedRedirect("/plan");
  await checkProtectedRedirect("/dashboard/ai-evaluation");
  await checkProtectedRedirect("/dashboard/workflow-inspector");

  const unauthTeacher = await request("/api/teacher-chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      courseId: "ap-calculus-ab",
      conceptId: "what-is-a-limit",
      locale: "en",
      currentSection: "Full lesson context",
      userMessage: "auth check",
      chatHistory: [],
    }),
  });
  assert(
    unauthTeacher.status === 401,
    `unauth /api/teacher-chat expected 401, got ${unauthTeacher.status}`,
  );
  console.log("PASS unauthorized /api/teacher-chat => 401");

  const unauthLiveEval = await request("/api/teacher-evaluation/live", {
    method: "POST",
  });
  assert(
    unauthLiveEval.status === 401,
    `unauth /api/teacher-evaluation/live expected 401, got ${unauthLiveEval.status}`,
  );
  console.log("PASS unauthorized /api/teacher-evaluation/live => 401");

  const unauthHumanReview = await request(
    "/api/teacher-evaluation/review",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({}),
    },
  );
  assert(
    unauthHumanReview.status === 401,
    `unauth human review expected 401, got ${unauthHumanReview.status}`,
  );
  console.log("PASS unauthorized human evaluation review => 401");

  const unauthMemory = await request("/api/memory?courseId=ap-calculus-ab", {
    method: "GET",
  });
  assert(
    unauthMemory.status === 401,
    `unauth /api/memory expected 401, got ${unauthMemory.status}`,
  );
  console.log("PASS unauthorized /api/memory => 401");

  const { bodyJson: publicDiagnostic, res: publicDiagnosticRes } = await getJson(
    "/api/formative-assessment?courseId=ap-calculus-ab&conceptId=what-is-a-limit&phase=diagnostic&locale=en",
  );
  assert(
    publicDiagnosticRes.status === 200,
    `public assessment GET expected 200, got ${publicDiagnosticRes.status}`,
  );
  assert(
    publicDiagnostic?.assessment?.questions?.length === 2 &&
      !JSON.stringify(publicDiagnostic.assessment).includes("correctOptionId"),
    "public assessment must include two questions without answer keys",
  );
  console.log("PASS public assessment DTO hides answer keys");

  const unauthAssessmentWrite = await request("/api/formative-assessment", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      courseId: "ap-calculus-ab",
      conceptId: "what-is-a-limit",
      phase: "diagnostic",
      locale: "en",
      answers: [],
    }),
  });
  assert(
    unauthAssessmentWrite.status === 401,
    `unauth assessment POST expected 401, got ${unauthAssessmentWrite.status}`,
  );
  console.log("PASS unauthorized assessment write => 401");

  const email = `auth_reg_${Date.now()}@example.com`;
  const submittedEmail = `  ${email.toUpperCase()}  `;
  const password = "Password123!";

  const registerRes = await request("/api/auth/register", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ email: submittedEmail, password, name: "   " }),
  });
  const registerBody = await registerRes.json();
  assert(
    registerRes.status === 201 &&
      registerBody?.user?.email === email &&
      registerBody?.user?.name === null,
    `blank-name register expected normalized account, got ${registerRes.status} ${JSON.stringify(registerBody)}`,
  );
  console.log(`PASS blank-name register normalizes ${email}`);

  const duplicateRes = await request("/api/auth/register", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const duplicateBody = await duplicateRes.json();
  assert(
    duplicateRes.status === 409 && duplicateBody?.code === "email_exists",
    `duplicate register expected email_exists 409, got ${duplicateRes.status} ${JSON.stringify(duplicateBody)}`,
  );
  console.log("PASS normalized duplicate register => email_exists 409");

  const invalidRegisterRes = await request("/api/auth/register", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      email: `invalid_${Date.now()}@example.com`,
      password: "short",
    }),
  });
  const invalidRegisterBody = await invalidRegisterRes.json();
  assert(
    invalidRegisterRes.status === 400 &&
      invalidRegisterBody?.code === "invalid_request",
    `invalid register expected invalid_request 400, got ${invalidRegisterRes.status} ${JSON.stringify(invalidRegisterBody)}`,
  );
  console.log("PASS invalid registration returns stable error contract");

  const concurrentEmail = `auth_reg_concurrent_${Date.now()}@example.com`;
  const concurrentRequests = [0, 1].map(() =>
    request("/api/auth/register", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ email: concurrentEmail, password }),
    }),
  );
  const concurrentResponses = await Promise.all(concurrentRequests);
  const concurrentStatuses = concurrentResponses
    .map((response) => response.status)
    .sort((left, right) => left - right);
  assert(
    concurrentStatuses[0] === 201 && concurrentStatuses[1] === 409,
    `concurrent registration expected 201/409, got ${concurrentStatuses.join("/")}`,
  );
  console.log("PASS concurrent duplicate registration is conflict-safe");

  const jar = new CookieJar();
  const { bodyJson: csrfBody, res: csrfRes } = await getJson("/api/auth/csrf", jar);
  assert(csrfRes.status === 200, `csrf expected 200, got ${csrfRes.status}`);
  assert(csrfBody?.csrfToken, "csrf token missing");

  const wrongJar = new CookieJar();
  const { bodyJson: wrongCsrfBody } = await getJson("/api/auth/csrf", wrongJar);
  assert(wrongCsrfBody?.csrfToken, "wrong-login csrf token missing");
  const wrongLogin = await request(
    "/api/auth/callback/credentials",
    {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        csrfToken: wrongCsrfBody.csrfToken,
        email: submittedEmail,
        password: "WrongPassword123!",
        callbackUrl: `${BASE_URL}/learn`,
      }).toString(),
    },
    wrongJar,
  );
  assert(
    wrongLogin.status === 302 || wrongLogin.status === 303,
    `wrong login expected redirect, got ${wrongLogin.status}`,
  );
  const wrongLocation = wrongLogin.headers.get("location") ?? "";
  assert(
    wrongLocation.includes("error=CredentialsSignin"),
    `wrong login expected CredentialsSignin in redirect, got ${wrongLocation}`,
  );
  console.log("PASS wrong password => CredentialsSignin");

  const loginRes = await request(
    "/api/auth/callback/credentials",
    {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        csrfToken: csrfBody.csrfToken,
        email: submittedEmail,
        password,
        callbackUrl: `${BASE_URL}/learn`,
      }).toString(),
    },
    jar,
  );
  assert(
    loginRes.status === 302 || loginRes.status === 303,
    `login expected redirect, got ${loginRes.status}`,
  );
  console.log("PASS credentials login redirect");

  const { bodyJson: sessionAfterLogin, res: sessionResAfterLogin } = await getJson(
    "/api/auth/session",
    jar,
  );
  assert(
    sessionResAfterLogin.status === 200 && sessionAfterLogin?.user?.email === email,
    `session after login expected ${email}, got ${JSON.stringify(sessionAfterLogin)}`,
  );
  console.log("PASS authenticated session");

  const authDashboard = await request("/dashboard", { method: "GET" }, jar);
  assert(
    authDashboard.status === 200,
    `/dashboard with auth expected 200, got ${authDashboard.status}`,
  );
  console.log("PASS authenticated /dashboard");

  const authPlan = await request("/plan", { method: "GET" }, jar);
  const authPlanHtml = await authPlan.text();
  assert(
    authPlan.status === 200 && authPlanHtml.includes("自适应学习计划"),
    `/plan with auth expected rendered adaptive plan, got ${authPlan.status}`,
  );
  console.log("PASS authenticated /plan");

  const { bodyJson: initialMemory, res: initialMemoryRes } = await getJson(
    "/api/memory?courseId=ap-calculus-ab",
    jar,
  );
  assert(
    initialMemoryRes.status === 200,
    `/api/memory GET expected 200, got ${initialMemoryRes.status}`,
  );
  assert(
    initialMemory?.memory?.learnerId,
    "initial memory should include current learner id",
  );
  console.log("PASS authenticated /api/memory GET");

  const diagnosticWrite = await request(
    "/api/formative-assessment",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        courseId: "ap-calculus-ab",
        conceptId: "what-is-a-limit",
        phase: "diagnostic",
        locale: "en",
        answers: [
          { questionId: "what-is-a-limit-d1", selectedOptionId: "b" },
          { questionId: "what-is-a-limit-d2", selectedOptionId: "c" },
        ],
      }),
    },
    jar,
  );
  const diagnosticBody = await diagnosticWrite.json();
  assert(
    diagnosticWrite.status === 200 && diagnosticBody?.attempt?.score === 100,
    `diagnostic write expected score 100, got ${diagnosticWrite.status} ${JSON.stringify(diagnosticBody)}`,
  );
  assert(
    diagnosticBody.readiness <= 69,
    `diagnostic-only readiness must remain below mastery, got ${diagnosticBody.readiness}`,
  );
  console.log("PASS authenticated diagnostic is server-scored and mastery-capped");

  const exitWrite = await request(
    "/api/formative-assessment",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        courseId: "ap-calculus-ab",
        conceptId: "what-is-a-limit",
        phase: "exit_ticket",
        locale: "en",
        answers: [
          { questionId: "what-is-a-limit-e1", selectedOptionId: "a" },
          { questionId: "what-is-a-limit-e2", selectedOptionId: "b" },
        ],
      }),
    },
    jar,
  );
  const exitBody = await exitWrite.json();
  assert(
    exitWrite.status === 200 &&
      exitBody?.attempt?.score === 100 &&
      exitBody?.progress?.learningGain === 0 &&
      exitBody?.status === "familiar",
    `exit write expected pre/post evidence and familiar status, got ${exitWrite.status} ${JSON.stringify(exitBody)}`,
  );
  console.log("PASS exit evidence completes readiness loop");

  const { bodyJson: assessmentAfterWrite, res: assessmentAfterWriteRes } =
    await getJson(
      "/api/formative-assessment?courseId=ap-calculus-ab&conceptId=what-is-a-limit&phase=exit_ticket&locale=en",
      jar,
    );
  assert(
    assessmentAfterWriteRes.status === 200 &&
      assessmentAfterWrite?.latestAttempt?.score === 100,
    "authenticated assessment GET should return the current learner's latest attempt",
  );
  console.log("PASS assessment attempt readback");

  const memoryWriteRes = await request(
    "/api/memory",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        courseId: "ap-calculus-ab",
        conceptId: "what-is-a-limit",
        conceptTitle: "What is a limit?",
        source: "direct_chat",
        section: "Full lesson context",
        userMessage: "I am confused about limits.",
        teachingMove: "explain",
        detectedMisconception: "The limit is always the same as the function value.",
        memorySignals: {
          confusionLevel: "medium",
          needsReview: true,
          suggestedStudyAction: "repair_misconception",
          confidenceDelta: -4,
          evidenceNote: "Student confused limit value with function value.",
        },
        locale: "en",
      }),
    },
    jar,
  );
  assert(
    memoryWriteRes.status === 405,
    `/api/memory client POST expected 405, got ${memoryWriteRes.status}`,
  );
  console.log("PASS client cannot forge learner memory => 405");

  const secondEmail = `auth_reg_second_${Date.now()}@example.com`;
  const secondJar = new CookieJar();
  const secondRegisterRes = await request("/api/auth/register", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      email: secondEmail,
      password,
      name: "Auth Smoke Second",
    }),
  });
  assert(
    secondRegisterRes.status === 201,
    `second register expected 201, got ${secondRegisterRes.status}`,
  );
  const { bodyJson: secondCsrfBody } = await getJson("/api/auth/csrf", secondJar);
  const secondLoginRes = await request(
    "/api/auth/callback/credentials",
    {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        csrfToken: secondCsrfBody.csrfToken,
        email: secondEmail,
        password,
        callbackUrl: `${BASE_URL}/learn`,
      }).toString(),
    },
    secondJar,
  );
  assert(
    secondLoginRes.status === 302 || secondLoginRes.status === 303,
    `second login expected redirect, got ${secondLoginRes.status}`,
  );
  const { bodyJson: secondMemory } = await getJson(
    "/api/memory?courseId=ap-calculus-ab",
    secondJar,
  );
  assert(
    secondMemory?.memory?.learnerId &&
      secondMemory.memory.learnerId !== initialMemory.memory.learnerId,
    "second user should receive a distinct learner-memory identity",
  );
  console.log("PASS learner memory identity isolated by authenticated user");

  const { bodyJson: secondAssessment } = await getJson(
    "/api/formative-assessment?courseId=ap-calculus-ab&conceptId=what-is-a-limit&phase=exit_ticket&locale=en",
    secondJar,
  );
  assert(
    !secondAssessment?.latestAttempt,
    "second learner must not receive the first learner's assessment attempt",
  );
  console.log("PASS assessment evidence isolated by authenticated user");

  const teacherWithAuth = await request(
    "/api/teacher-chat",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        courseId: "ap-calculus-ab",
        conceptId: "what-is-a-limit",
        locale: "en",
        currentSection: "Full lesson context",
        userMessage: "auth smoke check",
        chatHistory: [],
      }),
    },
    jar,
  );
  assert(
    teacherWithAuth.status !== 401,
    "authenticated /api/teacher-chat should not return 401",
  );
  console.log(`PASS authenticated /api/teacher-chat status=${teacherWithAuth.status}`);

  await checkDeveloperRedirect("/dashboard/workflow-inspector", jar);
  await checkDeveloperRedirect("/dashboard/ai-evaluation", jar);

  const liveEvalWithoutDeveloperMode = await request(
    "/api/teacher-evaluation/live",
    { method: "POST" },
    jar,
  );
  assert(
    liveEvalWithoutDeveloperMode.status === 403,
    `live eval without developer mode expected 403, got ${liveEvalWithoutDeveloperMode.status}`,
  );
  console.log("PASS authenticated live eval requires developer mode");

  const humanReviewWithoutDeveloperMode = await request(
    "/api/teacher-evaluation/review",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({}),
    },
    jar,
  );
  assert(
    humanReviewWithoutDeveloperMode.status === 403,
    `human review without developer mode expected 403, got ${humanReviewWithoutDeveloperMode.status}`,
  );
  console.log("PASS human evaluation review requires developer mode");

  if (DEVELOPER_MODE_PASSWORD) {
    const enableDeveloperMode = await request(
      "/api/developer-mode",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ password: DEVELOPER_MODE_PASSWORD }),
      },
      jar,
    );
    assert(
      enableDeveloperMode.status === 200,
      `enable developer mode expected 200, got ${enableDeveloperMode.status}`,
    );

    const evaluationPage = await request(
      "/dashboard/ai-evaluation",
      { method: "GET" },
      jar,
    );
    const evaluationHtml = await evaluationPage.text();
    const normalizedEvaluationHtml = evaluationHtml.replaceAll("<!-- -->", "");
    const caseSummaryMatch = normalizedEvaluationHtml.match(
      /(\d+)\/(\d+) cases passed/,
    );
    const passedCaseCount = Number(caseSummaryMatch?.[1]);
    const totalCaseCount = Number(caseSummaryMatch?.[2]);
    const hasQualityDimensions = normalizedEvaluationHtml.includes("Quality dimensions");
    const hasReleaseDimensions = normalizedEvaluationHtml.includes(
      "Six release dimensions",
    );
    assert(
      evaluationPage.status === 200 &&
        totalCaseCount > 0 &&
        passedCaseCount === totalCaseCount &&
        hasQualityDimensions &&
        hasReleaseDimensions,
      `developer evaluation page expected an all-passing six-dimension suite, got status=${evaluationPage.status} summary=${caseSummaryMatch?.[0] ?? "missing"} quality=${hasQualityDimensions} release=${hasReleaseDimensions}`,
    );
    console.log(
      `PASS developer evaluation page renders ${passedCaseCount}/${totalCaseCount} six-dimension suite`,
    );

    const browserEvaluationReport = await request(
      "/api/developer/evaluation-report?format=json",
      { method: "GET" },
      jar,
    );
    const browserEvaluationReportBody = await browserEvaluationReport.json();
    assert(
      browserEvaluationReport.status === 200 &&
        browserEvaluationReportBody?.decision?.status === "pass",
      "Developer Mode session should download the evaluation report without a bearer secret",
    );
    console.log("PASS Developer Mode session downloads evaluation report");

    const invalidHumanReview = await request(
      "/api/teacher-evaluation/review",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({}),
      },
      jar,
    );
    assert(
      invalidHumanReview.status === 400,
      `invalid human review expected 400, got ${invalidHumanReview.status}`,
    );

    const missingRunHumanReview = await request(
      "/api/teacher-evaluation/review",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          evaluationRunId: "00000000-0000-4000-8000-000000000000",
          ratings: {
            grounding: 4,
            localization: 4,
            pedagogy: 4,
            safety: 4,
          },
          reviewedAllCases: true,
          rubricVersion: "teacher-human-review-v1",
        }),
      },
      jar,
    );
    assert(
      missingRunHumanReview.status === 404,
      `missing-run human review expected 404, got ${missingRunHumanReview.status}`,
    );
    console.log("PASS human review validates contract and evaluation run target");

    const aiRunsPage = await request(
      "/developer/ai-runs",
      { method: "GET" },
      jar,
    );
    const aiRunsHtml = await aiRunsPage.text();
    assert(
      aiRunsPage.status === 200 &&
        aiRunsHtml.includes("Teacher run history and usage controls") &&
        aiRunsHtml.includes("Evaluation trends") &&
        aiRunsHtml.includes("Human-review calibration") &&
        (aiRunsHtml.includes("No versioned live evaluations yet") ||
          aiRunsHtml.includes("Comparable run timeline")) &&
        (aiRunsHtml.includes("No human-reviewed runs yet") ||
          aiRunsHtml.includes("Recent calibration reviews")),
      "developer AI run dashboard should render trends and human calibration after authorization",
    );
    console.log("PASS developer AI run dashboard renders trends and calibration");

    const disableDeveloperMode = await request(
      "/api/developer-mode",
      { method: "DELETE" },
      jar,
    );
    assert(
      disableDeveloperMode.status === 200,
      `disable developer mode expected 200, got ${disableDeveloperMode.status}`,
    );
  }

  const { bodyJson: signoutCsrfBody } = await getJson("/api/auth/csrf", jar);
  assert(signoutCsrfBody?.csrfToken, "signout csrf token missing");

  const signOutRes = await request(
    "/api/auth/signout",
    {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        csrfToken: signoutCsrfBody.csrfToken,
        callbackUrl: `${BASE_URL}/learn`,
      }).toString(),
    },
    jar,
  );
  assert(
    signOutRes.status === 302 || signOutRes.status === 303,
    `signout expected redirect, got ${signOutRes.status}`,
  );

  const { bodyJson: sessionAfterLogout } = await getJson(
    "/api/auth/session",
    jar,
  );
  assert(sessionAfterLogout === null, `session after logout expected null, got ${JSON.stringify(sessionAfterLogout)}`);
  console.log("PASS logout clears session");

  console.log("Auth regression finished: ALL PASS");
}

run().catch((error) => {
  console.error(`Auth regression failed: ${error.message}`);
  process.exitCode = 1;
});
