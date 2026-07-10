import type { Concept } from "@/features/knowledge/types";
import type { LessonContent } from "@/features/lessons/types";
import type { TeacherIntent } from "@/features/ai-teacher/workflow/types";
import type {
  TeacherChatMessage,
  TeachingMove,
} from "@/features/ai-teacher/types";
import type { AssembledCurriculumContext } from "@/features/rag/curriculum-context";
import type { LearnerMemorySnapshot } from "@/features/ai-teacher/workflow/types";
import { getLessonVisualization } from "@/features/lessons/lesson-visualizations";

export const TEACHER_PROMPT_VERSION = "teacher-v4-formative-evidence";

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
  learnerMemorySnapshot?: LearnerMemorySnapshot;
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
    "When visualRepresentationEvidence is provided, keep graph and table explanations numerically consistent with that exact evidence.",
    "Keep responses concise, student-friendly, and focused on the current concept.",
    "Also act as an educational observer: produce structured memorySignals that describe what this interaction suggests about the learner's state.",
    "Use learner memory as tentative personalization context, not as unquestionable truth. The current student message always has priority over historical signals.",
    "Treat server-scored diagnostic and exit-ticket results as stronger learning evidence than model-inferred confidence signals.",
    "Do not reveal internal readiness scores, memory labels, stored evidence notes, or workflow mechanics unless the student explicitly asks how personalization works.",
    "If retrieved curriculum chunks are provided, use the most relevant chunks as grounded teaching evidence. Do not invent citations.",
    "When a retrieved chunk directly supports the answer, naturally refer to the lesson section by title in assistantMessage, but never expose chunk ids to the learner.",
    "Return citationChunkIds for the chunks you actually used, but only choose chunk ids explicitly listed in allowedCitationChunkIds.",
    ...languageRules,
    "Return one valid JSON object only. Do not wrap it in markdown. Do not include extra top-level keys.",
    "Place assistantMessage as the first top-level JSON field so it can be rendered progressively.",
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
  learnerMemorySnapshot,
}: TeacherPromptInput) {
  const allowedCitationChunkIds =
    curriculumContext?.allowedCitations.map((citation) => citation.chunkId) ??
    [];
  const allowedCitationSources =
    curriculumContext?.allowedCitations.map((citation) => ({
      chunkId: citation.chunkId,
      conceptId: citation.conceptId,
      locale: citation.locale,
      sectionTitle: citation.sectionTitle,
      sectionType: citation.sectionType,
      sourceLabel: citation.sourceLabel,
    })) ?? [];

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
        "If you use a retrieved chunk as evidence, include its chunk id in citationChunkIds.",
        "Prefer 1 to 3 citationChunkIds. Do not cite every chunk.",
        "Do not include citation objects, URLs, or source labels. Only return chunk ids.",
      ],
      rules: [
        "Base the response on the static lesson content below.",
        "Use visualRepresentationEvidence when the learner asks about the displayed graph, nearby-value table, approach direction, open point, jump, or asymptote.",
        "Use the current section as the main local context.",
        "If selectedText is provided, respond directly to that selected lesson text.",
        "If selectionAction is provided, honor that action first.",
        "Use recent chat history only to maintain continuity.",
        "Use the provided authenticated learner-memory snapshot for personalization when available, while treating historical signals as tentative evidence.",
        "If the student asks for an answer, guide the reasoning instead of just giving a final answer.",
        "Keep assistantMessage under 170 words.",
        "Use retrieved curriculum chunks as supporting evidence only when relevant; do not quote long passages.",
        "Prefer the retrieved chunk that best matches the current student question, not necessarily the highest-scored chunk.",
        "If a retrieved section supports the answer, mention it naturally, for example: 'The Common trap section is pointing at this exact confusion...' or, in Chinese, '课程里的「常见误区」部分就在提醒这个点...'.",
        "Do not say 'according to chunk id' or expose internal retrieval mechanics to the learner.",
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
      visualRepresentationEvidence: getLessonVisualization(concept.id),
      retrievedCurriculumContext: curriculumContext?.contextText ?? "",
      allowedCitationChunkIds,
      allowedCitationSources,
      currentSection,
      selectedText,
      selectionAction,
      runtimeHints: {
        intent,
        teachingMoveHint,
        note:
          "These are deterministic runtime hints for future LangGraph orchestration. Use them as guidance, not as content to reveal to the learner.",
      },
      learnerMemoryContext: learnerMemorySnapshot ?? {
        source: "not_available",
        conceptId: concept.id,
        interactionCount: 0,
        recentConfusionSections: [],
        recentMisconceptions: [],
      },
      learnerMemoryRules: [
        "Treat historical misconceptions and confusion sections as hypotheses to check, not facts to repeat blindly.",
        "Treat diagnosticScore and exitTicketScore as server-scored evidence. Use a low diagnostic score to start from prerequisites, and use a low exit-ticket score to revisit the key misconception with a fresh representation.",
        "Use learningGain to recognize improvement or stalled learning, but never claim that a score proves permanent mastery.",
        "When a relevant misconception is present, address it through the current explanation or guiding question without announcing that it came from stored memory.",
        "When readiness is high, prefer reflection or application-oriented reasoning over repeating a basic explanation unless the current message shows confusion.",
        "Never quote internal evidence notes or expose numeric readiness or assessment scores unless the learner explicitly asks about their saved progress.",
        "The memorySignals in this response will be persisted by the authenticated server route after successful validation.",
      ],
      recentChatHistory: chatHistory,
      userMessage,
    },
    null,
    2,
  );
}
