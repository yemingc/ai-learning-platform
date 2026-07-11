export type DemoAccountCredentials = {
  email: string;
  name: string;
  password: string;
};

type Environment = Record<string, string | undefined>;

const PLACEHOLDER_PATTERN = /(change[_ -]?me|replace[_ -]?me|your[_ -]?)/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+$/;

function isReservedExampleEmail(email: string) {
  const domain = email.split("@")[1]?.toLowerCase();

  return domain === "example.com" || domain?.endsWith(".example.com") === true;
}

export function parseDemoAccountCredentials(
  environment: Environment,
): DemoAccountCredentials | undefined {
  const email = environment.DEMO_ACCOUNT_EMAIL?.trim().toLowerCase() ?? "";
  const password = environment.DEMO_ACCOUNT_PASSWORD?.trim() ?? "";
  const name =
    environment.DEMO_ACCOUNT_NAME?.trim() || "Portfolio Demo Learner";
  const privilegedSecrets = [
    environment.AUTH_SECRET,
    environment.DEVELOPER_MODE_PASSWORD,
    environment.AI_EVALUATION_REPORT_SECRET,
    environment.EMBEDDING_INDEX_SECRET,
    environment.DEEPSEEK_API_KEY,
    environment.EMBEDDING_API_KEY,
  ]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  if (
    !EMAIL_PATTERN.test(email) ||
    email.length > 254 ||
    !isReservedExampleEmail(email) ||
    name.length > 64 ||
    password.length < 12 ||
    password.length > 128 ||
    PLACEHOLDER_PATTERN.test(password) ||
    privilegedSecrets.includes(password)
  ) {
    return undefined;
  }

  return { email, name, password };
}

export function parsePublicDemoAccountConfig(
  environment: Environment,
): DemoAccountCredentials | undefined {
  if (environment.ENABLE_PUBLIC_DEMO_ACCOUNT !== "true") {
    return undefined;
  }

  return parseDemoAccountCredentials(environment);
}
