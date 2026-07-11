import { z } from "zod";
import {
  buildEvaluationGovernanceReport,
  renderEvaluationGovernanceMarkdown,
} from "@/features/ai-teacher/evaluation/evaluation-governance-report";
import { runTeacherEvaluationSuite } from "@/features/ai-teacher/evaluation/eval-runner";
import { TEACHER_EVALUATION_SUITE_VERSION } from "@/features/ai-teacher/evaluation/eval-types";
import { TEACHER_PROMPT_VERSION } from "@/features/ai-teacher/teacher-prompts";
import { buildEvaluationTrendReport } from "@/features/ai-teacher/evaluation/evaluation-trends";
import {
  getAiTeacherRunDashboard,
  getHumanEvaluationCalibrationDashboard,
} from "@/lib/ai-run-db";
import { hasEvaluationReportAccess } from "@/lib/developer-api-access";

export const dynamic = "force-dynamic";

const reportQuerySchema = z
  .object({
    format: z.enum(["json", "markdown"]).default("json"),
    requireHumanCalibration: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
    requireLive: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
  })
  .strict();

export async function GET(request: Request) {
  if (!(await hasEvaluationReportAccess(request))) {
    return Response.json(
      {
        error: {
          code: "evaluation_report_access_denied",
          message: "Evaluation report access is disabled or unauthorized.",
        },
      },
      { status: 403 },
    );
  }

  const url = new URL(request.url);
  const parsedQuery = reportQuerySchema.safeParse(
    Object.fromEntries(url.searchParams.entries()),
  );

  if (!parsedQuery.success) {
    return Response.json(
      {
        error: {
          code: "invalid_evaluation_report_query",
          message:
            "Use format=json|markdown and true|false requirement flags only.",
        },
      },
      { status: 400 },
    );
  }

  const deterministic = runTeacherEvaluationSuite();
  const dashboard = getAiTeacherRunDashboard(100);
  const matchingEvaluations = dashboard.evaluations.filter(
    (evaluation) =>
      evaluation.suiteVersion === TEACHER_EVALUATION_SUITE_VERSION,
  );
  const report = buildEvaluationGovernanceReport({
    dashboard: {
      ...dashboard,
      evaluationTrends: buildEvaluationTrendReport(matchingEvaluations),
      humanCalibration: getHumanEvaluationCalibrationDashboard(
        100,
        TEACHER_EVALUATION_SUITE_VERSION,
      ),
    },
    deterministic,
    promptVersion: TEACHER_PROMPT_VERSION,
    requirements: {
      requireHumanCalibration: parsedQuery.data.requireHumanCalibration,
      requireLive: parsedQuery.data.requireLive,
    },
    suiteVersion: TEACHER_EVALUATION_SUITE_VERSION,
  });
  const isMarkdown = parsedQuery.data.format === "markdown";
  const extension = isMarkdown ? "md" : "json";
  const body = isMarkdown
    ? renderEvaluationGovernanceMarkdown(report)
    : `${JSON.stringify(report, null, 2)}\n`;

  return new Response(body, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="ai-evaluation-report.${extension}"`,
      "Content-Type": isMarkdown
        ? "text/markdown; charset=utf-8"
        : "application/json; charset=utf-8",
      "X-Evaluation-Evidence-Level": report.decision.evidenceLevel,
      "X-Evaluation-Gate-Status": report.decision.status,
      "X-Evaluation-Report-Schema": report.schemaVersion,
    },
  });
}
