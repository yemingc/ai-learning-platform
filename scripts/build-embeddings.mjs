const baseUrl = process.env.EMBEDDING_INDEX_BASE_URL ?? "http://localhost:3000";
const secret = process.env.EMBEDDING_INDEX_SECRET;
const locale = process.env.EMBEDDING_INDEX_LOCALE ?? "all";
const force = process.env.EMBEDDING_INDEX_FORCE === "true";

async function main() {
  const headers = {
    "Content-Type": "application/json",
  };

  if (secret) {
    headers.Authorization = `Bearer ${secret}`;
  }

  const response = await fetch(`${baseUrl}/api/developer/embedding-index`, {
    body: JSON.stringify({
      force,
      locale,
    }),
    headers,
    method: "POST",
  });
  const result = await response.json().catch(() => undefined);

  if (!response.ok || !result?.ok) {
    throw new Error(
      `Embedding index build failed with status ${response.status}: ${JSON.stringify(result)}`,
    );
  }

  console.log(
    [
      "Embedding index build complete.",
      `provider=${result.summary.provider}`,
      `model=${result.summary.model}`,
      `dimensions=${result.summary.dimensions}`,
      `embedded=${result.summary.chunksEmbedded}`,
      `skipped=${result.summary.chunksSkipped}`,
      `records=${result.stats.recordCount}`,
    ].join(" "),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

