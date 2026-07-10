import assert from "node:assert/strict";
import test from "node:test";
import {
  encodeTeacherStreamEvent,
  extractJsonStringProgress,
  parseTeacherStreamBuffer,
} from "../src/features/ai-teacher/teacher-streaming.ts";

test("extracts an assistant message while its JSON string is incomplete", () => {
  assert.deepEqual(
    extractJsonStringProgress(
      '{"assistantMessage":"A limit describes what happens near',
      "assistantMessage",
    ),
    {
      complete: false,
      value: "A limit describes what happens near",
    },
  );
});

test("decodes JSON escapes without exposing an incomplete escape", () => {
  assert.deepEqual(
    extractJsonStringProgress(
      '{"assistantMessage":"Line 1\\nLine 2: \\\"limit\\\" \\u4',
      "assistantMessage",
    ),
    {
      complete: false,
      value: 'Line 1\nLine 2: "limit" ',
    },
  );

  assert.deepEqual(
    extractJsonStringProgress(
      '{"assistantMessage":"极限 \\ud83d\\udca1","teachingMove":"explain"}',
      "assistantMessage",
    ),
    {
      complete: true,
      value: "极限 💡",
    },
  );
});

test("parses only complete NDJSON events and preserves the remainder", () => {
  const first = encodeTeacherStreamEvent({
    type: "status",
    stage: "preparing_context",
  });
  const second = JSON.stringify({
    type: "assistant_delta",
    delta: "Approach",
  });
  const parsed = parseTeacherStreamBuffer(`${first}${second.slice(0, 18)}`);

  assert.deepEqual(parsed.events, [
    { type: "status", stage: "preparing_context" },
  ]);
  assert.equal(parsed.remainder, second.slice(0, 18));
});
