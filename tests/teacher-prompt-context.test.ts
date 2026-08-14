import assert from "node:assert/strict";
import test from "node:test";
import { buildCompactLessonContext } from "../src/features/ai-teacher/teacher-prompt-context.ts";
import type { LessonContent } from "../src/features/lessons/types.ts";

function createLesson(): LessonContent {
  return {
    title: "A compact lesson",
    objective: {
      title: "Understand the idea",
      description: "Use the active section only.",
      successCriteria: ["Explain it"],
    },
    sections: [
      {
        id: "formal-v1",
        sectionId: "formal",
        type: "formal_idea",
        title: "Formal idea",
        body: "ACTIVE FORMAL CONTENT",
        retrievalTags: [],
        misconceptionIds: [],
      },
      {
        id: "worked-v1",
        sectionId: "worked",
        type: "worked_example",
        title: "Worked example",
        body: "UNRELATED WORKED EXAMPLE SENTINEL",
        retrievalTags: [],
        misconceptionIds: [],
      },
    ],
    intuition: "Fallback intuition",
    formalExplanation: "Localized formal explanation",
    hook: "Why it matters",
    prerequisiteConnections: [],
    workedExamples: [],
    guidedQuestions: [],
    misconceptionChecks: [],
    reflectionPrompt: { prompt: "Reflect", sentenceStarter: "I learned" },
    applicationPrompt: {
      title: "Apply",
      prompt: "Try it",
      whyItTransfers: "It transfers",
    },
    keyTakeaways: ["One concise takeaway"],
  } as unknown as LessonContent;
}

test("keeps only the active English lesson section plus a compact overview", () => {
  const lesson = createLesson();
  const context = buildCompactLessonContext({
    currentSection: "Formal idea",
    lesson,
    locale: "en",
  });
  const serialized = JSON.stringify(context);

  assert.match(serialized, /ACTIVE FORMAL CONTENT/);
  assert.doesNotMatch(serialized, /UNRELATED WORKED EXAMPLE SENTINEL/);
  assert.ok(serialized.length < JSON.stringify(lesson).length);
  assert.equal(context.activeSection.sectionType, "formal_idea");
});

test("uses localized legacy content for a Chinese section", () => {
  const lesson = createLesson();
  lesson.formalExplanation = "本地化正式解释";
  const context = buildCompactLessonContext({
    currentSection: "正式说法",
    lesson,
    locale: "zh",
  });

  assert.equal(context.activeSection.content, "本地化正式解释");
});
