import "server-only";

import {
  buildTeacherWorkflowContext,
  createNextStudyActionHint,
  createTraceEvent,
  generateValidatedTeacherTurn,
  getBroadenedRetrievalUpdate,
  getContextTraceDetail,
  getCurriculumRetrievalDecision,
  getLessonOnlyContext,
  getRetrievalQuality,
  getRetrievalTraceDetail,
  getTeacherMemoryWriteDecision,
  MAX_RETRIEVAL_RETRIES,
  prepareTeacherMemoryPatch,
  retrieveCurriculumForTeacher,
} from "@/features/ai-teacher/workflow/teacher-workflow-steps";
import {
  classifyTeacherIntent,
  selectTeachingStrategy,
} from "@/features/ai-teacher/workflow/teacher-policy";
import type {
  TeacherWorkflowInput,
  TeacherWorkflowNode,
  TeacherWorkflowResult,
  TeacherWorkflowRuntimeOptions,
  TeacherWorkflowState,
  TeacherWorkflowTraceEvent,
} from "@/features/ai-teacher/workflow/types";

function appendTrace(
  state: TeacherWorkflowState,
  node: TeacherWorkflowNode,
  detail?: string,
  status: TeacherWorkflowTraceEvent["status"] = "success",
): TeacherWorkflowState {
  return {
    ...state,
    trace: [...state.trace, createTraceEvent(node, detail, status)],
  };
}

export async function runTypeScriptTeacherWorkflow(
  input: TeacherWorkflowInput,
  runtimeOptions: TeacherWorkflowRuntimeOptions = {},
): Promise<TeacherWorkflowResult> {
  let state: TeacherWorkflowState = {
    citations: [],
    input,
    retrievalAttempt: 0,
    trace: [
      createTraceEvent("student_message", "Received student message."),
    ],
  };

  const context = buildTeacherWorkflowContext(input);
  state = appendTrace(
    { ...state, context },
    "build_context",
    getContextTraceDetail(context),
  );

  const intent = classifyTeacherIntent(input);
  state = appendTrace(
    { ...state, intent },
    "classify_user_intent",
    intent,
  );

  const teachingStrategy = selectTeachingStrategy(
    intent,
    context.learnerMemorySnapshot,
    input.userMessage,
  );
  state = appendTrace(
    { ...state, teachingStrategy },
    "select_teaching_strategy",
    teachingStrategy,
  );

  const retrievalDecision = getCurriculumRetrievalDecision(state);
  state = appendTrace(
    { ...state, retrievalDecision },
    "decide_curriculum_retrieval",
    retrievalDecision === "retrieve"
      ? "Substantive teaching request requires grounded curriculum context."
      : "Lightweight message uses the reviewed lesson context without retrieval.",
  );

  if (retrievalDecision === "retrieve") {
    while (true) {
      const curriculumContext = await retrieveCurriculumForTeacher(state);
      state = appendTrace(
        { ...state, curriculumContext },
        "retrieve_curriculum_context",
        getRetrievalTraceDetail(state, curriculumContext),
      );

      const retrievalQuality = getRetrievalQuality(state);
      state = appendTrace(
        { ...state, retrievalQuality },
        "assess_retrieval_quality",
        retrievalQuality === "sufficient"
          ? "Retrieved context contains the active lesson concept."
          : `${retrievalQuality}; the workflow will ${state.retrievalAttempt < MAX_RETRIEVAL_RETRIES ? "retry once with current-concept scope" : "fall back to the reviewed lesson context"}.`,
      );

      if (retrievalQuality === "sufficient") {
        break;
      }

      if (state.retrievalAttempt < MAX_RETRIEVAL_RETRIES) {
        const broadened = getBroadenedRetrievalUpdate(state);
        state = appendTrace(
          { ...state, ...broadened },
          "broaden_retrieval_query",
          "Expanded the query with the active concept and restricted the retry to that concept.",
        );
        continue;
      }

      const reason =
        "No sufficiently relevant current-concept chunks were found after the bounded retry.";
      state = appendTrace(
        {
          ...state,
          curriculumContext: getLessonOnlyContext(reason),
        },
        "use_lesson_context",
        reason,
      );
      break;
    }
  } else {
    const reason = "Retrieval skipped for a lightweight message.";
    state = appendTrace(
      {
        ...state,
        curriculumContext: getLessonOnlyContext(reason),
      },
      "use_lesson_context",
      reason,
    );
  }

  const generated = await generateValidatedTeacherTurn(state, runtimeOptions);
  state = appendTrace(
    { ...state, ...generated },
    "generate_validated_response",
    `${generated.teacherResponse.teachingMove}; schema validated and ${generated.citations.length} allowlisted citations accepted.`,
  );

  const memorySignals = generated.teacherResponse.memorySignals;
  state = appendTrace(
    { ...state, memorySignals },
    "extract_learning_signals",
    `${memorySignals.confusionLevel} confusion, ${memorySignals.suggestedStudyAction}`,
  );

  const memoryWriteDecision = getTeacherMemoryWriteDecision(state);
  state = appendTrace(
    { ...state, memoryWriteDecision },
    "decide_memory_update",
    memoryWriteDecision === "persist"
      ? "Learning evidence is strong enough to update learner state."
      : memoryWriteDecision === "record_interaction_only"
        ? "Interaction will be retained for audit without affecting readiness."
        : "Lightweight interaction will not be written to learner memory.",
  );

  if (memoryWriteDecision === "persist") {
    const memoryPatch = prepareTeacherMemoryPatch(state);
    state = appendTrace(
      { ...state, memoryPatch },
      "prepare_memory_patch",
      memoryPatch.shouldPersistClientSide
        ? "Prepared client-side learner-memory patch."
        : "Prepared server-side learner-memory patch.",
    );
  }

  const nextStudyAction = createNextStudyActionHint(state);
  state = appendTrace(
    { ...state, nextStudyAction },
    "return_next_study_action",
    nextStudyAction.action,
  );

  return {
    teacherResponse: generated.teacherResponse,
    modelTelemetry: generated.modelTelemetry,
    memorySignals,
    memoryWriteDecision,
    memoryPatch: state.memoryPatch,
    nextStudyAction,
    citations: generated.citations,
    trace: state.trace,
    state,
  };
}
