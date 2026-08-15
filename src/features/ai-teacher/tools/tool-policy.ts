import {
  activateLearningPlanInputSchema,
  draftLearningPlanInputSchema,
  getLearningStateInputSchema,
  learningAgentToolNameSchema,
  retrieveCourseEvidenceInputSchema,
  type LearningAgentToolCall,
  type LearningAgentToolName,
} from "./types.ts";

export type LearningAgentActionMode = "teach" | "learning_agent";

const ACTION_PATTERNS = [
  /(?:帮我|给我|为我)?.{0,8}(?:安排|制定|生成|创建|调整|保存|启用).{0,12}(?:学习|复习|备考)?计划/u,
  /(?:学习|复习|掌握).{0,8}(?:进度|状态|安排|优先级)/u,
  /(?:学习|复习)?计划.{0,12}(?:调整|改成|改为|保存|启用)/u,
  /(?:今天|本周|这周).{0,10}(?:学什么|复习什么|怎么学|怎么复习)/u,
  /(?:我|当前).{0,6}(?:该学什么|该复习什么|先学什么|先复习什么)/u,
  /\b(?:create|make|build|draft|activate|save|adjust)\b.{0,24}\b(?:study|learning|review)\s+(?:plan|schedule)\b/i,
  /\b(?:show|check|review)\b.{0,16}\b(?:my\s+)?(?:learning|study)\s+(?:progress|state|status)\b/i,
  /\bwhat should i (?:study|review|learn)(?: next)?\b/i,
];

export function getLearningAgentActionMode(
  userMessage: string,
): LearningAgentActionMode {
  return ACTION_PATTERNS.some((pattern) => pattern.test(userMessage))
    ? "learning_agent"
    : "teach";
}

export type ParsedLearningAgentToolCall =
  | {
      id: string;
      name: "get_learning_state";
      arguments: ReturnType<typeof getLearningStateInputSchema.parse>;
    }
  | {
      id: string;
      name: "retrieve_course_evidence";
      arguments: ReturnType<typeof retrieveCourseEvidenceInputSchema.parse>;
    }
  | {
      id: string;
      name: "draft_learning_plan";
      arguments: ReturnType<typeof draftLearningPlanInputSchema.parse>;
    }
  | {
      id: string;
      name: "activate_learning_plan";
      arguments: ReturnType<typeof activateLearningPlanInputSchema.parse>;
    };

export class LearningAgentToolValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LearningAgentToolValidationError";
  }
}

export function parseLearningAgentToolCall(input: {
  id: string;
  name: string;
  argumentsJson: string;
}): ParsedLearningAgentToolCall {
  const parsedName = learningAgentToolNameSchema.safeParse(input.name);

  if (!parsedName.success) {
    throw new LearningAgentToolValidationError(
      `Unknown or disallowed tool: ${input.name}`,
    );
  }

  let rawArguments: unknown;

  try {
    rawArguments = JSON.parse(input.argumentsJson || "{}");
  } catch {
    throw new LearningAgentToolValidationError(
      `Tool ${parsedName.data} returned invalid JSON arguments.`,
    );
  }

  try {
    if (parsedName.data === "get_learning_state") {
      return {
        id: input.id,
        name: parsedName.data,
        arguments: getLearningStateInputSchema.parse(rawArguments),
      };
    }

    if (parsedName.data === "retrieve_course_evidence") {
      return {
        id: input.id,
        name: parsedName.data,
        arguments: retrieveCourseEvidenceInputSchema.parse(rawArguments),
      };
    }

    if (parsedName.data === "draft_learning_plan") {
      return {
        id: input.id,
        name: parsedName.data,
        arguments: draftLearningPlanInputSchema.parse(rawArguments),
      };
    }

    return {
      id: input.id,
      name: parsedName.data,
      arguments: activateLearningPlanInputSchema.parse(rawArguments),
    };
  } catch {
    throw new LearningAgentToolValidationError(
      `Tool ${parsedName.data} arguments failed schema validation.`,
    );
  }
}

export function isWriteLearningAgentTool(toolName: LearningAgentToolName) {
  return toolName === "activate_learning_plan";
}

export function toLearningAgentToolCall(input: {
  id: string;
  name: string;
  argumentsJson: string;
}): LearningAgentToolCall {
  const parsed = parseLearningAgentToolCall(input);

  return {
    id: parsed.id,
    name: parsed.name,
    argumentsJson: JSON.stringify(parsed.arguments),
  };
}
