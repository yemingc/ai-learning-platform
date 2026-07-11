import type {
  TeacherWorkflowNode,
  TeacherWorkflowTraceEvent,
} from "@/features/ai-teacher/workflow/types";

export const requiredWorkflowNodes: TeacherWorkflowNode[] = [
  "student_message",
  "build_context",
  "classify_user_intent",
  "select_teaching_strategy",
  "decide_curriculum_retrieval",
  "generate_validated_response",
  "extract_learning_signals",
  "decide_memory_update",
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
