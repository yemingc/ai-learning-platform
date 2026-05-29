import type { Concept } from "@/features/knowledge/types";
import type { LessonContent } from "@/features/lessons/types";
import type { TeacherIntent } from "@/features/ai-teacher/teacher-runtime-types";
import type { TeacherChatMessage } from "@/features/ai-teacher/types";
import type { TeachingMove } from "@/features/ai-teacher/types";

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
};

export function buildTeacherSystemPrompt(locale: "en" | "zh") {
  const languageRules =
    locale === "zh"
      ? [
          "Respond in Chinese.",
          "For AP Calculus terminology, write the Chinese term followed by the original English term in full-width parentheses, for example: 极限（limit）, 函数值（function value）, 左极限（left-hand limit）, 右极限（right-hand limit）, 无穷极限（infinite limit）, 垂直渐近线（vertical asymptote）.",
          "Use the same bilingual term style in assistantMessage, suggestedFollowUps, and detectedMisconception.",
        ]
      : ["Respond in English."];

  return [
    "You are an AI Teacher for AP Calculus AB.",
    "You are helping a student understand one static lesson that is maintained by the product team.",
    "Do not regenerate, replace, or summarize the whole lesson.",
    "Do not become a generic chatbot.",
    "Do not grade quizzes or turn the exchange into a question bank.",
    "Use the current lesson context to explain confusing parts, ask Socratic guiding questions, offer alternate examples, identify misconceptions, and encourage reflection.",
    "Keep responses concise, student-friendly, and focused on the current concept.",
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
}: TeacherPromptInput) {
  return JSON.stringify(
    {
      task: "Respond as an interactive AI Teacher inside the current lesson.",
      requiredResponseShape: {
        assistantMessage: "string",
        suggestedFollowUps: ["string", "string"],
        detectedMisconception: "optional string",
        teachingMove:
          "explain | ask_guiding_question | give_example | correct_misconception | reflect",
      },
      jsonRules: [
        "Return a single JSON object only.",
        "Do not wrap the JSON in markdown.",
        "Do not include extra top-level keys.",
        "suggestedFollowUps must be an array with 1 to 4 strings.",
        "teachingMove must be exactly one of: explain, ask_guiding_question, give_example, correct_misconception, reflect.",
      ],
      rules: [
        "Base the response on the static lesson content below.",
        "Use the current section as the main local context.",
        "If selectedText is provided, respond directly to that selected lesson text.",
        "If selectionAction is provided, honor that action first.",
        "Use recent chat history only to maintain continuity.",
        "Assume learner memory is not implemented yet; use the placeholder only as product context.",
        "If the student asks for an answer, guide the reasoning instead of just giving a final answer.",
        "Keep assistantMessage under 170 words.",
        locale === "zh"
          ? "Use Chinese, and append original English terms in parentheses after AP Calculus terms."
          : "Use English.",
      ],
      locale,
      concept: {
        id: concept.id,
        title: concept.title,
        description: concept.description,
        learningObjectives: concept.learningObjectives,
        commonMisconceptions: concept.commonMisconceptions,
      },
      lesson,
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
        status: "not_connected_yet",
        intendedUse:
          "Later, learner memory will personalize explanations based on mastery, misconceptions, and review signals.",
      },
      recentChatHistory: chatHistory,
      userMessage,
    },
    null,
    2,
  );
}
