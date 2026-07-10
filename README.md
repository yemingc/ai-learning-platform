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
- Student-facing Dashboard navigation split into course selection, unit
  selection, and concept-level progress/recommendations.
- Study recommendations generated from memory signals rather than raw question
  counts.
- Readiness combines deterministic assessment evidence with bounded AI Teacher
  signals. Conversations and a diagnostic alone are capped below `familiar`;
  an exit ticket is required to certify application readiness.
- Authenticated memory API with user isolation by `learnerId + courseId`.

### LangGraph Workflow

The AI Teacher is orchestrated through a graph-ready teaching workflow:

```text
Student Message
  -> Build Context
  -> Classify Intent
  -> Select Teaching Strategy
  -> Retrieve Curriculum Chunks
  -> Assemble Curriculum Context
  -> Generate Teaching Response
  -> Validate Structured Output
  -> Extract Learning Signals
  -> Update Learner Memory
  -> Return Next Study Action
```

LangGraph is the default workflow engine. A deterministic TypeScript runner is
kept as a fallback.

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

The deterministic runner provides a fast offline contract and pedagogy layer.

The same page also includes **Live Model Evaluation Mode**, which calls the
real AI Teacher workflow through `/api/teacher-evaluation/live` and scores the
model response with the same cases. This route is authenticated and intended
for development or portfolio demos, not for student-facing learning sessions.
Each live evaluation summary is persisted with aggregate score, pass count,
duration, workflow engines, and model telemetry.

### Persisted AI Run Observability

Authenticated AI Teacher calls are recorded as privacy-minimized metadata in
SQLite and exposed behind Developer Mode at:

```text
/developer/ai-runs
```

The dashboard reports 24-hour volume, success rate, first-token/total latency, token usage,
retrieval/fallback behavior, prompt and model versions, recent live evaluation
summaries, and hashed learner labels. Raw student and assistant messages are
not stored in the telemetry table. Local retention defaults to 90 days and can
be configured with `AI_RUN_RETENTION_DAYS`.

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
| `/learn/[conceptId]` | Static lesson plus AI Teacher chat |
| `/dashboard` | Student course progress dashboard |
| `/dashboard/[courseId]` | Course-level progress and unit selection |
| `/dashboard/[courseId]/[unitId]` | Unit-level concept readiness and recommendations |
| `/memory` | Legacy redirect to `/dashboard` |
| `/developer` | Developer Mode entry and internal tool launcher |
| `/developer/ai-runs` | Persisted AI run, usage, latency, and live-evaluation dashboard |
| `/developer/retrieval-preview` | Retrieval-ready curriculum chunk preview for future RAG |
| `/dashboard/ai-evaluation` | AI Teacher contract and pedagogy evaluation suite |
| `/dashboard/workflow-inspector` | AI workflow trace and memory patch inspector |
| `/api/developer/embedding-index` | Local embedding index status/build endpoint |
| `/api/developer/ai-runs` | Protected AI run and live-evaluation telemetry API |
| `/api/developer/retrieval-check` | Deterministic retrieval index health check |
| `/api/memory` | Authenticated learner memory read/reset API; writes come from trusted teacher and assessment services |
| `/api/formative-assessment` | Answer-key-safe assessment reads and authenticated server-scored attempt writes |
| `/api/teacher-evaluation/live` | Authenticated live AI Teacher evaluation API |
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

  components/
    dashboard/                 Workflow Inspector UI
    i18n/                      Language provider and toggle
    learning/                  Lesson and AI Teacher UI
    memory/                    Learning progress UI backed by learner memory
    ui/                        Shared UI primitives

  curricula/
    index.ts                   Curriculum pack registry
    types.ts                   Reusable curriculum pack contract
    ap-calculus-ab/            First course implementation

  features/
    assessment/                Bilingual item bank, scoring, and learning gain
    ai-teacher/                AI Teacher schema, prompts, service, workflows
    ai-teacher/evaluation/     Fixed evaluation cases and offline runner
    application/               Application task domain types
    knowledge/                 Course-agnostic graph types and getters
    lessons/                   Structured lesson assets, getters, and retrieval chunk helpers
    memory/                    Learner memory model, API client, scoring, recommendations
    planner/                   Planner domain types
```

AP Calculus AB now lives as a curriculum pack. The platform services read from
the curriculum registry, so a future course can be added by creating another
pack with its own course metadata, knowledge graph, lessons, and teaching
profile.

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
index builds.

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
11. Open `/dashboard/workflow-inspector` to inspect the AI workflow run.
12. If prompted, open `/developer` and enable Developer Mode first.

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
- bilingual learning UX

Potential resume bullet:

```text
Built a learning-centric AI education platform with Next.js, TypeScript,
DeepSeek, Zod, and LangGraph, featuring grounded curriculum retrieval,
server-persisted learner memory, schema-validated teaching workflows,
per-user usage controls, cancellable structured-response streaming,
server-scored diagnostic-to-exit learning evidence, live/offline evaluations,
and privacy-minimized model/token/TTFT observability.
```

## Recommended Next Step

Build **prompt/model comparison gates with versioned cost budgets**.

The learning layer now includes a measurable diagnostic-to-exit evidence loop
in addition to server-authoritative memory, grounded retrieval, cancellable
streaming, quotas, persisted live evals, and model telemetry. A future
engineering step would be to compare prompt/model versions over persisted
evaluation runs, calculate cost from versioned provider pricing, and block
prompt releases that regress quality or exceed a configured budget.

## Roadmap

### Short Term

- Larger retrieval and teaching evaluation case libraries
- Estimated model cost based on versioned provider pricing metadata
- README screenshots or demo GIFs

### Medium Term

- AP Calculus AB Unit 2 derivative foundations
- Persistent workflow traces and teacher/admin curriculum review tools
- PostgreSQL/pgvector migration for a multi-instance deployment
- Email verification or OAuth sign-in if the app moves beyond local demos

### Long Term

- Adaptive planner using learner memory and concept dependencies
- LangGraph checkpointing and bounded conditional tool loops
- Evaluation dashboard for prompt and model quality
- Curriculum authoring workflow
- Deployment-ready observability and analytics

## Status

The current version is a portfolio-ready MVP centered on a complete Unit 1
learning loop, authenticated evidence-based learner memory, grounded AI
teaching, and observable/evaluable agent workflows.
