import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const homePageSource = readFileSync(
  new URL("../src/app/page.tsx", import.meta.url),
  "utf8",
);
const siteHeaderSource = readFileSync(
  new URL("../src/components/site-header.tsx", import.meta.url),
  "utf8",
);

test("home page provides complete natural Chinese copy", () => {
  for (const text of [
    "AI 自适应学习平台",
    "开始学习",
    "查看学习进度",
    "知识图谱",
    "结构化课程",
    "学习闭环",
    "自适应学习行动",
    "一切围绕真正学会",
    "带账号的持久学习状态",
  ]) {
    assert.match(homePageSource, new RegExp(text));
  }
});

test("home page remains connected to the shared language switch", () => {
  assert.match(homePageSource, /^"use client";/);
  assert.match(homePageSource, /const \{ language \} = useLanguage\(\);/);
  assert.match(homePageSource, /const copy = homePageCopy\[language\];/);
  assert.match(homePageSource, /title: "AI Learning Platform"/);
  assert.match(homePageSource, /startLearning: "Start learning"/);
});

test("site header localizes the product name and fallback user label", () => {
  assert.match(siteHeaderSource, /AI 自适应学习平台/);
  assert.match(siteHeaderSource, /language === "zh" \? "用户" : "User"/);
});
