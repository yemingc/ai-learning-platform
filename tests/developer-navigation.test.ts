import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

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

test("developer mode cookie changes trigger one document navigation", () => {
  assert.match(developerModeClientSource, /window\.location\.replace\(callbackUrl\)/);
  assert.match(developerModeClientSource, /window\.location\.reload\(\)/);
  assert.doesNotMatch(developerModeClientSource, /router\.(push|replace|refresh)\(/);
});

test("retrieval search does not race a navigation with a refresh", () => {
  assert.match(retrievalPreviewSearchSource, /router\.push\(/);
  assert.doesNotMatch(retrievalPreviewSearchSource, /router\.refresh\(/);
});
