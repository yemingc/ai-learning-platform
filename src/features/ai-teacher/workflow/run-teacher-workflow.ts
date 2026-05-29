import "server-only";

import { runTypeScriptTeacherWorkflow } from "@/features/ai-teacher/workflow/typescript-teacher-workflow";
import type {
  TeacherWorkflowInput,
  TeacherWorkflowResult,
} from "@/features/ai-teacher/workflow/types";

export async function runTeacherWorkflow(
  input: TeacherWorkflowInput,
): Promise<TeacherWorkflowResult> {
  // Adapter boundary: swap this implementation for LangGraph later without
  // changing the API route or UI contract.
  return runTypeScriptTeacherWorkflow(input);
}
