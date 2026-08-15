export const TEACHER_STREAM_MEDIA_TYPE = "application/x-ndjson";

export type TeacherStreamStage =
  | "preparing_context"
  | "planning_action"
  | "executing_tools"
  | "awaiting_confirmation"
  | "generating_response"
  | "finalizing_learning_state";

export type TeacherChatStreamEvent<TComplete = unknown> =
  | {
      type: "status";
      stage: TeacherStreamStage;
    }
  | {
      type: "assistant_delta";
      delta: string;
    }
  | {
      type: "complete";
      data: TComplete;
    }
  | {
      type: "error";
      error: {
        code: string;
        message: string;
      };
    };

export type JsonStringProgress = {
  value: string;
  complete: boolean;
};

function escapeRegularExpression(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decodeSimpleEscape(value: string) {
  const escapes: Record<string, string> = {
    '"': '"',
    "\\": "\\",
    "/": "/",
    b: "\b",
    f: "\f",
    n: "\n",
    r: "\r",
    t: "\t",
  };

  return escapes[value];
}

export function extractJsonStringProgress(
  json: string,
  property: string,
): JsonStringProgress | undefined {
  const propertyPattern = new RegExp(
    `"${escapeRegularExpression(property)}"\\s*:\\s*"`,
  );
  const match = propertyPattern.exec(json);

  if (!match) {
    return undefined;
  }

  let value = "";
  let index = match.index + match[0].length;

  while (index < json.length) {
    const character = json[index];

    if (character === '"') {
      return { complete: true, value };
    }

    if (character !== "\\") {
      value += character;
      index += 1;
      continue;
    }

    const escapedCharacter = json[index + 1];

    if (!escapedCharacter) {
      break;
    }

    if (escapedCharacter !== "u") {
      const decodedEscape = decodeSimpleEscape(escapedCharacter);

      if (decodedEscape === undefined) {
        break;
      }

      value += decodedEscape;
      index += 2;
      continue;
    }

    const unicodeDigits = json.slice(index + 2, index + 6);

    if (!/^[0-9a-fA-F]{4}$/.test(unicodeDigits)) {
      break;
    }

    const codeUnit = Number.parseInt(unicodeDigits, 16);

    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const lowSurrogatePrefix = json.slice(index + 6, index + 8);
      const lowSurrogateDigits = json.slice(index + 8, index + 12);

      if (
        lowSurrogatePrefix !== "\\u" ||
        !/^[0-9a-fA-F]{4}$/.test(lowSurrogateDigits)
      ) {
        break;
      }

      const lowSurrogate = Number.parseInt(lowSurrogateDigits, 16);

      if (lowSurrogate < 0xdc00 || lowSurrogate > 0xdfff) {
        break;
      }

      value += String.fromCodePoint(
        0x10000 +
          ((codeUnit - 0xd800) << 10) +
          (lowSurrogate - 0xdc00),
      );
      index += 12;
      continue;
    }

    value += String.fromCharCode(codeUnit);
    index += 6;
  }

  return { complete: false, value };
}

export function encodeTeacherStreamEvent<TComplete>(
  event: TeacherChatStreamEvent<TComplete>,
) {
  return `${JSON.stringify(event)}\n`;
}

export function parseTeacherStreamBuffer<TComplete>(buffer: string) {
  const lines = buffer.split("\n");
  const remainder = lines.pop() ?? "";
  const events = lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map(
      (line) => JSON.parse(line) as TeacherChatStreamEvent<TComplete>,
    );

  return { events, remainder };
}
