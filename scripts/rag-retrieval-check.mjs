const baseUrl = process.env.TEST_BASE_URL ?? "http://localhost:3000";

async function main() {
  const secret = process.env.EMBEDDING_INDEX_SECRET?.trim();
  const response = await fetch(`${baseUrl}/api/developer/retrieval-check`, {
    headers: secret
      ? {
          authorization: `Bearer ${secret}`,
        }
      : undefined,
  });

  if (!response.ok) {
    throw new Error(`RAG retrieval check failed with status ${response.status}.`);
  }

  const result = await response.json();

  if (!result.ok || result.chunkCount <= 0 || result.smokeResultCount <= 0) {
    throw new Error(`Unexpected RAG retrieval check result: ${JSON.stringify(result)}`);
  }

  if (result.chineseSmokeResultCount <= 0) {
    throw new Error(
      `Chinese RAG retrieval smoke query failed: ${JSON.stringify(result)}`,
    );
  }

  if (!result.evaluation || result.evaluation.failedCases > 0) {
    throw new Error(
      `Retrieval quality evaluation failed: ${JSON.stringify(result.evaluation)}`,
    );
  }

  console.log(
    `RAG retrieval check passed: ${result.chunkCount} chunks, ${result.smokeResultCount} English smoke results, ${result.chineseSmokeResultCount} Chinese smoke results, ${result.evaluation.passedCases}/${result.evaluation.totalCases} eval cases passed.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
