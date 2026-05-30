import "server-only";

import { TeacherChatServiceError } from "@/features/ai-teacher/teacher-service";
import { runLangGraphTeacherWorkflow } from "@/features/ai-teacher/workflow/langgraph-teacher-workflow";
import { runTypeScriptTeacherWorkflow } from "@/features/ai-teacher/workflow/typescript-teacher-workflow";
import type {
  TeacherWorkflowInput,
  TeacherWorkflowResult,
} from "@/features/ai-teacher/workflow/types";

export type TeacherWorkflowEngine = "langgraph" | "typescript";

export function getTeacherWorkflowEngine(): TeacherWorkflowEngine {
  return process.env.TEACHER_WORKFLOW_ENGINE === "typescript"
    ? "typescript"
    : "langgraph";
}

export async function runTeacherWorkflow(
  input: TeacherWorkflowInput,
): Promise<TeacherWorkflowResult> {
  if (getTeacherWorkflowEngine() === "typescript") {
    return runTypeScriptTeacherWorkflow(input);
  }

  try {
    return await runLangGraphTeacherWorkflow(input);
  } catch (error) {
    if (error instanceof TeacherChatServiceError) {
      throw error;
    }

    console.warn(
      "LangGraph teacher workflow failed; falling back to TypeScript workflow.",
      error,
    );

    return runTypeScriptTeacherWorkflow(input);
  }
}
