# AI Learning Platform

An AI-powered, learning-centric platform for AP Calculus AB.

This project is intentionally **not** a question bank, not a practice-review
app, and not just a generic AI tutor. It is designed around a learning system:

```text
Knowledge Graph
  -> Static Lesson Content
  -> AI Teacher Chat
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
- AP Calculus AB Unit 1 concept cards under the Unit 1 learning map.
- Static lesson pages for five Unit 1 concepts:
  - What is a limit?
  - Limit notation
  - Estimating limits from graphs
  - One-sided limits
  - Infinite limits
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
- 3-minute client timeout with loading state.

### Learning Dashboard

- Account-scoped learner memory persisted in SQLite.
- Concept-level memory records:
  - readiness score
  - learning status
  - recent interactions
  - confusion signals
  - misconceptions
  - memory signal history
- Student-facing Dashboard navigation split into course selection, unit
  selection, and concept-level progress/recommendations.
- Study recommendations generated from memory signals rather than raw question
  counts.
- Authenticated memory API with user isolation by `learnerId + courseId`.

### LangGraph Workflow

The AI Teacher is orchestrated through a graph-ready teaching workflow:

```text
Student Message
  -> Build Context
  -> Classify Intent
  -> Select Teaching Strategy
  -> Generate Teaching Response
  -> Validate Structured Output
  -> Extract Learning Signals
  -> Update Learner Memory
  -> Return Next Study Action
```

LangGraph is the default workflow engine. A deterministic TypeScript runner is
kept as a fallback.

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

This is currently an offline contract and pedagogy evaluation layer. A future
live evaluation runner can reuse the same case library to call DeepSeek or
compare multiple models.

The same page also includes **Live Model Evaluation Mode**, which calls the
real AI Teacher workflow through `/api/teacher-evaluation/live` and scores the
model response with the same cases. This route is authenticated and intended
for development or portfolio demos, not for student-facing learning sessions.

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
| `/developer/retrieval-preview` | Retrieval-ready curriculum chunk preview for future RAG |
| `/dashboard/ai-evaluation` | AI Teacher contract and pedagogy evaluation suite |
| `/dashboard/workflow-inspector` | AI workflow trace and memory patch inspector |
| `/api/developer/retrieval-check` | Deterministic retrieval index health check |
| `/api/memory` | Authenticated learner memory read/write/reset API |
| `/api/teacher-evaluation/live` | Authenticated live AI Teacher evaluation API |
| `/api/teacher-chat` | Server-side AI Teacher chat API |

## Architecture

```text
src/
  app/
    api/teacher-chat/          Server-side AI Teacher route
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

## AI Teacher Design

The AI Teacher receives:

- current concept
- current static lesson content
- current lesson section
- selected text, when available
- user message
- recent chat history
- learner memory placeholder

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
workflow runs after AI Teacher conversations.

## Environment Variables

Create `.env.local`:

```env
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-pro
AUTH_SECRET=change_me_to_a_long_random_secret
AUTH_TRUST_HOST=true

TEACHER_WORKFLOW_ENGINE=langgraph
NEXT_PUBLIC_SHOW_AI_TRACE=false
ENABLE_DEVELOPER_TOOLS=true
DEVELOPER_MODE_PASSWORD=
```

See `.env.example` for the current template.

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

Run auth regression checks (requires `npm run dev` already running on `http://localhost:3000`):

```bash
npm run test:auth
```

Run the RAG retrieval index check (also requires `npm run dev` already running on `http://localhost:3000`):

```bash
npm run test:rag
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
3. Open `Unit 1: Limits and Continuity`.
4. Select `What is a limit?`.
5. Read a lesson section.
6. Use `Ask about this` or select lesson text and ask the AI Teacher.
7. Ask a misconception-style question, for example:

   ```text
   I think the limit is always the same as the function value.
   ```

8. Open `/dashboard`, choose a course, then choose a unit to inspect concept readiness and recommendations.
9. Open `/dashboard/workflow-inspector` to inspect the AI workflow run.
10. If prompted, open `/developer` and enable Developer Mode first.

## Auth Flow (Current)

- Registration creates an account in SQLite using `email + password`.
- Passwords are stored as bcrypt hashes.
- Auth.js credentials login creates a JWT session with `session.user.id`.
- Memory is isolated by `learnerId + courseId`, so different accounts do not
  share learner memory.
- Learner memory is persisted in `data/auth.sqlite` through `/api/memory`.
- The schema keeps `email_verified_at` available for future email verification,
  but the current MVP does not require email ownership verification.

## Current MVP Boundaries

The project intentionally does not include:

- quiz grading
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
5. Practice should happen after readiness, not before understanding.
6. AI behavior should be observable, structured, and testable.

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
- AI observability through Workflow Inspector
- bilingual learning UX

Potential resume bullet:

```text
Built a learning-centric AI education platform for AP Calculus AB using
Next.js, TypeScript, DeepSeek, Zod, and LangGraph, with static curriculum
content, an interactive AI Teacher, structured learner memory, and an
observable teaching workflow inspector.
```

## Recommended Next Step

Build **RAG Phase 2: Embeddings and Retrieval Quality Evaluation**.

The curriculum is now structured into retrieval-ready chunks and can be
previewed with deterministic search. The next improvement is to add embeddings
and a vector store, then evaluate retrieval quality before letting the AI
Teacher cite retrieved chunks in live conversations.

## Roadmap

### Short Term

- RAG Phase 2: embedding provider and vector store selection
- Retrieval quality eval cases for lesson citations
- Persisted eval run history and prompt/model comparison
- Better memory summaries per concept
- Application readiness gate
- More AP Calculus AB Unit 1 lesson polish
- README screenshots or demo GIFs

### Medium Term

- Persistent workflow traces
- Teacher/admin curriculum review tools
- More AP Calculus AB units
- Application practice tasks gated by readiness
- Email verification or OAuth sign-in if the app moves beyond local demos

### Long Term

- Adaptive planner using learner memory and concept dependencies
- LangGraph memory persistence nodes
- Evaluation dashboard for prompt and model quality
- Curriculum authoring workflow
- Deployment-ready observability and analytics

## Status

This is an active portfolio project. The current version is an MVP that focuses
on the core learning system, authenticated learner memory, and observable AI
teaching architecture.
