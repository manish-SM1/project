# CareerAI — One-Page Architecture Review (Interview/Presentation Ready)

## 1) Product Scope
CareerAI is an AI-powered career guidance platform with:
- Auth-first access control
- Profile intake and weighted career recommendations
- Course discovery and topic-based learning workspace
- Advanced AI chatbot with retrieval-augmented responses
- In-app coding compiler with multi-language execution

## 2) Tech Stack (Scratch to Top)
### Languages
- JavaScript (frontend + backend)
- HTML, CSS
- JSON (knowledge/course datasets)
- Markdown (architecture and setup docs)

### Frontend
- Multi-page web app (no SPA framework)
- Monaco Editor integration for compiler workspace
- SSE-style streamed chat rendering in advanced chat UI
- LocalStorage-based session/state persistence

### Backend
- Node.js + Express API server
- Mongoose + MongoDB integration
- Axios for outbound API calls (LLM, compiler provider, scraping)
- Nodemailer for OTP/email workflows
- dotenv for environment configuration

### AI/LLM + Retrieval
- LLM provider abstraction (OpenRouter/OpenAI/Anthropic)
- Embedding service with API + fallback mode
- Retrieval service with similarity ranking
- Chat orchestration controller with persona and fallback handling
- Session memory manager with summarization and token budgeting

## 3) High-Level Architecture
1. Browser UI sends API requests to Express backend.
2. Backend routes dispatch to modular services.
3. Chat controller orchestrates:
   - memory context
   - retrieval context
   - LLM generation (streaming/non-streaming)
4. Retrieval service searches knowledge docs by embedding similarity.
5. Learning module uses scraped topic datasets for in-app quiz/exercise/project generation.
6. Compiler route executes code remotely through provider API and returns compile/runtime diagnostics.

## 4) Core Algorithms and Engineering Patterns
### A) Career Recommendation Model
- Weighted scoring classifier over:
  - academics
  - aptitude
  - traits
  - interests
  - skills
- Produces ranked top-fit clusters with role/education/course suggestions
- Deterministic and interpretable scoring design

### B) Retrieval-Augmented Generation (RAG)
- Query embedding generation
- Cosine similarity scoring against document embeddings
- Top-K + minimum threshold filtering
- Context assembly with source attribution
- Keyword fallback retrieval when needed

### C) Conversation Memory Strategy
- Per-session in-memory message store
- Token-budget-aware message selection
- Auto-truncation of older messages
- Optional summarization of conversation history

### D) Compiler Execution Flow
- Frontend editor sends language + code + stdin
- Backend compile API validates payload
- Backend calls remote runner (create + poll)
- Response normalized into:
  - compile stdout/stderr/code
  - run stdout/stderr/code
  - timing/memory metadata
- UI shows diagnostics and preserves per-language draft state

## 5) Data and Content Pipeline
- Web scraping pipeline collects topic pages into JSON datasets
- Course catalog is auto-derived from scraped files
- Learning page converts topic content into:
  - topic summaries
  - in-site quizzes
  - in-site exercises/projects
  - compiler starter tasks

## 6) API Surface (Representative)
- Chat:
  - message (sync)
  - stream (chunked)
  - feedback
  - session clear/info
  - config update
  - stats/test
- Courses:
  - catalog
  - content by course
  - health
- Compiler:
  - execute code with stdin and diagnostics

## 7) Reliability and Safety Controls
- Request validation and structured error responses
- LLM retry with exponential backoff
- Basic rate limiting in LLM service
- Offline-mode behavior when MongoDB is unavailable
- Fallback responses when provider calls fail
- Auth guard routing for protected pages

## 8) Current Strengths
- Clean modular service decomposition
- Practical AI + retrieval architecture
- Strong interview-ready mix: web, backend, AI, and tooling
- End-to-end user journey from assessment to coding practice

## 9) Known Gaps / Next Upgrades
- Add persistent database-backed chat memory (instead of process memory)
- Add centralized auth token validation middleware for APIs
- Add tests (unit + integration + API contract)
- Add observability (request logs, metrics, tracing)
- Add queue/caching for heavy operations
- Add local compiler sandbox option for provider independence

## 10) 60-Second Interview Pitch
CareerAI is a full-stack AI education platform built with JavaScript across frontend and backend. It combines a deterministic weighted recommendation engine with a modular RAG chatbot architecture. The backend separates memory, retrieval, embeddings, and LLM orchestration, while the learning workspace converts scraped course data into in-app quizzes, projects, and a real multi-language compiler experience. The system is production-minded with fallbacks, streaming responses, config-driven providers, and auth-first page protection.
