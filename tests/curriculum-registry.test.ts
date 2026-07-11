import assert from "node:assert/strict";
import test from "node:test";
import { getCurriculumIntegrityIssues } from "../src/curricula/integrity.ts";
import { localizeCourse } from "../src/curricula/localization.ts";
import { getLessonPath } from "../src/curricula/routing.ts";
import {
  javascriptFoundationsAssessments,
  javascriptFoundationsCurriculum,
} from "../src/curricula/javascript-foundations/index.ts";

test("every registered curriculum satisfies the shared pack contract", () => {
  const curricula = [javascriptFoundationsCurriculum];

  assert.deepEqual(getCurriculumIntegrityIssues(curricula), []);
});

test("course identities scope lesson routes and localized resources", () => {
  const javascript = javascriptFoundationsCurriculum;
  assert.equal(localizeCourse(javascript, "zh").title, "JavaScript 基础");
  assert.equal(
    getLessonPath(javascript.concepts[0]),
    "/courses/javascript-foundations/learn/javascript-foundations-unit-1-language-basics/js-values-and-types",
  );
  assert.equal(
    javascriptFoundationsAssessments.getAssessment({
      conceptId: "js-values-and-types",
      locale: "zh",
      phase: "diagnostic",
    }).courseId,
    javascript.id,
  );
});
