import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

function parseArguments(argv) {
  const options = {
    baseUrl:
      process.env.AI_EVALUATION_REPORT_BASE_URL ?? "http://localhost:3000",
    failOnGate: true,
    format: "json",
    output: undefined,
    requireHumanCalibration: false,
    requireLive: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--format") {
      options.format = argv[++index];
    } else if (argument === "--output") {
      options.output = argv[++index];
    } else if (argument === "--base-url") {
      options.baseUrl = argv[++index];
    } else if (argument === "--require-live") {
      options.requireLive = true;
    } else if (argument === "--require-human-calibration") {
      options.requireHumanCalibration = true;
    } else if (argument === "--no-fail-on-gate") {
      options.failOnGate = false;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (!["json", "markdown"].includes(options.format)) {
    throw new Error("--format must be json or markdown.");
  }

  options.output ??=
    options.format === "markdown"
      ? "artifacts/ai-evaluation-report.md"
      : "artifacts/ai-evaluation-report.json";

  return options;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const url = new URL("/api/developer/evaluation-report", options.baseUrl);
  url.searchParams.set("format", options.format);
  url.searchParams.set("requireLive", String(options.requireLive));
  url.searchParams.set(
    "requireHumanCalibration",
    String(options.requireHumanCalibration),
  );
  const headers = {};
  const secret = process.env.AI_EVALUATION_REPORT_SECRET?.trim();

  if (secret) {
    headers.Authorization = `Bearer ${secret}`;
  }

  const response = await fetch(url, { headers });
  const responseBody = await response.text();

  if (!response.ok) {
    throw new Error(
      `Evaluation report request failed (${response.status}): ${responseBody}`,
    );
  }

  const artifact =
    options.format === "json"
      ? `${JSON.stringify(JSON.parse(responseBody), null, 2)}\n`
      : responseBody;

  if (options.output === "-") {
    process.stdout.write(artifact);
  } else {
    const outputPath = resolve(options.output);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, artifact, "utf8");
    console.error(`Evaluation report written to ${outputPath}`);
  }

  const gateStatus =
    response.headers.get("x-evaluation-gate-status") ?? "unknown";
  const evidenceLevel =
    response.headers.get("x-evaluation-evidence-level") ?? "unknown";
  console.error(`Evaluation gate=${gateStatus} evidence=${evidenceLevel}`);

  if (options.failOnGate && gateStatus !== "pass") {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 2;
});
