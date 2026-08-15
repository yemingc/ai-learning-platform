import "server-only";

import { TeacherChatServiceError } from "@/features/ai-teacher/teacher-service";
import { runLangGraphTeacherWorkflow } from "@/features/ai-teacher/workflow/langgraph-teacher-workflow";
import { runTypeScriptTeacherWorkflow } from "@/features/ai-teacher/workflow/typescript-teacher-workflow";
import type {
  TeacherWorkflowInput,
  TeacherWorkflowResult,
  TeacherWorkflowRuntimeOptions,
} from "@/features/ai-teacher/workflow/types";
import { getLearningAgentActionMode } from "@/features/ai-teacher/tools/tool-policy";

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
    if (getLearningAgentActionMode(input.userMessage) === "learning_agent") {
      throw new TeacherChatServiceError(
        "api_error",
        "Learning-plan tool actions require the LangGraph workflow engine.",
      );
    }

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

    if (getLearningAgentActionMode(input.userMessage) === "learning_agent") {
      throw error;
    }

    console.warn(
      "LangGraph teacher workflow failed; falling back to TypeScript workflow.",
      error,
    );

    return runTypeScriptTeacherWorkflow(input, effectiveRuntimeOptions);
  }
}
