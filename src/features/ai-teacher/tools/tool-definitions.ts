import type OpenAI from "openai";

export const learningAgentToolDefinitions: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_learning_state",
      description:
        "Read the authenticated learner's course-scoped progress, readiness, assessment evidence, and active misconceptions. Learner and course identity are injected by the server.",
      parameters: {
        type: "object",
        properties: {
          conceptIds: {
            type: "array",
            items: { type: "string" },
            maxItems: 8,
            description:
              "Optional concept IDs from the active course to inspect. Omit for a ranked course overview.",
          },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "retrieve_course_evidence",
      description:
        "Search the active course's allowlisted bilingual curriculum evidence. This tool cannot search another course or the open web.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            minLength: 2,
            maxLength: 500,
          },
          conceptId: {
            type: "string",
            description:
              "Optional concept ID in the active course. Omit to use the current lesson concept.",
          },
        },
        required: ["query"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "draft_learning_plan",
      description:
        "Create a deterministic learning-plan draft from the authenticated learner's evidence and the active course graph. The draft is not activated until the learner confirms it.",
      parameters: {
        type: "object",
        properties: {
          goal: {
            type: "string",
            minLength: 2,
            maxLength: 240,
            description:
              "Optional learner-stated goal to preserve with the confirmed plan.",
          },
          minutesAvailable: {
            type: "integer",
            minimum: 10,
            maximum: 240,
            description:
              "Optional preferred minutes per learning session. This is stored as a scheduling preference; concept duration estimates remain evidence-based.",
          },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "activate_learning_plan",
      description:
        "Request activation of an existing learning-plan draft. This tool never writes directly; it returns a confirmation request that the authenticated learner must approve in the UI.",
      parameters: {
        type: "object",
        properties: {
          draftId: {
            type: "string",
            format: "uuid",
          },
        },
        required: ["draftId"],
        additionalProperties: false,
      },
    },
  },
];
