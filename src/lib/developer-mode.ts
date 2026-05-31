import "server-only";

import { cookies } from "next/headers";

export const DEVELOPER_MODE_COOKIE = "ai_learning_developer_mode";

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
  const expectedPassword = process.env.DEVELOPER_MODE_PASSWORD;

  if (!expectedPassword) {
    return process.env.NODE_ENV !== "production";
  }

  return password === expectedPassword;
}

export async function hasDeveloperModeAccess() {
  if (!isDeveloperToolsEnabled()) {
    return false;
  }

  const cookieStore = await cookies();

  return cookieStore.get(DEVELOPER_MODE_COOKIE)?.value === "enabled";
}
