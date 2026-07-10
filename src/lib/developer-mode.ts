import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const DEVELOPER_MODE_COOKIE = "ai_learning_developer_mode";
export const DEVELOPER_MODE_MAX_AGE_SECONDS = 60 * 60 * 8;

function valuesMatch(provided: string, expected: string) {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

function getDeveloperModeSigningSecret() {
  return (
    process.env.AUTH_SECRET?.trim() ||
    process.env.DEVELOPER_MODE_PASSWORD?.trim()
  );
}

function signDeveloperModePayload(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function isDeveloperToolsEnabled() {
  return (
    process.env.ENABLE_DEVELOPER_TOOLS === "true" ||
    process.env.NODE_ENV !== "production"
  );
}

export function hasDeveloperModePassword() {
  return Boolean(process.env.DEVELOPER_MODE_PASSWORD);
}

export function isValidDeveloperModePassword(password: string) {
  const expectedPassword = process.env.DEVELOPER_MODE_PASSWORD?.trim();

  if (!expectedPassword) {
    return process.env.NODE_ENV !== "production";
  }

  return valuesMatch(password, expectedPassword);
}

export function createDeveloperModeCookieValue(now = Date.now()) {
  const secret = getDeveloperModeSigningSecret();

  if (!secret) {
    if (process.env.NODE_ENV !== "production") {
      return "enabled";
    }

    throw new Error(
      "AUTH_SECRET or DEVELOPER_MODE_PASSWORD is required to sign developer mode access.",
    );
  }

  const expiresAt = Math.floor(now / 1000) + DEVELOPER_MODE_MAX_AGE_SECONDS;
  const payload = `v1.${expiresAt}`;
  const signature = signDeveloperModePayload(payload, secret);

  return `${payload}.${signature}`;
}

export function isDeveloperModeCookieValueValid(
  value: string | undefined,
  now = Date.now(),
) {
  if (!value) {
    return false;
  }

  const secret = getDeveloperModeSigningSecret();

  if (!secret) {
    return process.env.NODE_ENV !== "production" && value === "enabled";
  }

  const [version, expiresAtValue, signature] = value.split(".", 3);
  const expiresAt = Number(expiresAtValue);

  if (
    version !== "v1" ||
    !Number.isInteger(expiresAt) ||
    expiresAt <= Math.floor(now / 1000) ||
    !signature
  ) {
    return false;
  }

  const payload = `${version}.${expiresAt}`;
  const expectedSignature = signDeveloperModePayload(payload, secret);

  return valuesMatch(signature, expectedSignature);
}

export async function hasDeveloperModeAccess() {
  if (!isDeveloperToolsEnabled()) {
    return false;
  }

  const cookieStore = await cookies();

  return isDeveloperModeCookieValueValid(
    cookieStore.get(DEVELOPER_MODE_COOKIE)?.value,
  );
}
