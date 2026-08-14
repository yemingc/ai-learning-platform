# Operations and deployment

This document covers local setup, verification, the single-instance Docker
profile, demo data, health checks, and operational boundaries.

## Prerequisites

- Node.js and npm
- A DeepSeek API key for live AI Teacher calls
- An OpenAI-compatible embedding provider for embedding/hybrid retrieval
- Docker Desktop or another Compose-compatible runtime for container deployment

Deterministic tests, lint, type checking, and the production build do not call
the live model.

## Local setup

```powershell
git clone https://github.com/yemingc/ai-learning-platform.git
cd ai-learning-platform
npm install
Copy-Item .env.example .env.local
```

Set at least `DEEPSEEK_API_KEY` and replace the example `AUTH_SECRET`, then run:

```powershell
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

Use `.env.example` as the authoritative template. `.env.local` and other real
environment files are ignored by Git and excluded from the Docker build
context.

### Model and authentication

| Variable | Purpose |
| --- | --- |
| `DEEPSEEK_API_KEY` | Server-only AI Teacher provider credential |
| `DEEPSEEK_BASE_URL` | OpenAI-compatible provider base URL |
| `DEEPSEEK_MODEL` | AI Teacher model id |
| `AUTH_SECRET` | Auth.js signing secret; replace the example value |
| `AUTH_TRUST_HOST` | Enables trusted-host behavior for the intended deployment |

### Workflow, quota, and telemetry

| Variable | Default/example | Purpose |
| --- | --- | --- |
| `TEACHER_WORKFLOW_ENGINE` | `langgraph` | Selects `langgraph` or `typescript` |
| `AI_TEACHER_BURST_LIMIT` | `12` | Per-learner burst allowance |
| `AI_TEACHER_BURST_WINDOW_SECONDS` | `600` | Burst window |
| `AI_TEACHER_DAILY_LIMIT` | `100` | Rolling per-learner daily allowance |
| `AI_RUN_RETENTION_DAYS` | `90` | Local privacy-minimized telemetry retention |
| `NEXT_PUBLIC_SHOW_AI_TRACE` | `false` | Shows trace data in a portfolio demo |
| `ENABLE_DEVELOPER_TOOLS` | `true` | Enables developer routes |
| `DEVELOPER_MODE_PASSWORD` | empty locally | Protects developer tools in shared environments |

### Retrieval and embedding

| Variable | Default/example | Purpose |
| --- | --- | --- |
| `RAG_RETRIEVAL_MODE` | `hybrid` | `keyword`, `embedding`, or `hybrid` |
| `RAG_KEYWORD_MIN_SCORE` | `4` | Keyword relevance gate |
| `RAG_EMBEDDING_MIN_SCORE` | `48` | Embedding relevance gate |
| `RAG_HYBRID_MIN_SCORE` | `20` | Hybrid relevance gate |
| `RAG_HYBRID_KEYWORD_WEIGHT` | `65` | Keyword contribution |
| `RAG_HYBRID_EMBEDDING_WEIGHT` | `35` | Embedding contribution |
| `EMBEDDING_PROVIDER` | `openai-compatible` | Embedding adapter |
| `EMBEDDING_BASE_URL` | provider-specific | Embedding endpoint |
| `EMBEDDING_API_KEY` | required for builds | Server-only embedding credential |
| `EMBEDDING_MODEL` | provider-specific | Embedding model id |
| `EMBEDDING_DIMENSIONS` | model-specific | Expected vector dimensions |
| `EMBEDDING_INDEX_SECRET` | empty locally | Optional bearer protection for index builds |
| `EMBEDDING_INDEX_BASE_URL` | `http://localhost:3000` | CLI target application |
| `EMBEDDING_INDEX_LOCALE` | `all` | Locale build scope |
| `EMBEDDING_INDEX_FORCE` | `false` | Forces rebuilding current vectors |

Keyword and embedding weights must total 100. An incomplete, stale, or
wrong-model index is rejected instead of searched partially.

### Evaluation governance

| Variable | Default/example | Purpose |
| --- | --- | --- |
| `AI_EVALUATION_REPORT_SECRET` | empty locally | Dedicated CI/export bearer credential |
| `AI_EVALUATION_REPORT_BASE_URL` | `http://localhost:3000` | Report-export target |

`AI_EVALUATION_REPORT_SECRET` and `EMBEDDING_INDEX_SECRET` are deliberately
separate; neither grants the other's authority.

### Shared demo account

| Variable | Default/example | Purpose |
| --- | --- | --- |
| `ENABLE_PUBLIC_DEMO_ACCOUNT` | `false` | Enables one-click shared demo login |
| `DEMO_ACCOUNT_EMAIL` | reserved `example.com` address | Labels the synthetic learner |
| `DEMO_ACCOUNT_PASSWORD` | replace before use | Dedicated shared-demo password |
| `DEMO_ACCOUNT_NAME` | `Portfolio Demo Learner` | Display name |
| `DEMO_BASE_URL` | `http://localhost:3000` | Demo-seed target |

Do not reuse auth, developer, model-provider, evaluation-report, embedding, or
embedding-index secrets as the demo password.

## Repository verification

Run the deterministic repository checks:

```powershell
npm test
npx tsc --noEmit
npm run lint
npm run audit:prod
npm run build
```

The production dependency audit fails on high or critical advisories.

## Runtime regression checks

Start the development server before running the authenticated or retrieval
checks.

### Authentication and formative evidence

```powershell
npm run test:auth
```

This regression covers registration/login, authenticated isolation, assessment
answer boundaries, server scoring, diagnostic mastery caps, exit-ticket
readiness updates, attempt readback, and cross-account isolation.

### Embedding index and RAG release gate

Configure the embedding variables, then run:

```powershell
npm run embeddings:build
npm run test:rag
```

The retrieval check requires a non-empty chunk index, English and Chinese smoke
results, all deterministic keyword cases, and the hybrid release gate. See
[RAG and retrieval evaluation](RAG_EVALUATION.md).

## Evaluation governance exports

The protected endpoint supports JSON and Markdown:

```text
/api/developer/evaluation-report?format=json|markdown
```

Export through the CLI:

```powershell
npm run report:evaluation
npm run report:evaluation -- --format markdown
npm run report:evaluation -- --require-live
npm run report:evaluation -- --require-live --require-human-calibration
```

The default report can pass at `deterministic_only` evidence without making a
live-model claim. Requirement flags fail closed when evidence is absent. If a
matching live run exists and its release gate failed, the report fails even
when live evidence was optional.

The CLI writes privacy-safe artifacts under ignored `artifacts/` and exits
non-zero on a failed gate. CI starts the production server with an ephemeral
report secret, exports both formats without calling the model, and uploads them
as workflow artifacts.

## Production build without Docker

```powershell
npm run build
npm run start
```

The default application URL is `http://localhost:3000`.

## Single-instance Docker profile

The repository includes a non-root Next.js standalone image and Compose
configuration.

```powershell
Copy-Item docker.env.example .env.docker.local
# Replace every change_me value in .env.docker.local
docker compose --env-file .env.docker.local up --build
```

Open `http://localhost:3000`.

The `ai-learning-data` named volume persists:

- accounts and password hashes;
- learner memory and assessment attempts;
- privacy-minimized AI-run telemetry;
- live-evaluation summaries; and
- human reviews.

Container and platform probes should call:

```text
GET /api/health
```

The response verifies application and SQLite readiness without exposing
credentials, provider configuration, user data, or model names.

## Backup and replacement

Back up the `ai-learning-data` volume before replacing the host, image, or
volume. The current repository does not automate remote backups or restore
testing; that remains an operator responsibility for any persistent deployment.

This profile intentionally runs one application instance. SQLite, local Next.js
cache, and in-process coordination are not safe assumptions for horizontal
scaling. Before adding replicas:

1. migrate persistence to a shared database;
2. move embedding search to a shared index where required;
3. configure shared cache and coordination; and
4. apply the current Next.js multi-instance requirements for Server Action
   encryption and cache invalidation.

## Seed a recruiter-friendly learner

The seed flow uses normal product APIs. It does not write SQLite directly and
does not invent live-model evaluations or human reviews.

Configure a reserved identity and dedicated password:

```env
ENABLE_PUBLIC_DEMO_ACCOUNT=true
DEMO_ACCOUNT_EMAIL=demo.learner@example.com
DEMO_ACCOUNT_PASSWORD=use_a_unique_12_plus_character_password
DEMO_ACCOUNT_NAME=Portfolio Demo Learner
DEMO_BASE_URL=http://localhost:3000
```

With the application running:

```powershell
npm run demo:seed -- --env-file .env.docker.local
```

The command is idempotent. It creates or reuses only the named demo account,
resets that account's AP Calculus memory, and writes five final assessment
attempts across three concepts. The resulting cases demonstrate strong learning
gain, partial understanding, and diagnostic-only evidence.

When enabled, `/login` displays a one-click shared-demo button. The credentials
are intentionally public, so the application accepts only an `example.com`
identity, rejects placeholder passwords, and rejects reuse of privileged
secrets. Keep the feature disabled for real learner accounts. A remote
`DEMO_BASE_URL` must use HTTPS.

## Pre-publication checklist

- [ ] Repository secret and full-history scan completed.
- [ ] Real `.env` files, SQLite data, artifacts, logs, and local interview notes
      remain ignored.
- [ ] Tests, types, lint, dependency audit, and production build pass.
- [ ] Container starts as a non-root user and `/api/health` succeeds.
- [ ] Production secrets are unique and supplied by the host, not the image.
- [ ] Embedding index is rebuilt and the RAG release gate passes in the target
      environment.
- [ ] Shared demo identity contains only synthetic evidence.
- [ ] Developer Mode has a dedicated password in a shared environment.
- [ ] At least three live evaluation runs have complete human reviews before
      automated teaching-score calibration is claimed.
- [ ] Screenshots or video are reviewed for learner data and credentials.

## Known operational limitations

- No email ownership verification or OAuth.
- No automated remote backup or restore drill.
- No multi-instance database, cache, or coordination layer.
- No production distributed tracing or alerting.
- Live-model quality and embedding freshness remain environment-dependent.
- AP Units 1–2 still require named subject-matter review.
