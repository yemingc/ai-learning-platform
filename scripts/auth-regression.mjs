const BASE_URL = process.env.AUTH_TEST_BASE_URL ?? "http://localhost:3000";

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

async function run() {
  console.log(`Auth regression start: ${BASE_URL}`);

  await checkPublicPages();
  await checkLegacyRedirect("/memory", "/dashboard");
  await checkLegacyRedirect("/memory/ap-calculus-ab", "/dashboard/ap-calculus-ab");
  await checkProtectedRedirect("/dashboard");
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

  const unauthMemory = await request("/api/memory?courseId=ap-calculus-ab", {
    method: "GET",
  });
  assert(
    unauthMemory.status === 401,
    `unauth /api/memory expected 401, got ${unauthMemory.status}`,
  );
  console.log("PASS unauthorized /api/memory => 401");

  const email = `auth_reg_${Date.now()}@example.com`;
  const password = "Password123!";

  const registerRes = await request("/api/auth/register", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ email, password, name: "Auth Smoke" }),
  });
  assert(registerRes.status === 201, `register expected 201, got ${registerRes.status}`);
  console.log(`PASS register ${email}`);

  const duplicateRes = await request("/api/auth/register", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ email, password, name: "Auth Smoke" }),
  });
  assert(duplicateRes.status === 409, `duplicate register expected 409, got ${duplicateRes.status}`);
  console.log("PASS duplicate register => 409");

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
        email,
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
        email,
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
  const memoryWriteBody = await memoryWriteRes.json();
  assert(
    memoryWriteRes.status === 200,
    `/api/memory POST expected 200, got ${memoryWriteRes.status}`,
  );
  assert(
    memoryWriteBody?.conceptMemory?.interactionCount === 1,
    "memory POST should create first concept interaction",
  );
  console.log("PASS authenticated /api/memory POST");

  const { bodyJson: memoryAfterWrite } = await getJson(
    "/api/memory?courseId=ap-calculus-ab",
    jar,
  );
  assert(
    memoryAfterWrite?.memory?.conceptMemories?.["what-is-a-limit"]?.interactionCount >= 1,
    "memory GET should include saved concept memory",
  );
  console.log("PASS /api/memory persists concept memory");

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
    !secondMemory?.memory?.conceptMemories?.["what-is-a-limit"],
    "second user should not see first user's learner memory",
  );
  console.log("PASS learner memory isolated by authenticated user");

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
