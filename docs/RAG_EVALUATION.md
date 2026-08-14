# RAG and retrieval evaluation

This document explains the curriculum RAG design, its evaluation contract, and
the tradeoffs behind the current hybrid default.

## Goals

The retrieval layer must:

- ground substantive AI Teacher responses in reviewed lesson content;
- support natural English and Chinese queries;
- preserve stable source metadata for safe citations;
- reject irrelevant queries instead of forcing context into every prompt;
- remain inspectable and reproducible for a portfolio project; and
- fail explicitly or degrade to a deterministic baseline.

It is not intended to search arbitrary web content or replace the structured
lesson system.

## Source of truth and chunking

Structured lessons remain the source of truth. Each English lesson section and
each localized Chinese section becomes a first-class retrieval chunk with a
stable id shaped by:

```text
courseId/unitId/conceptId/locale/sectionId
```

Chunk metadata includes:

- course, unit, concept, lesson, locale, and section ids;
- section type;
- retrieval tags;
- a human-readable source label; and
- the text used to detect stale embedding records.

Chinese content is indexed directly. Chinese retrieval therefore does not rely
only on query expansion against English text.

The latest local snapshot contains 506 curriculum chunks across AP Calculus AB
and JavaScript Foundations.

## Retrieval modes

### Keyword

Keyword retrieval is the deterministic baseline. It uses normalized lexical
evidence, English stopword filtering, lightweight Chinese n-grams, retrieval
tags, and a calibrated relevance threshold.

Advantages:

- deterministic and easy to debug;
- no external embedding service at query time;
- strong for exact academic terminology and identifiers; and
- always available as the fallback.

Limitation: paraphrases with weak lexical overlap can rank below an exact-word
distractor.

### Embedding

Embedding retrieval uses an OpenAI-compatible embedding endpoint. Vectors and
their source metadata are stored in `data/rag-embeddings.sqlite`.

Before search, the index verifies:

- every current chunk has a vector;
- the stored text still matches the curriculum chunk;
- the embedding provider/model/dimensions match the active configuration; and
- no orphaned records remain.

An incomplete, stale, or wrong-model index is rejected. The runtime does not
silently search a partial index or substitute fake vectors.

### Hybrid

Hybrid is the evaluated default when the embedding index is complete and
current. It combines two independently gated candidate channels:

```text
hybrid score = 0.65 * normalized keyword evidence
             + 0.35 * absolute embedding cosine score
```

Both weights are configurable but must total 100. Each channel must pass its own
minimum relevance threshold before contributing. This prevents a weak semantic
score from disguising irrelevant lexical evidence, or vice versa.

Course-wide results retain at most three chunks per concept. This prevents one
concept from filling the result set while still allowing complementary lesson
sections from a strongly supported concept.

## Runtime retrieval policy

Retrieval is part of the teaching workflow rather than an unconditional
pre-processing step:

```text
Classify learner intent
  -> lightweight turn: skip retrieval
  -> substantive turn: search active concept
      -> quality sufficient: use top evidence
      -> insufficient: retry once at course scope
          -> quality sufficient: use bounded results
          -> insufficient: fall back to reviewed lesson context
```

At most four chunks are assembled into the model context. The prompt also
receives only the compact active lesson section, objective, and key takeaways,
avoiding duplication with retrieved evidence.

If embedding or hybrid search fails, the runtime switches to keyword retrieval
and records the fallback in the workflow trace.

## Citation safety

The model cannot construct citation objects. It may return only
`citationChunkIds`. The server intersects those ids with the retrieved chunk
allowlist and creates display citations from trusted chunk metadata.

This protects the learner UI from invented source labels or ids even when the
model is explicitly pressured to cite unavailable material.

## Evaluation set

The checked-in suite contains 48 cases:

- 45 positive cases with expected curriculum evidence;
- 3 explicit no-match cases that should retrieve nothing;
- AP Calculus Unit 1 and Unit 2 coverage;
- JavaScript Foundations coverage;
- English and Chinese queries;
- paraphrase and ranking cases; and
- distractors that share vocabulary but refer to the wrong concept.

All modes run against the same cases. The release check fails when the hybrid
mode does not pass every case or when Top-3, Recall@8, or no-match accuracy drops
below 100%.

## Metric definitions

| Metric | Meaning |
| --- | --- |
| Top-1 | Expected evidence is the first result for a positive case |
| Top-3 | Expected evidence appears within ranks 1–3 |
| Recall@8 | Expected evidence appears in the full bounded candidate result |
| MRR | Mean reciprocal rank of the first expected result |
| No-match accuracy | A negative case correctly returns no accepted evidence |
| p95 latency | 95th-percentile retrieval duration for the evaluated cases |

Top-1 and Top-3 are retrieval hit rates. They do **not** measure whether the
final generated answer is correct. Answer quality is covered separately by the
AI Teacher contract, pedagogy, grounding, safety, localization, workflow, and
human-review pipeline.

## Current verified snapshot

Local environment snapshot verified on 2026-08-14:

| Evidence | Result |
| --- | --- |
| Curriculum chunks | 506 |
| Embedding coverage | 506 / 506 current |
| Missing / stale / orphaned vectors | 0 / 0 / 0 |
| Embedding model | `BAAI/bge-m3`, 1024 dimensions |
| Hybrid case gate | 48 / 48 passed |
| Hybrid Top-1 | 84.44% |
| Hybrid Top-3 | 100% |
| Hybrid Recall@8 | 100% |
| Hybrid no-match accuracy | 100% |
| Keyword Top-1 | 77.78% |
| Embedding-only case gate | 45 / 48 passed |
| Embedding-only Top-1 | 71.11% |
| Embedding-only Top-3 | 93.33% |

The local embedding index is intentionally ignored by Git. These numbers are
environment-backed evidence, not a claim that every future deployment has a
fresh index.

## Why hybrid is the default

Keyword retrieval is stronger than embedding-only retrieval on this small,
terminology-heavy curriculum, while embedding retrieval helps with paraphrases.
The hybrid policy improved Top-1 over both individual modes and met the strict
Top-3/no-match release gate.

The design therefore keeps embedding as a real, evaluated component without
pretending that semantic retrieval is automatically superior to a lexical
baseline.

## Why there is no reranker

A reranker is not currently justified:

- the corpus is small and structurally scoped by course and concept;
- the bounded active-concept-first search already reduces candidate noise;
- hybrid Top-3, Recall@8, and no-match accuracy meet the release gate;
- another model would add latency, cost, credentials, and failure modes; and
- there is no measured ranking failure set demonstrating that reranking would
  improve the learner outcome.

Revisit reranking only when corpus growth or real query traces produce repeated
ranking failures that fusion-weight or threshold calibration cannot solve.

## Build and inspect the index

Configure an embedding provider in `.env.local`, start the application, and run:

```powershell
npm run embeddings:build
npm run test:rag
```

Developer tools:

- `/developer/retrieval-preview` shows chunk ids, source labels, locale,
  section type, tags, matched reasons, keyword/embedding contributions, preview
  text, and index coverage.
- `/developer/retrieval-evaluation` compares keyword, embedding, and hybrid
  modes on the same checked-in cases.
- `/api/developer/retrieval-check` powers the CLI release check.

Embedding builds are triggered server-side, so the browser never receives the
embedding API key. A shared or production environment should protect the build
endpoint with `EMBEDDING_INDEX_SECRET`.

## Change gate

Rebuild the index and preserve the three-mode comparison whenever any of these
change:

- curriculum or localization text;
- chunk ids, section boundaries, or metadata;
- embedding provider, model, or dimensions;
- keyword or per-mode relevance thresholds;
- hybrid fusion weights; or
- course/concept diversity rules.

The minimum verification sequence is:

```powershell
npm run embeddings:build
npm run test:rag
npm test
npx tsc --noEmit
npm run lint
```

## Storage and scaling boundary

SQLite is sufficient for the reproducible single-instance portfolio profile.
The retriever contract, prompt assembly, citation gate, and evaluation suite are
storage-independent. If a multi-instance deployment becomes necessary,
PostgreSQL/pgvector or another shared vector store can replace the local index
without changing those boundaries.
