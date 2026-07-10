import type {
  TeacherWorkflowNode,
  TeacherWorkflowTraceEvent,
} from "@/features/ai-teacher/workflow/types";

export const requiredWorkflowNodes: TeacherWorkflowNode[] = [
  "student_message",
  "build_context",
  "classify_user_intent",
  "select_teaching_strategy",
  "retrieve_curriculum_chunks",
  "assemble_curriculum_context",
  "generate_teaching_response",
  "validate_structured_output",
  "extract_learning_signals",
  "update_learner_memory",
  "return_next_study_action",
];

export function getMissingSuccessfulWorkflowNodes(
  trace: TeacherWorkflowTraceEvent[],
) {
  const successfulNodes = new Set(
    trace
      .filter((event) => event.status === "success")
      .map((event) => event.node),
  );

  return requiredWorkflowNodes.filter((node) => !successfulNodes.has(node));
}
