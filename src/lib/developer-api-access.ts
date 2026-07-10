import "server-only";

import { timingSafeEqual } from "node:crypto";
import { auth } from "@/auth";
import {
  hasDeveloperModeAccess,
  isDeveloperToolsEnabled,
} from "@/lib/developer-mode";

function secretsMatch(provided: string, expected: string) {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

function hasValidBearerSecret(request: Request) {
  const expectedSecret = process.env.EMBEDDING_INDEX_SECRET?.trim();

  if (!expectedSecret) {
    return false;
  }

  const authorization = request.headers.get("authorization") ?? "";
  const [scheme, providedSecret] = authorization.split(" ", 2);

  return (
    scheme?.toLowerCase() === "bearer" &&
    Boolean(providedSecret) &&
    secretsMatch(providedSecret, expectedSecret)
  );
}

export async function hasDeveloperApiAccess(request: Request) {
  if (!isDeveloperToolsEnabled()) {
    return false;
  }

  if (hasValidBearerSecret(request)) {
    return true;
  }

  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  const session = await auth();

  return Boolean(session?.user?.id) && (await hasDeveloperModeAccess());
}
