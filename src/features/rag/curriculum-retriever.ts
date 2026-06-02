import type { CurriculumPack } from "@/curricula/types";
import {
  flattenLessonsToRetrievalChunks,
  type LessonRetrievalChunk,
  type LessonRetrievalLocale,
} from "@/features/lessons/retrieval-chunks";
import {
  getLocalizedConcept,
  getLocalizedCourse,
  getLocalizedUnit,
} from "@/features/knowledge/concept-localization";
import type {
  CurriculumRetrievalMatchReason,
  CurriculumRetrievalPreview,
  CurriculumRetrievalQuery,
  CurriculumRetrievalResult,
} from "@/features/rag/retrieval-types";

const bilingualMathTermSynonyms: Record<string, string[]> = {
  函数: ["function"],
  函数值: ["function value", "output value", "f(x)"],
  双侧极限: ["two-sided limit"],
  方程无解: [
    "没有定义",
    "不存在",
    "函数值",
    "函数值不存在",
    "空点",
    "空心点",
    "undefined",
    "not defined",
    "missing",
  ],
  图像: ["graph", "graphical"],
  垂直渐近线: ["vertical asymptote"],
  左极限: ["left-hand limit", "left sided limit"],
  应用: ["application"],
  接近: ["approach", "approaching behavior"],
  无界: ["unbounded behavior", "without bound"],
  无穷: ["infinity", "infinite"],
  无穷极限: ["infinite limit", "infinite limits"],
  极限: ["limit", "limits"],
  极限值: ["limit value"],
  极限符号: ["limit notation"],
  空心点: ["hole", "open circle", "open point"],
  表格: ["table"],
  误区: ["misconception", "common trap"],
  没有定义: ["undefined", "not defined", "missing"],
  无解: [
    "没有定义",
    "不存在",
    "函数值",
    "函数值不存在",
    "空点",
    "空心点",
    "undefined",
    "not defined",
    "missing",
  ],
  连续: ["continuity"],
  存在: ["exist", "exists"],
  右极限: ["right-hand limit", "right sided limit"],
  单侧极限: ["one-sided limit", "one-sided limits"],
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[()，。！？；：、,.!?;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return [];
  }

  return Array.from(
    new Set(
      normalized
        .split(" ")
        .map((token) => token.trim())
        .filter((token) => token.length >= 2),
    ),
  );
}

function expandBilingualMathTerms(value: string) {
  const expandedTerms = Object.entries(bilingualMathTermSynonyms).flatMap(
    ([sourceTerm, synonyms]) =>
      value.includes(sourceTerm) ? [sourceTerm, ...synonyms] : [],
  );

  return Array.from(new Set(expandedTerms));
}

function getQueryTokens(value: string) {
  return tokenize([value, ...expandBilingualMathTerms(value)].join(" "));
}

function countTokenMatches(tokens: string[], target: string) {
  const normalizedTarget = normalizeText(target);

  return tokens.filter((token) => normalizedTarget.includes(token)).length;
}

function addReason(
  reasons: Set<CurriculumRetrievalMatchReason>,
  reason: CurriculumRetrievalMatchReason,
) {
  reasons.add(reason);
}

function getChunkCitation(curriculum: CurriculumPack, chunk: LessonRetrievalChunk) {
  const unit = curriculum.units.find((item) => item.id === chunk.unitId);
  const concept = curriculum.concepts.find((item) => item.id === chunk.conceptId);
  const locale = chunk.locale;
  const courseTitle = getLocalizedCourse(curriculum.course, locale).title;
  const unitTitle = unit ? getLocalizedUnit(unit, locale).title : chunk.unitId;
  const conceptTitle = concept
    ? getLocalizedConcept(concept, locale).title
    : chunk.conceptId;

  return {
    conceptTitle,
    courseTitle,
    sectionTitle: chunk.title,
    sectionType: chunk.sectionType,
    unitTitle,
  };
}

function createPreviewText(text: string) {
  const compactText = text.replace(/\s+/g, " ").trim();

  if (compactText.length <= 260) {
    return compactText;
  }

  return `${compactText.slice(0, 257).trim()}...`;
}

export function createCurriculumRetrievalResult({
  chunk,
  curricula,
  matchedReasons,
  score,
}: {
  chunk: LessonRetrievalChunk;
  curricula: CurriculumPack[];
  matchedReasons: CurriculumRetrievalMatchReason[];
  score: number;
}): CurriculumRetrievalResult {
  const curriculum = curricula.find((item) => item.course.id === chunk.courseId);
  const citation = curriculum
    ? getChunkCitation(curriculum, chunk)
    : {
        conceptTitle: chunk.conceptId,
        courseTitle: chunk.courseId,
        sectionTitle: chunk.title,
        sectionType: chunk.sectionType,
        unitTitle: chunk.unitId,
      };

  return {
    ...chunk,
    citation,
    matchedReasons,
    previewText: createPreviewText(chunk.text),
    score,
    sourceLabel: `${citation.courseTitle} / ${citation.unitTitle} / ${citation.conceptTitle} / ${citation.sectionTitle}`,
  };
}

function scoreChunk({
  chunk,
  query,
  tokens,
}: {
  chunk: LessonRetrievalChunk;
  query: CurriculumRetrievalQuery;
  tokens: string[];
}) {
  const reasons = new Set<CurriculumRetrievalMatchReason>();
  let score = 0;

  if (query.sectionType && chunk.sectionType === query.sectionType) {
    score += 3;
    addReason(reasons, "section_type");
  }

  const requestedTags = query.tags?.map(normalizeText).filter(Boolean) ?? [];
  const normalizedChunkTags = chunk.retrievalTags.map(normalizeText);
  const explicitTagMatches = requestedTags.filter((tag) =>
    normalizedChunkTags.some((chunkTag) => chunkTag.includes(tag)),
  ).length;

  if (explicitTagMatches > 0) {
    score += explicitTagMatches * 4;
    addReason(reasons, "tag");
  }

  const queryTagMatches = tokens.filter((token) =>
    normalizedChunkTags.some((tag) => tag.includes(token)),
  ).length;

  if (queryTagMatches > 0) {
    score += queryTagMatches * 4;
    addReason(reasons, "tag");
  }

  const titleMatches = countTokenMatches(tokens, chunk.title);
  if (titleMatches > 0) {
    score += titleMatches * 5;
    addReason(reasons, "title");
  }

  const textMatches = countTokenMatches(tokens, chunk.text);
  if (textMatches > 0) {
    score += textMatches * 2;
    addReason(reasons, "text");
  }

  return {
    matchedReasons: Array.from(reasons),
    score,
  };
}

function getRequestedLocales(locale: CurriculumRetrievalQuery["locale"]) {
  if (locale === "en" || locale === "zh") {
    return [locale] satisfies LessonRetrievalLocale[];
  }

  return ["zh", "en"] satisfies LessonRetrievalLocale[];
}

export function getCurriculumRetrievalChunks(
  curricula: CurriculumPack[],
  locale: CurriculumRetrievalQuery["locale"] = "all",
): LessonRetrievalChunk[] {
  const locales = getRequestedLocales(locale);

  return curricula.flatMap((curriculum) =>
    locales.flatMap((activeLocale) =>
      flattenLessonsToRetrievalChunks(curriculum.lessons, {
        locale: activeLocale,
      }),
    ),
  );
}

export function searchCurriculumChunks({
  curricula,
  query,
}: {
  curricula: CurriculumPack[];
  query: CurriculumRetrievalQuery;
}): CurriculumRetrievalPreview {
  const chunks = getCurriculumRetrievalChunks(
    curricula,
    query.locale ?? "zh",
  ).filter((chunk) => {
    if (query.courseId && chunk.courseId !== query.courseId) {
      return false;
    }

    if (query.unitId && chunk.unitId !== query.unitId) {
      return false;
    }

    if (query.conceptId && chunk.conceptId !== query.conceptId) {
      return false;
    }

    if (query.sectionType && chunk.sectionType !== query.sectionType) {
      return false;
    }

    return true;
  });
  const tokens = getQueryTokens(query.query);
  const limit = query.limit ?? 8;
  const scoredResults = chunks
    .map((chunk) => {
      const scoredChunk = scoreChunk({ chunk, query, tokens });

      return createCurriculumRetrievalResult({
        chunk,
        curricula,
        matchedReasons: scoredChunk.matchedReasons,
        score: scoredChunk.score,
      });
    })
    .filter((result) => {
      if (!tokens.length && !(query.tags?.length || query.sectionType)) {
        return true;
      }

      return result.score > 0;
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      if (a.locale !== b.locale) {
        return a.locale === "zh" ? -1 : 1;
      }

      return a.id.localeCompare(b.id);
    });
  const limitedResults = scoredResults.slice(0, limit);

  return {
    query,
    results: limitedResults,
    totalChunks: chunks.length,
    totalMatches: scoredResults.length,
  };
}

export function validateCurriculumRetrievalIndex(curricula: CurriculumPack[]) {
  const chunks = getCurriculumRetrievalChunks(curricula, "all");
  const chunkIds = new Set<string>();

  if (!chunks.length) {
    throw new Error("RAG retrieval index must include at least one chunk.");
  }

  for (const chunk of chunks) {
    if (!chunk.id.trim()) {
      throw new Error("RAG retrieval chunk must have a stable id.");
    }

    if (!chunk.text.trim()) {
      throw new Error(`RAG retrieval chunk ${chunk.id} must have non-empty text.`);
    }

    if (chunkIds.has(chunk.id)) {
      throw new Error(`Duplicate RAG retrieval chunk id: ${chunk.id}`);
    }

    chunkIds.add(chunk.id);
  }

  const smokeResult = searchCurriculumChunks({
    curricula,
    query: {
      limit: 3,
      locale: "en",
      query: "limit function value misconception",
    },
  });

  if (!smokeResult.results.length) {
    throw new Error("RAG retrieval smoke query returned no chunks.");
  }

  const chineseSmokeResult = searchCurriculumChunks({
    curricula,
    query: {
      limit: 3,
      locale: "zh",
      query: "方程无解时有极限存在吗",
    },
  });

  if (!chineseSmokeResult.results.length) {
    throw new Error("RAG retrieval Chinese smoke query returned no chunks.");
  }

  const unrelatedResult = searchCurriculumChunks({
    curricula,
    query: {
      limit: 3,
      locale: "zh",
      query: "zzzz-unrelated-rag-smoke-query",
    },
  });

  if (unrelatedResult.totalMatches !== 0) {
    throw new Error(
      `RAG retrieval unrelated query should return 0 matches, got ${unrelatedResult.totalMatches}.`,
    );
  }

  return {
    chunkCount: chunks.length,
    chineseSmokeResultCount: chineseSmokeResult.results.length,
    englishChunkCount: chunks.filter((chunk) => chunk.locale === "en").length,
    smokeResultCount: smokeResult.results.length,
    unrelatedResultCount: unrelatedResult.totalMatches,
    zhChunkCount: chunks.filter((chunk) => chunk.locale === "zh").length,
  };
}
