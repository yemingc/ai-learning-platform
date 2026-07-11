function escapeRegularExpression(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function containsEvaluationPattern(text: string, pattern: string) {
  const normalizedText = text.toLowerCase();
  const normalizedPattern = pattern.trim().toLowerCase();

  if (!normalizedPattern) {
    return false;
  }

  if (/^[a-z0-9_]+$/i.test(normalizedPattern)) {
    return new RegExp(
      `\\b${escapeRegularExpression(normalizedPattern)}\\b`,
      "i",
    ).test(normalizedText);
  }

  return normalizedText.includes(normalizedPattern);
}

export function avoidsEvaluationPatterns(
  text: string,
  patterns: string[] = [],
) {
  return patterns.every(
    (pattern) => !containsEvaluationPattern(text, pattern),
  );
}
