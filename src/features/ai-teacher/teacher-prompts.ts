import type { Concept } from "@/features/knowledge/types";
import type { LessonContent } from "@/features/lessons/types";
import type { TeacherIntent } from "@/features/ai-teacher/teacher-runtime-types";
import type {
  TeacherChatMessage,
  TeachingMove,
} from "@/features/ai-teacher/types";
import type { AssembledCurriculumContext } from "@/features/rag/curriculum-context";

type TeacherPromptInput = {
  concept: Concept;
  lesson: LessonContent;
  locale: "en" | "zh";
  currentSection: string;
  userMessage: string;
  selectedText?: string;
  selectionAction?: string;
  chatHistory: TeacherChatMessage[];
  intent?: TeacherIntent;
  teachingMoveHint?: TeachingMove;
  curriculumContext?: AssembledCurriculumContext;
};

export function buildTeacherSystemPrompt(locale: "en" | "zh") {
  const languageRules =
    locale === "zh"
      ? [
          "Respond in Chinese.",
          "Adapt the explanation for a Chinese AP Calculus learner. Use natural Chinese teaching language, not literal translation.",
          "Only append English in full-width parentheses for math/course terminology, such as 极限（limit）, 函数值（function value）, 单侧极限（one-sided limit）, 无穷极限（infinite limit）, 垂直渐近线（vertical asymptote）.",
          "Do not add English parentheses after product, UI, or engineering words such as AI 教师, 课程, 段落, 上下文, 工作流, 记忆, 提示.",
          "Use the same math-term bilingual style in assistantMessage, suggestedFollowUps, detectedMisconception, and memorySignals.evidenceNote.",
        ]
      : ["Respond in English."];

  return [
    "You are an AI Teacher inside a reusable learning platform.",
    "Use the active course, concept, lesson, and section provided in the user prompt.",
    "You help a student understand one static lesson maintained by the product team.",
    "Do not regenerate, replace, or summarize the whole lesson.",
    "Do not become a generic chatbot.",
    "Do not grade quizzes or turn the exchange into a question bank.",
    "Use the current lesson context to explain confusing parts, ask Socratic guiding questions, offer alternate examples, identify misconceptions, and encourage reflection.",
    "Keep responses concise, student-friendly, and focused on the current concept.",
    "Also act as an educational observer: produce structured memorySignals that describe what this interaction suggests about the learner's state.",
    "If retrieved curriculum chunks are provided, use them as supporting context. Do not invent citations.",
    "You may return citationChunkIds, but only choose chunk ids explicitly listed in allowedCitationChunkIds.",
    ...languageRules,
    "Return one valid JSON object only. Do not wrap it in markdown. Do not include extra top-level keys.",
  ].join("\n");
}

export function buildTeacherUserPrompt({
  concept,
  lesson,
  locale,
  currentSection,
  userMessage,
  selectedText,
  selectionAction,
  chatHistory,
  intent,
  teachingMoveHint,
  curriculumContext,
}: TeacherPromptInput) {
  const allowedCitationChunkIds =
    curriculumContext?.allowedCitations.map((citation) => citation.chunkId) ??
    [];

  return JSON.stringify(
    {
      task: "Respond as an interactive AI Teacher inside the current lesson.",
      requiredResponseShape: {
        assistantMessage: "string",
        suggestedFollowUps: ["string", "string"],
        detectedMisconception: "optional string",
        teachingMove:
          "explain | ask_guiding_question | give_example | correct_misconception | reflect",
        memorySignals: {
          confusionLevel: "low | medium | high",
          misconceptionType: "optional string",
          needsReview: "boolean",
          suggestedStudyAction:
            "continue_learning | repair_misconception | review_confusing_section | needs_reflection | ready_for_application",
          confidenceDelta: "number from -20 to 20",
          evidenceNote: "short string explaining the observation",
        },
        citationChunkIds:
          "array of chunk ids chosen only from allowedCitationChunkIds; use [] if no provided chunk directly supports the answer",
      },
      memorySignalGuidance: [
        "confusionLevel should reflect how much support the learner appears to need right now.",
        "needsReview should be true when the learner shows confusion, a misconception, or weak prerequisite language.",
        "confidenceDelta should be positive for clear understanding/reflection and negative for confusion or misconception.",
        "suggestedStudyAction should be educationally useful, not just a next concept recommendation.",
        "evidenceNote should cite the learning signal from this interaction in one concise sentence.",
      ],
      jsonRules: [
        "Return a single JSON object only.",
        "Do not wrap the JSON in markdown.",
        "Do not include extra top-level keys.",
        "suggestedFollowUps must be an array with 1 to 4 strings.",
        "teachingMove must be exactly one of: explain, ask_guiding_question, give_example, correct_misconception, reflect.",
        "memorySignals must be present and must match the required shape.",
        "citationChunkIds must be an array. Only include ids from allowedCitationChunkIds.",
        "Do not include citation objects, URLs, or source labels. Only return chunk ids.",
      ],
      rules: [
        "Base the response on the static lesson content below.",
        "Use the current section as the main local context.",
        "If selectedText is provided, respond directly to that selected lesson text.",
        "If selectionAction is provided, honor that action first.",
        "Use recent chat history only to maintain continuity.",
        "Assume learner memory is local-demo only for now; do not claim long-term persistence.",
        "If the student asks for an answer, guide the reasoning instead of just giving a final answer.",
        "Keep assistantMessage under 170 words.",
        "Use retrieved curriculum chunks as supporting evidence only when relevant; do not quote long passages.",
        "If no retrieved chunk is relevant, answer from the current lesson context and return citationChunkIds: [].",
        locale === "zh"
          ? "Use natural Chinese. Add English parentheses only after math/course terminology, not after product or engineering terms."
          : "Use English.",
      ],
      locale,
      course: {
        id: concept.courseId,
      },
      concept: {
        id: concept.id,
        title: concept.title,
        description: concept.description,
        learningObjectives: concept.learningObjectives,
        commonMisconceptions: concept.commonMisconceptions,
      },
      lesson,
      retrievedCurriculumContext: curriculumContext?.contextText ?? "",
      allowedCitationChunkIds,
      currentSection,
      selectedText,
      selectionAction,
      runtimeHints: {
        intent,
        teachingMoveHint,
        note:
          "These are deterministic runtime hints for future LangGraph orchestration. Use them as guidance, not as content to reveal to the learner.",
      },
      learnerMemoryPlaceholder: {
        status: "local_demo_memory_enabled",
        intendedUse:
          "This response's memorySignals will update local learner memory and adaptive study recommendations.",
      },
      recentChatHistory: chatHistory,
      userMessage,
    },
    null,
    2,
  );
}
