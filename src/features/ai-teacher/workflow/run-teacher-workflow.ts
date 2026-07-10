import "server-only";

import { TeacherChatServiceError } from "@/features/ai-teacher/teacher-service";
import { runLangGraphTeacherWorkflow } from "@/features/ai-teacher/workflow/langgraph-teacher-workflow";
import { runTypeScriptTeacherWorkflow } from "@/features/ai-teacher/workflow/typescript-teacher-workflow";
import type {
  TeacherWorkflowInput,
  TeacherWorkflowResult,
  TeacherWorkflowRuntimeOptions,
} from "@/features/ai-teacher/workflow/types";

export type TeacherWorkflowEngine = "langgraph" | "typescript";

export function getTeacherWorkflowEngine(): TeacherWorkflowEngine {
  return process.env.TEACHER_WORKFLOW_ENGINE === "typescript"
    ? "typescript"
    : "langgraph";
}

export async function runTeacherWorkflow(
  input: TeacherWorkflowInput,
  runtimeOptions: TeacherWorkflowRuntimeOptions = {},
): Promise<TeacherWorkflowResult> {
  let hasStreamedAssistantContent = false;
  const effectiveRuntimeOptions: TeacherWorkflowRuntimeOptions = {
    ...runtimeOptions,
    onAssistantMessageDelta: runtimeOptions.onAssistantMessageDelta
      ? (delta) => {
          hasStreamedAssistantContent = true;
          runtimeOptions.onAssistantMessageDelta?.(delta);
        }
      : undefined,
  };

  if (getTeacherWorkflowEngine() === "typescript") {
    return runTypeScriptTeacherWorkflow(input, effectiveRuntimeOptions);
  }

  try {
    return await runLangGraphTeacherWorkflow(input, effectiveRuntimeOptions);
  } catch (error) {
    if (error instanceof TeacherChatServiceError) {
      throw error;
    }

    if (hasStreamedAssistantContent) {
      throw new TeacherChatServiceError(
        "api_error",
        "AI Teacher workflow failed after response streaming began.",
      );
    }

    console.warn(
      "LangGraph teacher workflow failed; falling back to TypeScript workflow.",
      error,
    );

    return runTypeScriptTeacherWorkflow(input, effectiveRuntimeOptions);
  }
}
