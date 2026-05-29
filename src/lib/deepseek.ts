import "server-only";

import OpenAI from "openai";

export const DEEPSEEK_MODEL =
  process.env.DEEPSEEK_MODEL?.trim() || "deepseek-v4-pro";

export const DEEPSEEK_TIMEOUT_MS = 180_000;

export function getDeepSeekClient() {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();

  if (!apiKey) {
    return undefined;
  }

  return new OpenAI({
    apiKey,
    baseURL: process.env.DEEPSEEK_BASE_URL?.trim() || "https://api.deepseek.com",
    maxRetries: 0,
    timeout: DEEPSEEK_TIMEOUT_MS,
  });
}
