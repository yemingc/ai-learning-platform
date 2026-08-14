const baseUrl = process.env.TEST_BASE_URL ?? "http://localhost:3000";

async function main() {
  const secret = process.env.EMBEDDING_INDEX_SECRET?.trim();
  const response = await fetch(
    `${baseUrl}/api/developer/retrieval-check?includeModeComparison=true`,
    {
      headers: secret
        ? {
            authorization: `Bearer ${secret}`,
          }
        : undefined,
    },
  );

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

  const hybridEvaluation = result.modeComparison?.modes?.find(
    (summary) => summary.mode === "hybrid",
  );

  if (
    !hybridEvaluation ||
    hybridEvaluation.error ||
    hybridEvaluation.passedCases !== hybridEvaluation.totalCases ||
    hybridEvaluation.topThreeHitRate !== 1 ||
    hybridEvaluation.recallAtEightRate !== 1 ||
    hybridEvaluation.noMatchAccuracy !== 1
  ) {
    throw new Error(
      `Hybrid retrieval release gate failed: ${JSON.stringify(hybridEvaluation)}`,
    );
  }

  console.log(
    `RAG retrieval check passed: ${result.chunkCount} chunks, ${result.smokeResultCount} English smoke results, ${result.chineseSmokeResultCount} Chinese smoke results, keyword ${result.evaluation.passedCases}/${result.evaluation.totalCases}, hybrid ${hybridEvaluation.passedCases}/${hybridEvaluation.totalCases} with Top-3, Recall@8, and no-match accuracy at 100%.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
