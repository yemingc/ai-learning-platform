# AI Learning Platform

An AI-powered, learning-centric platform for AP Calculus AB.

This project is intentionally **not** a question bank, not a practice-review
app, and not just a generic AI tutor. It is designed around a learning system:

```text
Knowledge Graph
  -> Server-scored Diagnostic
  -> Static Lesson Content
  -> AI Teacher Chat
  -> Server-scored Exit Ticket
  -> Learner Memory
  -> Study Recommendations
  -> Application Practice Readiness
```

The MVP focuses on AP Calculus AB Unit 1 and demonstrates how a modern AI
education product can combine structured curriculum content, interactive AI
teaching, learner memory, and observable AI workflows.

## Product Positioning

Most AI education demos either generate answers to individual questions or act
as a generic chatbot. This project takes a different approach:

- Concepts are the center of the system, not questions.
- Lessons are static, structured, and reviewable in the codebase.
- The AI Teacher supports the current lesson instead of regenerating the
  curriculum.
- Learner memory captures misconceptions, confusion signals, and readiness.
- Practice is treated as an application stage after learning, not the product
  core.

The goal is to show how AI can help students build conceptual understanding
before they move into problem solving.

## Current MVP

### Learning Experience

- Polished landing page explaining the learning-centric product model.
- Course library page with AP Calculus AB as one selectable course pack.
- Course learning page that separates course -> unit -> concept navigation.
- AP Calculus AB Unit 1 concept cards organized into six dependency-aware topics.
- Static lesson pages for ten limits-and-continuity concepts:
  - What is a limit?
  - Limit notation
  - Estimating limits from graphs
  - One-sided limits
  - Infinite limits
  - Evaluating limits with limit laws
  - The Squeeze Theorem
  - Continuity at a point
  - The Intermediate Value Theorem
  - Limits at infinity and end behavior
- Every lesson includes a concept-specific accessible SVG representation and
  numerical evidence with directional controls.
- Guided questions and misconception checks use progressive disclosure and can
  send the learner's written reasoning to the AI Teacher for feedback.
- Every concept includes a bilingual two-item diagnostic and a distinct
  two-item exit ticket. Answer keys remain server-side; authenticated attempts
  are persisted as formative evidence rather than course grades.
- Lesson flow sections:
  - Why this matters
  - Intuition
  - Formal idea
  - Worked example
  - Think with me
  - Common trap
  - Reflection
  - Try applying it
  - Key takeaways

### AI Teacher Chat

- Sticky desktop AI Teacher panel beside the lesson.
- Mobile floating button that opens a chat drawer.
- Section-level "Ask about this" actions.
- Text selection actions, allowing students to select lesson text and ask the
  AI Teacher to explain it.
- DeepSeek API integration through the OpenAI-compatible SDK.
- Server-only API key handling.
- Zod validation for request and response contracts.
- Explicit error messages for missing API keys, API failures, timeouts, invalid
  JSON, and schema validation failures.
- Progressive NDJSON streaming backed by DeepSeek token streaming while the
  final structured response remains schema-validated before persistence.
- Visible preparation, generation, and learning-state finalization stages,
  with a 3-minute timeout and a user-controlled stop action.
- Interrupted drafts are labeled in the UI and excluded from subsequent chat
  context and learner-memory updates.
- Per-learner burst and rolling daily quotas enforced atomically before model
  calls, with `429` and `Retry-After` responses when a quota is exceeded.
- Optional retrieval context for lesson-grounded answers. The workflow retrieves
  only the top curriculum chunks when useful, and the backend filters any
  citation ids returned by the model against the retrieved chunk whitelist.

### Learning Dashboard

- Account-scoped learner memory persisted in SQLite.
- Concept-level memory records:
  - readiness score
  - learning status
  - recent interactions
  - confusion signals
  - misconceptions
  - memory signal history
  - diagnostic and exit-ticket attempts
  - measured learning gain
- Misconceptions have an evidence-backed lifecycle: they remain active until a
  strong server-scored exit ticket marks them repaired, retain their audit
  history, and reopen if the same misconception is detected again later.
- Student-facing Dashboard navigation split into course selection, unit
  selection, and concept-level progress/recommendations.
- Destructive course-progress resets use an explicit, cancellable confirmation
  step and preserve the current view when the reset request fails.
- Study recommendations generated from memory signals rather than raw question
  counts.
- Readiness combines deterministic assessment evidence with bounded AI Teacher
  signals. Conversations and a diagnostic alone are capped below `familiar`;
  an exit ticket is required to certify application readiness.
- Strong exit evidence can outweigh stale negative conversation signals, while
  weak exit evidence still keeps the learner in a repair loop.
- Review signals are time-ordered against the latest exit ticket: newer AI
  interactions can reopen a review need, but older inferred signals no longer
  override stronger assessment evidence forever.
- Authenticated memory API with user isolation by `learnerId + courseId`.

### Adaptive Study Plan

- Authenticated `/plan` route turns the concept graph and learner memory into a
  concrete next-learning queue.
- The planner ranks up to three unlocked concepts using server-scored
  diagnostic/exit evidence, readiness, misconceptions, recent review signals,
  and prerequisite stability.
- Downstream concepts remain visibly blocked until their prerequisites are
  stable, while active misconceptions and weak exit evidence move ahead of new
  content.
- Every recommendation explains why it was selected and links directly into
  the relevant lesson and AI Teacher prompt.
- A concept is only marked complete when exit evidence, readiness, and recent
  learning signals all meet the completion standard.

### LangGraph Workflow

The AI Teacher is orchestrated through a graph-ready teaching workflow:

```text
Student Message
  -> Build Context
  -> Classify Intent
  -> Select Teaching Strategy
  -> Decide Curriculum Retrieval
      -> Lightweight: Use Reviewed Lesson Context
      -> Substantive: Retrieve Curriculum Context
          -> Assess Retrieval Quality
          -> Retry Once With Current-Concept Scope, Or Fall Back To Lesson
  -> Generate And Validate Teaching Response
  -> Extract Learning Signals
  -> Decide Memory Update
      -> Persist Learning Evidence
      -> Record Audit-Only Interaction
      -> Skip Lightweight Interaction
  -> Return Next Study Action
```

LangGraph is the default workflow engine and is compiled once as a bounded,
conditional state machine. A deterministic TypeScript runner shares the same
retrieval, validation, and memory-write policies as a fallback.

### Formative Learning Evidence

The lesson experience closes the learning loop without becoming a question
bank:

```text
Diagnostic -> Lesson + AI support -> Exit ticket -> Learning gain
                                      -> Readiness + recommendation
                                      -> AI Teacher personalization
```

- Forty bilingual conceptual items cover all ten Unit 1 concepts: two
  diagnostic and two exit-ticket items per concept.
- `GET /api/formative-assessment` returns a minimal public DTO without correct
  options or explanations.
- `POST /api/formative-assessment` re-authenticates the learner, validates the
  course/concept/item/option contract, grades against the server curriculum,
  and persists the learner's attempt evidence.
- The AI Teacher memory snapshot receives diagnostic score, exit score,
  learning gain, and evidence level. Prompt rules treat server-scored evidence
  as stronger than model-inferred confidence.
- Application recommendations require exit evidence and block progression when
  the key idea did not transfer.

### AI Workflow Inspector

The project includes a developer-facing Workflow Inspector behind Developer
Mode at:

```text
/dashboard/workflow-inspector
```

It shows recent AI Teacher workflow runs, including:

- workflow engine
- selected concept and section
- student message
- assistant response preview
- intent classification
- teaching strategy
- learning signals
- memory patch
- next study action
- node-by-node workflow trace
- model, prompt version, token usage, first-token latency, and total model
  latency for newly captured runs

This is meant to demonstrate AI observability and make the AI layer explainable
from an engineering/product perspective.

### AI Teacher Evaluation Suite

The project includes a deterministic evaluation page behind Developer Mode at:

```text
/dashboard/ai-evaluation
```

It runs fixed pedagogical cases that check:

- curriculum concept and lesson resolution
- `TeacherChatResponse` Zod schema compliance
- expected teaching move selection
- expected next study action in memory signals
- required academic terminology
- bilingual Chinese responses with English terms in parentheses
- guardrails against question-bank or grading language
- coverage of the graph-ready AI Teacher workflow nodes
- prompt-injection resistance without abandoning the learning task
- learner-memory privacy using non-production canary values
- confident false-premise correction instead of user-agreement bias
- citation allowlist compliance under explicit hallucination pressure

Checks are grouped into six independently visible quality dimensions:
`contract`, `pedagogy`, `grounding`, `safety`, `localization`, and `workflow`.
Dimensions with no executed checks are shown as not run rather than receiving a
misleading perfect score.

The deterministic runner provides a fast offline contract and pedagogy layer.

The same page also includes **Live Model Evaluation Mode**, which calls the
real AI Teacher workflow through `/api/teacher-evaluation/live` and scores the
model response with the same cases. This route is authenticated and intended
for development or portfolio demos, not for student-facing learning sessions.
Each live evaluation summary is persisted with aggregate score, pass count,
duration, workflow engines, and model telemetry. A release-governance layer then:

- estimates cost from per-case input/output tokens using a versioned pricing snapshot
- uses cache-miss input pricing as a conservative upper-bound estimate
- establishes the first qualifying run as an approved baseline
- compares later prompt/model candidates against the latest approved baseline
- blocks releases on absolute quality failures, quality regressions, cost-budget
  overruns, unknown model prices, or incomplete token evidence
- persists the policy version, pricing version, checks, baseline id, and decision
  so historical approvals remain auditable
- requires safety and contract dimensions to score 100%, with explicit minimums
  for pedagogy, grounding, localization, and workflow

The current `deepseek-official-usd-2026-07-11` snapshot is sourced from the
[official DeepSeek model pricing documentation](https://api-docs.deepseek.com/quick_start/pricing).
Because the SDK telemetry does not currently separate cache-hit and cache-miss
prompt tokens, the estimate deliberately prices all input as cache misses rather
than presenting a falsely precise lower cost.

### Persisted AI Run Observability

Authenticated AI Teacher calls are recorded as privacy-minimized metadata in
SQLite and exposed behind Developer Mode at:

```text
/developer/ai-runs
```

The dashboard reports 24-hour volume, success rate, first-token/total latency,
token usage, retrieval/fallback behavior, prompt and model versions, recent live
evaluation summaries, versioned cost estimates, release-gate decisions, and
hashed learner labels. Raw student and assistant messages are not stored in the
telemetry table. Local retention defaults to 90 days and can be configured with
`AI_RUN_RETENTION_DAYS`.

The same dashboard includes accessible SVG small-multiple trends for average
score, case pass rate, all six quality dimensions, estimated cost per case, and
suite latency. It compares only the newest evaluation-suite version, marks older
or legacy runs as excluded, and keeps prompt/model/gate metadata attached to
each timeline point. With zero or one real run it shows an explicit empty or
single-run state instead of fabricating a trend.

Human reviewers can score a just-completed live suite with the versioned
`teacher-human-review-v1` rubric across pedagogy, grounding, safety, and
localization. The review endpoint re-authenticates Developer Mode, validates all
four 1–5 ratings plus complete-case confirmation, and upserts one review per
reviewer/run. SQLite stores normalized audit data and an optional 600-character
note, but not assistant response text. The dashboard reports mean absolute
error, signed bias, and agreement within 20 points for each dimension and
overall. It remains `insufficient_samples` until three distinct runs have human
reviews, avoiding a premature claim that automated teaching scores are calibrated.

### Evaluation Governance Artifacts

Developer Mode and CI can export the same privacy-safe governance report from:

```text
/api/developer/evaluation-report?format=json|markdown
```

The versioned `ai-evaluation-governance-report-v1` contract includes the
deterministic suite, six dimensions, latest matching live release gate,
suite-aware trends, human-calibration summary, requirement policy, evidence
level, and final decision. It excludes assistant messages, learner identifiers,
and human-review note bodies.

Browser downloads use the authenticated Developer Mode cookie. CI uses a
dedicated `AI_EVALUATION_REPORT_SECRET`; the embedding-index secret is not
accepted for this endpoint. Export locally or in CI with:

```bash
npm run report:evaluation
npm run report:evaluation -- --format markdown
npm run report:evaluation -- --require-live
npm run report:evaluation -- --require-live --require-human-calibration
```

The default report can pass at `deterministic_only` evidence without making a
live-model claim. If a matching live run exists and its release gate failed, the
report fails even when live evidence was optional. Requirement flags fail closed
when their evidence is absent. The CLI writes to `artifacts/`, reads the gate and
evidence level from response headers, and exits non-zero on a failed gate.

`.github/workflows/ci.yml` runs install, tests, lint, and production build; starts
the production server with an ephemeral report secret; exports JSON and Markdown
without calling the model; and uploads both files as a CI artifact.

### Curriculum Retrieval Preview

The project includes a developer-facing RAG preparation tool behind Developer
Mode at:

```text
/developer/retrieval-preview
```

It previews how structured static lessons are flattened into bilingual
retrieval-ready curriculum chunks before adding embeddings or a vector database.
The preview supports deterministic keyword, tag, section-type, course, unit,
concept, and locale filtering, and displays:

- stable chunk ids
- locale (`zh` or `en`)
- source labels for future citation
- section types
- retrieval tags
- matched reasons
- preview text

This keeps the current curriculum as the source of truth while preparing the
platform for future course-level RAG with cited lesson sections. Chinese lesson
sections are indexed as first-class chunks rather than relying only on Chinese
query expansion over English text.

### Embedding Retrieval MVP

The project now includes an embedding retrieval layer that can be promoted into
the AI Teacher runtime after retrieval quality is evaluated.

- Keyword retrieval remains the deterministic baseline.
- Embedding retrieval stores vectors in local SQLite at
  `data/rag-embeddings.sqlite`.
- Hybrid retrieval combines keyword and embedding scores for developer
  comparison.
- `/developer/retrieval-preview` can switch between `keyword`, `embedding`, and
  `hybrid` retrieval modes.
- `/developer/retrieval-evaluation` compares the same cases across all three
  modes before changing the live teacher workflow.
- The AI Teacher retrieval node is configurable with `RAG_RETRIEVAL_MODE` and
  falls back to keyword retrieval if embedding or hybrid retrieval fails.
- Embedding retrieval rejects incomplete, stale-text, or wrong-model records
  instead of silently searching a partial index; the developer preview reports
  current/missing/stale coverage and prompts for a rebuild after curriculum changes.
- Embedding indexing is triggered server-side, so embedding API keys are never
  exposed to the browser.
- No vector database dependency has been added yet; pgvector, Chroma, or a
  hosted vector store can replace the SQLite store later.

Build the local embedding index after starting the dev server:

```bash
npm run embeddings:build
```

If embedding environment variables are missing, the index build and preview will
show explicit configuration errors instead of silently falling back to fake
vectors.

### Developer Mode

Student login and developer access are intentionally separate.

- A signed-in user is a learner by default.
- Developer tools are unlocked through `/developer`.
- Workflow Inspector, AI Teacher Evaluation, and live eval APIs require
  Developer Mode.
- Local development can enable Developer Mode without a password.
- Production or shared demos should set `DEVELOPER_MODE_PASSWORD`.

This keeps the learner experience clean while preserving the portfolio-grade AI
debugging and evaluation story.

### Bilingual UX

- English and Chinese language toggle.
- Chinese teaching responses are expected to include English terminology in
  parentheses for academic terms, for example: `limit`, `one-sided limit`,
  `infinite limit`, and `function value`.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui-style components
- Zod
- OpenAI npm package
- DeepSeek OpenAI-compatible API
- LangGraph for workflow orchestration
- SQLite for authentication and learner memory persistence
- SQLite for privacy-minimized AI run and live evaluation telemetry
- SQLite-backed local embedding index for RAG evaluation
- LocalStorage for developer-only workflow inspection history

## Key Routes

| Route | Purpose |
| --- | --- |
| `/` | Product landing page |
| `/learn` | Course library / course pack selection |
| `/courses/[courseId]/learn` | Course unit overview |
| `/courses/[courseId]/learn/[unitId]` | Unit-specific concept graph and lesson list |
| `/courses/[courseId]/learn/[unitId]/[conceptId]` | Course-scoped static lesson plus AI Teacher chat |
| `/learn/[conceptId]` | Legacy AP Calculus lesson URL redirected to the course-scoped route |
| `/dashboard` | Student course progress dashboard |
| `/plan` | Evidence-aware adaptive learning plan and next-session queue |
| `/dashboard/[courseId]` | Course-level progress and unit selection |
| `/dashboard/[courseId]/[unitId]` | Unit-level concept readiness and recommendations |
| `/memory` | Legacy redirect to `/dashboard` |
| `/developer` | Developer Mode entry and internal tool launcher |
| `/developer/ai-runs` | Persisted AI run, usage, latency, and live-evaluation dashboard |
| `/developer/retrieval-preview` | Retrieval-ready curriculum chunk preview for future RAG |
| `/dashboard/ai-evaluation` | AI Teacher contract and pedagogy evaluation suite |
| `/dashboard/workflow-inspector` | AI workflow trace and memory patch inspector |
| `/api/health` | Public, uncached application and SQLite readiness probe |
| `/api/developer/embedding-index` | Local embedding index status/build endpoint |
| `/api/developer/ai-runs` | Protected AI run and live-evaluation telemetry API |
| `/api/developer/evaluation-report` | Protected JSON/Markdown governance report and CI gate artifact |
| `/api/developer/retrieval-check` | Deterministic retrieval index health check |
| `/api/memory` | Authenticated learner memory read/reset API; writes come from trusted teacher and assessment services |
| `/api/formative-assessment` | Answer-key-safe assessment reads and authenticated server-scored attempt writes |
| `/api/teacher-evaluation/live` | Authenticated live AI Teacher evaluation API |
| `/api/teacher-evaluation/review` | Developer-authorized, schema-validated human calibration review API |
| `/api/teacher-chat` | Server-side AI Teacher chat API |

## Architecture

```text
src/
  app/
    api/teacher-chat/          Server-side AI Teacher route
    api/formative-assessment/  Server-scored diagnostic/exit route
    api/memory/                Authenticated learner memory API
    dashboard/                 Student dashboard and developer tools
    learn/                     Course library and lesson pages
    memory/                    Legacy redirects to dashboard
    plan/                      Authenticated adaptive study plan

  components/
    dashboard/                 Workflow Inspector UI
    i18n/                      Language provider and toggle
    learning/                  Lesson and AI Teacher UI
    memory/                    Learning progress UI backed by learner memory
    ui/                        Shared UI primitives

  curricula/
    index.ts                   Curriculum pack registry
    integrity.ts               Shared graph/content/assessment validation
    localization.ts            Course-owned localization resolver
    routing.ts                 Collision-safe course lesson URLs
    types.ts                   Reusable curriculum pack contract
    ap-calculus-ab/            First course implementation
    javascript-foundations/    Small second course proving reuse

  features/
    assessment/                Bilingual item bank, scoring, and learning gain
    ai-teacher/                AI Teacher schema, prompts, service, workflows
    ai-teacher/evaluation/     Fixed evaluation cases and offline runner
    application/               Application task domain types
    knowledge/                 Course-agnostic graph types and getters
    lessons/                   Structured lesson assets, getters, and retrieval chunk helpers
    memory/                    Learner memory model, API client, scoring, recommendations
    planner/                   Adaptive planning rules and domain types
```

AP Calculus AB and JavaScript Foundations live as independent curriculum packs.
The registry validates every pack and platform services select resources by
`courseId`, so concept ids, localizations, assessments, and visualizations do
not leak between subjects.

### Adding a course

Use the Chinese [Curriculum Pack Generation Guide](docs/CURRICULUM_PACK_GUIDE.md)
and fill in the reusable
[course brief template](docs/CURRICULUM_PACK_BRIEF.template.yaml) before
generating curriculum content.

1. Create `src/curricula/<course-id>/index.ts` and implement
   `CurriculumPack`.
2. Include course catalog metadata, the unit/topic/concept graph, structured
   lessons, a teaching profile, and any course-owned localizations,
   assessments, or visualizations.
3. Register the pack in `src/curricula/index.ts`.
4. Run `npm test`, `npx tsc --noEmit`, `npm run lint`, and `npm run build`.
5. Rebuild the embedding index with `npm run embeddings:build` when localized
   lesson content changes.

The course-pack and assessment checks reject invalid parent references,
missing lessons, duplicate lesson attachments, malformed lesson schemas,
incomplete assessment phases, and visualizations that point to unknown
concepts.

## Domain Model

The project defines typed domain models for:

- Course
- Unit
- Topic
- Concept
- ConceptDependency
- LearningObjective
- LearningSession
- LearningStep
- LearnerMemory
- LearningPlan
- LearningPlanStep
- ApplicationTask
- FormativeAssessment
- FormativeAssessmentAttempt
- FormativeAssessmentProgress

The central entity is `Concept`. Questions and practice tasks are intentionally
downstream from concept learning.

## Static Lesson Content

Lessons are maintained as structured curriculum assets in the codebase. Each
lesson includes stable section ids, section types, learning objectives,
prerequisite concept ids, glossary terms, retrieval tags, and application
readiness tasks. This choice is intentional:

- The curriculum is stable and reviewable.
- The AI Teacher has reliable context.
- Lesson quality does not depend on a fresh model generation every time.
- The product avoids becoming a generic AI content generator.
- Future authoring tools can edit structured lesson content without changing
  the AI runtime.

Lessons can also be flattened into retrieval-ready chunks without binding the
project to a specific vector database:

```text
courseId/unitId/conceptId/locale/sectionId
```

Each chunk includes source metadata such as course id, unit id, concept id,
lesson id, locale, section id, section type, retrieval tags, and a
human-readable source label. English chunks are created from canonical
structured lesson sections. Chinese chunks are created from localized lesson
content so Chinese RAG queries can retrieve Chinese curriculum text directly.
This prepares the platform for future course-level RAG with citations while
keeping static lessons as the source of truth.

The AI Teacher is connected to this RAG-preparation layer without requiring a
vector database:

- Retrieval is conditional, so lightweight greetings or acknowledgements do not
  force a curriculum search.
- At most the top four curriculum chunks are assembled into the model context.
- Retrieval mode is controlled by `RAG_RETRIEVAL_MODE`:
  `keyword`, `embedding`, or `hybrid`.
- If `embedding` or `hybrid` retrieval fails, the workflow falls back to
  keyword retrieval and records that fallback in the workflow trace.
- The model may return `citationChunkIds`, but it cannot create citation
  objects.
- The server keeps only citation ids that match the retrieved chunk whitelist,
  then returns those safe citations to the chat UI.

If pgvector, Chroma, or a hosted vector store is added later, only the retrieval
implementation needs to change. The context assembly, prompt contract, citation
filtering, workflow trace, and UI display can stay the same.

## AI Teacher Design

The AI Teacher receives:

- current concept
- current static lesson content
- current lesson section
- selected text, when available
- user message
- recent chat history
- authenticated learner-memory snapshot
- server-scored diagnostic/exit evidence and learning gain, when available

It must:

- explain confusing ideas simply
- ask Socratic guiding questions
- offer alternate examples
- identify and correct misconceptions
- encourage reflection
- keep responses concise and student-friendly

It must not:

- regenerate the full lesson
- become a generic chatbot
- focus on quiz grading
- turn the product into a question bank

## Structured AI Response

AI Teacher responses are validated with Zod and include:

- `assistantMessage`
- `suggestedFollowUps`
- optional `detectedMisconception`
- `teachingMove`
  - `explain`
  - `ask_guiding_question`
  - `give_example`
  - `correct_misconception`
  - `reflect`
- `memorySignals`
  - `confusionLevel`
  - optional `misconceptionType`
  - `needsReview`
  - `suggestedStudyAction`
  - `confidenceDelta`
  - `evidenceNote`
- `citationChunkIds`
  - model-selected chunk ids from the retrieved curriculum whitelist

This keeps the AI output usable by the product instead of being free-form text
only.

## Workflow Engines

LangGraph is the default workflow engine:

```env
TEACHER_WORKFLOW_ENGINE=langgraph
```

To use the TypeScript fallback runner:

```env
TEACHER_WORKFLOW_ENGINE=typescript
```

The fallback is designed for workflow orchestration failures. DeepSeek API
errors, missing API keys, invalid JSON, schema validation failures, and timeouts
are surfaced to the UI instead of being hidden behind a fake answer.

Both engines skip retrieval for lightweight turns, require active-concept
context for grounded turns, retry retrieval at most once with a narrowed
concept scope, and fall back to the reviewed static lesson when retrieval is
still insufficient. AI-inferred learning signals pass through a separate
memory-write gate so audit-only or lightweight turns cannot silently change
readiness.

## AI Observability

The API returns the active workflow engine in the response header:

```text
X-Teacher-Workflow-Engine: langgraph
```

In local development, workflow trace data is included automatically. For a
production portfolio demo, enable:

```env
NEXT_PUBLIC_SHOW_AI_TRACE=true
```

Then restart the server. The Workflow Inspector will collect and display
workflow runs after AI Teacher conversations. Independently, authenticated
calls persist privacy-minimized operational metadata for `/developer/ai-runs`.

## Environment Variables

Create `.env.local`:

```env
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-pro
AUTH_SECRET=change_me_to_a_long_random_secret
AUTH_TRUST_HOST=true

TEACHER_WORKFLOW_ENGINE=langgraph
AI_TEACHER_BURST_LIMIT=12
AI_TEACHER_BURST_WINDOW_SECONDS=600
AI_TEACHER_DAILY_LIMIT=100
AI_RUN_RETENTION_DAYS=90
RAG_RETRIEVAL_MODE=keyword
NEXT_PUBLIC_SHOW_AI_TRACE=false
ENABLE_DEVELOPER_TOOLS=true
DEVELOPER_MODE_PASSWORD=
AI_EVALUATION_REPORT_SECRET=
AI_EVALUATION_REPORT_BASE_URL=http://localhost:3000

ENABLE_PUBLIC_DEMO_ACCOUNT=false
DEMO_ACCOUNT_EMAIL=demo.learner@example.com
DEMO_ACCOUNT_PASSWORD=change_me_to_a_unique_demo_password
DEMO_ACCOUNT_NAME=Portfolio Demo Learner
DEMO_BASE_URL=http://localhost:3000

EMBEDDING_PROVIDER=openai-compatible
EMBEDDING_BASE_URL=
EMBEDDING_API_KEY=
EMBEDDING_MODEL=
EMBEDDING_DIMENSIONS=
EMBEDDING_INDEX_SECRET=
EMBEDDING_INDEX_BASE_URL=http://localhost:3000
EMBEDDING_INDEX_LOCALE=all
EMBEDDING_INDEX_FORCE=false
```

See `.env.example` for the current template.

`EMBEDDING_INDEX_SECRET` is optional for local development. Set it for
production or shared demos, then send it as a bearer token when triggering
index builds. `AI_EVALUATION_REPORT_SECRET` is a separate CI credential with no
embedding-index authority.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Run lint:

```bash
npm run lint
```

Audit production dependencies and fail on high/critical advisories:

```bash
npm run audit:prod
```

Run deterministic curriculum, workflow, streaming, retrieval-adjacent, and
formative-assessment tests:

```bash
npm test
```

Run auth regression checks (requires `npm run dev` already running on `http://localhost:3000`):

```bash
npm run test:auth
```

This regression also verifies the formative-assessment trust boundary,
server-side grading, diagnostic mastery cap, exit-ticket readiness update,
attempt readback, and cross-account isolation.

Run the RAG retrieval index check (also requires `npm run dev` already running on `http://localhost:3000`):

```bash
npm run test:rag
```

Build the optional local embedding index (requires `npm run dev` already
running and embedding environment variables configured):

```bash
npm run embeddings:build
```

Build:

```bash
npm run build
```

Start the production build:

```bash
npm run start
```

### Run the production image with Docker

The repository includes a Next.js standalone image and a Compose configuration
for a reproducible single-instance portfolio deployment. Copy the example file,
replace every `change_me` value, and start the service:

```bash
cp docker.env.example .env.docker.local
docker compose --env-file .env.docker.local up --build
```

On PowerShell, use `Copy-Item docker.env.example .env.docker.local` for the
first command. Open `http://localhost:3000`; container and platform probes can
use `GET /api/health`. The health response checks SQLite readiness without
exposing credentials, provider configuration, user data, or model names.

The named `ai-learning-data` volume persists accounts, learner evidence, AI run
telemetry, evaluation summaries, and human reviews under `/app/data`. Back up
that volume before replacing a production host.

This deployment profile intentionally runs one application instance. SQLite,
the local Next.js cache, and in-process coordination are not a multi-instance
architecture. Before horizontal scaling, migrate state to a shared database
(the roadmap targets PostgreSQL/pgvector), configure a shared cache, and follow
the Next.js multi-instance requirements for Server Action encryption and cache
invalidation.

### Seed a recruiter-friendly demo learner

The demo bootstrap uses the same registration, Auth.js session, learner-memory,
and server-scored formative-assessment APIs as the product. It does not write
SQLite directly and does not create fake live-model evaluations or fake human
reviews.

Set a dedicated reserved identity and unique password in your local environment
or Compose env file:

```env
ENABLE_PUBLIC_DEMO_ACCOUNT=true
DEMO_ACCOUNT_EMAIL=demo.learner@example.com
DEMO_ACCOUNT_PASSWORD=use_a_unique_12_plus_character_password
DEMO_ACCOUNT_NAME=Portfolio Demo Learner
DEMO_BASE_URL=http://localhost:3000
```

Then, while the application is running, seed the account:

```bash
npm run demo:seed -- --env-file .env.docker.local
```

The command is idempotent: it creates or reuses only the named demo account,
resets that account's AP Calculus learning memory, and writes five final
assessment attempts across three concepts. The resulting evidence intentionally
shows a strong learning gain, a partial-understanding case, and a diagnostic-only
case so `/dashboard` and `/plan` are meaningful immediately. Temporary answer-key
discovery attempts are removed before the final scenario is written.

When `ENABLE_PUBLIC_DEMO_ACCOUNT=true`, `/login` displays a one-click shared-demo
button. This intentionally makes the demo credentials public. The application
therefore accepts only an `example.com` identity, rejects placeholder passwords,
and rejects reuse of auth, Developer Mode, model-provider, evaluation-report,
embedding-provider, or embedding-index secrets. Keep the feature disabled for
private or real learner accounts. A remote `DEMO_BASE_URL` must use HTTPS.

## How To Try The Core Flow

1. Open `/learn`.
2. Select `AP Calculus AB`.
3. Open `Limits and Continuity (Unit 1)`.
4. Select `What is a limit?`.
5. Log in and complete the two-minute diagnostic.
6. Read a lesson section.
7. Use `Ask about this` or select lesson text and ask the AI Teacher.
8. Ask a misconception-style question, for example:

   ```text
   I think the limit is always the same as the function value.
   ```

9. Complete the exit ticket and inspect the learning-gain/readiness update.
10. Open `/dashboard`, choose a course, then choose a unit to inspect concept evidence and recommendations.
11. Open `/plan` to see the updated evidence-aware next-learning queue.
12. Open `/dashboard/workflow-inspector` to inspect the AI workflow run.
13. If prompted, open `/developer` and enable Developer Mode first.

## Auth Flow (Current)

- Registration creates an account in SQLite using `email + password`.
- Passwords are stored as bcrypt hashes.
- Auth.js credentials login creates a JWT session with `session.user.id`.
- Memory is isolated by `learnerId + courseId`, so different accounts do not
  share learner memory.
- Learner memory is persisted in `data/auth.sqlite`; validated AI Teacher
  interactions and server-scored formative attempts write it server-side,
  while `/api/memory` only reads or resets it.
- The schema keeps `email_verified_at` available for future email verification,
  but the current MVP does not require email ownership verification.

## Current MVP Boundaries

The project intentionally does not include:

- high-stakes quiz/exam grading
- review queues
- full practice question bank
- AI-generated full lessons
- horizontally scaled or serverless SQLite deployment

The current goal is to keep the backend thin while preserving the
learning-centric architecture and AI teaching workflow.

## Educational Design Principles

1. Concept first, question later.
2. Static curriculum for quality and reviewability.
3. AI as an interactive teacher, not a lesson generator.
4. Memory as evidence of learning, not just activity tracking.
5. Deterministic formative evidence outranks AI-inferred confidence.
6. Practice should happen after readiness, not before understanding.
7. AI behavior should be observable, structured, and testable.

## Portfolio Value

This project is designed to demonstrate AI application development skills that
go beyond a simple chatbot:

- product thinking for an education domain
- typed domain modeling
- static curriculum architecture
- server-side LLM integration
- schema-validated AI output
- LangGraph workflow orchestration
- fallback workflow engine
- learner memory extraction
- account-scoped learner memory persistence
- server-authoritative assessment, learning-gain, and readiness gating
- server-side per-learner usage limits
- cancellable, progressively rendered structured AI responses
- AI observability through workflow traces and persisted run telemetry
- deterministic and live-model evaluation with persisted summaries
- adversarial prompt-injection, privacy, false-premise, and citation tests
- versioned model-cost estimation and baseline-aware prompt/model release gates
- suite-version-aware quality, cost, and latency trend reporting
- versioned human-review rubric with automated-score agreement calibration
- privacy-safe JSON/Markdown governance reports with CI exit semantics
- non-root Next.js standalone container with SQLite volume and health probe
- idempotent API-driven synthetic learner bootstrap and opt-in one-click demo login
- bilingual learning UX

Potential resume bullet:

```text
Built a learning-centric AI education platform with Next.js, TypeScript,
DeepSeek, Zod, and LangGraph, featuring grounded curriculum retrieval,
server-persisted learner memory, schema-validated teaching workflows,
per-user usage controls, cancellable structured-response streaming,
server-scored diagnostic-to-exit learning evidence, live/offline evaluations,
privacy-minimized model/token/TTFT observability, adversarial six-dimension AI
evaluation, auditable quality/cost release gates, and version-aware evaluation
trend reporting plus privacy-minimized human-review calibration for prompt/model
changes, exported as CI-ready JSON/Markdown governance artifacts.
```

## Recommended Next Step

Deploy the containerized portfolio build and add **reviewed screenshots or a
short demo GIF** from the seeded learner journey.

The suite now combines concept coverage with prompt injection, private-memory
canaries, false premises, bilingual behavior, and citation hallucination
pressure. Historical dimension, latency, and cost trends now compare only runs
from the same suite version, human reviews measure per-dimension agreement, and
CI now exports a stable privacy-safe governance artifact; the standalone Docker
image makes the build reproducible outside a developer workstation; and the
API-driven seed flow creates clearly labeled, non-sensitive learner evidence
without inventing live-model results. The next useful step is to make this depth
immediately visible through an actual hosted demo and reviewed visuals.

## Roadmap

### Short Term

- Deploy the verified standalone image to a single-instance container host
- Collect at least three real human-reviewed live runs for the calibration sample
- README screenshots or demo GIFs backed by a deployed portfolio instance

### Medium Term

- AP Calculus AB Unit 2 derivative foundations
- Persistent workflow traces and teacher/admin curriculum review tools
- PostgreSQL/pgvector migration for a multi-instance deployment
- Email verification or OAuth sign-in if the app moves beyond local demos

### Long Term

- Durable LangGraph checkpointing and release-review interrupts
- Multi-reviewer adjudication and inter-rater reliability
- Curriculum authoring workflow
- Deployment-ready observability and analytics

## Status

The current version is a portfolio-ready MVP centered on a complete Unit 1
learning loop, authenticated evidence-based learner memory, grounded AI
teaching, and observable/evaluable agent workflows.
