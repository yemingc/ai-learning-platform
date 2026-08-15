import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as { scripts?: Record<string, string> };
const nextConfigSource = readFileSync(
  new URL("../next.config.ts", import.meta.url),
  "utf8",
);

const siteHeaderSource = readFileSync(
  new URL("../src/components/site-header.tsx", import.meta.url),
  "utf8",
);
const developerModeClientSource = readFileSync(
  new URL(
    "../src/components/developer/developer-mode-client.tsx",
    import.meta.url,
  ),
  "utf8",
);
const developerPageSource = readFileSync(
  new URL("../src/app/developer/page.tsx", import.meta.url),
  "utf8",
);
const developerToolPageSources = [
  "../src/app/developer/ai-runs/page.tsx",
  "../src/app/developer/retrieval-evaluation/page.tsx",
  "../src/app/developer/retrieval-preview/page.tsx",
].map((path) => readFileSync(new URL(path, import.meta.url), "utf8"));
const workflowInspectorSource = readFileSync(
  new URL(
    "../src/components/dashboard/workflow-inspector-client.tsx",
    import.meta.url,
  ),
  "utf8",
);
const retrievalPreviewSearchSource = readFileSync(
  new URL(
    "../src/components/developer/retrieval-preview-search-form.tsx",
    import.meta.url,
  ),
  "utf8",
);

test("developer entry uses a document navigation for its auth-sensitive route", () => {
  assert.match(
    siteHeaderSource,
    /item\.href === "\/developer"[\s\S]*?<a[\s\S]*?href=\{item\.href\}/,
  );
});

test("default development uses Turbopack without its persistent disk cache", () => {
  assert.equal(packageJson.scripts?.dev, "next dev");
  assert.equal(packageJson.scripts?.["dev:webpack"], "next dev --webpack");
  assert.match(nextConfigSource, /turbopackFileSystemCacheForDev:\s*false/);
});

test("developer mode cookie changes trigger one document navigation", () => {
  assert.match(developerModeClientSource, /window\.location\.replace\(callbackUrl\)/);
  assert.match(developerModeClientSource, /window\.location\.reload\(\)/);
  assert.doesNotMatch(developerModeClientSource, /router\.(push|replace|refresh)\(/);
});

test("developer tool cards use document navigation", () => {
  assert.doesNotMatch(developerPageSource, /from "next\/link"/);
  assert.match(
    developerPageSource,
    /<a[\s\S]*?href=\{hasAccess \? tool\.href : undefined\}/,
  );
});

test("developer tool pages keep return and refresh links outside the RSC router", () => {
  for (const source of developerToolPageSources) {
    assert.doesNotMatch(source, /from "next\/link"/);
  }
});

test("retrieval search uses a native GET submission", () => {
  assert.doesNotMatch(retrievalPreviewSearchSource, /"use client"/);
  assert.doesNotMatch(retrievalPreviewSearchSource, /useRouter|router\./);
  assert.match(
    retrievalPreviewSearchSource,
    /action="\/developer\/retrieval-preview"[\s\S]*?method="get"/,
  );
});

test("workflow inspector tolerates stale trace node names", () => {
  assert.match(
    workflowInspectorSource,
    /nodeLabels\[event\.node\] \?\? \{[\s\S]*?未知节点/,
  );
});
